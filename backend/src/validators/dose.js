import { z } from 'zod';
import { optionalDay, pagination } from './common.js';

export const doseListQuery = z.object({ from: optionalDay, to: optionalDay });

export const doseHistoryQuery = z.object({
  ...pagination,
  status: z.enum(['taken', 'skipped', 'missed']).optional(),
});

export const doseMarkBody = z.object({ status: z.enum(['taken', 'skipped']) });
