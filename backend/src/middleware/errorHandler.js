import { config } from '../config/index.js';

export function errorHandler(err, req, res, next) {
  console.error('[Error Middleware]', err);

  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Requested resource not found.';
    return res.status(404).json({ success: false, message });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `An account with this ${field} already exists.`;
    return res.status(400).json({ success: false, message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    return res.status(400).json({ success: false, message });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Unable to complete your request. Please try again.',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
}
