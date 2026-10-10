import { Loader2 } from 'lucide-react';

const VARIANTS = { primary: 'btn-primary', secondary: 'btn-secondary', danger: 'btn-danger', ghost: 'btn-ghost' };

export default function Button({ variant = 'primary', size, loading = false, className = '', children, disabled, type = 'button', ...rest }) {
  return (
    <button
      type={type}
      className={`btn ${VARIANTS[variant]} ${size === 'sm' ? 'btn-sm' : ''} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
