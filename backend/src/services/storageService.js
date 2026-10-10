import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileTypeFromFile } from 'file-type';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

// All file access goes through this module. Today it uses a private folder on disk.
// For deployment on hosts with temporary disks, only THIS file needs to change
// (for example to use Cloudinary or Amazon S3 with private access).

const EXTENSIONS = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png' };

const safeKey = (key) => {
  if (path.basename(key) !== key) throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid file key.');
  return path.join(env.uploadDir, key);
};

export async function remove(key) {
  try {
    await fsp.unlink(safeKey(key));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err; // already gone is fine
  }
}

// Look at the real bytes of the file (not the name or the browser's claim),
// then give it a random permanent name.
export async function finalizeUpload(file) {
  const detected = await fileTypeFromFile(file.path);
  const ext = detected && EXTENSIONS[detected.mime];
  if (!ext) {
    await remove(file.filename);
    throw new ApiError(415, 'UNSUPPORTED_FILE_TYPE', 'Only PDF, JPG and PNG files are allowed.');
  }
  const storageKey = `${crypto.randomUUID()}.${ext}`;
  await fsp.rename(file.path, safeKey(storageKey));
  return { storageKey, mimeType: detected.mime };
}

export function openReadStream(key) {
  return fs.createReadStream(safeKey(key));
}
