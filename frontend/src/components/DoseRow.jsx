import { AnimatePresence, motion } from 'framer-motion';
import { Check, SkipForward } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from './ui/Button.jsx';
import StatusBadge from './ui/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useMarkDose } from '../hooks/useMarkDose.js';
import { formatDate, formatTime } from '../utils/dateFormat.js';

// The whole row changes colour with the status, so "due", "taken" and "skipped" are easy to tell apart.
const ROW_STYLE = {
  upcoming: 'border-brand-100 bg-white',
  due: 'border-amber-300 bg-amber-50 ring-2 ring-amber-200',
  overdue: 'border-red-200 bg-red-50/70',
  taken: 'border-emerald-200 bg-emerald-50/80',
  skipped: 'border-slate-200 bg-slate-50',
};

// One scheduled dose: time, medicine, status, and Taken / Skip buttons.
export default function DoseRow({ dose, onChanged, showDate = false }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { mark, busy } = useMarkDose(onChanged);
  const pending = dose.status === 'scheduled';
  const med = dose.medicine;
  const lng = i18n.language;

  return (
    <motion.li layout="position" className={`flex flex-col gap-3 rounded-2xl border p-4 transition-colors duration-300 sm:flex-row sm:items-center ${ROW_STYLE[dose.displayStatus] || ROW_STYLE.upcoming}`}>
      <div className="w-24 shrink-0">
        <p className="text-lg font-extrabold">{formatTime(dose.scheduledAt, lng, user.timeZone)}</p>
        {showDate && <p className="text-sm text-slate-600">{formatDate(dose.scheduledAt, lng, user.timeZone)}</p>}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{med?.name}</p>
        <p className="text-sm text-slate-700">
          {[med?.dosage, med?.foodInstruction !== 'none' ? t(`food.${med?.foodInstruction}`) : ''].filter(Boolean).join(' · ')}
        </p>
        {dose.status === 'taken' && dose.actedAt && <p className="text-sm font-medium text-emerald-800">{t('medicines.takenAt', { time: formatTime(dose.actedAt, lng, user.timeZone) })}</p>}
        {dose.status === 'skipped' && dose.actedAt && <p className="text-sm font-medium text-slate-700">{t('medicines.skippedAt', { time: formatTime(dose.actedAt, lng, user.timeZone) })}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={dose.displayStatus} />
        <AnimatePresence initial={false}>
          {pending && (
            <motion.div key="actions" className="flex flex-wrap gap-2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15 }}>
              <Button size="sm" onClick={() => mark(dose.id, 'taken')} disabled={Boolean(busy)} loading={busy === `${dose.id}:taken`} aria-label={`${t('medicines.taken')}: ${med?.name}`}>
                <Check className="size-4" aria-hidden="true" />{t('medicines.taken')}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => mark(dose.id, 'skipped')} disabled={Boolean(busy)} loading={busy === `${dose.id}:skipped`} aria-label={`${t('medicines.skip')}: ${med?.name}`}>
                <SkipForward className="size-4" aria-hidden="true" />{t('medicines.skip')}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  );
}
