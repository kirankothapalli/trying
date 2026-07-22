const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/helpers');
const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) token = req.headers.authorization.split(' ')[1];
    if (!token) return sendError(res, 401, 'Access denied. No token provided.');
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!user) return sendError(res, 401, 'User no longer exists.');
    if (!user.isActive) return sendError(res, 401, 'Your account has been deactivated.');
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') return sendError(res, 401, 'Token expired.');
    return sendError(res, 401, 'Invalid token.');
  }
};
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return sendError(res, 403, `Access denied. Role '${req.user.role}' not authorized.`);
  next();
};
module.exports = { protect, authorize };
