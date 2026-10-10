import { z } from 'zod';

const email = z
  .string({ required_error: 'validation.emailInvalid' })
  .trim()
  .toLowerCase()
  .email('validation.emailInvalid')
  .max(254, 'validation.tooLong');

export const registerBody = z.object({
  name: z.string({ required_error: 'validation.nameRequired' }).trim().min(2, 'validation.nameShort').max(80, 'validation.tooLong'),
  email,
  password: z
    .string({ required_error: 'validation.passwordWeak' })
    .min(8, 'validation.passwordWeak')
    .max(72, 'validation.passwordWeak') // bcrypt only reads the first 72 characters
    .regex(/[A-Za-z]/, 'validation.passwordWeak')
    .regex(/\d/, 'validation.passwordWeak'),
  language: z.enum(['en', 'mr']).optional(),
});

export const loginBody = z.object({
  email,
  password: z.string({ required_error: 'validation.passwordRequired' }).min(1, 'validation.passwordRequired').max(72),
});
