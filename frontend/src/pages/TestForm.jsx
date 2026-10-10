import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button.jsx';
import Field, { describedBy } from '../components/ui/Field.jsx';
import { Async } from '../components/ui/Feedback.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { recordApi, testApi } from '../services/endpoints.js';
import { todayString } from '../utils/dateFormat.js';
import { applyServerErrors, getErrorMessage } from '../utils/errors.js';
import { ACCEPT, ALLOWED_TYPES, MAX_FILE_MB } from '../utils/files.js';

const CATEGORIES = ['blood', 'diabetes', 'lipid', 'thyroid', 'urine', 'imaging', 'other'];
const blankMeasurement = { name: '', valueType: 'numeric', value: '', unit: '', refLow: '', refHigh: '', refText: '' };

function TestFormInner({ initial, id }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const { register, control, handleSubmit, watch, getValues, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues: initial
      ? { ...initial, measurements: initial.measurements.length ? initial.measurements : [blankMeasurement] }
      : { testName: '', category: 'blood', testDate: todayString(user.timeZone), labName: '', notes: '', measurements: [blankMeasurement] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'measurements' });

  function onFileChange(e) {
    const f = e.target.files?.[0];
    setFileError('');
    if (!f) return setFile(null);
    if (!ALLOWED_TYPES.includes(f.type)) { e.target.value = ''; setFile(null); return setFileError(t('records.fileWrongType')); }
    if (f.size > MAX_FILE_MB * 1024 * 1024) { e.target.value = ''; setFile(null); return setFileError(t('records.fileTooBig', { size: MAX_FILE_MB })); }
    setFile(f);
  }

  async function onSubmit(values) {
    try {
      let recordId = initial?.recordId || '';
      if (file) {
        // Step 1: upload the original document (private). Step 2: save the test and link the file.
        const fd = new FormData();
        fd.append('type', 'lab_report');
        fd.append('title', values.testName);
        fd.append('recordDate', values.testDate);
        fd.append('file', file);
        const { record } = await recordApi.upload(fd);
        recordId = record.id;
      }
      const body = {
        testName: values.testName, category: values.category, testDate: values.testDate, labName: values.labName, notes: values.notes,
        recordId,
        measurements: values.measurements.map((m) => ({ ...m })),
      };
      if (id) await testApi.update(id, body);
      else await testApi.create(body);
      toast.success(t('tests.saved'));
      navigate(id ? `/app/tests/${id}` : '/app/tests');
    } catch (err) {
      if (!applyServerErrors(err, setError, t)) toast.error(getErrorMessage(err, t));
    }
  }

  const err = (i, f) => errors.measurements?.[i]?.[f]?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <fieldset className="solid-card space-y-4 p-5 sm:p-6">
        <legend className="sr-only">{t('tests.testName')}</legend>
        <Field id="testName" label={t('tests.testName')} error={errors.testName?.message}>
          <input id="testName" className="input" aria-invalid={Boolean(errors.testName)} aria-describedby={describedBy('testName', errors.testName)}
            {...register('testName', { required: t('validation.testNameRequired'), maxLength: { value: 100, message: t('validation.tooLong') } })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="category" label={t('tests.category')}>
            <select id="category" className="input" {...register('category')}>{CATEGORIES.map((c) => <option key={c} value={c}>{t(`tests.categories.${c}`)}</option>)}</select>
          </Field>
          <Field id="testDate" label={t('tests.testDate')} error={errors.testDate?.message}>
            <input id="testDate" type="date" className="input" aria-invalid={Boolean(errors.testDate)} {...register('testDate', { required: t('validation.invalidDate') })} />
          </Field>
        </div>
        <Field id="labName" label={t('tests.lab')} optional><input id="labName" className="input" {...register('labName')} /></Field>
        <Field id="notes" label={t('common.notes')} optional><textarea id="notes" rows={3} className="input py-3" {...register('notes', { maxLength: { value: 1000, message: t('validation.tooLong') } })} /></Field>
        <Field id="file" label={t('tests.attach')} optional hint={initial?.record ? `${initial.record.originalName} — ${t('tests.attached')}` : t('tests.attachHint', { size: MAX_FILE_MB })} error={fileError}>
          <input id="file" type="file" accept={ACCEPT} onChange={onFileChange} className="input py-2.5 file:mr-3 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-1.5 file:font-semibold file:text-brand-900" />
        </Field>
      </fieldset>

      <fieldset className="solid-card space-y-4 p-5 sm:p-6">
        <legend className="float-left w-full text-lg font-bold">{t('tests.measurements')}</legend>
        <p className="clear-both text-sm text-slate-600">{t('tests.measurementsHint')}</p>

        {fields.map((field, i) => {
          const type = watch(`measurements.${i}.valueType`);
          return (
            <div key={field.id} className="space-y-3 rounded-2xl border border-brand-100 bg-brand-50/40 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{t('tests.measurementN', { n: i + 1 })}</p>
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(i)} aria-label={`${t('tests.removeMeasurement')} ${i + 1}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-red-700 hover:bg-red-50">
                    <Trash2 className="size-4" aria-hidden="true" />{t('tests.removeMeasurement')}
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field id={`m-name-${i}`} label={t('tests.measurementName')} error={err(i, 'name')}>
                  <input id={`m-name-${i}`} className="input" aria-invalid={Boolean(err(i, 'name'))} {...register(`measurements.${i}.name`, { required: t('validation.measurementNameRequired') })} />
                </Field>
                <Field id={`m-type-${i}`} label={t('tests.valueType')}>
                  <select id={`m-type-${i}`} className="input" {...register(`measurements.${i}.valueType`)}>
                    <option value="numeric">{t('tests.numeric')}</option>
                    <option value="qualitative">{t('tests.qualitative')}</option>
                  </select>
                </Field>
                <Field id={`m-value-${i}`} label={t('tests.value')} error={err(i, 'value')}>
                  <input id={`m-value-${i}`} inputMode={type === 'numeric' ? 'decimal' : 'text'} className="input" aria-invalid={Boolean(err(i, 'value'))}
                    {...register(`measurements.${i}.value`, {
                      required: t('validation.valueRequired'),
                      validate: (v) => getValues(`measurements.${i}.valueType`) !== 'numeric' || (v.trim() !== '' && Number.isFinite(Number(v))) || t('validation.valueNumeric'),
                    })} />
                </Field>
                <Field id={`m-unit-${i}`} label={t('tests.unit')} optional>
                  <input id={`m-unit-${i}`} className="input" placeholder="mg/dL" {...register(`measurements.${i}.unit`)} />
                </Field>
                {type === 'numeric' && (
                  <>
                    <Field id={`m-low-${i}`} label={t('tests.refLow')} optional error={err(i, 'refLow')}>
                      <input id={`m-low-${i}`} inputMode="decimal" className="input" {...register(`measurements.${i}.refLow`, { validate: (v) => v === '' || Number.isFinite(Number(v)) || t('validation.valueNumeric') })} />
                    </Field>
                    <Field id={`m-high-${i}`} label={t('tests.refHigh')} optional error={err(i, 'refHigh')}>
                      <input id={`m-high-${i}`} inputMode="decimal" className="input"
                        {...register(`measurements.${i}.refHigh`, {
                          validate: (v) => {
                            if (v === '') return true;
                            if (!Number.isFinite(Number(v))) return t('validation.valueNumeric');
                            const low = getValues(`measurements.${i}.refLow`);
                            return low === '' || Number(low) <= Number(v) || t('validation.rangeOrder');
                          },
                        })} />
                    </Field>
                  </>
                )}
                <Field id={`m-ref-${i}`} label={t('tests.refText')} optional className="sm:col-span-2">
                  <input id={`m-ref-${i}`} className="input" {...register(`measurements.${i}.refText`)} />
                </Field>
              </div>
            </div>
          );
        })}
        {fields.length < 40 && <Button variant="secondary" onClick={() => append(blankMeasurement)}><Plus className="size-4" aria-hidden="true" />{t('tests.addMeasurement')}</Button>}
      </fieldset>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link to={id ? `/app/tests/${id}` : '/app/tests'} className="btn btn-secondary">{t('common.cancel')}</Link>
        <Button type="submit" loading={isSubmitting}>{isSubmitting ? t('common.saving') : t('common.save')}</Button>
      </div>
    </form>
  );
}

export default function TestForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const state = useApi(() => (id ? testApi.get(id) : Promise.resolve(null)), [id]);

  return (
    <div className="mx-auto max-w-2xl">
      <Link to={id ? `/app/tests/${id}` : '/app/tests'} className="mb-3 inline-flex items-center gap-1.5 font-semibold text-brand-700"><ArrowLeft className="size-4" aria-hidden="true" />{t('common.back')}</Link>
      <PageHeader title={id ? t('tests.editTitle') : t('tests.newTitle')} />
      <Async state={state}>{(data) => <TestFormInner id={id} initial={data?.test} />}</Async>
    </div>
  );
}
