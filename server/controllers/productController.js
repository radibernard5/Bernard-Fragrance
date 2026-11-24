const mongoose = require('mongoose');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find().sort('-createdAt');
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: { products },
  });
});

exports.getProductById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid product id', 404));
  }
  const product = await Product.findById(id);
  if (!product) return next(new AppError('Product not found', 404));
  res.status(200).json({ status: 'success', data: { product } });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const { name, price, description, imageUrl, category, stock, isAvailable } = req.body;

  const product = await Product.create({
    name,
    price: Number(price),
    description,
    imageUrl,
    category,
    stock: Number(stock),
    isAvailable:
      typeof isAvailable === 'boolean'
        ? isAvailable
        : typeof isAvailable === 'string'
        ? isAvailable === 'true'
        : Number(stock) > 0,
  });

  res.status(201).json({ status: 'success', data: { product } });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid product id', 404));
  }

  const allowed = ['name', 'price', 'description', 'imageUrl', 'category', 'stock', 'isAvailable'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  if (updates.price !== undefined) updates.price = Number(updates.price);
  if (updates.stock !== undefined) updates.stock = Number(updates.stock);
  if (typeof updates.isAvailable === 'string') updates.isAvailable = updates.isAvailable === 'true';

  const product = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!product) return next(new AppError('Product not found', 404));
  res.status(200).json({ status: 'success', data: { product } });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);
  if (!product) return next(new AppError('Product not found', 404));
  res.status(204).json({ status: 'success', data: null });
});
