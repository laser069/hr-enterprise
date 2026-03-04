import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '../../shared/utils/cn';

export function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen relative bg-slate-100 flex font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
      <Sidebar
        collapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div
        className={cn(
          "flex-1 flex flex-col h-screen overflow-hidden transition-all duration-500",
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