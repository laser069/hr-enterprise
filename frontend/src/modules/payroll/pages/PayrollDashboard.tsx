import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePayrollRuns, usePayrollStats, useCreatePayrollRun } from '../hooks/usePayroll';
import { useAuthContext } from '../../../core/auth/use-auth-context';
import type { PayrollRun, CreatePayrollRunDto } from '../types';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { StatCard, Card } from '../../../shared/components/ui/Card';
import { DataTable, type Column } from '../../../shared/components/ui/DataTable';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const statusColors: Record<string, 'success' | 'warning' | 'default'> = {
  processed: 'success',
  approved: 'success',
  draft: 'warning',
};

export default function PayrollDashboard() {
  const { hasPermission } = useAuthContext();
  const { data: runs, isLoading: runsLoading } = usePayrollRuns();
  const { data: stats } = usePayrollStats();
  const createMutation = useCreatePayrollRun();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPayroll, setNewPayroll] = useState<CreatePayrollRunDto>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const canManage = hasPermission('payroll:manage');

  const handleCreate = async () => {
    await createMutation.mutateAsync(newPayroll);
    setShowCreateModal(false);
  };

  const columns: Column<PayrollRun>[] = [
    {
      header: 'Cyclical Period',
      accessor: (run) => (
        <span className="text-sm font-black text-slate-900 tracking-tighter drop-shadow-sm">
           {months[run.month - 1]} {run.year}
        </span>
      )
    },
    {
       header: 'Protocol Status',
       accessor: (run) => (
         <Badge variant={statusColors[run.status]} className="shadow-2xl">{run.status}</Badge>
       )
    },
    {
       header: 'Net Disbursement',
       align: 'right',
       accessor: () => (
         <span className="text-xs font-black text-slate-400 font-mono tracking-tighter bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
            COMPUTING
         </span>
       )
    }
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
           <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none drop-shadow-sm">Compensation Registry</h1>
           <p className="text-xs text-slate-400 font-black uppercase tracking-[0.3em] mt-6 opacity-70">
             Strategic disbursement oversight & financial cycle intelligence
           </p>
        </div>
        
        {canManage && (
          <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)} className="shadow-2xl shadow-indigo-500/20">
            Initialize New Run
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <StatCard
           title="Active Disbursement"
           value={`$${(stats?.monthlyPayrollAmount || 0).toLocaleString()}`}
           trend={{ value: 12, isPositive: false }}
           icon={
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           }
        />
        <StatCard
           title="Payroll Nodes"
           value={stats?.totalPayrolls || 0}
           icon={
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
             </svg>
           }
        />
        <StatCard
           title="Processed (YTD)"
           value={stats?.totalProcessed || 0}
           icon={
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           }
        />
        <StatCard
           title="Protocol Queue"
           value={stats?.totalPending || 0}
           icon={
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
           <Card title="Tactical Operations" subtitle="Standardize and manage compensation nodes">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-6">
                 <Link to="/payroll/structures" className="block">
                    <QuickAction 
                       title="Structures" 
                       desc="Basic, HRA & Vectors"
                       icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                    />
                 </Link>
                 <QuickAction 
                    title="Deductions" 
                    desc="PF, ESI & Tax Vectors"
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                 />
                  <Link to="/payroll/my-payslips" className="block text-inherit no-underline">
                     <QuickAction 
                        title="My Payslips" 
                        desc="View & download slips"
                        icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                     />
                  </Link>
              </div>
           </Card>

           <Card title="Execution History" subtitle="Successive processing telemetry" noPadding>
              <DataTable
                 columns={columns}
                 data={runs || []}
                 isLoading={runsLoading}
                 className="border-none bg-transparent"
              />
              <div className="p-10 bg-white/5 border-t border-white/10 flex justify-center backdrop-blur-md">
                 <Link to="/payroll/runs" className="text-[11px] font-black text-white/30 hover:text-white uppercase tracking-[0.3em] transition-all hover:scale-105">
                    Access Comprehensive Audit Pipeline →
                 </Link>
              </div>
           </Card>
        </div>

        <div className="lg:col-span-1 space-y-12">
           <div className="glass-strong rounded-[4rem] p-16 text-slate-900 relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] border-white/80 group ring-1 ring-white/20 backdrop-blur-xl">
              <div className="relative z-10 flex flex-col justify-between h-full min-h-[300px]">
                 <div>
                    <div className="inline-flex px-4 py-1.5 bg-slate-900 text-white border border-slate-800 mb-8 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-900/20 gloss-overlay">Protocol Season</div>
                    <h3 className="text-4xl font-black tracking-tighter mb-6 drop-shadow-sm">Autonomous Compliance</h3>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-[0.25em] opacity-80 leading-relaxed max-w-xs">Synthesize statutory reports & fiscal nodes with one click.</p>
                 </div>
                 <Button variant="primary" size="lg" className="w-full mt-12 rounded-[2rem] shadow-[0_20px_40px_-12px_rgba(15,23,42,0.3)]">
                    Generate Intelligence
                 </Button>
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] -mr-48 -mt-48 group-hover:bg-indigo-500/10 transition-all duration-1000"></div>
           </div>

           <Card title="Ledger Insights">
              <div className="space-y-10 py-6">
                 <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 group cursor-default backdrop-blur-md hover:bg-white/10 transition-all">
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] group-hover:text-white transition-colors">Growth Vector</span>
                       <span className="text-xs font-black text-white drop-shadow-md">+4.2%</span>
                    </div>
                    <p className="text-[11px] text-white/40 font-black uppercase tracking-widest leading-relaxed">Headcount and disbursement vectors expanded by 4.2% in current cycle.</p>
                 </div>
                 
                 <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 group cursor-default backdrop-blur-md hover:bg-white/10 transition-all">
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] group-hover:text-white transition-colors">Action Protocol</span>
                       <span className="text-xs font-black text-white drop-shadow-md">2 NODES</span>
                    </div>
                    <p className="text-[11px] text-white/40 font-black uppercase tracking-widest leading-relaxed">Tax declarations pending for 12 consultants in Sales Division.</p>
                 </div>
              </div>
           </Card>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-2xl flex items-center justify-center z-50 p-6 animate-in fade-in duration-500">
          <div className="glass-strong rounded-[4rem] p-16 w-full max-w-2xl shadow-2xl border-white/30 relative overflow-hidden animate-in zoom-in-95 duration-500">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
             <h3 className="text-5xl font-black text-white tracking-tighter mb-6 drop-shadow-2xl">Initialize Cycle</h3>
             <p className="text-[11px] text-white/40 font-black uppercase tracking-[0.3em] opacity-80 mb-14">Provision fiscal period for compensation compute.</p>
             
             <div className="space-y-10">
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Cycle Month</label>
                    <select
                      value={newPayroll.month}
                      onChange={(e) => setNewPayroll({ ...newPayroll, month: Number(e.target.value) })}
                      className="w-full px-8 py-5 border border-white/10 rounded-[2rem] text-[11px] font-black text-white bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/10 transition-all cursor-pointer uppercase tracking-[0.2em] shadow-xl appearance-none"
                    >
                      {months.map((month, index) => (
                        <option key={index + 1} value={index + 1} className="bg-slate-900">{month}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Process Year</label>
                    <input
                      type="number"
                      value={newPayroll.year}
                      onChange={(e) => setNewPayroll({ ...newPayroll, year: Number(e.target.value) })}
                      className="w-full px-8 py-5 border border-white/10 rounded-[2rem] text-[11px] font-black text-white bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/10 transition-all uppercase tracking-[0.2em] shadow-xl"
                    />
                  </div>
                </div>
             </div>
             
             <div className="flex gap-6 mt-16">
                <Button variant="outline" className="flex-1 rounded-[2rem] h-16 border-white/20" onClick={() => setShowCreateModal(false)}>
                  Abort
                </Button>
                <Button
                  variant="primary"
                  className="flex-2 rounded-[2rem] h-16 shadow-2xl shadow-indigo-500/20"
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Computing Operations...' : 'Initialize Protocol'}
                </Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickAction({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start p-10 rounded-[3rem] border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-500 text-left group shadow-2xl backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer w-full h-full">
       <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white/40 group-hover:text-white group-hover:bg-white/20 transition-all duration-500 mb-8 border border-white/10 shadow-xl group-hover:scale-110">
          {icon}
       </div>
       <h4 className="text-lg font-black text-white group-hover:text-white mb-3 tracking-tighter transition-colors drop-shadow-md">{title}</h4>
       <p className="text-[10px] text-white/30 group-hover:text-white/60 font-black uppercase tracking-[0.2em] leading-relaxed transition-colors opacity-80 group-hover:opacity-100">{desc}</p>
    </div>
  );
}
