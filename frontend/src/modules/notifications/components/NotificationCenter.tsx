import { useState, useRef, useEffect } from 'react';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';
import { Link } from 'react-router-dom';
import type { Notification } from '../types';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications, isLoading } = useNotifications();
  const { data: unreadData } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = unreadData?.count || 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white shadow-lg shadow-rose-500/20">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 glass-dark rounded-[2rem] shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in duration-300 ring-1 ring-white/10">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Telemetry Feed</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
            {isLoading ? (
              <div className="p-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest animate-pulse">Syncing feed...</div>
            ) : !notifications || notifications.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">No active telemetry</div>
            ) : (
              notifications.map((n: Notification) => (
                <div
                  key={n.id}
                  className={`p-6 border-b border-white/5 transition-all hover:bg-white/5 cursor-pointer group ${!n.isRead ? 'bg-indigo-500/5' : ''}`}
                  onClick={() => !n.isRead && markAsRead.mutate(n.id)}
                >
                  <div className="flex gap-4">
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!n.isRead ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-600 opacity-30'}`} />
                    <div className="space-y-1">
                      <p className={`text-[11px] font-black uppercase tracking-tight group-hover:text-white transition-colors ${!n.isRead ? 'text-white' : 'text-slate-400'}`}>
                        {n.title}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed tracking-wide">
                        {n.message}
                      </p>
                      <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest pt-2">
                        {new Date(n.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setIsOpen(false)}
            className="block p-4 bg-white/5 text-center text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all"
          >
            Access Full Matrix →
          </Link>
        </div>
      )}
    </div>
  );
}
