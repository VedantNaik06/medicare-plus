import 'dotenv/config';
import path from 'node:path';
import { z } from 'zod';

// Read and validate environment variables once, at start-up.
// If something is missing we stop immediately with a clear message.
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required (your MongoDB Atlas connection string)'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  SESSION_DAYS: z.coerce.number().int().min(1).max(30).default(7),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  COOKIE_SECURE: z.enum(['true', 'false']).optional(),
  UPLOAD_DIR: z.string().default('storage/uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().positive().default(5),
  DOSE_GRACE_MINUTES: z.coerce.number().int().min(1).default(60),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:');
  for (const issue of parsed.error.issues) console.error(` - ${issue.path.join('.')}: ${issue.message}`);
  process.exit(1);
}

const v = parsed.data;
const isProd = v.NODE_ENV === 'production';

export const env = {
  ...v,
  isProd,
  clientOrigins: v.CLIENT_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean),
  // Browsers require Secure cookies when SameSite=None.
  cookieSecure: v.COOKIE_SECURE ? v.COOKIE_SECURE === 'true' : isProd || v.COOKIE_SAMESITE === 'none',
  uploadDir: path.resolve(process.cwd(), v.UPLOAD_DIR),
  maxFileBytes: Math.round(v.MAX_FILE_SIZE_MB * 1024 * 1024),
  graceMs: v.DOSE_GRACE_MINUTES * 60 * 1000,
};
