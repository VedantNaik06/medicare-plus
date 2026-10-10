import { useTranslation } from 'react-i18next';

// Label + input + hint + error message, wired together for screen readers.
export default function Field({ id, label, error, hint, optional = false, children, className = '' }) {
  const { t } = useTranslation();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[15px] font-semibold text-ink">
        {label}
        {optional && <span className="ml-1.5 font-normal text-slate-500">({t('common.optional')})</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1.5 text-sm text-slate-600">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm font-medium text-red-700">{error}</p>}
    </div>
  );
}

export const describedBy = (id, error, hint) => (error ? `${id}-err` : hint ? `${id}-hint` : undefined);
