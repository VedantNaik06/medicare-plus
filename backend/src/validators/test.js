import { z } from 'zod';
import { dayString, objectId, optionalDay, pagination, text } from './common.js';
import { TEST_CATEGORIES } from '../models/TestReport.js';

const emptyToUndefined = (v) => (v === '' || v === null ? undefined : v);
const optionalNumber = z.preprocess(
  emptyToUndefined,
  z.coerce.number({ invalid_type_error: 'validation.valueNumeric' }).finite('validation.valueNumeric').optional()
);

const measurement = z
  .object({
    name: z.string({ required_error: 'validation.measurementNameRequired' }).trim().min(1, 'validation.measurementNameRequired').max(80, 'validation.tooLong'),
    valueType: z.enum(['numeric', 'qualitative']),
    value: z.string({ required_error: 'validation.valueRequired' }).trim().min(1, 'validation.valueRequired').max(100, 'validation.tooLong'),
    unit: text(20),
    refLow: optionalNumber,
    refHigh: optionalNumber,
    refText: text(60),
  })
  .superRefine((m, ctx) => {
    if (m.valueType === 'numeric' && !Number.isFinite(Number(m.value))) {
      ctx.addIssue({ code: 'custom', path: ['value'], message: 'validation.valueNumeric' });
    }
    if (m.refLow !== undefined && m.refHigh !== undefined && m.refLow > m.refHigh) {
      ctx.addIssue({ code: 'custom', path: ['refLow'], message: 'validation.rangeOrder' });
    }
  });

export const testBody = z.object({
  testName: z.string({ required_error: 'validation.testNameRequired' }).trim().min(1, 'validation.testNameRequired').max(100, 'validation.tooLong'),
  category: z.enum(TEST_CATEGORIES).default('other'),
  testDate: dayString,
  labName: text(100),
  notes: text(1000),
  recordId: z.preprocess(emptyToUndefined, objectId.optional()),
  measurements: z.array(measurement).max(40).default([]),
});

export const testListQuery = z.object({
  ...pagination,
  search: z.string().trim().max(80).optional(),
  category: z.enum(TEST_CATEGORIES).optional(),
  from: optionalDay,
  to: optionalDay,
});

export const compareQuery = z.object({
  name: z.string().trim().min(1, 'validation.invalid').max(80),
  unit: z.string().trim().max(20).optional(), // omitted = pick the most common unit; "" = no unit
  from: optionalDay,
  to: optionalDay,
});
