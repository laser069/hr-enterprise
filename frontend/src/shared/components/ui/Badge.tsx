import { cn } from '../../utils/cn';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-black uppercase tracking-[0.2em] rounded-2xl backdrop-blur-xl border shadow-[0_10px_20px_-5px_rgba(0,0,0,0.05)] ring-1 ring-white/20',
        {
          'bg-slate-100/80 text-slate-700 border-slate-200/60 shadow-inner': variant === 'default',
          'bg-indigo-600 text-white border-indigo-500 shadow-[0_10px_20px_-5px_rgba(79,70,229,0.3)]': variant === 'primary',
          'bg-emerald-500 text-white border-emerald-400 shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)]': variant === 'success',
          'bg-amber-500 text-white border-amber-400 shadow-[0_10px_20px_-5px_rgba(245,158,11,0.3)]': variant === 'warning',
          'bg-rose-500 text-white border-rose-400 shadow-[0_10px_20px_-5px_rgba(244,63,94,0.3)]': variant === 'danger',
          'bg-indigo-500 text-white border-indigo-400 shadow-[0_10px_20px_-5px_rgba(99,102,241,0.3)]': variant === 'info',
        },
        {
          'px-3 py-1 text-[8px]': size === 'sm',
          'px-4 py-1.5 text-[9px]': size === 'md',
        },
        className
      )}
    >
      {children}
    </span>
  );
}