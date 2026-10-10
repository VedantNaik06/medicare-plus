import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button.jsx';
import Field, { describedBy } from '../components/ui/Field.jsx';
import { Async } from '../components/ui/Feedback.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { medicineApi } from '../services/endpoints.js';
import { todayString } from '../utils/dateFormat.js';
import { applyServerErrors, getErrorMessage } from '../utils/errors.js';

const DEFAULT_TIMES = {
  once: ['08:00'],
  twice: ['08:00', '20:00'],
  thrice: ['08:00', '14:00', '20:00'],
  four: ['07:00', '12:00', '17:00', '22:00'],
};

function Section({ title, children }) {
  return (
    <fieldset className="solid-card space-y-4 p-5 sm:p-6">
      <legend className="float-left mb-1 w-full text-lg font-bold">{title}</legend>
      <div className="clear-both space-y-4">{children}</div>
    </fieldset>
  );
}

function MedicineFormInner({ initial, id }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues: initial || {
      name: '', dosage: '', frequency: 'once', startDate: todayString(user.timeZone), endDate: '', foodInstruction: 'none', notes: '',
    },
  });
  const [times, setTimes] = useState(initial?.times || DEFAULT_TIMES.once);
  const [timesError, setTimesError] = useState('');
  const frequencyReg = register('frequency');

  function onFrequencyChange(e) {
    frequencyReg.onChange(e);
    const value = e.target.value;
    if (DEFAULT_TIMES[value]) setTimes(DEFAULT_TIMES[value]); // "custom" keeps whatever is there
  }

  const setTime = (i, value) => setTimes((list) => list.map((x, idx) => (idx === i ? value : x)));

  async function onSubmit(values) {
    if (times.some((x) => !x)) return setTimesError(t('validation.invalidTime'));
    if (new Set(times).size !== times.length) return setTimesError(t('validation.timesDuplicate'));
    if (!times.length) return setTimesError(t('validation.timesRequired'));
    setTimesError('');

    const payload = { ...values, times, endDate: values.endDate || '' };
    try {
      if (id) await medicineApi.update(id, payload);
      else await medicineApi.create(payload);
      toast.success(t('medicines.saved'));
      navigate('/app/medicines');
    } catch (err) {
      if (!applyServerErrors(err, (field, e) => (field === 'times' ? setTimesError(e.message) : setError(field, e)), t)) {
        toast.error(getErrorMessage(err, t));
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <Section title={t('medicines.sectionDetails')}>
        <Field id="name" label={t('medicines.name')} error={errors.name?.message}>
          <input id="name" className="input" aria-invalid={Boolean(errors.name)} aria-describedby={describedBy('name', errors.name)}
            {...register('name', { required: t('validation.medicineNameRequired'), maxLength: { value: 100, message: t('validation.tooLong') } })} />
        </Field>
        <Field id="dosage" label={t('medicines.dosage')} optional hint={t('medicines.dosageHint')} error={errors.dosage?.message}>
          <input id="dosage" className="input" aria-describedby={describedBy('dosage', errors.dosage, true)} {...register('dosage', { maxLength: { value: 60, message: t('validation.tooLong') } })} />
        </Field>
      </Section>

      <Section title={t('medicines.sectionSchedule')}>
        <Field id="frequency" label={t('medicines.frequency')}>
          <select id="frequency" className="input" {...frequencyReg} onChange={onFrequencyChange}>
            {['once', 'twice', 'thrice', 'four', 'custom'].map((f) => <option key={f} value={f}>{t(`medicines.freq.${f}`)}</option>)}
          </select>
        </Field>

        <div>
          <p className="mb-1.5 text-[15px] font-semibold">{t('medicines.times')}</p>
          <div className="space-y-2">
            {times.map((value, i) => (
              <div key={i} className="flex items-center gap-2">
                <label htmlFor={`time-${i}`} className="sr-only">{t('medicines.timeN', { n: i + 1 })}</label>
                <input id={`time-${i}`} type="time" value={value} onChange={(e) => setTime(i, e.target.value)} className="input max-w-48" aria-invalid={Boolean(timesError)} />
                {watch('frequency') === 'custom' && times.length > 1 && (
                  <button type="button" onClick={() => setTimes((l) => l.filter((_, idx) => idx !== i))} aria-label={t('medicines.removeTime')} className="grid size-11 place-items-center rounded-full text-slate-600 hover:bg-slate-100">
                    <X className="size-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {watch('frequency') === 'custom' && times.length < 8 && (
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setTimes((l) => [...l, '12:00'])}><Plus className="size-4" aria-hidden="true" />{t('medicines.addTime')}</Button>
          )}
          {timesError && <p role="alert" className="mt-1.5 text-sm font-medium text-red-700">{timesError}</p>}
        </div>
      </Section>

      <Section title={t('medicines.sectionDates')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="startDate" label={t('medicines.startDate')} error={errors.startDate?.message}>
            <input id="startDate" type="date" className="input" aria-invalid={Boolean(errors.startDate)} {...register('startDate', { required: t('validation.invalidDate') })} />
          </Field>
          <Field id="endDate" label={t('medicines.endDate')} optional hint={t('medicines.endDateHint')} error={errors.endDate?.message}>
            <input id="endDate" type="date" className="input" aria-invalid={Boolean(errors.endDate)}
              {...register('endDate', { validate: (v) => !v || v >= watch('startDate') || t('validation.endBeforeStart') })} />
          </Field>
        </div>
      </Section>

      <Section title={t('medicines.sectionExtra')}>
        <Field id="foodInstruction" label={t('medicines.food')}>
          <select id="foodInstruction" className="input" {...register('foodInstruction')}>
            {['none', 'before', 'after', 'with'].map((f) => <option key={f} value={f}>{t(`food.${f}`)}</option>)}
          </select>
        </Field>
        <Field id="notes" label={t('medicines.notesLabel')} optional error={errors.notes?.message}>
          <textarea id="notes" rows={3} className="input py-3" {...register('notes', { maxLength: { value: 500, message: t('validation.tooLong') } })} />
        </Field>
      </Section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link to="/app/medicines" className="btn btn-secondary">{t('common.cancel')}</Link>
        <Button type="submit" loading={isSubmitting}>{isSubmitting ? t('common.saving') : t('common.save')}</Button>
      </div>
    </form>
  );
}

export default function MedicineForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const state = useApi(() => (id ? medicineApi.get(id) : Promise.resolve(null)), [id]);

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/app/medicines" className="mb-3 inline-flex items-center gap-1.5 font-semibold text-brand-700"><ArrowLeft className="size-4" aria-hidden="true" />{t('common.back')}</Link>
      <PageHeader title={id ? t('medicines.editTitle') : t('medicines.newTitle')} />
      <Async state={state}>{(data) => <MedicineFormInner id={id} initial={data?.medicine} />}</Async>
    </div>
  );
}
