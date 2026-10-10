import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import { reminderApi } from '../services/endpoints.js';
import { formatDateTime, formatTime } from '../utils/dateFormat.js';

export const PERMISSION_EVENT = 'notif:permission';
export const REMINDERS_FIRED = 'reminders:fired';

export const notificationState = () => (typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);

// Every 30 seconds (while the app is open) ask the server: "which reminders are due that nobody was told about?"
// The server marks them as sent in the same step, so a reminder can never appear twice.
export function useReminders() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [permission, setPermission] = useState(notificationState());

  useEffect(() => {
    const onChange = () => setPermission(notificationState());
    window.addEventListener(PERMISSION_EVENT, onChange);
    return () => window.removeEventListener(PERMISSION_EVENT, onChange);
  }, []);

  const enabled = Boolean(user?.notificationPrefs?.browser) && permission === 'granted';
  const lng = i18n.language;
  const tz = user?.timeZone;

  useEffect(() => {
    if (!enabled) return undefined;

    const tick = async () => {
      try {
        const { doses, appointments } = await reminderApi.claim();
        for (const d of doses) {
          new Notification(t('notify.doseTitle', { name: d.medicine?.name || '' }), {
            body: t('notify.doseBody', { time: formatTime(d.scheduledAt, lng, tz) }),
            tag: `dose-${d.id}`,
          });
        }
        for (const a of appointments) {
          new Notification(t('notify.apptTitle', { name: a.doctorName }), {
            body: t('notify.apptBody', { when: formatDateTime(a.appointmentAt, lng, tz) }),
            tag: `appt-${a.id}-${a.leadMinutes}`,
          });
        }
        if (doses.length || appointments.length) window.dispatchEvent(new Event(REMINDERS_FIRED));
      } catch (err) {
        console.warn('Reminder check failed', err);
      }
    };

    tick();
    const id = setInterval(tick, 30000);
    const onVisible = () => document.visibilityState === 'visible' && tick();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [enabled, lng, tz, t]);

  return { permission };
}
