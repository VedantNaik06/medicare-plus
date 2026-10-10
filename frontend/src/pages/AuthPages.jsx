import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../layouts/AuthLayout.jsx';
import Button from '../components/ui/Button.jsx';
import Field, { describedBy } from '../components/ui/Field.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { applyServerErrors, getErrorMessage } from '../utils/errors.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function PasswordInput({ id, register, error, hint, autoComplete }) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        className="input pr-14"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        {...register}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? t('auth.hidePassword') : t('auth.showPassword')}
        className="absolute right-1 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-slate-600 hover:bg-slate-100"
      >
        {show ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
      </button>
    </div>
  );
}

export function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm();
  const [formError, setFormError] = useState('');

  async function onSubmit(values) {
    setFormError('');
    try {
      const user = await login(values);
      toast.success(t('auth.welcome', { name: user.name }));
      navigate(location.state?.from || '/app/dashboard', { replace: true });
    } catch (err) {
      if (!applyServerErrors(err, setError, t)) setFormError(getErrorMessage(err, t));
    }
  }

  return (
    <AuthLayout
      title={t('auth.loginTitle')}
      subtitle={t('auth.loginSubtitle')}
      footer={<>{t('auth.noAccount')} <Link to="/register" className="font-bold text-brand-700 underline">{t('auth.register')}</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {formError && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{formError}</p>}
        <Field id="email" label={t('auth.email')} error={errors.email?.message}>
          <input
            id="email" type="email" autoComplete="email" className="input" aria-invalid={Boolean(errors.email)} aria-describedby={describedBy('email', errors.email)}
            {...register('email', { required: t('validation.emailInvalid'), pattern: { value: EMAIL_RE, message: t('validation.emailInvalid') } })}
          />
        </Field>
        <Field id="password" label={t('auth.password')} error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="current-password" error={errors.password} register={register('password', { required: t('validation.passwordRequired') })} />
        </Field>
        <Button type="submit" className="w-full" loading={isSubmitting}>{t('auth.login')}</Button>
      </form>
    </AuthLayout>
  );
}

export function Register() {
  const { t } = useTranslation();
  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm();
  const [formError, setFormError] = useState('');

  async function onSubmit(values) {
    setFormError('');
    try {
      const user = await signUp(values);
      toast.success(t('auth.welcome', { name: user.name }));
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      if (err.response?.data?.error?.code === 'EMAIL_TAKEN') setError('email', { message: t('errors.EMAIL_TAKEN') });
      else if (!applyServerErrors(err, setError, t)) setFormError(getErrorMessage(err, t));
    }
  }

  return (
    <AuthLayout
      title={t('auth.registerTitle')}
      subtitle={t('auth.registerSubtitle')}
      footer={<>{t('auth.haveAccount')} <Link to="/login" className="font-bold text-brand-700 underline">{t('auth.login')}</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {formError && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{formError}</p>}
        <Field id="name" label={t('auth.name')} error={errors.name?.message}>
          <input
            id="name" autoComplete="name" className="input" aria-invalid={Boolean(errors.name)} aria-describedby={describedBy('name', errors.name)}
            {...register('name', { required: t('validation.nameRequired'), minLength: { value: 2, message: t('validation.nameShort') } })}
          />
        </Field>
        <Field id="email" label={t('auth.email')} error={errors.email?.message}>
          <input
            id="email" type="email" autoComplete="email" className="input" aria-invalid={Boolean(errors.email)} aria-describedby={describedBy('email', errors.email)}
            {...register('email', { required: t('validation.emailInvalid'), pattern: { value: EMAIL_RE, message: t('validation.emailInvalid') } })}
          />
        </Field>
        <Field id="password" label={t('auth.password')} hint={t('auth.passwordHint')} error={errors.password?.message}>
          <PasswordInput
            id="password" autoComplete="new-password" error={errors.password} hint={t('auth.passwordHint')}
            register={register('password', {
              required: t('validation.passwordWeak'),
              validate: (v) => (v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v)) || t('validation.passwordWeak'),
            })}
          />
        </Field>
        <Button type="submit" className="w-full" loading={isSubmitting}>{t('auth.register')}</Button>
      </form>
    </AuthLayout>
  );
}
