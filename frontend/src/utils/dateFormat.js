// Dates are shown in a consistent Indian style: 12 Oct 2026, 8:30 am.
// We force Latin digits for Marathi too, so dates and doses are easy to read at a glance.
const locale = (lng) => (lng === 'mr' ? 'mr-IN-u-nu-latn' : 'en-IN');
export const DEFAULT_TZ = 'Asia/Kolkata';

const isDayOnly = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

export function formatDate(value, lng, tz = DEFAULT_TZ) {
  if (!value) return '';
  const opts = { day: '2-digit', month: 'short', year: 'numeric' };
  if (isDayOnly(value)) {
    // A calendar date ("2026-10-12") has no time zone: format it as UTC noon so it never shifts a day.
    return new Intl.DateTimeFormat(locale(lng), { ...opts, timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`));
  }
  return new Intl.DateTimeFormat(locale(lng), { ...opts, timeZone: tz }).format(new Date(value));
}

export function formatTime(value, lng, tz = DEFAULT_TZ) {
  if (!value) return '';
  return new Intl.DateTimeFormat(locale(lng), { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz }).format(new Date(value));
}

export const formatDateTime = (value, lng, tz) => `${formatDate(value, lng, tz)}, ${formatTime(value, lng, tz)}`;

// "08:00" -> "8:00 am"
export function formatClock(hhmm, lng) {
  return new Intl.DateTimeFormat(locale(lng), { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' }).format(
    new Date(`1970-01-01T${hhmm}:00Z`)
  );
}

export function formatLongDate(value, lng, tz = DEFAULT_TZ) {
  return new Intl.DateTimeFormat(locale(lng), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz }).format(new Date(value));
}

export const todayString = (tz = DEFAULT_TZ) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

export function greetingKey(tz = DEFAULT_TZ) {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: tz }).format(new Date())) % 24;
  if (hour < 12) return 'dashboard.morning';
  if (hour < 17) return 'dashboard.afternoon';
  return 'dashboard.evening';
}
