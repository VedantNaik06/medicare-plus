import { motion } from 'framer-motion';

// Accessible tabs: arrow keys move between tabs, and the highlight slides to the chosen tab.
export default function Tabs({ tabs, value, onChange, label, idPrefix = 'tabs' }) {
  function onKeyDown(e) {
    const index = tabs.findIndex((t) => t.id === value);
    let next = index;
    if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;
    e.preventDefault();
    onChange(tabs[next].id);
    document.getElementById(`${idPrefix}-tab-${tabs[next].id}`)?.focus();
  }

  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="mb-6 inline-flex max-w-full flex-wrap gap-1 rounded-full border border-brand-200 bg-white/80 p-1 backdrop-blur">
      {tabs.map((tab) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`relative min-h-11 rounded-full px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 ${selected ? 'text-white' : 'text-brand-900 hover:bg-brand-50'}`}
          >
            {selected && <motion.span layoutId={`${idPrefix}-pill`} className="absolute inset-0 rounded-full bg-brand-700" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ idPrefix = 'tabs', value, children }) {
  return (
    <motion.div key={value} role="tabpanel" id={`${idPrefix}-panel`} aria-labelledby={`${idPrefix}-tab-${value}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
      {children}
    </motion.div>
  );
}
