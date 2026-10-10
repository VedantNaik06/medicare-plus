import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, CalendarClock, Check, FileText, Languages, LineChart, Lock, Pill, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from '../components/ui/Logo.jsx';
import LanguageSwitcher from '../components/ui/LanguageSwitcher.jsx';
import Disclaimer from '../components/ui/Disclaimer.jsx';
import { HeroIllustration } from '../components/illustrations/Illustrations.jsx';
import { Reveal, Stagger, StaggerItem } from '../components/ui/motion.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const BENEFITS = [
  { icon: Pill, key: 'b1' },
  { icon: CalendarClock, key: 'b2' },
  { icon: FileText, key: 'b3' },
  { icon: LineChart, key: 'b4' },
];
const STEPS = ['s1', 's2', 's3'];
const TRUST = [
  { icon: Lock, key: 'trust1' },
  { icon: Smartphone, key: 'trust2' },
  { icon: Languages, key: 'trust3' },
];

export default function Landing() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const startTo = user ? '/app/dashboard' : '/register';
  const loginTo = user ? '/app/dashboard' : '/login';

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-8">
        <Logo compact />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link to={loginTo} className="btn btn-secondary hidden sm:inline-flex">{t('landing.login')}</Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-16 pt-6 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pt-12">
          <Stagger step={0.09}>
            <StaggerItem>
              <span className="chip border border-brand-200 bg-white/80 text-brand-800 backdrop-blur"><Bell className="size-4" aria-hidden="true" />{t('landing.eyebrow')}</span>
            </StaggerItem>
            <StaggerItem as="h1" className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-brand-900 sm:text-5xl lg:text-[3.4rem]">
              {t('landing.heroTitle')}
            </StaggerItem>
            <StaggerItem as="p" className="mt-5 max-w-xl text-lg leading-relaxed text-slate-700">{t('landing.heroText')}</StaggerItem>
            <StaggerItem className="mt-8 flex flex-wrap gap-3">
              <Link to={startTo} className="btn btn-primary min-h-12 px-7 text-base">{t('landing.getStarted')}</Link>
              <Link to={loginTo} className="btn btn-secondary min-h-12 px-7 text-base">{t('landing.login')}</Link>
            </StaggerItem>
            <StaggerItem as="ul" className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-700">
              {TRUST.map(({ icon: Icon, key }) => (
                <li key={key} className="flex items-center gap-2"><Icon className="size-4 text-brand-700" aria-hidden="true" />{t(`landing.${key}`)}</li>
              ))}
            </StaggerItem>
          </Stagger>

          <motion.div className="mx-auto w-full max-w-md lg:max-w-none" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <HeroIllustration className="w-full" />
            {/* Sample card sits BELOW the picture (not on top of it), so nothing in the illustration is hidden */}
            <motion.div className="glass mx-auto mt-2 w-full max-w-sm p-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-brand-800">{t('landing.sampleTitle')}</p>
                <span className="chip whitespace-nowrap bg-slate-100 text-xs text-slate-700">{t('landing.sampleLabel')}</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between gap-3"><span>8:00 am · Vitamin D</span><span className="chip whitespace-nowrap bg-emerald-100 px-2 py-0.5 text-xs text-emerald-900"><Check className="size-3" aria-hidden="true" />{t('status.taken')}</span></li>
                <li className="flex items-center justify-between gap-3"><span>2:00 pm · Iron</span><span className="chip whitespace-nowrap bg-amber-100 px-2 py-0.5 text-xs text-amber-900">{t('status.due')}</span></li>
              </ul>
            </motion.div>
          </motion.div>
        </section>

        {/* How it works */}
        <section className="border-y border-brand-100 bg-white/60 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8">
            <Reveal inView as="h2" className="text-2xl font-extrabold tracking-tight text-brand-900 sm:text-3xl">{t('landing.howTitle')}</Reveal>
            <ol className="mt-8 grid gap-6 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <Reveal inView as="li" key={s} delay={i * 0.1} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-700 text-lg font-extrabold text-white shadow-lift">{i + 1}</span>
                  <div>
                    <h3 className="text-lg font-bold">{t(`landing.${s}Title`)}</h3>
                    <p className="mt-1 leading-relaxed text-slate-700">{t(`landing.${s}Text`)}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* Benefits */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-8">
          <Reveal inView as="h2" className="max-w-xl text-2xl font-extrabold tracking-tight text-brand-900 sm:text-3xl">{t('landing.benefitsTitle')}</Reveal>
          <div className="mt-10 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {BENEFITS.map(({ icon: Icon, key }, i) => (
              <Reveal inView key={key} delay={(i % 2) * 0.1} className="flex gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-100 text-brand-700"><Icon className="size-6" aria-hidden="true" /></span>
                <div>
                  <h3 className="text-lg font-bold">{t(`landing.${key}Title`)}</h3>
                  <p className="mt-1 leading-relaxed text-slate-700">{t(`landing.${key}Text`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Final call to action */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-8">
          <Reveal inView className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-8 text-white shadow-lift sm:p-12">
            <h2 className="max-w-xl text-2xl font-extrabold tracking-tight sm:text-3xl">{t('landing.ctaTitle')}</h2>
            <p className="mt-2 text-brand-100">{t('landing.ctaText')}</p>
            <Link to={startTo} className="btn mt-6 min-h-12 bg-white px-7 text-base text-brand-900 hover:bg-brand-50">{t('landing.getStarted')}</Link>
          </Reveal>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl space-y-3 px-4 py-8 sm:px-8">
        <Disclaimer />
        <p className="text-sm text-slate-600">{t('landing.footer', { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  );
}
