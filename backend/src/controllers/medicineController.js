import DoseLog from '../models/DoseLog.js';
import Medicine from '../models/Medicine.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { notFound } from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { serializeMedicine } from '../utils/serializers.js';
import { syncMedicineLogs } from '../services/doseService.js';

// Every query below includes `user: req.user._id`. That is the ownership check.
const mine = (req, extra = {}) => ({ user: req.user._id, ...extra });

export const listMedicines = asyncHandler(async (req, res) => {
  const { phase } = req.query;
  const now = new Date();
  const docs = await Medicine.find(mine(req)).sort({ createdAt: -1 }).limit(200);
  let items = docs.map((m) => serializeMedicine(m, req.user.timeZone, now));
  if (phase === 'active') items = items.filter((m) => m.phase !== 'completed');
  if (phase === 'completed') items = items.filter((m) => m.phase === 'completed');
  ok(res, { items });
});

export const getMedicine = asyncHandler(async (req, res) => {
  const med = await Medicine.findOne(mine(req, { _id: req.params.id }));
  if (!med) throw notFound();
  ok(res, { medicine: serializeMedicine(med, req.user.timeZone) });
});

export const createMedicine = asyncHandler(async (req, res) => {
  const med = await Medicine.create({ ...req.body, user: req.user._id });
  await syncMedicineLogs(med, req.user.timeZone);
  ok(res, { medicine: serializeMedicine(med, req.user.timeZone) }, 201);
});

export const updateMedicine = asyncHandler(async (req, res) => {
  const med = await Medicine.findOne(mine(req, { _id: req.params.id }));
  if (!med) throw notFound();
  med.set({ ...req.body, endDate: req.body.endDate || undefined });
  await med.save();
  await syncMedicineLogs(med, req.user.timeZone);
  ok(res, { medicine: serializeMedicine(med, req.user.timeZone) });
});

export const deleteMedicine = asyncHandler(async (req, res) => {
  const med = await Medicine.findOneAndDelete(mine(req, { _id: req.params.id }));
  if (!med) throw notFound();
  await DoseLog.deleteMany({ medicine: med._id, user: req.user._id });
  ok(res, { deleted: true });
});
