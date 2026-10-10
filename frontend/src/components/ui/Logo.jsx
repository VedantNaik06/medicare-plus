import { Link } from 'react-router-dom';

export function CapsuleMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="18" fill="#14807a" />
      <g transform="rotate(-40 32 32)">
        <rect x="11" y="22" width="42" height="20" rx="10" fill="#fff" />
        <path d="M32 22h11a10 10 0 0 1 0 20H32z" fill="#a9e6dc" />
      </g>
    </svg>
  );
}

export default function Logo({ to = '/', className = '', compact = false }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-700 ${className}`}>
      <CapsuleMark />
      <span className={`text-xl font-extrabold tracking-tight text-brand-900 ${compact ? 'hidden min-[420px]:inline' : ''}`}>MediCare+</span>
    </Link>
  );
}
