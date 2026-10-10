import fs from 'node:fs';
import crypto from 'node:crypto';
import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

fs.mkdirSync(env.uploadDir, { recursive: true });

export const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png'];

// Files are saved with a random temporary name. The real name is never used on disk.
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadDir),
  filename: (_req, _file, cb) => cb(null, `${crypto.randomUUID()}.tmp`),
});

export const uploadSingle = multer({
  storage,
  limits: { fileSize: env.maxFileBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true);
    cb(new ApiError(415, 'UNSUPPORTED_FILE_TYPE', 'Only PDF, JPG and PNG files are allowed.'));
  },
}).single('file');
