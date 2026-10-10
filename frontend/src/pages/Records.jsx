import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { Download, Eye, FileImage, FileText, Lock, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Field from '../components/ui/Field.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { ConfirmDialog, Modal } from '../components/ui/Modal.jsx';
import { Async, EmptyState } from '../components/ui/Feedback.jsx';
import { Stagger, StaggerItem } from '../components/ui/motion.jsx';
import { useApi } from '../hooks/useApi.js';
import { recordApi } from '../services/endpoints.js';
import { formatDate } from '../utils/dateFormat.js';
import { applyServerErrors, getErrorMessage } from '../utils/errors.js';
import { ACCEPT, ALLOWED_TYPES, MAX_FILE_MB, formatBytes, openRecordFile } from '../utils/files.js';

const TYPES = ['prescription', 'lab_report', 'other'];

function UploadModal({ open, onClose, onUploaded }) {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm({ defaultValues: { type: 'prescription', title: '', recordDate: '' } });
  const [percent, setPercent] = useState(0);

  useEffect(() => { if (open) { reset({ type: 'prescription', title: '', recordDate: '' }); setPercent(0); } }, [open, reset]);

  async function onSubmit(values) {
    const file = values.file?.[0];
    const fd = new FormData();
    fd.append('type', values.type);
    fd.append('title', values.title);
    if (values.recordDate) fd.append('recordDate', values.recordDate);
    fd.append('file', file); // the file goes LAST so the server reads the text fields first
    try {
      await recordApi.upload(fd, setPercent);
      toast.success(t('records.uploaded'));
      onUploaded();
      onClose();
    } catch (err) {
      if (!applyServerErrors(err, setError, t)) toast.error(getErrorMessage(err, t));
    }
  }

  const validateFile = (list) => {
    const f = list?.[0];
    if (!f) return t('validation.fileRequired');
    if (!ALLOWED_TYPES.includes(f.type)) return t('records.fileWrongType');
    if (f.size > MAX_FILE_MB * 1024 * 1024) return t('records.fileTooBig', { size: MAX_FILE_MB });
    return true;
  };

  return (
    <Modal open={open} onClose={onClose} title={t('records.upload')}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field id="type" label={t('records.type')}>
          <select id="type" className="input" {...register('type')}>{TYPES.map((x) => <option key={x} value={x}>{t(`records.types.${x}`)}</option>)}</select>
        </Field>
        <Field id="title" label={t('records.titleField')} optional error={errors.title?.message}>
          <input id="title" className="input" {...register('title', { maxLength: { value: 100, message: t('validation.tooLong') } })} />
        </Field>
        <Field id="recordDate" label={t('records.recordDate')} optional>
          <input id="recordDate" type="date" className="input" {...register('recordDate')} />
        </Field>
        <Field id="file" label={t('records.file')} hint={t('records.fileHint', { size: MAX_FILE_MB })} error={errors.file?.message}>
          <input id="file" type="file" accept={ACCEPT} className="input py-2.5 file:mr-3 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-1.5 file:font-semibold file:text-brand-900"
            aria-invalid={Boolean(errors.file)} {...register('file', { validate: validateFile })} />
        </Field>
        {isSubmitting && (
          <div role="status" aria-live="polite">
            <p className="mb-1 text-sm font-semibold">{t('records.uploading', { percent })}</p>
            <div className="h-2.5 overflow-hidden rounded-full bg-brand-100"><div className="h-full bg-brand-600 transition-all" style={{ width: `${percent}%` }} /></div>
          </div>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>{t('common.cancel')}</Button>
          <Button type="submit" loading={isSubmitting}><Upload className="size-4" aria-hidden="true" />{t('records.upload')}</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function Records() {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const state = useApi(() => recordApi.list({ type, page, limit: 10 }), [type, page]);

  // The dashboard's "Upload report" button links here with ?upload=1
  useEffect(() => {
    if (params.get('upload')) { setUploading(true); setParams({}, { replace: true }); }
  }, [params, setParams]);

  async function open(record, download) {
    try { await openRecordFile(record, { download }); } catch (err) { toast.error(getErrorMessage(err, t)); }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await recordApi.remove(toDelete.id);
      toast.success(t('records.deleted'));
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
      <PageHeader title={t('records.title')} subtitle={undefined} action={<Button onClick={() => setUploading(true)}><Upload className="size-5" aria-hidden="true" />{t('records.upload')}</Button>} />
      <p className="mb-5 flex items-center gap-2 text-sm text-slate-700"><Lock className="size-4 text-brand-700" aria-hidden="true" />{t('records.private')}</p>

      <div className="mb-5 flex items-center gap-3">
        <label htmlFor="type-filter" className="font-semibold">{t('records.type')}</label>
        <select id="type-filter" className="input max-w-56" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
          <option value="">{t('common.all')}</option>
          {TYPES.map((x) => <option key={x} value={x}>{t(`records.types.${x}`)}</option>)}
        </select>
      </div>

      <Async state={state}>
        {(data) =>
          data.items.length ? (
            <>
              <Stagger as="ul" className="space-y-3" step={0.05}>
                {data.items.map((r) => {
                  const Icon = r.mimeType === 'application/pdf' ? FileText : FileImage;
                  return (
                    <StaggerItem as="li" key={r.id} className="solid-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-100 text-brand-700"><Icon className="size-6" aria-hidden="true" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">{r.title}</p>
                        <p className="text-sm text-slate-600">
                          {t(`records.types.${r.type}`)} · {formatBytes(r.sizeBytes)} · {formatDate(r.recordDate || r.createdAt, i18n.language)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="secondary" onClick={() => open(r, false)}><Eye className="size-4" aria-hidden="true" />{t('common.view')}</Button>
                        <Button size="sm" variant="secondary" onClick={() => open(r, true)}><Download className="size-4" aria-hidden="true" />{t('common.download')}</Button>
                        <Button size="sm" variant="danger" onClick={() => setToDelete(r)} aria-label={`${t('common.delete')}: ${r.title}`}><Trash2 className="size-4" aria-hidden="true" />{t('common.delete')}</Button>
                      </div>
                    </StaggerItem>
                  );
                })}
              </Stagger>
              <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
            </>
          ) : (
            <EmptyState art="docs" text={t('records.empty')} action={<Button onClick={() => setUploading(true)}>{t('records.upload')}</Button>} />
          )
        }
      </Async>

      <UploadModal open={uploading} onClose={() => setUploading(false)} onUploaded={state.reload} />
      <ConfirmDialog open={Boolean(toDelete)} onClose={() => setToDelete(null)} onConfirm={confirmDelete} loading={deleting}
        text={toDelete ? t('records.deleteConfirm', { title: toDelete.title }) : ''} />
    </div>
  );
}
