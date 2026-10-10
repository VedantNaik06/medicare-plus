import { useTranslation } from 'react-i18next';
import Button from './Button.jsx';

export default function Pagination({ page, totalPages, onChange }) {
  const { t } = useTranslation();
  if (!totalPages || totalPages <= 1) return null;
  return (
    <nav className="mt-5 flex items-center justify-between gap-3" aria-label="pagination">
      <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>{t('common.previous')}</Button>
      <span className="text-sm text-slate-700">{t('common.page', { page, total: totalPages })}</span>
      <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>{t('common.next')}</Button>
    </nav>
  );
}
