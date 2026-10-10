import { ZodError } from 'zod';
import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export function notFoundHandler(_req, res) {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found.' } });
}

// The ONE place where errors become JSON responses.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  let status = 500;
  let code = 'SERVER_ERROR';
  let message = 'Something went wrong on our side. Please try again.';
  let details;

  if (err instanceof ApiError) {
    ({ status, code, message, details } = err);
  } else if (err instanceof ZodError) {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'Please check the highlighted fields.';
    details = err.issues.map((i) => ({
      field: i.path.join('.'),
      message: String(i.message).startsWith('validation.') ? i.message : 'validation.invalid',
    }));
  } else if (err instanceof multer.MulterError) {
    const tooBig = err.code === 'LIMIT_FILE_SIZE';
    status = tooBig ? 413 : 400;
    code = tooBig ? 'FILE_TOO_LARGE' : 'UPLOAD_ERROR';
    message = tooBig ? 'That file is too large.' : 'The upload could not be processed.';
  } else if (err?.code === 11000) {
    status = 409;
    code = 'DUPLICATE';
    message = 'This item already exists.';
  } else if (err?.name === 'CastError') {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid value.';
  } else if (err?.type === 'entity.parse.failed') {
    status = 400;
    code = 'BAD_JSON';
    message = 'The request body is not valid JSON.';
  }

  if (status >= 500) {
    // Log the problem, never the request body (it may contain medical data).
    console.error(`[error] ${req.method} ${req.path}:`, env.isProd ? err.message : err);
  }

  res.status(status).json({ success: false, error: { code, message, ...(details ? { details } : {}) } });
}
