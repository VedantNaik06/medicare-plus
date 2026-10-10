import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const COOKIE_NAME = 'medicare_token';

// Runs before every private route. The user id comes ONLY from the signed cookie,
// never from the request body, query or URL.
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw new ApiError(401, 'AUTH_REQUIRED', 'Please log in to continue.');

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'SESSION_EXPIRED', 'Your session has ended. Please log in again.');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, 'AUTH_REQUIRED', 'Please log in to continue.');

  req.user = user;
  next();
});
