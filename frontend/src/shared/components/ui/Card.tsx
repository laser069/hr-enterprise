import { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  noPadding?: boolean;
}

export function Card({ children, className, title, subtitle, action, noPadding = false }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm',
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
          <div>
            {title && (
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex items-center">{action}</div>}
        </div>
      )}
      <div className={cn(noPadding ? 'p-0' : 'p-6')}>
        {children}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  progress?: number;
  action?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  square?: boolean;
}

export function StatCard({ title, value, icon, trend, progress, action, className, style, square }: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col',
        square && 'aspect-square',
        className
      )}
      style={style}
    >
      <div className="flex items-start justify-between mb-4 w-full">
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
          <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>

          {trend && (
            <div className="flex items-center gap-2 mt-3">
              <span
                className={cn(
                  'text-xs font-semibold px-2 py-1 rounded-lg border',
                  trend.isPositive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              {trend.label && (
                <span className="text-xs text-slate-400">{trend.label}</span>
              )}
            </div>
          )}
        </div>

        {icon && (
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
            {icon}
          </div>
        )}
      </div>

      {(progress !== undefined || action) && (
        <div className="mt-4 space-y-3">
          {progress !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Progress</span>
                <span className="font-semibold text-slate-700">{progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          {action && (
            <div className="flex justify-center pt-1">{action}</div>
          )}
        </div>
      )}
    </div>
  );
}
