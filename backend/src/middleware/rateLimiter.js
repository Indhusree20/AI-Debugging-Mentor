import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 attempts per hour for login/register
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});

export const debugLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 40, // 40 executions/analysis per minute
  message: {
    success: false,
    message: 'Code analysis rate limit exceeded. Please wait a moment.',
  },
});
