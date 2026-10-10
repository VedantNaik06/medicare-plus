import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Bell, Eye, LogOut, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Field from '../components/ui/Field.jsx';
import LanguageSwitcher from '../components/ui/LanguageSwitcher.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import InfoTip from '../components/ui/Tooltip.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { PERMISSION_EVENT, notificationState } from '../hooks/useReminders.js';
import { userApi } from '../services/endpoints.js';
import { useTextSize } from '../hooks/useTextSize.js';
import { TEXT_SIZES } from '../utils/textSize.js';
import { applyServerErrors, getErrorMessage } from '../utils/errors.js';

const ZONES = [
  ['Asia/Kolkata', 'India (Asia/Kolkata)'], ['Asia/Kathmandu', 'Nepal (Asia/Kathmandu)'], ['Asia/Dhaka', 'Bangladesh (Asia/Dhaka)'],
  ['Asia/Dubai', 'UAE (Asia/Dubai)'], ['Asia/Singapore', 'Singapore (Asia/Singapore)'], ['Europe/London', 'UK (Europe/London)'],
  ['Europe/Berlin', 'Central Europe (Europe/Berlin)'], ['America/New_York', 'US East (America/New_York)'],
  ['America/Los_Angeles', 'US West (America/Los_Angeles)'], ['Australia/Sydney', 'Australia (Australia/Sydney)'], ['UTC', 'UTC'],
];

function Card({ title, children, icon: Icon, tip }) {
  return (
    <section className="solid-card space-y-4 p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold">{Icon && <Icon className="size-5 text-brand-700" aria-hidden="true" />}{title}{tip}</h2>
      {children}
    </section>
  );
}

