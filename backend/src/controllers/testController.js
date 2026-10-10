import Measurement from '../models/Measurement.js';
import MedicalRecord from '../models/MedicalRecord.js';
import TestReport from '../models/TestReport.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError, notFound } from '../utils/ApiError.js';
import { ok, pageInfo, skipFor } from '../utils/response.js';
import { escapeRegex, normalizeName, normalizeUnit } from '../utils/time.js';
import { serializeMeasurement, serializeRecord, serializeTest } from '../utils/serializers.js';
import { buildComparison } from '../services/compareService.js';

const mine = (req, extra = {}) => ({ user: req.user._id, ...extra });

async function assertOwnRecord(req, recordId) {
  if (!recordId) return null;
  const exists = await MedicalRecord.exists(mine(req, { _id: recordId }));
  if (!exists) throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid file.', [{ field: 'recordId', message: 'validation.invalid' }]);
  return recordId;
}

function toMeasurementDoc(m, report, userId) {
  const numeric = m.valueType === 'numeric';
  return {
    user: userId,
    report: report._id,
    testDate: report.testDate,
    name: m.name,
    nameKey: normalizeName(m.name),
    valueType: m.valueType,
    valueNumber: numeric ? Number(m.value) : undefined,
    valueText: numeric ? undefined : m.value,
    unit: m.unit || '',
    unitKey: normalizeUnit(m.unit),
    refLow: m.refLow,
    refHigh: m.refHigh,
    refText: m.refText || '',
  };
}

export const listTests = asyncHandler(async (req, res) => {
  const { page, limit, search, category, from, to } = req.query;
  const filter = mine(req);
  if (search) filter.testName = { $regex: escapeRegex(search), $options: 'i' };
  if (category) filter.category = category;
  if (from || to) filter.testDate = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };

  const [total, docs] = await Promise.all([
    TestReport.countDocuments(filter),
    TestReport.find(filter).sort({ testDate: -1, createdAt: -1 }).skip(skipFor(page, limit)).limit(limit),
  ]);

  const counts = await Measurement.aggregate([
    { $match: { user: req.user._id, report: { $in: docs.map((d) => d._id) } } },
    { $group: { _id: '$report', n: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.n]));

  ok(res, {
    items: docs.map((d) => serializeTest(d, { measurementCount: countMap.get(String(d._id)) || 0, hasFile: Boolean(d.record) })),
    ...pageInfo(page, limit, total),
  });
});

export const getTest = asyncHandler(async (req, res) => {
  const report = await TestReport.findOne(mine(req, { _id: req.params.id })).populate('record');
  if (!report) throw notFound();
  const measurements = await Measurement.find(mine(req, { report: report._id })).sort({ createdAt: 1 });
  ok(res, {
    test: serializeTest(report, {
      hasFile: Boolean(report.record),
      record: report.record ? serializeRecord(report.record) : null,
      measurements: measurements.map(serializeMeasurement),
    }),
  });
});

export const createTest = asyncHandler(async (req, res) => {
  const { measurements, recordId, ...fields } = req.body;
  const record = await assertOwnRecord(req, recordId);

  const report = await TestReport.create({ ...fields, user: req.user._id, record });
  try {
    if (measurements.length) await Measurement.insertMany(measurements.map((m) => toMeasurementDoc(m, report, req.user._id)));
  } catch (err) {
    await TestReport.deleteOne({ _id: report._id }); // do not leave a half-saved report
    throw err;
  }
  ok(res, { id: String(report._id) }, 201);
});

export const updateTest = asyncHandler(async (req, res) => {
  const report = await TestReport.findOne(mine(req, { _id: req.params.id }));
  if (!report) throw notFound();
  const { measurements, recordId, ...fields } = req.body;
  const record = await assertOwnRecord(req, recordId);

  report.set({ ...fields, record: record || report.record });
  await report.save();

  // Replace the measurements with the edited list.
  await Measurement.deleteMany(mine(req, { report: report._id }));
  if (measurements.length) await Measurement.insertMany(measurements.map((m) => toMeasurementDoc(m, report, req.user._id)));
  ok(res, { id: String(report._id) });
});

export const deleteTest = asyncHandler(async (req, res) => {
  const report = await TestReport.findOneAndDelete(mine(req, { _id: req.params.id }));
  if (!report) throw notFound();
  await Measurement.deleteMany(mine(req, { report: report._id }));
  ok(res, { deleted: true });
});

// Which measurement names exist, and in which units? (fills the "choose a measurement" list)
export const measurementNames = asyncHandler(async (req, res) => {
  const rows = await Measurement.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id: '$nameKey',
        name: { $first: '$name' },
        count: { $sum: 1 },
        lastDate: { $max: '$testDate' },
      },
    },
    { $sort: { name: 1 } },
    { $limit: 200 },
  ]);
  ok(res, { items: rows.map((r) => ({ nameKey: r._id, name: r.name, count: r.count, lastDate: r.lastDate })) });
});

// GET /tests/compare?name=<nameKey>&unit=<unitKey>&from&to
export const compareMeasurements = asyncHandler(async (req, res) => {
  const { name, unit, from, to } = req.query;
  const filter = mine(req, { nameKey: normalizeName(name) });
  if (from || to) filter.testDate = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };

  const rows = await Measurement.find(filter).sort({ testDate: 1, createdAt: 1 }).limit(500).lean();
  const result = buildComparison(rows, unit === undefined ? undefined : normalizeUnit(unit));
  ok(res, result);
});
