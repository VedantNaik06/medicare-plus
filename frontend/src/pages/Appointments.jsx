import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { CalendarClock, Check, MapPin, Pencil, Plus, RefreshCw, Trash2, Undo2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Field, { describedBy } from '../components/ui/Field.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Tabs, { TabPanel } from '../components/ui/Tabs.jsx';
import { Stagger, StaggerItem } from '../components/ui/motion.jsx';
import { ConfirmDialog, Modal } from '../components/ui/Modal.jsx';
import { Async, EmptyState } from '../components/ui/Feedback.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { appointmentApi } from '../services/endpoints.js';
import { formatDateTime } from '../utils/dateFormat.js';
import { applyServerErrors, getErrorMessage } from '../utils/errors.js';

const LEADS = [60, 120, 1440, 2880];

function AppointmentModal({ open, onClose, appointment, onSaved }) {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm();

  // Fill the form each time the dialog opens (empty for "add", saved values for "edit").
  useEffect(() => {
    if (!open) return;
    reset(
      appointment
        ? { doctorName: appointment.doctorName, clinicName: appointment.clinicName, appointmentLocal: appointment.appointmentLocal, reason: appointment.reason, reminderLeadMinutes: appointment.reminderLeadMinutes.map(String) }
        : { doctorName: '', clinicName: '', appointmentLocal: '', reason: '', reminderLeadMinutes: ['1440', '60'] }
    );
  }, [open, appointment, reset]);

  async function onSubmit(values) {
    const body = { ...values, reminderLeadMinutes: [].concat(values.reminderLeadMinutes || []).map(Number) };
    try {
      if (appointment) await appointmentApi.update(appointment.id, body);
      else await appointmentApi.create(body);
      toast.success(t('appointments.saved'));
      onSaved();
      onClose();
    } catch (err) {
      if (!applyServerErrors(err, setError, t)) toast.error(getErrorMessage(err, t));
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={appointment ? t('appointments.editTitle') : t('appointments.newTitle')}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field id="doctorName" label={t('appointments.doctor')} error={errors.doctorName?.message}>
          <input id="doctorName" className="input" aria-invalid={Boolean(errors.doctorName)} aria-describedby={describedBy('doctorName', errors.doctorName)}
            {...register('doctorName', { required: t('validation.doctorRequired') })} />
        </Field>
        <Field id="clinicName" label={t('appointments.clinic')} optional>
          <input id="clinicName" className="input" {...register('clinicName')} />
        </Field>
        <Field id="appointmentLocal" label={t('appointments.dateTime')} error={errors.appointmentLocal?.message}>
          <input id="appointmentLocal" type="datetime-local" className="input" aria-invalid={Boolean(errors.appointmentLocal)}
            {...register('appointmentLocal', { required: t('validation.dateTimeRequired') })} />
        </Field>
        <Field id="reason" label={t('appointments.reason')} optional>
          <textarea id="reason" rows={2} className="input py-3" {...register('reason', { maxLength: { value: 300, message: t('validation.tooLong') } })} />
        </Field>
        <fieldset>
          <legend className="mb-1.5 text-[15px] font-semibold">{t('appointments.remind')}</legend>
          <div className="flex flex-wrap gap-2">
            {LEADS.map((m) => (
              <label key={m} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-brand-200 bg-white px-4 text-sm font-semibold has-[:checked]:border-brand-700 has-[:checked]:bg-brand-50">
                <input type="checkbox" value={String(m)} className="size-4 accent-brand-700" {...register('reminderLeadMinutes')} />
                {t(`appointments.lead.${m}`)}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" loading={isSubmitting}>{isSubmitting ? t('common.saving') : t('common.save')}</Button>
        </div>
      </form>
    </Modal>
  );
}

function RescheduleModal({ appointment, onClose, onSaved }) {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  useEffect(() => { if (appointment) reset({ appointmentLocal: appointment.appointmentLocal }); }, [appointment, reset]);

  async function onSubmit(values) {
    try {
      await appointmentApi.setStatus(appointment.id, { status: 'rescheduled', appointmentLocal: values.appointmentLocal });
      toast.success(t('appointments.statusUpdated'));
      onSaved();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, t));
    }
  }

  return (
    <Modal open={Boolean(appointment)} onClose={onClose} title={t('appointments.rescheduleTitle')}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field id="newDateTime" label={t('appointments.newDateTime')} error={errors.appointmentLocal?.message}>
          <input id="newDateTime" type="datetime-local" className="input" {...register('appointmentLocal', { required: t('validation.dateTimeRequired') })} />
        </Field>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" loading={isSubmitting}>{t('common.save')}</Button>
        </div>
      </form>
    </Modal>
  );
}

function AppointmentCard({ appt, tab, onEdit, onReschedule, onStatus, onDelete }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  return (
    <StaggerItem as="li" className="solid-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-bold">{appt.doctorName}</h3>
          {appt.clinicName && <p className="flex items-center gap-1.5 text-slate-700"><MapPin className="size-4 text-brand-700" aria-hidden="true" />{appt.clinicName}</p>}
        </div>
        <StatusBadge status={appt.status} />
      </div>
      <p className="mt-3 flex items-center gap-2 font-semibold text-brand-800"><CalendarClock className="size-5" aria-hidden="true" />{formatDateTime(appt.appointmentAt, i18n.language, user.timeZone)}</p>
      {appt.reason && <p className="mt-1 text-slate-700">{appt.reason}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {tab === 'upcoming' ? (
          <>
            <Button size="sm" onClick={() => onStatus(appt, 'completed')}><Check className="size-4" aria-hidden="true" />{t('appointments.markCompleted')}</Button>
            <Button size="sm" variant="secondary" onClick={() => onReschedule(appt)}><RefreshCw className="size-4" aria-hidden="true" />{t('appointments.reschedule')}</Button>
            <Button size="sm" variant="secondary" onClick={() => onStatus(appt, 'cancelled')}><XCircle className="size-4" aria-hidden="true" />{t('appointments.cancelAppointment')}</Button>
          </>
        ) : (
          appt.status !== 'completed' && <Button size="sm" variant="secondary" onClick={() => onReschedule(appt)}><Undo2 className="size-4" aria-hidden="true" />{t('appointments.reschedule')}</Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => onEdit(appt)}><Pencil className="size-4" aria-hidden="true" />{t('common.edit')}</Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(appt)}><Trash2 className="size-4" aria-hidden="true" />{t('common.delete')}</Button>
      </div>
    </StaggerItem>
  );
}

export default function Appointments() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState('upcoming');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // an appointment, or {} for "new"
  const [rescheduling, setRescheduling] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const state = useApi(() => appointmentApi.list({ tab, page, limit: 10 }), [tab, page]);

  // The dashboard's "Add appointment" button links here with ?new=1
  useEffect(() => {
    if (params.get('new')) { setEditing({}); setParams({}, { replace: true }); }
  }, [params, setParams]);

  async function setStatus(appt, status) {
    try {
      await appointmentApi.setStatus(appt.id, { status });
      toast.success(t('appointments.statusUpdated'));
      state.reload();
    } catch (err) {
      toast.error(getErrorMessage(err, t));
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await appointmentApi.remove(toDelete.id);
      toast.success(t('appointments.deleted'));
      setToDelete(null);
      state.reload();
    } catch (err) {
      toast.error(getErrorMessage(err, t));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader title={t('appointments.title')} action={<Button onClick={() => setEditing({})}><Plus className="size-5" aria-hidden="true" />{t('appointments.add')}</Button>} />

      <Tabs
        idPrefix="appt"
        label={t('appointments.title')}
        value={tab}
        onChange={(id) => { setTab(id); setPage(1); }}
        tabs={[{ id: 'upcoming', label: t('appointments.upcoming') }, { id: 'past', label: t('appointments.past') }]}
      />

      <TabPanel idPrefix="appt" value={tab}>
      <Async state={state}>
        {(data) =>
          data.items.length ? (
            <>
              <Stagger as="ul" className="grid gap-4 md:grid-cols-2">
                {data.items.map((a) => (
                  <AppointmentCard key={a.id} appt={a} tab={tab} onEdit={setEditing} onReschedule={setRescheduling} onStatus={setStatus} onDelete={setToDelete} />
                ))}
              </Stagger>
              <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
            </>
          ) : (
            <EmptyState art="calendar" text={tab === 'upcoming' ? t('appointments.empty') : t('appointments.emptyPast')}
              action={tab === 'upcoming' ? <Button onClick={() => setEditing({})}>{t('appointments.add')}</Button> : null} />
          )
        }
      </Async>
      </TabPanel>

      <AppointmentModal open={Boolean(editing)} appointment={editing?.id ? editing : null} onClose={() => setEditing(null)} onSaved={state.reload} />
      <RescheduleModal appointment={rescheduling} onClose={() => setRescheduling(null)} onSaved={state.reload} />
      <ConfirmDialog open={Boolean(toDelete)} onClose={() => setToDelete(null)} onConfirm={confirmDelete} loading={deleting}
        text={toDelete ? t('appointments.deleteConfirm', { name: toDelete.doctorName }) : ''} />
    </div>
  );
}
