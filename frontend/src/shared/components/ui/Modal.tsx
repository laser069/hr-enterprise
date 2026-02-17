import { useEffect, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-6 text-center">
        <div
          className={cn(
            'glass-strong relative transform overflow-hidden rounded-[3rem] p-16 text-left shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] transition-all border-white/80 ring-1 ring-white/20 backdrop-blur-2xl ring-inset w-full',
            {
              'max-w-md': size === 'sm',
              'max-w-2xl': size === 'md',
              'max-w-4xl': size === 'lg',
              'max-w-6xl': size === 'xl',
            },
            className
          )}
        >
          {/* Top Accent Gradient */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-500 opacity-80" />

          <div className="flex items-center justify-between mb-12">
            <div>
              {title && (
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none drop-shadow-sm">
                  {title}
                </h3>
              )}
              <div className="mt-4 h-1 w-20 bg-slate-900 rounded-full" />
            </div>
            <button
              onClick={onClose}
              className="rounded-2xl p-3 text-slate-400 hover:text-slate-900 bg-white/40 hover:bg-white hover:shadow-xl transition-all duration-500 border border-white/60"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-2 text-slate-600">{children}</div>
        </div>
      </div>
    </div>
  );
}
