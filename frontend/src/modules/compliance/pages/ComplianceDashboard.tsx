import { Link } from 'react-router-dom';
import { useComplianceDashboard, useComplianceStats, useUpcomingFilings } from '../hooks/useCompliance';
import { Badge } from '../../../shared/components/ui/Badge';
import { Card, StatCard } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';

export default function ComplianceDashboard() {
  const { data: dashboard, isLoading: dashboardLoading } = useComplianceDashboard();
  const { data: stats, isLoading: statsLoading } = useComplianceStats();
  const { data: upcomingFilings } = useUpcomingFilings();

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'default'> = {
      acknowledged: 'success',
      filed: 'success',
      pending: 'warning',
    };
    return colors[status] || 'default';
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-none drop-shadow-2xl">Regulatory Ledger</h1>
          <p className="text-sm text-white/40 font-black uppercase tracking-[0.3em] mt-6 opacity-70">
            Enterprise compliance monitoring & statutory filing telemetry
          </p>
        </div>
        <Link to="/compliance/filings">
          <Button variant="outline" size="md" className="rounded-[2.5rem] h-14 px-8 border-white/10 bg-white/5 backdrop-blur-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
            Audit Archive →
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass h-40 animate-pulse rounded-[2rem]"></div>
          ))
        ) : (
          <>
            <StatCard
               title="Global Filings"
               value={stats?.totalFilings || 0}
               icon={
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
               }
            />

            <StatCard
               title="Pending Protocol"
               value={stats?.pendingFilings || 0}
               icon={
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
               }
            />

            <StatCard
               title="Certified Nodes"
               value={stats?.filedFilings || 0}
               icon={
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
               }
            />

            <StatCard
               title="Overdue Risk"
               value={stats?.overdueCount || 0}
               icon={
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                 </svg>
               }
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Upcoming Filings */}
        <Card title="Due Node Sequence" subtitle="Sequential regulatory deadline telemetry" noPadding>
          <div className="divide-y divide-white/5">
            {!upcomingFilings || upcomingFilings.length === 0 ? (
              <div className="px-10 py-24 text-center">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">No Active Deadlines Found</p>
              </div>
            ) : (
              upcomingFilings.slice(0, 5).map((filing) => (
                <div key={filing.id} className="px-10 py-8 hover:bg-white/5 transition-all group cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-6">
                      <span className="w-16 h-16 flex items-center justify-center rounded-[1.5rem] text-[10px] font-black tracking-widest bg-white/10 text-white shadow-2xl backdrop-blur-md border border-white/10 transition-transform group-hover:scale-110">
                        {filing.type}
                      </span>
                      <div>
                        <p className="text-base font-black text-white tracking-tight leading-none mb-3 drop-shadow-md">{filing.period}</p>
                        {filing.dueDate && (
                          <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isOverdue(filing.dueDate) ? 'text-rose-500' : 'text-white/30 opacity-70'}`}>
                            {isOverdue(filing.dueDate) ? 'Critical Overdue: ' : 'Deadline: '} 
                            {new Date(filing.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={getStatusColor(filing.status)} className="font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">
                      {filing.status}
                    </Badge>
                  </div>
                  {filing.amount && (
                    <div className="mt-6 flex items-center gap-3">
                       <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Allocation:</span>
                       <span className="text-sm font-black text-white font-mono tracking-tighter">${filing.amount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="p-10 bg-white/2 backdrop-blur-md border-t border-white/5 flex justify-center">
             <Link to="/compliance/filings" className="text-[10px] font-black text-white/30 hover:text-white uppercase tracking-[0.4em] transition-all">
                Access Comprehensive Audit Pipeline
             </Link>
          </div>
        </Card>

        {/* Recent Acknowledgements */}
        <Card title="Policy Lifecycle" subtitle="Real-time consultant acknowledgement telemetry" noPadding>
          <div className="divide-y divide-white/5">
            {dashboardLoading ? (
              <div className="px-10 py-24 text-center">
                 <div className="flex flex-col items-center gap-6">
                    <div className="w-12 h-12 border-[3px] border-white/5 border-t-white/40 rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Synchronizing Nodes...</p>
                 </div>
              </div>
            ) : !dashboard?.recentAcknowledgements || dashboard.recentAcknowledgements.length === 0 ? (
              <div className="px-10 py-24 text-center">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">No Recent Telemetry</p>
              </div>
            ) : (
              dashboard.recentAcknowledgements.slice(0, 5).map((ack) => (
                <div key={ack.id} className="px-10 py-8 hover:bg-white/5 transition-all group cursor-pointer">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-[1.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform backdrop-blur-xl">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-base font-black text-white tracking-tight leading-none mb-3 drop-shadow-md">{ack.policyName}</p>
                      <div className="flex items-center gap-3">
                         <span className="text-[9px] font-black text-white/20 uppercase tracking-widest opacity-70">Node:</span>
                         <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                           {ack.employee?.firstName} {ack.employee?.lastName}
                         </span>
                         <span className="w-1 h-1 bg-white/10 rounded-full mx-1"></span>
                         <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                           {new Date(ack.acknowledgedAt).toLocaleDateString()}
                         </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
