import { DateTime, IANAZone } from 'luxon';

// All timestamps are stored as UTC Dates. Time zones are only used to convert
// what the user types ("8:00 on 12 Oct") into a UTC instant, and back.

export const isValidZone = (zone) => IANAZone.isValidZone(zone);

export function localToUtc(localIso, zone) {
  const dt = DateTime.fromISO(localIso, { zone });
  return dt.isValid ? dt.toUTC().toJSDate() : null;
}

export const utcToLocalInput = (date, zone) =>
  DateTime.fromJSDate(new Date(date), { zone }).toFormat("yyyy-LL-dd'T'HH:mm");

export const todayInZone = (zone, now = new Date()) => DateTime.fromJSDate(now, { zone }).toFormat('yyyy-LL-dd');

export function dayRangeUtc(fromDay, toDay, zone) {
  const start = DateTime.fromISO(fromDay, { zone }).startOf('day');
  const end = DateTime.fromISO(toDay, { zone }).endOf('day');
  return { start: start.toUTC().toJSDate(), end: end.toUTC().toJSDate() };
}

export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// "Hemoglobin " -> "hemoglobin", "Total  Cholesterol (LDL)" -> "total cholesterol ldl"
export const normalizeName = (s) =>
  String(s).toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

// "mg/dL" and "MG/DL " are the same unit. We never convert between different units.
export const normalizeUnit = (s) => String(s || '').toLowerCase().replace(/\s+/g, '');
