import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';

// CSRF defence: browsers cannot add custom headers to cross-site form posts,
// so requiring one on every state-changing request blocks them.
export const REQUIRED_HEADER = 'x-requested-with';
export const REQUIRED_HEADER_VALUE = 'medicare-web';

export function requireCustomHeader(req, _res, next) {
  const safe = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  if (!safe && req.get(REQUIRED_HEADER) !== REQUIRED_HEADER_VALUE) {
    return next(new ApiError(403, 'CSRF', 'Request blocked.'));
  }
  next();
}

const limiterHandler = (_req, _res, next) =>
  next(new ApiError(429, 'RATE_LIMITED', 'Too many attempts. Please wait a few minutes.'));

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterHandler,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterHandler,
});
