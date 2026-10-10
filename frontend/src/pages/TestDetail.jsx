import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Eye, FileText, LineChart, Pencil, PenLine, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button.jsx';
import { ConfirmDialog } from '../components/ui/Modal.jsx';
import { Async } from '../components/ui/Feedback.jsx';
import { useApi } from '../hooks/useApi.js';
import { testApi } from '../services/endpoints.js';
import { formatDate } from '../utils/dateFormat.js';
import { getErrorMessage } from '../utils/errors.js';
import { formatBytes, openRecordFile } from '../utils/files.js';

function rangeText(m, t) {
  if (m.refLow !== '' && m.refHigh !== '') return `${m.refLow} – ${m.refHigh}`;
  if (m.refLow !== '') return `≥ ${m.refLow}`;
  if (m.refHigh !== '') return `≤ ${m.refHigh}`;
  return m.refText || '—';
}

export default function TestDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const state = useApi(() => testApi.get(id), [id]);
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function openFile(record, download) {
    try { await openRecordFile(record, { download }); } catch (err) { toast.error(getErrorMessage(err, t)); }
  }

  async function remove() {
    setDeleting(true);
    try {
      await testApi.remove(id);
      toast.success(t('tests.deleted'));
      navigate('/app/tests', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, t));
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/app/tests" className="mb-3 inline-flex items-center gap-1.5 font-semibold text-brand-700"><ArrowLeft className="size-4" aria-hidden="true" />{t('common.back')}</Link>
      <Async state={state}>
        {({ test }) => (
          <div className="space-y-5">
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{test.testName}</h1>
                <p className="mt-1 text-slate-700">
                  {formatDate(test.testDate, i18n.language)} · {t(`tests.categories.${test.category}`)}{test.labName ? ` · ${test.labName}` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <Link to={`/app/tests/${id}/edit`} className="btn btn-secondary btn-sm"><Pencil className="size-4" aria-hidden="true" />{t('common.edit')}</Link>
                <Button variant="danger" size="sm" onClick={() => setConfirm(true)}><Trash2 className="size-4" aria-hidden="true" />{t('common.delete')}</Button>
              </div>
            </header>

            {/* Original uploaded document: clearly separate from typed values */}
            <section aria-labelledby="orig" className="solid-card p-5">
              <h2 id="orig" className="flex items-center gap-2 text-lg font-bold"><FileText className="size-5 text-brand-700" aria-hidden="true" />{t('tests.original')}</h2>
              {test.record ? (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <p className="min-w-0 flex-1 truncate text-slate-700">{test.record.originalName} · {formatBytes(test.record.sizeBytes)}</p>
                  <Button size="sm" onClick={() => openFile(test.record, false)}><Eye className="size-4" aria-hidden="true" />{t('tests.viewOriginal')}</Button>
                  <Button size="sm" variant="secondary" onClick={() => openFile(test.record, true)}><Download className="size-4" aria-hidden="true" />{t('common.download')}</Button>
                </div>
              ) : (
                <p className="mt-2 text-slate-600">{t('tests.noOriginal')}</p>
              )}
            </section>

            <section aria-labelledby="meas" className="solid-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="meas" className="flex items-center gap-2 text-lg font-bold"><PenLine className="size-5 text-brand-700" aria-hidden="true" />{t('tests.measurements')}</h2>
                <span className="chip bg-sky-100 text-sky-900">{t('tests.enteredByYou')}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{t('tests.enteredNote')}</p>
              {test.measurements.length ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[30rem] text-left">
                    <thead>
                      <tr className="border-b border-brand-100 text-sm text-slate-600">
                        <th scope="col" className="py-2 pr-3 font-semibold">{t('tests.measurementName')}</th>
                        <th scope="col" className="py-2 pr-3 font-semibold">{t('tests.colValue')}</th>
                        <th scope="col" className="py-2 pr-3 font-semibold">{t('tests.colRange')}</th>
                        <th scope="col" className="py-2"><span className="sr-only">{t('tests.compareThis')}</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {test.measurements.map((m) => (
                        <tr key={m.id} className="border-b border-brand-50 last:border-0">
                          <th scope="row" className="py-3 pr-3 font-semibold">{m.name}</th>
                          <td className="py-3 pr-3">{m.value} {m.unit}</td>
                          <td className="py-3 pr-3 text-slate-700">{rangeText(m, t)}</td>
                          <td className="py-3 text-right">
                            {m.valueType === 'numeric' && (
                              <Link to={`/app/tests/compare?name=${encodeURIComponent(m.nameKey)}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 underline">
                                <LineChart className="size-4" aria-hidden="true" />{t('tests.compareThis')}
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-3 text-slate-600">{t('tests.noMeasurements')}</p>
              )}
            </section>

            {test.notes && (
              <section className="solid-card p-5">
                <h2 className="text-lg font-bold">{t('common.notes')}</h2>
                <p className="mt-2 whitespace-pre-wrap text-slate-700">{test.notes}</p>
              </section>
            )}
          </div>
        )}
      </Async>
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={remove} loading={deleting} text={t('tests.deleteConfirm')} />
    </div>
  );
}
