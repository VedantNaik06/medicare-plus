import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Info, Pencil, Pill, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import Tabs, { TabPanel } from '../components/ui/Tabs.jsx';
import InfoTip from '../components/ui/Tooltip.jsx';
import { Stagger, StaggerItem } from '../components/ui/motion.jsx';
import { ConfirmDialog } from '../components/ui/Modal.jsx';
import { Async, EmptyState } from '../components/ui/Feedback.jsx';
import DoseRow from '../components/DoseRow.jsx';
import { useApi } from '../hooks/useApi.js';
import { doseApi, medicineApi } from '../services/endpoints.js';
import { formatClock, formatDate } from '../utils/dateFormat.js';
import { getErrorMessage } from '../utils/errors.js';

function MedicineCard({ med, onDelete }) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  return (
    <StaggerItem as="li" className="solid-card p-5">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-lift">
          <Pill className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="truncate text-lg font-bold">{med.name}</h3>
            <StatusBadge status={med.phase} />
          </div>
          <p className="text-slate-700">{[med.dosage, t(`medicines.freq.${med.frequency}`)].filter(Boolean).join(' · ')}</p>
        </div>
      </div>
      <ul className="mt-4 flex flex-wrap gap-2" aria-label={t('medicines.times')}>
        {med.times.map((time) => <li key={time} className="chip bg-brand-50 text-brand-900">{formatClock(time, lng)}</li>)}
      </ul>
      <div className="mt-3 space-y-1 text-sm text-slate-700">
        {med.foodInstruction !== 'none' && <p>{t(`food.${med.foodInstruction}`)}</p>}
        <p className="flex items-center gap-1.5">
          <CalendarDays className="size-4 text-brand-700" aria-hidden="true" />
          {med.endDate
            ? t('medicines.dateRange', { start: formatDate(med.startDate, lng), end: formatDate(med.endDate, lng) })
            : t('medicines.noEnd', { start: formatDate(med.startDate, lng) })}
        </p>
        {med.notes && <p>{med.notes}</p>}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={`/app/medicines/${med.id}/edit`} className="btn btn-secondary btn-sm"><Pencil className="size-4" aria-hidden="true" />{t('common.edit')}</Link>
        <Button variant="danger" size="sm" onClick={() => onDelete(med)}><Trash2 className="size-4" aria-hidden="true" />{t('common.delete')}</Button>
      </div>
    </StaggerItem>
  );
}

function MedicineList({ phase }) {
  const { t } = useTranslation();
  const state = useApi(() => medicineApi.list({ phase }), [phase]);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await medicineApi.remove(toDelete.id);
      toast.success(t('medicines.deleted'));
      setToDelete(null);
      state.reload();
    } catch (err) {
      toast.error(getErrorMessage(err, t));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Async state={state}>
        {(data) =>
          data.items.length ? (
            <Stagger as="ul" className="grid gap-4 md:grid-cols-2">{data.items.map((m) => <MedicineCard key={m.id} med={m} onDelete={setToDelete} />)}</Stagger>
          ) : (
            <EmptyState
              art="pills"
              text={phase === 'completed' ? t('medicines.emptyCompleted') : t('medicines.empty')}
              action={phase === 'active' ? <Link to="/app/medicines/new" className="btn btn-primary">{t('medicines.add')}</Link> : null}
            />
          )
        }
      </Async>
      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        text={toDelete ? t('medicines.deleteConfirm', { name: toDelete.name }) : ''}
      />
    </>
  );
}

function TodayDoses() {
  const { t } = useTranslation();
  const state = useApi(() => doseApi.list(), []);
  return (
    <section aria-labelledby="today-doses" className="mb-8">
      <div className="mb-3 flex items-center gap-1">
        <h2 id="today-doses" className="text-lg font-bold">{t('medicines.todayDoses')}</h2>
        <InfoTip text={t('tips.statuses')} />
      </div>
      <Async state={state} rows={2}>
        {(data) =>
          data.items.length ? (
            <ul className="space-y-3">{data.items.map((d) => <DoseRow key={d.id} dose={d} onChanged={state.reload} />)}</ul>
          ) : (
            <p className="rounded-2xl border border-dashed border-brand-200 bg-white/60 p-5 text-slate-700">{t('medicines.noDoses')}</p>
          )
        }
      </Async>
    </section>
  );
}

function DoseHistory() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const state = useApi(() => doseApi.history({ page, limit: 10, status }), [page, status]);

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <label htmlFor="hist-status" className="font-semibold">{t('medicines.filterStatus')}</label>
        <select id="hist-status" className="input max-w-48" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">{t('common.all')}</option>
          <option value="taken">{t('status.taken')}</option>
          <option value="skipped">{t('status.skipped')}</option>
          <option value="missed">{t('status.missed')}</option>
        </select>
      </div>
      <Async state={state}>
        {(data) =>
          data.items.length ? (
            <>
              <ul className="space-y-3">{data.items.map((d) => <DoseRow key={d.id} dose={d} showDate onChanged={state.reload} />)}</ul>
              <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
            </>
          ) : (
            <EmptyState art="pills" text={t('medicines.noHistory')} />
          )
        }
      </Async>
    </section>
  );
}

export default function Medicines() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('active');
  const tabs = [
    { id: 'active', label: t('medicines.tabActive') },
    { id: 'completed', label: t('medicines.tabCompleted') },
    { id: 'history', label: t('medicines.tabHistory') },
  ];

  return (
    <div>
      <PageHeader
        title={t('medicines.title')}
        action={<Link to="/app/medicines/new" className="btn btn-primary"><Plus className="size-5" aria-hidden="true" />{t('medicines.add')}</Link>}
      />

      <p className="mb-5 flex items-start gap-2 rounded-2xl bg-sky-50 p-3 text-sm text-sky-950">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{t('medicines.advice')}
      </p>

      <Tabs idPrefix="med" tabs={tabs} value={tab} onChange={setTab} label={t('medicines.title')} />

      <TabPanel idPrefix="med" value={tab}>
        {tab === 'active' && (<><TodayDoses /><MedicineList phase="active" /></>)}
        {tab === 'completed' && <MedicineList phase="completed" />}
        {tab === 'history' && <DoseHistory />}
      </TabPanel>
    </div>
  );
}
