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
        'inline-flex items-center font-semibold uppercase tracking-wide rounded-lg border',
        {
          'bg-slate-100 text-slate-700 border-slate-200': variant === 'default',
          'bg-indigo-100 text-indigo-700 border-indigo-200': variant === 'primary',
          'bg-emerald-100 text-emerald-700 border-emerald-200': variant === 'success',
          'bg-amber-100 text-amber-700 border-amber-200': variant === 'warning',
          'bg-rose-100 text-rose-700 border-rose-200': variant === 'danger',
          'bg-blue-100 text-blue-700 border-blue-200': variant === 'info',
        },
        {
          'px-2 py-0.5 text-[9px]': size === 'sm',
          'px-2.5 py-1 text-[10px]': size === 'md',
        },
        className
      )}
    >
      {children}
    </span>
  );
}