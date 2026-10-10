import { z } from 'zod';
import { localDateTime, pagination, text } from './common.js';

export const LEAD_OPTIONS = [60, 120, 1440, 2880];

const leads = z
  .array(z.coerce.number().refine((n) => LEAD_OPTIONS.includes(n), 'validation.invalid'))
  .max(4)
  .default([1440, 60]);

export const appointmentBody = z.object({
  doctorName: z.string({ required_error: 'validation.doctorRequired' }).trim().min(1, 'validation.doctorRequired').max(100, 'validation.tooLong'),
  clinicName: text(100),
  appointmentLocal: localDateTime,
  reason: text(300),
  reminderLeadMinutes: leads,
});

export const appointmentListQuery = z.object({
  ...pagination,
  tab: z.enum(['upcoming', 'past']).default('upcoming'),
});

export const appointmentStatusBody = z
  .object({
    status: z.enum(['upcoming', 'completed', 'rescheduled', 'cancelled']),
    appointmentLocal: localDateTime.optional(),
  })
  .superRefine((v, ctx) => {
    if (v.status === 'rescheduled' && !v.appointmentLocal) {
      ctx.addIssue({ code: 'custom', path: ['appointmentLocal'], message: 'validation.dateTimeRequired' });
    }
  });
