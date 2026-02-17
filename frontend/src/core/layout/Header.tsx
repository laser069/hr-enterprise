import * as LucideIcons from 'lucide-react';

export function Header() {
  return (
    <header className="h-20 bg-white/40 backdrop-blur-xl mt-6 mx-4 md:mx-10 px-10 flex items-center justify-between sticky top-6 z-30 transition-all duration-500 border border-white/60 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.02] rounded-[2.5rem]">
      <div className="flex items-center gap-4">
        <h1 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] hidden md:block opacity-60">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </h1>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        {/* Approvals */}
        <button className="p-3 rounded-2xl text-slate-400 hover:bg-white hover:text-indigo-600 transition-all relative group border border-transparent hover:border-white hover:shadow-xl active:scale-95" title="Pending Approvals">
          <LucideIcons.ClipboardCheck className="w-5 h-5" />
          <span className="absolute top-3 right-3 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white shadow-sm animate-pulse"></span>
        </button>

        {/* Notifications */}
        <button className="p-3 rounded-2xl text-slate-400 hover:bg-white hover:text-indigo-600 transition-all relative group border border-transparent hover:border-white hover:shadow-xl active:scale-95" title="Notifications">
          <LucideIcons.Bell className="w-5 h-5" />
          <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white shadow-sm"></span>
        </button>
      </div>
    </header>
  );
}
