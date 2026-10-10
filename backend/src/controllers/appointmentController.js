import Appointment from '../models/Appointment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError, notFound } from '../utils/ApiError.js';
import { ok, pageInfo, skipFor } from '../utils/response.js';
import { localToUtc } from '../utils/time.js';
import { serializeAppointment } from '../utils/serializers.js';

const mine = (req, extra = {}) => ({ user: req.user._id, ...extra });

const toUtcOrFail = (local, zone) => {
  const date = localToUtc(local, zone);
  if (!date) throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid date.', [{ field: 'appointmentLocal', message: 'validation.invalidDate' }]);
  return date;
};

export const listAppointments = asyncHandler(async (req, res) => {
  const { tab, page, limit } = req.query;
  const now = new Date();
  const active = ['upcoming', 'rescheduled'];
  const filter =
    tab === 'upcoming'
      ? mine(req, { status: { $in: active }, appointmentAt: { $gte: now } })
      : mine(req, { $or: [{ status: { $nin: active } }, { appointmentAt: { $lt: now } }] });
  const sort = tab === 'upcoming' ? { appointmentAt: 1 } : { appointmentAt: -1 };

  const [total, docs] = await Promise.all([
    Appointment.countDocuments(filter),
    Appointment.find(filter).sort(sort).skip(skipFor(page, limit)).limit(limit),
  ]);
  ok(res, { items: docs.map((a) => serializeAppointment(a, req.user.timeZone)), ...pageInfo(page, limit, total) });
});

export const getAppointment = asyncHandler(async (req, res) => {
  const appt = await Appointment.findOne(mine(req, { _id: req.params.id }));
  if (!appt) throw notFound();
  ok(res, { appointment: serializeAppointment(appt, req.user.timeZone) });
});

export const createAppointment = asyncHandler(async (req, res) => {
  const { appointmentLocal, ...rest } = req.body;
  const appt = await Appointment.create({
    ...rest,
    appointmentAt: toUtcOrFail(appointmentLocal, req.user.timeZone),
    user: req.user._id,
  });
  ok(res, { appointment: serializeAppointment(appt, req.user.timeZone) }, 201);
});

export const updateAppointment = asyncHandler(async (req, res) => {
  const appt = await Appointment.findOne(mine(req, { _id: req.params.id }));
  if (!appt) throw notFound();
  const { appointmentLocal, ...rest } = req.body;
  const newTime = toUtcOrFail(appointmentLocal, req.user.timeZone);

  if (newTime.getTime() !== appt.appointmentAt.getTime() || rest.reminderLeadMinutes.join() !== appt.reminderLeadMinutes.join()) {
    appt.remindersSent = []; // time or reminder choices changed -> reminders start fresh
  }
  appt.set({ ...rest, appointmentAt: newTime });
  await appt.save();
  ok(res, { appointment: serializeAppointment(appt, req.user.timeZone) });
});

// PATCH /appointments/:id/status  { status, appointmentLocal? }
export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const appt = await Appointment.findOne(mine(req, { _id: req.params.id }));
  if (!appt) throw notFound();
  const { status, appointmentLocal } = req.body;

  if (status === 'rescheduled') {
    appt.appointmentAt = toUtcOrFail(appointmentLocal, req.user.timeZone);
    appt.remindersSent = [];
  }
  appt.status = status;
  await appt.save();
  ok(res, { appointment: serializeAppointment(appt, req.user.timeZone) });
});

export const deleteAppointment = asyncHandler(async (req, res) => {
  const appt = await Appointment.findOneAndDelete(mine(req, { _id: req.params.id }));
  if (!appt) throw notFound();
  ok(res, { deleted: true });
});
