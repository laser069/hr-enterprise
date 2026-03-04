import NotificationCenter from '../../modules/notifications/components/NotificationCenter';

export function Header() {
  return (
    <header className="h-20 bg-white/40 backdrop-blur-xl mt-6 mx-4 md:mx-10 px-10 flex items-center justify-between sticky top-6 z-30 transition-all duration-500 border border-white/60 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.02] rounded-[2.5rem]">
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
