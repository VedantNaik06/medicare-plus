import Appointment from '../models/Appointment.js';
import DoseLog from '../models/DoseLog.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Medicine from '../models/Medicine.js';
import TestReport from '../models/TestReport.js';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import { dayRangeUtc, todayInZone } from '../utils/time.js';
import { serializeAppointment } from '../utils/serializers.js';
import { adherenceSummary, serializeDose, topUpForUser } from '../services/doseService.js';

const POPULATE = ['medicine', 'name dosage foodInstruction'];

export const getDashboard = asyncHandler(async (req, res) => {
  const user = req.user;
  const zone = user.timeZone;
  const now = new Date();
  const today = todayInZone(zone, now);
  const { start, end } = dayRangeUtc(today, today, zone);

  await topUpForUser(user._id, zone);

  const [todayLogs, nextLog, nextAppt, adherence, medicineCount, tests, records] = await Promise.all([
    DoseLog.find({ user: user._id, scheduledAt: { $gte: start, $lte: end } }).sort({ scheduledAt: 1 }).populate(...POPULATE),
    DoseLog.findOne({
      user: user._id,
      status: 'scheduled',
      scheduledAt: { $gte: new Date(now.getTime() - env.graceMs) },
    })
      .sort({ scheduledAt: 1 })
      .populate(...POPULATE),
    Appointment.findOne({ user: user._id, status: { $in: ['upcoming', 'rescheduled'] }, appointmentAt: { $gte: now } }).sort({ appointmentAt: 1 }),
    adherenceSummary(user._id, 7, now),
    Medicine.countDocuments({ user: user._id }),
    TestReport.find({ user: user._id }).sort({ createdAt: -1 }).limit(3),
    MedicalRecord.find({ user: user._id }).sort({ createdAt: -1 }).limit(3),
  ]);

  const recent = [
    ...tests.map((t) => ({ kind: 'test', id: String(t._id), title: t.testName, date: t.testDate, createdAt: t.createdAt })),
    ...records.map((r) => ({ kind: 'record', id: String(r._id), title: r.title, date: r.recordDate || '', createdAt: r.createdAt })),
  ]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 4);

  ok(res, {
    today,
    medicineCount,
    todayDoses: todayLogs.filter((l) => l.medicine).map((l) => serializeDose(l, now)),
    nextDose: nextLog && nextLog.medicine ? serializeDose(nextLog, now) : null,
    nextAppointment: nextAppt ? serializeAppointment(nextAppt, zone) : null,
    recentReports: recent,
    adherence,
  });
});
