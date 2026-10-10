import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Check, FileText, FlaskConical, Pill, Plus, SkipForward, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Async, EmptyState, Skeleton } from '../components/ui/Feedback.jsx';
import InfoTip from '../components/ui/Tooltip.jsx';
import { AnimatedNumber, ProgressRing, Stagger, StaggerItem } from '../components/ui/motion.jsx';
import DoseRow from '../components/DoseRow.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { useMarkDose } from '../hooks/useMarkDose.js';
import { REMINDERS_FIRED } from '../hooks/useReminders.js';
import { dashboardApi } from '../services/endpoints.js';
import { formatDate, formatDateTime, formatLongDate, formatTime, greetingKey } from '../utils/dateFormat.js';

function DashboardSkeleton() {
  return (
    <div className="space-y-5" role="status">
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-52 lg:col-span-2" />
        <Skeleton className="h-52" />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2"><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
        <Skeleton className="h-52" />
      </div>
    </div>
  );
}

function NextDoseCard({ dose, onChanged }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { mark, busy } = useMarkDose(onChanged);

  return (
    <section aria-labelledby="next-dose" className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-6 text-white shadow-lift">
      {/* Decorative capsule */}
      <svg aria-hidden="true" viewBox="0 0 200 200" className="pointer-events-none absolute -right-8 -top-6 w-48 opacity-15">
        <g transform="rotate(-35 100 100)"><rect x="10" y="62" width="180" height="76" rx="38" fill="#fff" /><path d="M100 62h52a38 38 0 0 1 0 76h-52z" fill="#a9e6dc" /></g>
      </svg>
      <h2 id="next-dose" className="relative flex items-center gap-2 text-base font-semibold text-brand-100"><Pill className="size-5" aria-hidden="true" />{t('dashboard.nextDose')}</h2>
      {dose ? (
        <div className="relative">
          <p className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">{formatTime(dose.scheduledAt, i18n.language, user.timeZone)}</p>
          <p className="mt-1 text-xl font-bold">{dose.medicine.name}</p>
          <p className="text-brand-100">
            {[dose.medicine.dosage, dose.medicine.foodInstruction !== 'none' ? t(`food.${dose.medicine.foodInstruction}`) : ''].filter(Boolean).join(' · ')}
          </p>
          {dose.displayStatus === 'due' && <p className="mt-3 inline-flex rounded-full bg-amber-300 px-3 py-1 text-sm font-bold text-amber-950">{t('dashboard.dueNow')}</p>}
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => mark(dose.id, 'taken')} disabled={Boolean(busy)} className="btn min-h-12 bg-white px-6 text-brand-900 hover:bg-brand-50">
              <Check className="size-5" aria-hidden="true" />{t('medicines.taken')}
            </button>
            <button type="button" onClick={() => mark(dose.id, 'skipped')} disabled={Boolean(busy)} className="btn min-h-12 border border-white/60 px-6 text-white hover:bg-white/10">
              <SkipForward className="size-5" aria-hidden="true" />{t('medicines.skip')}
            </button>
          </div>
        </div>
      ) : (
        <p className="relative mt-4 text-lg text-brand-100">{t('dashboard.noNextDose')}</p>
      )}
    </section>
  );
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const state = useApi(() => dashboardApi.get(), []);
  const { reload } = state;

  // Keep the screen fresh: every minute, and right after a reminder fires.
  useEffect(() => {
    const refresh = () => reload({ silent: true });
    const id = setInterval(refresh, 60000);
    window.addEventListener(REMINDERS_FIRED, refresh);
    return () => { clearInterval(id); window.removeEventListener(REMINDERS_FIRED, refresh); };
  }, [reload]);

  const lng = i18n.language;
  const firstName = user.name.split(' ')[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t(greetingKey(user.timeZone), { name: firstName })}</h1>
        <p className="mt-1 text-slate-700">{t('dashboard.today', { date: formatLongDate(new Date(), lng, user.timeZone) })}</p>
      </div>

      {/* Quick actions stay at the top, within thumb reach */}
      <nav aria-label={t('dashboard.quickActions')} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link to="/app/medicines/new" className="btn btn-primary min-h-12"><Plus className="size-5" aria-hidden="true" />{t('dashboard.addMedicine')}</Link>
        <Link to="/app/appointments?new=1" className="btn btn-secondary min-h-12"><CalendarClock className="size-5" aria-hidden="true" />{t('dashboard.addAppointment')}</Link>
        <Link to="/app/records?upload=1" className="btn btn-secondary min-h-12"><Upload className="size-5" aria-hidden="true" />{t('dashboard.uploadReport')}</Link>
      </nav>

      <Async state={state} skeleton={<DashboardSkeleton />}>
        {(d) => (
          <Stagger className="space-y-5" step={0.08}>
            {d.medicineCount === 0 && (
              <StaggerItem>
                <EmptyState art="pills" text={t('dashboard.emptyNew')} action={<Link to="/app/medicines/new" className="btn btn-primary">{t('dashboard.addMedicine')}</Link>} />
              </StaggerItem>
            )}

            <div className="grid gap-5 lg:grid-cols-3">
              <StaggerItem className="lg:col-span-2"><NextDoseCard dose={d.nextDose} onChanged={reload} /></StaggerItem>

              <StaggerItem>
                <section aria-labelledby="next-appt" className="glass h-full p-6">
                  <h2 id="next-appt" className="flex items-center gap-2 text-base font-semibold text-brand-800"><CalendarClock className="size-5" aria-hidden="true" />{t('dashboard.nextAppointment')}</h2>
                  {d.nextAppointment ? (
                    <div className="mt-4">
                      <p className="text-xl font-bold">{d.nextAppointment.doctorName}</p>
                      {d.nextAppointment.clinicName && <p className="text-slate-700">{d.nextAppointment.clinicName}</p>}
                      <p className="mt-3 font-semibold text-brand-800">{formatDateTime(d.nextAppointment.appointmentAt, lng, user.timeZone)}</p>
                      {d.nextAppointment.reason && <p className="mt-1 text-sm text-slate-700">{d.nextAppointment.reason}</p>}
                    </div>
                  ) : (
                    <p className="mt-4 text-slate-700">{t('dashboard.noAppointment')}</p>
                  )}
                </section>
              </StaggerItem>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <StaggerItem className="lg:col-span-2">
                <section aria-labelledby="today">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 id="today" className="text-lg font-bold">{t('dashboard.todaySchedule')}</h2>
                    <Link to="/app/medicines" className="text-sm font-semibold text-brand-700 underline">{t('common.viewAll')}</Link>
                  </div>
                  {d.todayDoses.length ? (
                    <ul className="space-y-3">{d.todayDoses.map((dose) => <DoseRow key={dose.id} dose={dose} onChanged={reload} />)}</ul>
                  ) : (
                    <p className="rounded-2xl border border-dashed border-brand-200 bg-white/60 p-5 text-slate-700">{t('dashboard.noDosesToday')}</p>
                  )}
                </section>
              </StaggerItem>

              <div className="space-y-5">
                <StaggerItem>
                  <section aria-labelledby="adh" className="glass p-6">
                    <div className="flex items-center justify-between">
                      <h2 id="adh" className="text-base font-semibold text-brand-800">{t('dashboard.adherence')}</h2>
                      <InfoTip text={t('tips.adherence')} align="right" />
                    </div>
                    {d.adherence.total ? (
                      <div className="mt-3 flex items-center gap-4">
                        <div className="relative shrink-0">
                          <ProgressRing percent={d.adherence.percent} size={96} label={t('dashboard.adherenceRingLabel', { percent: d.adherence.percent })} />
                          <span className="absolute inset-0 grid place-items-center text-xl font-extrabold"><AnimatedNumber value={d.adherence.percent} suffix="%" /></span>
                        </div>
                        <div>
                          <p className="font-semibold">{t('dashboard.adherenceText', { taken: d.adherence.taken, total: d.adherence.total })}</p>
                          <p className="text-sm text-slate-700">{t('dashboard.adherenceDetail', { skipped: d.adherence.skipped, missed: d.adherence.missed })}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-700">{t('dashboard.adherenceNone')}</p>
                    )}
                  </section>
                </StaggerItem>

                <StaggerItem>
                  <section aria-labelledby="recent" className="glass p-6">
                    <h2 id="recent" className="text-base font-semibold text-brand-800">{t('dashboard.recentReports')}</h2>
                    {d.recentReports.length ? (
                      <ul className="mt-3 space-y-1">
                        {d.recentReports.map((r) => (
                          <li key={`${r.kind}-${r.id}`}>
                            <Link to={r.kind === 'test' ? `/app/tests/${r.id}` : '/app/records'} className="flex min-h-12 items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-brand-50">
                              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700">
                                {r.kind === 'test' ? <FlaskConical className="size-5" aria-hidden="true" /> : <FileText className="size-5" aria-hidden="true" />}
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate font-semibold">{r.title}</span>
                                <span className="block text-sm text-slate-700">{r.kind === 'test' ? t('dashboard.testResult') : t('dashboard.document')}{r.date ? ` · ${formatDate(r.date, lng)}` : ''}</span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-slate-700">{t('dashboard.noReports')}</p>
                    )}
                  </section>
                </StaggerItem>
              </div>
            </div>
          </Stagger>
        )}
      </Async>
    </div>
  );
}
