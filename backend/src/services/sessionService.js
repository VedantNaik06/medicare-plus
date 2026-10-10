import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { COOKIE_NAME } from '../middleware/auth.js';

// The token lives in an HttpOnly cookie: JavaScript on the page cannot read it,
// which protects it from theft by injected scripts (XSS).
const baseOptions = () => ({
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: env.COOKIE_SAMESITE,
  path: '/',
});

export function issueSession(res, userId) {
  const token = jwt.sign({ sub: String(userId) }, env.JWT_SECRET, { expiresIn: `${env.SESSION_DAYS}d` });
  res.cookie(COOKIE_NAME, token, { ...baseOptions(), maxAge: env.SESSION_DAYS * 24 * 60 * 60 * 1000 });
}

export function clearSession(res) {
  res.clearCookie(COOKIE_NAME, baseOptions());
}
