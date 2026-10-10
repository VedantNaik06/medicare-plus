import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="grid min-h-[50vh] place-items-center px-4 text-center">
      <div className="flex flex-col items-center gap-4">
        <span className="grid size-16 place-items-center rounded-full bg-brand-100 text-brand-700"><SearchX className="size-8" aria-hidden="true" /></span>
        <h1 className="text-2xl font-extrabold">{t('notFound.title')}</h1>
        <p className="text-slate-700">{t('notFound.text')}</p>
        <Link to="/" className="btn btn-primary">{t('notFound.home')}</Link>
      </div>
    </div>
  );
}
