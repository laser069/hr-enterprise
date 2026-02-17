import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '../../shared/utils/cn';

import { GlassFilter } from '../../shared/components/ui/LiquidGlass';

export function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen relative bg-[#F8FAFC] overflow-hidden flex font-sans selection:bg-emerald-500/20 selection:text-emerald-900">
      <GlassFilter />
      {/* Ambient Depth & Glass-Bait Blobs - Refined for Mirror Refraction */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-15%] right-[-5%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute top-[15%] right-[5%] w-[35%] h-[35%] bg-sky-400/15 rounded-full blur-[140px] animate-float"></div>
        <div className="absolute bottom-[20%] left-[10%] w-64 h-64 bg-violet-400/10 rounded-full blur-[80px] animate-float [animation-delay:3s]"></div>
      </div>
      
      <Sidebar 
        collapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      <div 
        className={cn(
          "flex-1 flex flex-col h-screen overflow-hidden transition-all duration-500 relative z-10",
          isSidebarCollapsed ? "ml-[104px]" : "ml-[312px]"
        )}
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-10">
          <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-700">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}