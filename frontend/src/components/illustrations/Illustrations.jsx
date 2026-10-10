import { motion } from 'framer-motion';

// Original SVG illustrations drawn for MediCare+ (no stock photos, so no licence problems or broken image links).
// Floating motion switches off automatically for people who prefer reduced motion (see MotionConfig in main.jsx).

const Float = ({ children, y = 8, duration = 5, delay = 0 }) => (
  <motion.g animate={{ y: [0, -y, 0] }} transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}>
    {children}
  </motion.g>
);

const Defs = () => (
  <defs>
    <linearGradient id="mc-teal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#3fb8aa" />
      <stop offset="1" stopColor="#146762" />
    </linearGradient>
    <linearGradient id="mc-sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#bfe3f5" />
      <stop offset="1" stopColor="#8cc7e8" />
    </linearGradient>
  </defs>
);

export function HeroIllustration({ className = '' }) {
  return (
    <svg viewBox="0 0 480 420" className={className} aria-hidden="true" focusable="false">
      <Defs />
      <ellipse cx="240" cy="212" rx="210" ry="188" fill="#d3f3ed" opacity="0.75" />
      <circle cx="410" cy="78" r="44" fill="url(#mc-sky)" opacity="0.8" />
      <circle cx="62" cy="338" r="28" fill="#a9e6dc" opacity="0.9" />
      <path d="M392 330v28M378 344h28" stroke="#3fb8aa" strokeWidth="6" strokeLinecap="round" />
      <path d="M96 40v20M86 50h20" stroke="#74d2c5" strokeWidth="5" strokeLinecap="round" />

      {/* Calendar card */}
      <Float y={6} duration={5.5}>
        <g transform="translate(46 62)">
          <rect width="156" height="138" rx="22" fill="#fff" stroke="#d3f3ed" strokeWidth="2" />
          <path d="M0 22a22 22 0 0 1 22-22h112a22 22 0 0 1 22 22v14H0z" fill="url(#mc-teal)" />
          <rect x="34" y="-8" width="9" height="22" rx="4.5" fill="#146762" />
          <rect x="113" y="-8" width="9" height="22" rx="4.5" fill="#146762" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2, 3].map((c) => (
              <circle key={`${r}-${c}`} cx={30 + c * 32} cy={60 + r * 26} r="8" fill={r === 1 && c === 2 ? '#14807a' : '#eaf5fa'} />
            ))
          )}
          <path d="M91 86l5 5 9-10" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </Float>

      {/* Big capsule */}
      <Float y={10} duration={6.2} delay={0.4}>
        <g transform="translate(318 168) rotate(-32)">
          <rect x="-98" y="-42" width="196" height="84" rx="42" fill="#fff" stroke="#d3f3ed" strokeWidth="2" />
          <path d="M0 -42h56a42 42 0 0 1 0 84H0z" fill="url(#mc-teal)" />
          <rect x="-78" y="-26" width="62" height="10" rx="5" fill="#eaf5fa" />
        </g>
      </Float>

      {/* Heart + pulse card */}
      <Float y={7} duration={4.8} delay={0.8}>
        <g transform="translate(78 232)">
          <rect width="176" height="124" rx="24" fill="#fff" stroke="#d3f3ed" strokeWidth="2" />
          <path
            d="M88 100c-34-24-42-48-22-60 12-7 24-1 28 10 4-11 16-17 28-10 20 12 12 36-22 60z"
            fill="#e0553b"
            opacity="0.92"
            transform="translate(-6 -12) scale(1.05)"
          />
          <path d="M18 104h34l9-16 12 28 10-20h22" stroke="#14807a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </Float>

      {/* Report card with chart */}
      <Float y={8} duration={5.2} delay={1.2}>
        <g transform="translate(278 262)">
          <rect width="150" height="104" rx="22" fill="#fff" stroke="#d3f3ed" strokeWidth="2" />
          <rect x="18" y="16" width="52" height="8" rx="4" fill="#a9e6dc" />
          <rect x="18" y="32" width="84" height="6" rx="3" fill="#eaf5fa" />
          <path d="M18 84l26-22 24 12 30-30 20 10" stroke="#14807a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="68" cy="74" r="5" fill="#14807a" />
          <circle cx="98" cy="44" r="5" fill="#14807a" />
        </g>
      </Float>
    </svg>
  );
}

const Frame = ({ children, className = '' }) => (
  <svg viewBox="0 0 160 120" className={className} aria-hidden="true" focusable="false">
    <Defs />
    <ellipse cx="80" cy="64" rx="64" ry="50" fill="#d3f3ed" opacity="0.7" />
    {children}
  </svg>
);

