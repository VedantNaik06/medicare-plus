import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Info } from 'lucide-react';

// A small "i" button that explains something. Works with mouse, keyboard focus and touch.
export default function InfoTip({ text, align = 'left', className = '' }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const position = align === 'right' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0';

  return (
    <span className={`relative inline-flex ${className}`}>
      <button
        type="button"
        aria-label={text}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        className="grid size-8 place-items-center rounded-full text-brand-700 hover:bg-brand-100 focus-visible:outline-2 focus-visible:outline-brand-700"
      >
        <Info className="size-4" aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full z-30 mt-1.5 w-64 max-w-[80vw] rounded-2xl bg-ink px-3.5 py-2.5 text-sm font-medium leading-snug text-white shadow-lg ${position}`}
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
