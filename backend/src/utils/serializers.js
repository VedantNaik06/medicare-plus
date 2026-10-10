import { todayInZone, utcToLocalInput } from './time.js';

// Serializers decide exactly which fields leave the server (no __v, no internal flags).

export function medicinePhase(m, zone, now = new Date()) {
  const today = todayInZone(zone, now);
  if (m.endDate && m.endDate < today) return 'completed';
  if (m.startDate > today) return 'notStarted';
  return 'active';
}

export const serializeMedicine = (m, zone, now) => ({
  id: String(m._id),
  name: m.name,
  dosage: m.dosage || '',
  frequency: m.frequency,
  times: m.times,
  startDate: m.startDate,
  endDate: m.endDate || '',
  foodInstruction: m.foodInstruction,
  notes: m.notes || '',
  phase: medicinePhase(m, zone, now),
  createdAt: m.createdAt,
});

export const serializeAppointment = (a, zone) => ({
  id: String(a._id),
  doctorName: a.doctorName,
  clinicName: a.clinicName || '',
  appointmentAt: a.appointmentAt,
  appointmentLocal: utcToLocalInput(a.appointmentAt, zone), // handy for <input type="datetime-local">
  reason: a.reason || '',
  status: a.status,
  reminderLeadMinutes: a.reminderLeadMinutes,
  createdAt: a.createdAt,
});

export const serializeRecord = (r) => ({
  id: String(r._id),
  type: r.type,
  title: r.title,
  originalName: r.originalName,
  mimeType: r.mimeType,
  sizeBytes: r.sizeBytes,
  recordDate: r.recordDate || '',
  createdAt: r.createdAt,
});

export const serializeMeasurement = (m) => ({
  id: String(m._id),
  name: m.name,
  nameKey: m.nameKey,
  valueType: m.valueType,
  value: m.valueType === 'numeric' ? String(m.valueNumber) : m.valueText || '',
  unit: m.unit || '',
  refLow: m.refLow ?? '',
  refHigh: m.refHigh ?? '',
  refText: m.refText || '',
});

export const serializeTest = (t, extra = {}) => ({
  id: String(t._id),
  testName: t.testName,
  category: t.category,
  testDate: t.testDate,
  labName: t.labName || '',
  notes: t.notes || '',
  recordId: t.record ? String(t.record._id || t.record) : '',
  createdAt: t.createdAt,
  ...extra,
});
