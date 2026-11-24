const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

exports.protectAdmin = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Admin authentication required', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin' || decoded.username !== 'bernard_admin') {
      return next(new AppError('Not authorized as admin', 403));
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired admin session', 401));
  }
};
