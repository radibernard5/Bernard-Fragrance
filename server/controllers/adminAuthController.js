const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.adminLogin = catchAsync(async (req, res, next) => {
  const { username, password } = req.body || {};

  const expectedUsername = 'bernard_admin';
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    return next(new AppError('Admin authentication is not configured', 500));
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    return next(new AppError('Invalid username or password', 401));
  }

  const token = jwt.sign(
    { username: expectedUsername, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.status(200).json({
    status: 'success',
    token,
    data: { admin: { username: expectedUsername } },
  });
});
