import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { GlassEffect } from './LiquidGlass';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-black uppercase tracking-widest rounded-2xl transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-slate-900/5 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.05] active:scale-95 group overflow-hidden',
          {
            'bg-slate-900 text-white shadow-[0_20px_40px_-12px_rgba(15,23,42,0.3)] hover:bg-slate-800 ring-1 ring-slate-900/10':
              variant === 'primary',
            'glass-strong text-slate-900 hover:bg-white hover:shadow-2xl shadow-black/5':
              variant === 'secondary',
            'border-2 border-slate-200/60 bg-transparent text-slate-700 hover:bg-white hover:text-slate-900 hover:border-slate-900 shadow-sm hover:shadow-xl':
              variant === 'outline',
            'text-slate-500 hover:text-slate-900 hover:bg-white/60 backdrop-blur-sm':
              variant === 'ghost',
            'bg-rose-500 text-white shadow-[0_20px_40px_-12px_rgba(244,63,94,0.3)] hover:bg-rose-600 ring-1 ring-rose-500/20':
              variant === 'danger',
            'bg-emerald-500 text-white shadow-[0_20px_40px_-12px_rgba(16,185,129,0.3)] hover:bg-emerald-600 ring-1 ring-emerald-500/20':
              variant === 'success',
            'bg-amber-500 text-white shadow-[0_20px_40px_-12px_rgba(245,158,11,0.3)] hover:bg-amber-600 ring-1 ring-amber-500/20':
              variant === 'warning',
          },
          {
            'px-6 py-3 text-[9px]': size === 'sm',
            'px-10 py-5 text-[10px]': size === 'md',
            'px-14 py-6 text-xs': size === 'lg',
          },
          (disabled || isLoading) && 'opacity-50 cursor-not-allowed grayscale pointer-events-none',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        <GlassEffect 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-inherit"
          disableFilter={true}
        >
          <div />
        </GlassEffect>
        <div className="relative z-10 flex items-center justify-center">
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
        </div>
      </button>
    );
  }
);

Button.displayName = 'Button';