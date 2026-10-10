import { env } from '../config/env.js';
import Appointment from '../models/Appointment.js';
import DoseLog from '../models/DoseLog.js';
import { serializeDose } from './doseService.js';

// "Claiming" = atomically marking a reminder as sent AND returning it only if WE marked it.
// Two browser tabs (or a server restart) can therefore never produce the same notification twice.
export async function claimDueReminders(user, now = new Date()) {
  const userId = user._id;
  const windowStart = new Date(now.getTime() - env.graceMs);

  // Doses that are due right now (inside the grace window) and not yet notified.
  const candidates = await DoseLog.find({
    user: userId,
    status: 'scheduled',
    notifiedAt: null,
    scheduledAt: { $lte: now, $gte: windowStart },
  })
    .populate('medicine', 'name dosage foodInstruction')
    .limit(20);

  const doses = [];
  for (const log of candidates) {
    const res = await DoseLog.updateOne({ _id: log._id, notifiedAt: null }, { $set: { notifiedAt: now } });
    if (res.modifiedCount === 1) doses.push(serializeDose(log, now));
  }

  // Appointments: remind at each chosen lead time ("1 day before", "1 hour before").
  const maxLead = 2880 * 60 * 1000;
  const upcoming = await Appointment.find({
    user: userId,
    status: { $in: ['upcoming', 'rescheduled'] },
    appointmentAt: { $gt: now, $lte: new Date(now.getTime() + maxLead) },
  }).limit(20);

  const appointments = [];
  for (const appt of upcoming) {
    const dueLeads = appt.reminderLeadMinutes.filter(
      (lead) => !appt.remindersSent.includes(lead) && appt.appointmentAt.getTime() - lead * 60000 <= now.getTime()
    );
    if (!dueLeads.length) continue;
    const lead = Math.min(...dueLeads); // if several are late, send only the most relevant one
    const res = await Appointment.updateOne(
      { _id: appt._id, remindersSent: { $ne: lead } },
      { $addToSet: { remindersSent: { $each: dueLeads } } }
    );
    if (res.modifiedCount === 1) {
      appointments.push({
        id: String(appt._id),
        doctorName: appt.doctorName,
        clinicName: appt.clinicName || '',
        appointmentAt: appt.appointmentAt,
        leadMinutes: lead,
      });
    }
  }

  return { doses, appointments };
}
