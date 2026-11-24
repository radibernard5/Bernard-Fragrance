const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getProductReviews = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new AppError('Invalid product id', 400));
  }
  const product = await Product.findById(productId);
  if (!product) return next(new AppError('Product not found', 404));

  const reviews = await Review.find({ product: productId })
    .populate('user', 'name')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  const { rating, comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new AppError('Invalid product id', 400));
  }
  const product = await Product.findById(productId);
  if (!product) return next(new AppError('Product not found', 404));

  // Verified buyer: has at least one non-cancelled/failed qualifying order containing this product
  const hasPurchased = await Order.exists({
    user: req.user._id,
    'items.product': productId,
    $or: [
      { paymentStatus: 'Paid' },
      { paymentMethod: 'Cash on Delivery', orderStatus: { $ne: 'Cancelled' } },
      { orderStatus: { $in: ['Confirmed', 'Out for Delivery', 'Delivered'] } },
    ],
  });

  if (!hasPurchased) {
    return next(new AppError('Only verified buyers can review this product', 403));
  }

  const existing = await Review.findOne({ user: req.user._id, product: productId });
  if (existing) {
    return next(new AppError('You have already reviewed this product', 400));
  }

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    rating,
    comment,
  });

  res.status(201).json({ status: 'success', data: { review } });
});
