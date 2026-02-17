import { useExecutiveSummary } from '../hooks/useExecutive';
import { ExecutiveKpis } from '../components/ExecutiveKpis';
import { ExecutiveCharts } from '../components/ExecutiveCharts';
import { Spinner } from '../../../shared/components/ui/Spinner';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { GlassEffect } from '../../../shared/components/ui/LiquidGlass';
import { Link } from 'react-router-dom';

function ExecutiveDashboard() {
  const { data, isLoading, error } = useExecutiveSummary();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 animate-shake">
        <h3 className="font-bold flex items-center gap-2 mb-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Error Loading Dashboard
        </h3>
        <p className="text-sm opacity-90">Please check your connection and try again later.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="text-center py-12">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Data Found</h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">
          We couldn't find any executive metrics for your organization at this time.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none drop-shadow-sm">Executive Registry</h1>
          <p className="text-xs text-slate-400 font-black uppercase tracking-[0.3em] mt-6 opacity-70">
            Real-time organizational performance & strategic telemetry
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" size="md">
            Export Report
          </Button>
          <Button variant="primary" size="md">
            Sync Telemetry
          </Button>
        </div>
      </div>

      <ExecutiveKpis data={data} />
      
      <ExecutiveCharts data={data} />

      {/* Quick Actions */}
      {/* Management Engine - Refined for White-Theme Liquid Glass */}
      <Card noPadding className="overflow-hidden border-none shadow-none bg-transparent">
        <div className="px-10 py-8 border-b border-white/40 bg-white/20 backdrop-blur-md">
          <h3 className="text-xl font-black text-slate-900 tracking-tighter drop-shadow-sm">Management Engine</h3>
          <p className="text-[10px] text-slate-500 mt-2 font-black uppercase tracking-[0.2em]">Administrative controls & frequent tasks</p>
        </div>
        
        <div className="p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/employees"
            className="group relative"
          >
            <GlassEffect className="p-6 rounded-[2.5rem] flex items-center gap-6 bg-white/30 border-white/40 hover:bg-white/50 transition-all duration-700">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-sm border border-emerald-500/20 group-hover:scale-110">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <span className="block text-base font-black text-slate-900 tracking-tight">Staffing</span>
                <span className="block text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1 opacity-70">Node Management</span>
              </div>
            </GlassEffect>
          </Link>
          
          <Link
            to="/approvals"
            className="group relative"
          >
            <GlassEffect className="p-6 rounded-[2.5rem] flex items-center gap-6 bg-white/30 border-white/40 hover:bg-white/50 transition-all duration-700">
              <div className="w-14 h-14 bg-indigo-500/20 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500 shadow-sm border border-indigo-500/20 group-hover:scale-110">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <span className="block text-base font-black text-slate-900 tracking-tight">Approvals</span>
                <span className="block text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1 opacity-70">Decision Matrix</span>
              </div>
            </GlassEffect>
          </Link>
          
          <Link
            to="/payroll"
            className="group relative"
          >
            <GlassEffect className="p-6 rounded-[2.5rem] flex items-center gap-6 bg-white/30 border-white/40 hover:bg-white/50 transition-all duration-700">
              <div className="w-14 h-14 bg-amber-500/20 text-amber-600 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all duration-500 shadow-sm border border-amber-500/20 group-hover:scale-110">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span className="block text-base font-black text-slate-900 tracking-tight">Payroll</span>
                <span className="block text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1 opacity-70">Fiscal Cycle</span>
              </div>
            </GlassEffect>
          </Link>
          
          <Link
            to="/analytics"
            className="group relative"
          >
            <GlassEffect className="p-6 rounded-[2.5rem] flex items-center gap-6 bg-white/30 border-white/40 hover:bg-white/50 transition-all duration-700">
              <div className="w-14 h-14 bg-rose-500/20 text-rose-600 rounded-2xl flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all duration-500 shadow-sm border border-rose-500/20 group-hover:scale-110">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <span className="block text-base font-black text-slate-900 tracking-tight">Analytics</span>
                <span className="block text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1 opacity-70">Deep Telemetry</span>
              </div>
            </GlassEffect>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default ExecutiveDashboard;
