import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Disclaimer({ className = '' }) {
  const { t } = useTranslation();
  return (
    <p className={`flex items-start gap-2 text-sm text-slate-600 ${className}`}>
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden="true" />
      <span>{t('disclaimer')}</span>
    </p>
  );
}
