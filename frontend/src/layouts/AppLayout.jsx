import { Suspense } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarClock, FileText, FlaskConical, LayoutDashboard, LogOut, Pill, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Logo from '../components/ui/Logo.jsx';
import LanguageSwitcher from '../components/ui/LanguageSwitcher.jsx';
import TextSizeToggle from '../components/ui/TextSizeToggle.jsx';
import UserMenu from '../components/ui/UserMenu.jsx';
import Disclaimer from '../components/ui/Disclaimer.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import { ListSkeleton } from '../components/ui/Feedback.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useReminders } from '../hooks/useReminders.js';

const NAV = [
  { to: '/app/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { to: '/app/medicines', key: 'medicines', icon: Pill },
  { to: '/app/appointments', key: 'appointments', icon: CalendarClock },
  { to: '/app/records', key: 'records', icon: FileText },
  { to: '/app/tests', key: 'tests', icon: FlaskConical },
];

export default function AppLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  useReminders(); // browser notifications while the app is open

  async function handleLogout() {
    await logout();
    toast.success(t('auth.loggedOut'));
  }

  return (
    <div className="min-h-screen md:pl-64">
      <a href="#main" className="sr-only z-[60] rounded-full bg-white px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        {t('nav.skip')}
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-white/70 bg-white/70 p-5 backdrop-blur-xl md:flex">
        <Logo to="/app/dashboard" />
        <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label={t('nav.mainMenu')}>
          {NAV.map(({ to, key, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-h-12 items-center gap-3 rounded-2xl px-4 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand-700 ${
                  isActive ? 'bg-brand-700 text-white shadow-lift' : 'text-brand-900 hover:bg-brand-50'
                }`
              }
            >
              <Icon className="size-5" aria-hidden="true" />
              {t(`nav.${key}`)}
            </NavLink>
          ))}
        </nav>
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            `mb-1 flex min-h-12 items-center gap-3 rounded-2xl px-4 text-[15px] font-semibold ${isActive ? 'bg-brand-700 text-white shadow-lift' : 'text-brand-900 hover:bg-brand-50'}`
          }
        >
          <Settings className="size-5" aria-hidden="true" />
          {t('nav.settings')}
        </NavLink>
        <button type="button" onClick={handleLogout} className="flex min-h-12 items-center gap-3 rounded-2xl px-4 text-[15px] font-semibold text-slate-700 hover:bg-slate-100">
          <LogOut className="size-5" aria-hidden="true" />
          {t('nav.logout')}
        </button>
      </aside>

      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-white/70 bg-white/70 px-4 py-2.5 backdrop-blur-xl sm:px-8 md:justify-end">
        <div className="md:hidden"><Logo to="/app/dashboard" compact /></div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <TextSizeToggle />
          <LanguageSwitcher />
          <UserMenu user={user} onLogout={handleLogout} />
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-5xl px-4 pb-32 pt-6 sm:px-8 md:pb-12">
        <ErrorBoundary key={location.pathname}>
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Suspense fallback={<ListSkeleton rows={3} />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </ErrorBoundary>
        <Disclaimer className="mt-12 border-t border-brand-100 pt-5" />
      </main>

      {/* Mobile bottom navigation: large touch targets */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/70 bg-white/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden" aria-label={t('nav.mainMenu')}>
        <ul className="grid grid-cols-5">
          {NAV.map(({ to, key, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => `flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold ${isActive ? 'text-brand-700' : 'text-slate-700'}`}
              >
                {({ isActive }) => (
                  <>
                    <span className={`grid h-7 w-12 place-items-center rounded-full transition-colors ${isActive ? 'bg-brand-100' : ''}`}>
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="max-w-full truncate">{t(`nav.${key}`)}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
