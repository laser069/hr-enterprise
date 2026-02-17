import { type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { GlassEffect } from './LiquidGlass';

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
    <GlassEffect
      className={cn(
        'glass overflow-hidden transition-all duration-700 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:border-white/80 group relative rounded-[2rem]',
        className
      )}
    >
      {/* Inner Glossy Glow */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
      {(title || action) && (
          <div className="flex items-center justify-between px-10 py-8 border-b border-slate-200/60 bg-white/40 backdrop-blur-md">
            <div>
              {title && (
                <h3 className="text-xl font-black text-slate-900 tracking-tighter drop-shadow-sm">{title}</h3>
              )}
              {subtitle && (
                <p className="text-[10px] text-slate-500 mt-2 font-black uppercase tracking-[0.2em]">{subtitle}</p>
              )}
            </div>
            {action && <div className="flex items-center">{action}</div>}
          </div>
      )}
      <div className={cn(noPadding ? 'p-0' : 'p-10')}>
        {children}
      </div>
    </GlassEffect>
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
}

export function StatCard({ title, value, icon, trend, progress, action, className, style }: StatCardProps) {
  return (
    <GlassEffect
      className={cn(
        'glass-mirror glass-rim rounded-[3.5rem] p-10 group transition-all duration-1000 hover:shadow-[0_60px_100px_-20px_rgba(0,0,0,0.15)] hover:-translate-y-3 flex flex-col relative overflow-hidden',
        className
      )}
      style={style}
    >
      {/* Dynamic Internal Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/10 rounded-full blur-[60px] animate-internal-glow pointer-events-none"></div>

      <div className="flex items-start justify-between relative z-20 mb-auto">
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 opacity-90 truncate">{title}</p>
          <p className="text-6xl font-black text-slate-900 tracking-tighter drop-shadow-md leading-none truncate mb-2">{value}</p>
          
          {trend && (
            <div className="flex items-center gap-3 mt-10">
              <span
                className={cn(
                  'flex items-center text-[11px] font-black px-4 py-2 rounded-2xl shadow-lg backdrop-blur-xl border ring-1 ring-black/[0.02] transition-all duration-500 group-hover:scale-105',
                  trend.isPositive 
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              {trend.label && (
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] ml-1 opacity-70 truncate">{trend.label}</span>
              )}
            </div>
          )}
        </div>
        
        {icon && (
          <div className="w-20 h-20 bg-white/70 rounded-full flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-all duration-700 shadow-[0_20px_40px_rgba(0,0,0,0.05)] border border-white shrink-0 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-[0_25px_50px_rgba(0,0,0,0.1)]">
            {icon}
          </div>
        )}
      </div>

      {(progress !== undefined || action) && (
        <div className="mt-10 space-y-8 relative z-20">
          {progress !== undefined && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                <span className="opacity-70">Optimization Telemetry</span>
                <span className="text-slate-900 drop-shadow-sm">{progress}%</span>
              </div>
              <div className="h-4 w-full glass-inset rounded-full overflow-hidden p-[3px] shadow-inner mb-2">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(79,70,229,0.4)] relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>
          )}
          
          {action && (
            <div className="flex justify-center pt-2">
              <div className="glass-pill-raised rounded-full py-1 px-1">
                {action}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Bottom Reflection Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
    </GlassEffect>
  );
}
