import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../i18n/index.js';
import { useAuth } from '../../context/AuthContext.jsx';

// A two-option toggle that is always visible (header, landing page, login/register).
export default function LanguageSwitcher({ className = '' }) {
  const { t, i18n } = useTranslation();
  const { changeLanguage } = useAuth();
  return (
    <div role="group" aria-label={t('common.language')} className={`inline-flex items-center gap-1 rounded-full border border-brand-200 bg-white p-1 ${className}`}>
      <Languages className="ml-2 size-4 text-brand-700" aria-hidden="true" />
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          onClick={() => changeLanguage(l.code)}
          aria-pressed={i18n.language === l.code}
          className={`min-h-9 rounded-full px-3.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand-700 ${
            i18n.language === l.code ? 'bg-brand-700 text-white' : 'text-brand-900 hover:bg-brand-50'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
