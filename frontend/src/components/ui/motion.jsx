import { useEffect, useRef, useState } from 'react';
import { animate, motion, useReducedMotion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

// Fade + slide up. With inView, it plays when the element scrolls into view.
export function Reveal({ children, delay = 0, y = 14, inView = false, as = 'div', className = '', ...rest }) {
  const Comp = motion[as];
  const visible = { opacity: 1, y: 0 };
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      {...(inView ? { whileInView: visible, viewport: { once: true, margin: '-60px' } } : { animate: visible })}
      transition={{ duration: 0.45, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

// Children appear one after another.
const container = (step, delay) => ({ hidden: {}, show: { transition: { staggerChildren: step, delayChildren: delay } } });
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } } };

export function Stagger({ children, step = 0.07, delay = 0, as = 'div', className = '', ...rest }) {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={container(step, delay)} initial="hidden" animate="show" {...rest}>
      {children}
    </Comp>
  );
}

export function StaggerItem({ children, as = 'div', className = '', ...rest }) {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={item} {...rest}>
      {children}
    </Comp>
  );
}

// Counts up to a number (or just shows it for people who prefer reduced motion).
export function AnimatedNumber({ value, suffix = '' }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);
  const from = useRef(0);

  useEffect(() => {
    if (reduce) { setShown(value); return undefined; }
    const controls = animate(from.current, value, {
      duration: 0.9,
      ease: 'easeOut',
      onUpdate: (v) => setShown(Math.round(v)),
      onComplete: () => { from.current = value; },
    });
    return () => controls.stop();
  }, [value, reduce]);

  return <>{shown}{suffix}</>;
}

// A circular progress indicator that draws itself.
export function ProgressRing({ percent, size = 112, stroke = 10, label }) {
  const r = 50 - stroke / 2;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={label}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="#d3f3ed" strokeWidth={stroke} />
      <g transform="rotate(-90 50 50)">
        <motion.circle
          cx="50" cy="50" r={r} fill="none" stroke="#14807a" strokeWidth={stroke} strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: Math.max(0, Math.min(1, percent / 100)) }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </g>
    </svg>
  );
}