export const PillsArt = ({ className }) => (
  <Frame className={className}>
    <Float y={4} duration={4}>
      <g transform="translate(70 56) rotate(-35)">
        <rect x="-38" y="-16" width="76" height="32" rx="16" fill="#fff" stroke="#a9e6dc" strokeWidth="2" />
        <path d="M0 -16h22a16 16 0 0 1 0 32H0z" fill="url(#mc-teal)" />
      </g>
    </Float>
    <Float y={3} duration={3.4} delay={0.5}>
      <circle cx="112" cy="84" r="14" fill="#fff" stroke="#a9e6dc" strokeWidth="2" />
      <path d="M102 84h20" stroke="#74d2c5" strokeWidth="3" strokeLinecap="round" />
    </Float>
    <path d="M38 28v14M31 35h14" stroke="#3fb8aa" strokeWidth="4" strokeLinecap="round" />
  </Frame>
);

export const CalendarArt = ({ className }) => (
  <Frame className={className}>
    <Float y={4} duration={4.4}>
      <g transform="translate(40 24)">
        <rect width="80" height="72" rx="14" fill="#fff" stroke="#a9e6dc" strokeWidth="2" />
        <path d="M0 14a14 14 0 0 1 14-14h52a14 14 0 0 1 14 14v10H0z" fill="url(#mc-teal)" />
        <circle cx="24" cy="46" r="5" fill="#eaf5fa" />
        <circle cx="42" cy="46" r="5" fill="#eaf5fa" />
        <circle cx="60" cy="46" r="5" fill="#14807a" />
        <circle cx="24" cy="62" r="5" fill="#eaf5fa" />
        <circle cx="42" cy="62" r="5" fill="#eaf5fa" />
      </g>
    </Float>
    <circle cx="124" cy="86" r="17" fill="#fff" stroke="#a9e6dc" strokeWidth="2" />
    <path d="M124 76v10l7 4" stroke="#14807a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Frame>
);

export const DocsArt = ({ className }) => (
  <Frame className={className}>
    <Float y={4} duration={4.2}>
      <g transform="translate(46 20)">
        <rect x="14" y="8" width="60" height="78" rx="10" fill="#eaf5fa" stroke="#bfe3f5" strokeWidth="2" />
        <rect width="60" height="78" rx="10" fill="#fff" stroke="#a9e6dc" strokeWidth="2" />
        <rect x="12" y="14" width="26" height="6" rx="3" fill="#a9e6dc" />
        <rect x="12" y="28" width="36" height="5" rx="2.5" fill="#d3f3ed" />
        <rect x="12" y="40" width="30" height="5" rx="2.5" fill="#d3f3ed" />
      </g>
    </Float>
    <g transform="translate(100 66)">
      <rect width="30" height="26" rx="7" fill="url(#mc-teal)" />
      <path d="M8 0v-6a7 7 0 0 1 14 0v6" stroke="#146762" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <circle cx="15" cy="13" r="3.5" fill="#fff" />
    </g>
  </Frame>
);

export const FlaskArt = ({ className }) => (
  <Frame className={className}>
    <Float y={4} duration={4.6}>
      <g transform="translate(52 18)">
        <path d="M22 0h32M30 0v30L6 74a8 8 0 0 0 7 12h50a8 8 0 0 0 7-12L46 30V0" fill="#fff" stroke="#a9e6dc" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M14 62h48l8 12a8 8 0 0 1-7 12H13a8 8 0 0 1-7-12z" fill="url(#mc-teal)" opacity="0.85" />
      </g>
    </Float>
    <circle cx="116" cy="40" r="6" fill="#bfe3f5" />
    <circle cx="128" cy="58" r="4" fill="#a9e6dc" />
    <circle cx="34" cy="48" r="4" fill="#a9e6dc" />
  </Frame>
);

export const ChartArt = ({ className }) => (
  <Frame className={className}>
    <g transform="translate(34 22)">
      <rect width="92" height="76" rx="14" fill="#fff" stroke="#a9e6dc" strokeWidth="2" />
      <path d="M14 58l20-16 16 8 26-26" stroke="#14807a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="34" cy="42" r="4.5" fill="#14807a" />
      <circle cx="50" cy="50" r="4.5" fill="#14807a" />
      <circle cx="76" cy="24" r="4.5" fill="#14807a" />
    </g>
  </Frame>
);

export const ART = { pills: PillsArt, calendar: CalendarArt, docs: DocsArt, flask: FlaskArt, chart: ChartArt };