export default function Settings() {
  const { t } = useTranslation();
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [permission, setPermission] = useState(notificationState());
  const [showDelete, setShowDelete] = useState(false);
  const { size: textSize, setSize: setTextSize } = useTextSize();

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: user.name,
      timeZone: user.timeZone,
      browser: user.notificationPrefs.browser,
      ecName: user.emergencyContact?.name || '',
      ecPhone: user.emergencyContact?.phone || '',
      ecRelation: user.emergencyContact?.relation || '',
    },
  });

  async function onSubmit(v) {
    try {
      const data = await userApi.update({
        name: v.name,
        timeZone: v.timeZone,
        notificationPrefs: { browser: v.browser, appointmentLeadMinutes: user.notificationPrefs.appointmentLeadMinutes },
        emergencyContact: { name: v.ecName, phone: v.ecPhone, relation: v.ecRelation },
      });
      setUser(data.user);
      toast.success(t('settings.saved'));
    } catch (err) {
      const map = { 'emergencyContact.phone': 'ecPhone', 'emergencyContact.name': 'ecName', 'emergencyContact.relation': 'ecRelation' };
      if (!applyServerErrors(err, (f, e) => setError(map[f] || f, e), t)) toast.error(getErrorMessage(err, t));
    }
  }

  async function askPermission() {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result);
    window.dispatchEvent(new Event(PERMISSION_EVENT)); // tells the reminder hook to start
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t('settings.title')} />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Card title={t('settings.profile')}>
          <Field id="name" label={t('auth.name')} error={errors.name?.message}>
            <input id="name" className="input" {...register('name', { required: t('validation.nameRequired'), minLength: { value: 2, message: t('validation.nameShort') } })} />
          </Field>
          <Field id="email" label={t('settings.emailFixed')}><input id="email" className="input bg-slate-50 text-slate-600" value={user.email} readOnly /></Field>
          <div>
            <p className="mb-1.5 text-[15px] font-semibold">{t('common.language')}</p>
            <LanguageSwitcher />
          </div>
          <Field id="timeZone" label={t('settings.timeZone')}>
            <select id="timeZone" className="input" {...register('timeZone')}>
              {!ZONES.some(([z]) => z === user.timeZone) && <option value={user.timeZone}>{user.timeZone}</option>}
              {ZONES.map(([z, label]) => <option key={z} value={z}>{label}</option>)}
            </select>
          </Field>
        </Card>

        <Card title={t('a11y.displayTitle')} icon={Eye}>
          <div role="group" aria-label={t('a11y.textSizeLabel')}>
            <p className="mb-2 text-[15px] font-semibold">{t('a11y.textSizeLabel')}</p>
            <div className="flex flex-wrap gap-2">
              {TEXT_SIZES.map((sz) => (
                <button key={sz.id} type="button" aria-pressed={textSize === sz.id} onClick={() => setTextSize(sz.id)}
                  className={`min-h-11 rounded-full border px-5 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand-700 ${textSize === sz.id ? 'border-brand-700 bg-brand-700 text-white' : 'border-brand-200 bg-white text-brand-900 hover:bg-brand-50'}`}>
                  {t(`a11y.sizes.${sz.id}`)}
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-slate-700">{t('a11y.textSizeHint')}</p>
          </div>
        </Card>

        <Card title={t('settings.notifications')} icon={Bell} tip={<InfoTip text={t('tips.notifications')} />}>
          <label className="flex min-h-11 cursor-pointer items-start gap-3">
            <input type="checkbox" className="mt-1 size-5 accent-brand-700" {...register('browser')} />
            <span className="font-semibold">{t('settings.browserNotifications')}</span>
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-slate-700">{t('settings.permission', { state: t(`settings.perm.${permission}`) })}</p>
            {permission === 'default' && <Button variant="secondary" size="sm" onClick={askPermission}>{t('settings.enable')}</Button>}
          </div>
          <p className="rounded-2xl bg-sky-50 p-3 text-sm text-sky-950">{t('settings.notifLimit')}</p>
        </Card>

        <Card title={t('settings.emergency')}>
          <Field id="ecName" label={t('settings.ecName')} optional><input id="ecName" className="input" {...register('ecName')} /></Field>
          <Field id="ecPhone" label={t('settings.ecPhone')} optional error={errors.ecPhone?.message}>
            <input id="ecPhone" type="tel" inputMode="tel" className="input" {...register('ecPhone', { pattern: { value: /^[0-9+\-\s()]*$/, message: t('validation.invalid') } })} />
          </Field>
          <Field id="ecRelation" label={t('settings.ecRelation')} optional><input id="ecRelation" className="input" {...register('ecRelation')} /></Field>
        </Card>

        <div className="flex justify-end"><Button type="submit" loading={isSubmitting}>{isSubmitting ? t('common.saving') : t('common.save')}</Button></div>
      </form>

      <div className="mt-5"><Card title={t('settings.account')}>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={async () => { await logout(); navigate('/', { replace: true }); }}><LogOut className="size-4" aria-hidden="true" />{t('nav.logout')}</Button>
          <Button variant="danger" onClick={() => setShowDelete(true)}><Trash2 className="size-4" aria-hidden="true" />{t('settings.deleteAccount')}</Button>
        </div>
      </Card></div>

      <DeleteAccountModal open={showDelete} onClose={() => setShowDelete(false)} />
    </div>
  );
}

function DeleteAccountModal({ open, onClose }) {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting } } = useForm();

  async function onSubmit({ password }) {
    try {
      await userApi.remove(password);
      toast.success(t('settings.accountDeleted'));
      await logout(); // clears the session and sends the person to the home page
      navigate('/', { replace: true });
    } catch (err) {
      if (err.response?.data?.error?.code === 'WRONG_PASSWORD') setError('password', { message: t('errors.WRONG_PASSWORD') });
      else toast.error(getErrorMessage(err, t));
    }
  }

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title={t('settings.deleteAccount')}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <p className="rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-900">{t('settings.deleteWarn')}</p>
        <Field id="del-password" label={t('settings.confirmPassword')} error={errors.password?.message}>
          <input id="del-password" type="password" autoComplete="current-password" className="input" {...register('password', { required: t('validation.passwordRequired') })} />
        </Field>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => { reset(); onClose(); }}>{t('common.cancel')}</Button>
          <Button type="submit" variant="danger" loading={isSubmitting}>{t('settings.deleteNow')}</Button>
        </div>
      </form>
    </Modal>
  );
}
