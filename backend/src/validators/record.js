import { z } from 'zod';
import { optionalDay, pagination } from './common.js';

export const recordBody = z.object({
  type: z.enum(['prescription', 'lab_report', 'other']).default('other'),
  title: z.string().trim().max(100, 'validation.tooLong').optional().default(''),
  recordDate: optionalDay,
});

export const recordListQuery = z.object({
  ...pagination,
  type: z.enum(['prescription', 'lab_report', 'other']).optional(),
});

export const fileQuery = z.object({ download: z.enum(['1', '0']).optional() });
