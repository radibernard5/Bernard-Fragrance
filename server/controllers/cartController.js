const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], totalPrice: 0 });
    cart = await cart.populate('items.product');
  }
  return cart;
};

exports.getCart = catchAsync(async (req, res, next) => {
  const cart = await getOrCreateCart(req.user._id);
  res.status(200).json({ status: 'success', data: { cart } });
});

exports.addOrUpdateItem = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const qty = Number(quantity);

  if (!productId || !qty || qty < 1) {
    return next(new AppError('productId and quantity (>=1) are required', 400));
  }

  const product = await Product.findById(productId);
  if (!product) return next(new AppError('Product not found', 404));
  if (product.isAvailable === false) return next(new AppError('Product is not available', 400));
  if (product.stock < qty) {
    return next(new AppError('Insufficient stock for selected product', 400));
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [], totalPrice: 0 });

  const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = qty;
    cart.items[itemIndex].price = product.price;
  } else {
    cart.items.push({
      product: product._id,
      quantity: qty,
      price: product.price,
    });
  }

  cart.calculateTotal();
  await cart.save();
  cart = await cart.populate('items.product');

  res.status(200).json({ status: 'success', data: { cart } });
});

exports.removeItem = catchAsync(async (req, res, next) => {
  const { productId } = req.body;
  if (!productId) {
    return next(new AppError('productId is required', 400));
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new AppError('Cart not found', 404));

  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  cart.calculateTotal();
  await cart.save();
  await cart.populate('items.product');

  res.status(200).json({ status: 'success', data: { cart } });
});

exports.clearCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(200).json({ status: 'success', data: { cart: { items: [], totalPrice: 0 } } });
  }
  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();
  res.status(200).json({ status: 'success', data: { cart } });
});
