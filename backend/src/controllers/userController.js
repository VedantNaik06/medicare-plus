import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import { deleteUserData } from '../services/accountService.js';
import { clearSession } from '../services/sessionService.js';

export const getMe = (req, res) => ok(res, { user: req.user });

export const updateMe = asyncHandler(async (req, res) => {
  req.user.set(req.body); // body was already cleaned by Zod: only allowed fields are present
  await req.user.save();
  ok(res, { user: req.user });
});

export const deleteMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+passwordHash');
  const matches = await bcrypt.compare(req.body.password, user.passwordHash);
  if (!matches) throw new ApiError(400, 'WRONG_PASSWORD', 'That password is not correct.');

  await deleteUserData(user._id);
  clearSession(res);
  ok(res, { deleted: true });
});
