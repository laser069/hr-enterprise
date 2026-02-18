import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification, useUnreadCount } from '../hooks/useNotifications';
import { Badge } from '../../../shared/components/ui/Badge';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import type { Notification } from '../types';

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const { data: unreadData } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      LEAVE: 'text-amber-500 bg-amber-500/10',
      PAYROLL: 'text-emerald-500 bg-emerald-500/10',
      PERFORMANCE: 'text-indigo-500 bg-indigo-500/10',
      SYSTEM: 'text-slate-400 bg-slate-400/10',
      RECRUITMENT: 'text-purple-500 bg-purple-500/10',
    };
    return colors[category] || 'text-slate-400 bg-slate-400/10';
  };

  return (
    <div className="space-y-12 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none drop-shadow-sm">Notification Matrix</h1>
          <p className="text-sm text-slate-400 font-black uppercase tracking-[0.3em] mt-6 opacity-70">
            Enterprise-wide telemetry & communication stream
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => markAllRead.mutate()}
            disabled={!(unreadData?.count && unreadData.count > 0)}
            className="rounded-2xl h-14 px-8"
          >
            Acknowledge All
          </Button>
        </div>
      </div>

      <Card noPadding className="overflow-hidden">
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="px-10 py-20 text-center text-slate-400 font-black uppercase tracking-[0.3em] animate-pulse">
              Synchronizing stream...
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="px-10 py-20 text-center text-slate-400 font-black uppercase tracking-[0.3em]">
              No enterprise telemetry detected
            </div>
          ) : (
            notifications.map((notification: Notification) => (
              <div
                key={notification.id}
                className={`px-10 py-8 flex items-start justify-between gap-8 transition-all hover:bg-slate-50 group border-l-4 ${
                  !notification.isRead ? 'border-indigo-500 bg-indigo-50/30' : 'border-transparent'
                }`}
              >
                <div className="flex gap-8">
                  <div className={`mt-1 h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-slate-100 transition-all group-hover:bg-white ${getCategoryColor(notification.category)}`}>
                    <span className="font-black text-xs">{notification.category[0]}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <h3 className={`text-lg font-black tracking-tighter leading-none ${!notification.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                        {notification.title}
                      </h3>
                      <Badge variant="default" className="text-[8px] font-black uppercase tracking-widest opacity-60">
                        {notification.category}
                      </Badge>
                    </div>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-2xl">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest pt-2">
                      Received at {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead.mutate(notification.id)}
                      className="p-3 bg-white text-indigo-500 rounded-2xl border border-slate-100 shadow-xl hover:scale-110 active:scale-95 transition-all"
                      title="Mark as Read"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification.mutate(notification.id)}
                    className="p-3 bg-white text-rose-500 rounded-2xl border border-slate-100 shadow-xl hover:scale-110 active:scale-95 transition-all"
                    title="Delete Notification"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
