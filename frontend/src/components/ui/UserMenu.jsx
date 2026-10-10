import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LogOut, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Avatar button with a small glass dropdown (Settings, Log out). Closes on outside click or Escape.
export default function UserMenu({ user, onLogout }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const initial = (user?.name || '?').trim().charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label={t('nav.account')}
        className="flex min-h-11 items-center gap-2 rounded-full border border-brand-200 bg-white py-1 pl-1 pr-3 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-brand-700">
        <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 text-sm font-bold text-white">{initial}</span>
        <span className="hidden max-w-32 truncate text-sm font-semibold sm:block">{user?.name}</span>
        <ChevronDown className={`size-4 text-slate-600 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div role="menu" initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.14 }}
            className="glass absolute right-0 top-full z-40 mt-2 w-56 origin-top-right bg-white/90 p-2 backdrop-blur-xl">
            <p className="truncate px-3 py-2 text-sm text-slate-600">{user?.email}</p>
            <Link role="menuitem" to="/app/settings" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-3 rounded-2xl px-3 font-semibold hover:bg-brand-50">
              <Settings className="size-5 text-brand-700" aria-hidden="true" />{t('nav.settings')}
            </Link>
            <button role="menuitem" type="button" onClick={() => { setOpen(false); onLogout(); }} className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-left font-semibold hover:bg-brand-50">
              <LogOut className="size-5 text-brand-700" aria-hidden="true" />{t('nav.logout')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
