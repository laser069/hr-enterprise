import NotificationCenter from '../../modules/notifications/components/NotificationCenter';

export function Header() {
  return (
    <header className="h-16 bg-white mt-4 mx-4 md:mx-6 px-6 flex items-center justify-between sticky top-4 z-30 border border-slate-200 shadow-sm rounded-2xl">
      <div className="flex items-center gap-4">
        <h1 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] hidden md:block opacity-60">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </h1>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        {/* Notifications */}
        <NotificationCenter />
      </div>
    </header>
  );
}
