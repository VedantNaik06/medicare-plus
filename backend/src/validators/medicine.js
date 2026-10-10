import { z } from 'zod';
import { dayString, optionalDay, text, timeString } from './common.js';

export const medicineBody = z
  .object({
    name: z.string({ required_error: 'validation.medicineNameRequired' }).trim().min(1, 'validation.medicineNameRequired').max(100, 'validation.tooLong'),
    dosage: text(60),
    frequency: z.enum(['once', 'twice', 'thrice', 'four', 'custom']),
    times: z.array(timeString).min(1, 'validation.timesRequired').max(8, 'validation.tooLong'),
    startDate: dayString,
    endDate: optionalDay,
    foodInstruction: z.enum(['none', 'before', 'after', 'with']).default('none'),
    notes: text(500),
  })
  .superRefine((v, ctx) => {
    if (new Set(v.times).size !== v.times.length) {
      ctx.addIssue({ code: 'custom', path: ['times'], message: 'validation.timesDuplicate' });
    }
    if (v.endDate && v.endDate < v.startDate) {
      ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'validation.endBeforeStart' });
    }
  })
  .transform((v) => ({ ...v, times: [...v.times].sort() }));

export const medicineListQuery = z.object({
  phase: z.enum(['active', 'completed', 'all']).default('all'),
});
