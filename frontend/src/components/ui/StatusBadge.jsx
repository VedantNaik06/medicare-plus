import { motion } from 'framer-motion';
import { AlarmClock, Ban, CalendarClock, Check, CircleDot, Clock, Hourglass, RefreshCw, SkipForward, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Status is always shown with an icon AND a word, never colour alone.
const STYLES = {
  upcoming: { icon: Clock, cls: 'bg-sky-100 text-sky-900' },
  due: { icon: AlarmClock, cls: 'bg-amber-100 text-amber-900' },
  overdue: { icon: Hourglass, cls: 'bg-red-100 text-red-900' },
  missed: { icon: Hourglass, cls: 'bg-red-100 text-red-900' },
  taken: { icon: Check, cls: 'bg-emerald-100 text-emerald-900' },
  skipped: { icon: SkipForward, cls: 'bg-slate-200 text-slate-800' },
  completed: { icon: Check, cls: 'bg-emerald-100 text-emerald-900' },
  rescheduled: { icon: RefreshCw, cls: 'bg-violet-100 text-violet-900' },
  cancelled: { icon: XCircle, cls: 'bg-slate-200 text-slate-800' },
  active: { icon: CircleDot, cls: 'bg-brand-100 text-brand-900' },
  notStarted: { icon: CalendarClock, cls: 'bg-sky-100 text-sky-900' },
  stopped: { icon: Ban, cls: 'bg-slate-200 text-slate-800' },
};

export default function StatusBadge({ status }) {
  const { t } = useTranslation();
  const { icon: Icon, cls } = STYLES[status] || STYLES.upcoming;
  return (
    // key={status}: when the status changes (for example due -> taken) the badge pops in again
    <motion.span key={status} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className={`chip ${cls}`}>
      <Icon className="size-4" aria-hidden="true" />
      {t(`status.${status}`)}
    </motion.span>
  );
}
