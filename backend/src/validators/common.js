import { z } from 'zod';
import { DateTime } from 'luxon';

// Error messages are translation KEYS ("validation.xxx"). The React app translates them
// into English or Marathi, so even server-side errors are bilingual.

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'validation.invalidId');
export const idParams = z.object({ id: objectId });

export const dayString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'validation.invalidDate')
  .refine((v) => DateTime.fromISO(v).isValid, 'validation.invalidDate');

export const timeString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'validation.invalidTime');

export const localDateTime = z
  .string({ required_error: 'validation.dateTimeRequired' })
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'validation.dateTimeRequired')
  .refine((v) => DateTime.fromISO(v).isValid, 'validation.invalidDate');

// "" or missing -> undefined
const emptyToUndefined = (v) => (v === '' || v === null ? undefined : v);
export const optionalDay = z.preprocess(emptyToUndefined, dayString.optional());

export const text = (max) => z.string().trim().max(max, 'validation.tooLong').optional().default('');

export const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
};
