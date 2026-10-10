import { z } from 'zod';
import { isValidZone } from '../utils/time.js';

const phone = z.string().trim().max(20, 'validation.tooLong').regex(/^[0-9+\-\s()]*$/, 'validation.invalid');

export const updateMeBody = z
  .object({
    name: z.string().trim().min(2, 'validation.nameShort').max(80, 'validation.tooLong'),
    language: z.enum(['en', 'mr']),
    timeZone: z.string().refine(isValidZone, 'validation.invalid'),
    notificationPrefs: z.object({
      browser: z.boolean(),
      appointmentLeadMinutes: z.array(z.number().int().min(5).max(10080)).max(4),
    }),
    emergencyContact: z.object({
      name: z.string().trim().max(80, 'validation.tooLong'),
      phone,
      relation: z.string().trim().max(40, 'validation.tooLong'),
    }),
  })
  .partial();

export const deleteMeBody = z.object({
  password: z.string().min(1, 'validation.passwordRequired').max(72),
});
