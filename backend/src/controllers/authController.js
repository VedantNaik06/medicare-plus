import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import { clearSession, issueSession } from '../services/sessionService.js';

const COST = 12; // how slow hashing is on purpose; higher = harder to brute-force
// Used so a login for an unknown email takes about as long as a real one.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password-1', COST);

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, language } = req.body;

  if (await User.exists({ email })) throw new ApiError(409, 'EMAIL_TAKEN', 'An account with this email already exists.');

  const passwordHash = await bcrypt.hash(password, COST);
  const user = await User.create({ name, email, passwordHash, language: language || 'en' });

  issueSession(res, user._id);
  ok(res, { user }, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash');

  const matches = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !matches) {
    // Same message for "no such email" and "wrong password" so attackers learn nothing.
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Incorrect email or password.');
  }

  issueSession(res, user._id);
  ok(res, { user: await User.findById(user._id) });
});

export const logout = (_req, res) => {
  clearSession(res);
  ok(res, { loggedOut: true });
};

export const me = (req, res) => ok(res, { user: req.user });
