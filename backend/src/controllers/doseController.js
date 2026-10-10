import DoseLog from '../models/DoseLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { notFound } from '../utils/ApiError.js';
import { ok, pageInfo, skipFor } from '../utils/response.js';
import { dayRangeUtc, todayInZone } from '../utils/time.js';
import { env } from '../config/env.js';
import { serializeDose, topUpForUser } from '../services/doseService.js';

const POPULATE = ['medicine', 'name dosage foodInstruction'];

// GET /doses?from=YYYY-MM-DD&to=YYYY-MM-DD  (days in the user's time zone; default = today)
export const listDoses = asyncHandler(async (req, res) => {
  const zone = req.user.timeZone;
  const today = todayInZone(zone);
  const from = req.query.from || today;
  const to = req.query.to || from;
  const { start, end } = dayRangeUtc(from, to, zone);

  await topUpForUser(req.user._id, zone);
  const logs = await DoseLog.find({ user: req.user._id, scheduledAt: { $gte: start, $lte: end } })
    .sort({ scheduledAt: 1 })
    .limit(300)
    .populate(...POPULATE);
  const now = new Date();
  ok(res, { items: logs.filter((l) => l.medicine).map((l) => serializeDose(l, now)) });
});

// GET /doses/history  (past doses, newest first, paginated)
export const doseHistory = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const now = new Date();
  const filter = { user: req.user._id, scheduledAt: { $lte: now } };
  if (status === 'taken' || status === 'skipped') filter.status = status;
  if (status === 'missed') {
    filter.status = 'scheduled';
    filter.scheduledAt = { $lt: new Date(now.getTime() - env.graceMs) };
  }

  const [total, logs] = await Promise.all([
    DoseLog.countDocuments(filter),
    DoseLog.find(filter).sort({ scheduledAt: -1 }).skip(skipFor(page, limit)).limit(limit).populate(...POPULATE),
  ]);
  ok(res, { items: logs.filter((l) => l.medicine).map((l) => serializeDose(l, now)), ...pageInfo(page, limit, total) });
});

// PATCH /doses/:id  { status: 'taken' | 'skipped' }
export const markDose = asyncHandler(async (req, res) => {
  const log = await DoseLog.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { status: req.body.status, actedAt: new Date() },
    { new: true }
  ).populate(...POPULATE);
  if (!log) throw notFound();
  ok(res, { dose: serializeDose(log) });
});
