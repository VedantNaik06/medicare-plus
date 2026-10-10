import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/ui/PageHeader.jsx';
import Field from '../components/ui/Field.jsx';
import { Async, EmptyState, ListSkeleton } from '../components/ui/Feedback.jsx';
import { useApi } from '../hooks/useApi.js';
import { testApi } from '../services/endpoints.js';
import { formatDate } from '../utils/dateFormat.js';

function rangeOf(p) {
  if (p.refLow != null && p.refHigh != null) return `${p.refLow} – ${p.refHigh}`;
  if (p.refLow != null) return `≥ ${p.refLow}`;
  if (p.refHigh != null) return `≤ ${p.refHigh}`;
  return p.refText || '—';
}

function Result({ data, from, to, unit, onUnit }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const chartData = useMemo(() => data.points.map((p) => ({ ...p, label: formatDate(p.date, lng) })), [data.points, lng]);
  const unitName = data.unit || t('tests.noUnit');
  const reduceMotion = useReducedMotion();

  return (
    <div className="space-y-5">
      {data.availableUnits.length > 1 && (
        <Field id="unit" label={t('tests.unitLabel')}>
          <select id="unit" className="input max-w-56" value={data.unitKey} onChange={(e) => onUnit(e.target.value)}>
            {data.availableUnits.map((u) => <option key={u.unitKey} value={u.unitKey}>{u.unit || t('tests.noUnit')} ({u.count})</option>)}
          </select>
        </Field>
      )}

      {data.otherUnitCount > 0 && <p className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-950">{t('tests.otherUnits', { count: data.otherUnitCount })}</p>}

      {data.points.length >= 2 ? (
        <section className="solid-card p-4 sm:p-6" aria-labelledby="chart-title">
          <h2 id="chart-title" className="mb-4 text-lg font-bold">{t('tests.chartTitle', { name: data.name })} <span className="font-normal text-slate-600">({unitName})</span></h2>
          <div className="h-72 w-full" role="img" aria-label={t('tests.chartTitle', { name: data.name })}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d3f3ed" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} width={48} />
                <Tooltip formatter={(v) => [`${v} ${data.unit}`, data.name]} />
                <Line type="monotone" dataKey="value" stroke="#14807a" strokeWidth={3} dot={{ r: 5, fill: '#14807a' }} activeDot={{ r: 7 }} isAnimationActive={!reduceMotion} animationDuration={900} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : (
        data.points.length > 0 && <p className="rounded-2xl bg-sky-50 p-3 text-sky-950">{t('tests.needTwo')}</p>
      )}

      {data.points.length > 0 && (
        <div className="solid-card overflow-x-auto p-4">
          <table className="w-full min-w-[24rem] text-left">
            <thead>
              <tr className="border-b border-brand-100 text-sm text-slate-600">
                <th scope="col" className="py-2 pr-3 font-semibold">{t('tests.colDate')}</th>
                <th scope="col" className="py-2 pr-3 font-semibold">{t('tests.colValue')}</th>
                <th scope="col" className="py-2 font-semibold">{t('tests.colRange')}</th>
              </tr>
            </thead>
            <tbody>
              {data.points.map((p, i) => (
                <tr key={`${p.reportId}-${i}`} className="border-b border-brand-50 last:border-0">
                  <th scope="row" className="py-3 pr-3 font-semibold"><Link to={`/app/tests/${p.reportId}`} className="text-brand-700 underline">{formatDate(p.date, lng)}</Link></th>
                  <td className="py-3 pr-3 font-bold">{p.value} {data.unit}</td>
                  <td className="py-3 text-slate-700">{rangeOf(p)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.qualitative.length > 0 && (
        <section className="solid-card p-4">
          <h2 className="mb-2 text-lg font-bold">{t('tests.textResults')}</h2>
          <ul className="divide-y divide-brand-50">
            {data.qualitative.map((q, i) => (
              <li key={`${q.reportId}-${i}`} className="flex justify-between gap-3 py-2">
                <span className="font-semibold">{formatDate(q.date, lng)}</span><span>{q.value}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="flex items-start gap-2 text-sm text-slate-700"><Info className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden="true" />{t('tests.compareNote')}</p>
    </div>
  );
}

export default function TestCompare() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const names = useApi(() => testApi.names(), []);
  const name = params.get('name') || '';
  const [unit, setUnit] = useState(undefined); // undefined = server picks the most common unit
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const result = useApi(() => (name ? testApi.compare({ name, unit, from, to }) : Promise.resolve(null)), [name, unit, from, to]);

  const pick = (value) => { setUnit(undefined); setParams(value ? { name: value } : {}); };

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/app/tests" className="mb-3 inline-flex items-center gap-1.5 font-semibold text-brand-700"><ArrowLeft className="size-4" aria-hidden="true" />{t('common.back')}</Link>
      <PageHeader title={t('tests.compare')} />

      <Async state={names} rows={1}>
        {({ items }) =>
          items.length === 0 ? (
            <EmptyState art="chart" text={t('tests.noNames')} action={<Link to="/app/tests/new" className="btn btn-primary">{t('tests.add')}</Link>} />
          ) : (
            <div className="space-y-5">
              <div className="glass grid gap-3 p-4 sm:grid-cols-3">
                <Field id="measurement" label={t('tests.pick')} className="sm:col-span-3">
                  <select id="measurement" className="input" value={name} onChange={(e) => pick(e.target.value)}>
                    <option value="">{t('tests.pickPlaceholder')}</option>
                    {items.map((n) => <option key={n.nameKey} value={n.nameKey}>{n.name} ({n.count})</option>)}
                  </select>
                </Field>
                <Field id="cmp-from" label={t('common.from')}><input id="cmp-from" type="date" className="input" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} /></Field>
                <Field id="cmp-to" label={t('common.to')}><input id="cmp-to" type="date" className="input" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} /></Field>
              </div>

              {name && (
                <Async state={result} rows={2}>
                  {(data) => (data && data.points.length + data.qualitative.length > 0 ? <Result data={data} from={from} to={to} unit={unit} onUnit={setUnit} /> : <EmptyState art="chart" text={t('tests.needTwo')} />)}
                </Async>
              )}
              {!name && result.loading && <ListSkeleton rows={1} />}
            </div>
          )
        }
      </Async>
    </div>
  );
}
