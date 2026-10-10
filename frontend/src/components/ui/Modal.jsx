import { useEffect, useId, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from './Button.jsx';

const FOCUSABLE = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, children, wide = false }) {
  const { t } = useTranslation();
  const panelRef = useRef(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose; // always call the latest onClose without re-running the effect below

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    // Keep keyboard focus INSIDE the dialog while it is open (Tab / Shift+Tab loop around).
    const onKey = (e) => {
      if (e.key === 'Escape') return closeRef.current();
      if (e.key !== 'Tab' || !panelRef.current) return undefined;
      const nodes = [...panelRef.current.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
      if (!nodes.length) return undefined;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === panelRef.current)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
      return undefined;
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previouslyFocused?.focus?.(); // give focus back to the button that opened the dialog
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && closeRef.current()}
        >
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-white/70 bg-white/95 p-5 shadow-2xl outline-none backdrop-blur-xl sm:rounded-3xl sm:p-7 ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'}`}
            initial={{ y: 32, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 32, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <h2 id={titleId} className="text-xl font-bold">{title}</h2>
              <button type="button" onClick={() => closeRef.current()} aria-label={t('common.close')} className="-mr-2 -mt-1 grid size-11 place-items-center rounded-full text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-brand-700">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// "Are you sure?" dialog used before every delete.
export function ConfirmDialog({ open, onClose, onConfirm, title, text, confirmLabel, loading }) {
  const { t } = useTranslation();
  return (
    <Modal open={open} onClose={onClose} title={title || t('common.confirmDeleteTitle')}>
      <p className="text-base text-slate-700">{text || t('common.confirmDeleteText')}</p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>{loading ? t('common.deleting') : confirmLabel || t('common.delete')}</Button>
      </div>
    </Modal>
  );
}
