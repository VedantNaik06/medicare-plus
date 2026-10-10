import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, FlaskConical, LineChart, Paperclip, Plus, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { Async, EmptyState } from '../components/ui/Feedback.jsx';
import { Stagger, StaggerItem } from '../components/ui/motion.jsx';
import { useApi } from '../hooks/useApi.js';
import { testApi } from '../services/endpoints.js';
import { formatDate } from '../utils/dateFormat.js';

const CATEGORIES = ['blood', 'diabetes', 'lipid', 'thyroid', 'urine', 'imaging', 'other'];

export default function Tests() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [category, setCategory] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  // Wait until the person stops typing before asking the server.
  useEffect(() => {
    const id = setTimeout(() => { setDebounced(search.trim()); setPage(1); }, 350);
    return () => clearTimeout(id);
  }, [search]);

  const state = useApi(() => testApi.list({ search: debounced, category, from, to, page, limit: 10 }), [debounced, category, from, to, page]);
  const filtered = Boolean(debounced || category || from || to);

  const reset = () => { setSearch(''); setCategory(''); setFrom(''); setTo(''); setPage(1); };

  return (
    <div>
      <PageHeader
        title={t('tests.title')}
        action={
          <div className="flex flex-wrap gap-2">
            <Link to="/app/tests/compare" className="btn btn-secondary"><LineChart className="size-5" aria-hidden="true" />{t('tests.compare')}</Link>
            <Link to="/app/tests/new" className="btn btn-primary"><Plus className="size-5" aria-hidden="true" />{t('tests.add')}</Link>
          </div>
        }
      />

      <div className="glass mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-4">
          <label htmlFor="search" className="sr-only">{t('common.search')}</label>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <input id="search" type="search" className="input pl-12" placeholder={t('tests.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-semibold">{t('tests.category')}</label>
          <select id="category" className="input" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">{t('common.all')}</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{t(`tests.categories.${c}`)}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="from" className="mb-1 block text-sm font-semibold">{t('common.from')}</label>
          <input id="from" type="date" className="input" value={from} max={to || undefined} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
        </div>
        <div>
          <label htmlFor="to" className="mb-1 block text-sm font-semibold">{t('common.to')}</label>
          <input id="to" type="date" className="input" value={to} min={from || undefined} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
        </div>
        {filtered && <div className="flex items-end"><Button variant="ghost" onClick={reset}>{t('common.clear')}</Button></div>}
      </div>

      <Async state={state}>
        {(data) =>
          data.items.length ? (
            <>
              <Stagger as="ul" className="space-y-3" step={0.05}>
                {data.items.map((r) => (
                  <StaggerItem as="li" key={r.id}>
                    <Link to={`/app/tests/${r.id}`} className="solid-card flex items-center gap-4 p-4 transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-brand-700">
                      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-100 text-brand-700"><FlaskConical className="size-6" aria-hidden="true" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold">{r.testName}</span>
                        <span className="block text-sm text-slate-600">
                          {formatDate(r.testDate, i18n.language)} · {t(`tests.categories.${r.category}`)}{r.labName ? ` · ${r.labName}` : ''}
                        </span>
                        <span className="mt-1 flex flex-wrap gap-3 text-sm text-slate-600">
                          <span>{t('tests.measurementCount', { count: r.measurementCount })}</span>
                          {r.hasFile && <span className="inline-flex items-center gap-1"><Paperclip className="size-4" aria-hidden="true" />{t('tests.hasFile')}</span>}
                        </span>
                      </span>
                      <ChevronRight className="size-5 shrink-0 text-slate-400" aria-hidden="true" />
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
              <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
            </>
          ) : (
            <EmptyState art="flask" text={filtered ? t('tests.emptyFiltered') : t('tests.empty')}
              action={filtered ? <Button variant="secondary" onClick={reset}>{t('common.clear')}</Button> : <Link to="/app/tests/new" className="btn btn-primary">{t('tests.add')}</Link>} />
          )
        }
      </Async>
    </div>
  );
}
