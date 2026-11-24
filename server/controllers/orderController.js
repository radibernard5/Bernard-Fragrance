const crypto = require('crypto');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { initializeTransaction, verifyWebhookSignature } = require('../utils/paystack');

const deductStockForOrder = async (order) => {
  if (order.stockDeducted) return order;

  for (const item of order.items) {
    const updated = await Product.findOneAndUpdate(
      {
        _id: item.product,
        stock: { $gte: item.quantity },
      },
      { $inc: { stock: -item.quantity } },
      { new: true }
    );
    if (!updated) {
      throw new AppError(`Insufficient stock while confirming order for item ${item.name}`, 400);
    }
    if (updated.stock === 0) {
      updated.isAvailable = false;
      await updated.save();
    }
  }

  order.stockDeducted = true;
  await order.save();
  return order;
};

exports.checkout = catchAsync(async (req, res, next) => {
  const { shippingDetails, paymentMethod, deliveryFee = 0 } = req.body;

  if (!shippingDetails || !paymentMethod) {
    return next(new AppError('shippingDetails and paymentMethod are required', 400));
  }
  const required = ['name', 'phone', 'city', 'region', 'address'];
  for (const field of required) {
    if (!shippingDetails[field]) {
      return next(new AppError(`shippingDetails.${field} is required`, 400));
    }
  }
  if (!['Paystack', 'Cash on Delivery'].includes(paymentMethod)) {
    return next(new AppError('Invalid payment method', 400));
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    return next(new AppError('Your cart is empty', 400));
  }

  // Validate stock and build snapshot
  const items = [];
  let subtotal = 0;
  for (const item of cart.items) {
    const product = item.product;
    if (!product) return next(new AppError('A product in your cart no longer exists', 400));
    if (product.isAvailable === false) {
      return next(new AppError(`${product.name} is not available`, 400));
    }
    if (product.stock < item.quantity) {
      return next(new AppError(`Insufficient stock for ${product.name}`, 400));
    }
    const price = Number(product.price);
    subtotal += price * item.quantity;
    items.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price,
      imageUrl: product.imageUrl || '',
    });
  }

  const delivery = Number(deliveryFee) || 0;
  const totalAmount = subtotal + delivery;

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingDetails,
    subtotal,
    deliveryFee: delivery,
    totalAmount,
    paymentMethod,
    paymentStatus: 'Pending',
    orderStatus: 'Processing',
  });

  // Clear cart after order creation
  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  if (paymentMethod === 'Cash on Delivery') {
    order.orderStatus = 'Confirmed';
    await deductStockForOrder(order);
    return res.status(201).json({
      status: 'success',
      message: 'Order placed successfully with Cash on Delivery',
      data: { order },
    });
  }

  // Paystack
  const reference = `BF-${order._id}-${Date.now()}`;
  order.paystackReference = reference;
  await order.save();

  const amountInPesewas = Math.round(totalAmount * 100);
  const init = await initializeTransaction({
    email: req.user.email,
    amount: amountInPesewas,
    reference,
    metadata: {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      userId: req.user._id.toString(),
      custom_fields: [
        { display_name: 'Order Number', variable_name: 'order_number', value: order.orderNumber },
      ],
    },
    callback_url: `${process.env.CLIENT_URL || ''}/payment/callback`,
  });

  res.status(201).json({
    status: 'success',
    message: 'Paystack transaction initialized',
    data: {
      order,
      authorization_url: init.data.authorization_url,
      access_code: init.data.access_code,
      reference: init.data.reference,
    },
  });
});

exports.paystackWebhook = catchAsync(async (req, res, next) => {
  const isValid = verifyWebhookSignature(req);
  if (!isValid) {
    return res.status(401).json({ status: 'fail', message: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(req.body.toString());
  } catch (e) {
    return res.status(400).json({ status: 'fail', message: 'Invalid payload' });
  }

  if (event.event === 'charge.success') {
    const data = event.data;
    const reference = data.reference;
    const order = await Order.findOne({ paystackReference: reference });
    if (order && order.paymentStatus !== 'Paid') {
      if (data.status === 'success') {
        order.paymentStatus = 'Paid';
        order.orderStatus = 'Confirmed';
        await order.save();
        try {
          await deductStockForOrder(order);
        } catch (err) {
          console.error('Stock deduction error after payment:', err.message);
        }
      }
    }
  } else if (event.event === 'charge.failed') {
    const reference = event.data && event.data.reference;
    if (reference) {
      const order = await Order.findOne({ paystackReference: reference });
      if (order && order.paymentStatus === 'Pending') {
        order.paymentStatus = 'Failed';
        await order.save();
      }
    }
  }

  res.status(200).json({ received: true });
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: { orders },
  });
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find()
    .populate('user', 'name email phone')
    .sort('-createdAt');
  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: { orders },
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const allowed = ['Processing', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'];
  if (!allowed.includes(status)) {
    return next(new AppError('Invalid order status', 400));
  }

  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError('Order not found', 404));

  order.orderStatus = status;
  await order.save();

  res.status(200).json({ status: 'success', data: { order } });
});

exports.getAdminAnalytics = catchAsync(async (req, res, next) => {
  const [salesAgg, orderCounts, lowStockProducts, recentOrders] = await Promise.all([
    Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          paidOrders: { $sum: 1 },
        },
      },
    ]),
    Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
        },
      },
    ]),
    Product.find({ stock: { $lte: 5 } })
      .select('name category stock price isAvailable imageUrl')
      .limit(50),
    Order.find().sort('-createdAt').limit(10).populate('user', 'name email'),
  ]);

  const totalSales = salesAgg[0] ? salesAgg[0].totalSales : 0;
  const paidOrders = salesAgg[0] ? salesAgg[0].paidOrders : 0;
  const countsByStatus = orderCounts.reduce((acc, cur) => {
    acc[cur._id] = cur.count;
    return acc;
  }, {});

  res.status(200).json({
    status: 'success',
    data: {
      totalSales,
      paidOrders,
      orderCountsByStatus: countsByStatus,
      lowStockAlerts: lowStockProducts,
      recentOrders,
    },
  });
});
