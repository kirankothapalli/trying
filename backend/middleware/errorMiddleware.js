const notFound = (req, res, next) => { const e = new Error(`Route not found: ${req.originalUrl}`); e.statusCode = 404; next(e); };
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;
  if (err.name === 'ValidationError') { statusCode = 400; message = 'Validation Error'; errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message })); }
  if (err.code === 11000) { statusCode = 409; const field = Object.keys(err.keyValue)[0]; message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`; }
  if (err.name === 'CastError') { statusCode = 400; message = `Invalid ${err.path}: ${err.value}`; }
  if (err.name === 'JsonWebTokenError') { statusCode = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError') { statusCode = 401; message = 'Token expired'; }
  if (process.env.NODE_ENV === 'development') console.error(`❌ [${statusCode}]: ${message}`);
  res.status(statusCode).json({ success: false, message, ...(errors && { errors }), ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) });
};
module.exports = { notFound, errorHandler };
