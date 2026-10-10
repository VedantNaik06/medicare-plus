import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../utils/errors.js';
import { ART } from '../illustrations/Illustrations.jsx';
import Button from './Button.jsx';

export const Skeleton = ({ className = 'h-24' }) => <div className={`skeleton ${className}`} aria-hidden="true" />;

export function ListSkeleton({ rows = 3 }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3" role="status" aria-label={t('common.loading')}>
      {Array.from({ length: rows }, (_, i) => <Skeleton key={i} className="h-24" />)}
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  );
}

// An empty screen is an invitation to act. "art" picks one of the drawn illustrations.
export function EmptyState({ icon: Icon, art, text, action }) {
  const Art = art ? ART[art] : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-brand-200 bg-white/60 px-6 py-10 text-center backdrop-blur"
    >
      {Art ? (
        <Art className="h-32 w-44" />
      ) : (
        Icon && (
          <span className="grid size-14 place-items-center rounded-full bg-brand-100 text-brand-700">
            <Icon className="size-7" aria-hidden="true" />
          </span>
        )
      )}
      <p className="max-w-sm text-base text-slate-700">{text}</p>
      {action}
    </motion.div>
  );
}

export function ErrorState({ error, onRetry }) {
  const { t } = useTranslation();
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-3xl border border-red-200 bg-red-50 px-6 py-8 text-center">
      <AlertCircle className="size-8 text-red-700" aria-hidden="true" />
      <p className="font-semibold text-red-900">{t('common.errorTitle')}</p>
      <p className="max-w-sm text-sm text-red-900">{getErrorMessage(error, t)}</p>
      {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>{t('common.retry')}</Button>}
    </div>
  );
}

// Standard "loading / error / content" wrapper. The content fades in when the skeleton goes away.
export function Async({ state, rows = 3, skeleton, children }) {
  if (state.loading && !state.data) return skeleton || <ListSkeleton rows={rows} />;
  if (state.error) return <ErrorState error={state.error} onRetry={state.reload} />;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      {children(state.data)}
    </motion.div>
  );
}
