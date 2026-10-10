import { DateTime } from 'luxon';
import { env } from '../config/env.js';
import DoseLog from '../models/DoseLog.js';
import Medicine from '../models/Medicine.js';
import { todayInZone } from '../utils/time.js';

export const HORIZON_DAYS = 7; // we prepare dose rows this many days ahead

// ---- Pure helpers (easy to unit-test) -------------------------------------------------

// Which exact moments (UTC) should a medicine's doses happen on?
export function buildDoseTimes(medicine, zone, now = new Date(), horizonDays = HORIZON_DAYS) {
  const today = DateTime.fromJSDate(now, { zone }).startOf('day');
  const start = DateTime.fromISO(medicine.startDate, { zone }).startOf('day');
  let last = today.plus({ days: horizonDays });
  if (medicine.endDate) {
    const end = DateTime.fromISO(medicine.endDate, { zone }).startOf('day');
    if (end < last) last = end;
  }
  const first = start > today ? start : today;

  const out = [];
  for (let day = first; day <= last; day = day.plus({ days: 1 })) {
    for (const time of medicine.times) {
      const [hour, minute] = time.split(':').map(Number);
      out.push(day.set({ hour, minute, second: 0, millisecond: 0 }).toUTC().toJSDate());
    }
  }
  return out;
}

// scheduled doses are shown as upcoming -> due -> overdue depending on the clock.
export function getDisplayStatus(log, now = new Date(), graceMs = env.graceMs) {
  if (log.status !== 'scheduled') return log.status;
  const t = new Date(log.scheduledAt).getTime();
  const n = now.getTime();
  if (n < t) return 'upcoming';
  if (n < t + graceMs) return 'due';
  return 'overdue';
}

export function serializeDose(log, now = new Date()) {
  const med = log.medicine && log.medicine._id ? log.medicine : null;
  return {
    id: String(log._id),
    medicineId: String(med ? med._id : log.medicine),
    medicine: med
      ? { id: String(med._id), name: med.name, dosage: med.dosage || '', foodInstruction: med.foodInstruction }
      : null,
    scheduledAt: log.scheduledAt,
    status: log.status,
    displayStatus: getDisplayStatus(log, now),
    actedAt: log.actedAt || null,
  };
}

// ---- Database helpers -----------------------------------------------------------------

const isDuplicateOnly = (err) =>
  err?.code === 11000 || (Array.isArray(err?.writeErrors) && err.writeErrors.every((e) => e.code === 11000));

// Create missing dose rows. The unique index + upsert makes this safe to run any number of times.
export async function ensureDoseLogs(medicine, zone, { notBefore } = {}) {
  const times = buildDoseTimes(medicine, zone).filter((d) => !notBefore || d >= notBefore);
  if (!times.length) return;
  try {
    await DoseLog.bulkWrite(
      times.map((scheduledAt) => ({
        updateOne: {
          filter: { medicine: medicine._id, scheduledAt },
          update: { $setOnInsert: { user: medicine.user, status: 'scheduled', notifiedAt: null } },
          upsert: true,
        },
      })),
      { ordered: false }
    );
  } catch (err) {
    if (!isDuplicateOnly(err)) throw err; // two requests raced; the unique index kept us safe
  }
}

// After a medicine is created or edited: drop future pending doses and rebuild them.
export async function syncMedicineLogs(medicine, zone) {
  const now = new Date();
  await DoseLog.deleteMany({ medicine: medicine._id, status: 'scheduled', scheduledAt: { $gt: now } });
  await ensureDoseLogs(medicine, zone, { notBefore: now });
}

// Keep the next 7 days prepared for one user (called when they open the app).
export async function topUpForUser(userId, zone) {
  const startOfToday = DateTime.now().setZone(zone).startOf('day').toUTC().toJSDate();
  const today = todayInZone(zone);
  const medicines = await Medicine.find({ user: userId, $or: [{ endDate: null }, { endDate: { $gte: today } }] });
  for (const med of medicines) await ensureDoseLogs(med, zone, { notBefore: startOfToday });
}

// Same job for everybody (called by the scheduler every hour).
export async function topUpAllUsers() {
  const yesterday = DateTime.now().minus({ days: 1 }).toFormat('yyyy-LL-dd');
  const cursor = Medicine.find({ $or: [{ endDate: null }, { endDate: { $gte: yesterday } }] })
    .populate('user', 'timeZone')
    .cursor();
  let count = 0;
  for await (const med of cursor) {
    if (!med.user) continue;
    const startOfToday = DateTime.now().setZone(med.user.timeZone).startOf('day').toUTC().toJSDate();
    await ensureDoseLogs({ ...med.toObject(), user: med.user._id }, med.user.timeZone, { notBefore: startOfToday });
    count += 1;
  }
  return count;
}

export async function adherenceSummary(userId, days = 7, now = new Date()) {
  const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const missedBefore = new Date(now.getTime() - env.graceMs);
  const [taken, skipped, missed] = await Promise.all([
    DoseLog.countDocuments({ user: userId, status: 'taken', scheduledAt: { $gte: since, $lte: now } }),
    DoseLog.countDocuments({ user: userId, status: 'skipped', scheduledAt: { $gte: since, $lte: now } }),
    DoseLog.countDocuments({ user: userId, status: 'scheduled', scheduledAt: { $gte: since, $lt: missedBefore } }),
  ]);
  const total = taken + skipped + missed;
  return { days, taken, skipped, missed, total, percent: total ? Math.round((taken / total) * 100) : null };
}
