import { useState } from 'react';
import { useLeaveBalance, useLeaveSummary, useMyLeaveRequests, useLeaveTypes, useCreateLeaveRequest } from '../hooks/useLeave';
import { useAuthContext } from '../../../core/auth/use-auth-context';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { StatCard, Card } from '../../../shared/components/ui/Card';
import { DataTable, type Column } from '../../../shared/components/ui/DataTable';
import { Modal } from '../../../shared/components/ui/Modal';
import type { LeaveRequest, LeaveBalance } from '../types';

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
  cancelled: 'default',
};

interface LeaveSummary {
  totalRequests: number;
  totalDaysTaken: number;
  pendingRequests: number;
  approvedRequests: number;
}

export default function LeaveDashboard() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { user } = useAuthContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const { data: balance, isLoading: balanceLoading } = useLeaveBalance(selectedYear);
  const { data: rawSummary } = useLeaveSummary(selectedYear);
  const summary = rawSummary as LeaveSummary | undefined;
  const { data: recentRequests, isLoading: requestsLoading } = useMyLeaveRequests();
  const { data: leaveTypes } = useLeaveTypes();
  const createRequest = useCreateLeaveRequest();

  const handleInitiateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.employeeId) return;
    
    try {
      await createRequest.mutateAsync({
        ...formData,
        employeeId: user.employeeId,
      });
      setIsModalOpen(false);
      setFormData({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
    } catch (err) {
      console.error('Failed to create leave request:', err);
    }
  };

  const columns: Column<LeaveRequest>[] = [
    {
      header: 'Strategic Category',
      accessor: (request) => (
        <span className="text-sm font-black text-slate-900 tracking-tighter drop-shadow-sm">{request.leaveType?.name}</span>
      )
    },
    {
       header: 'Temporal Window',
       accessor: (request) => (
         <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
            {new Date(request.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(request.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
         </span>
       )
    },
    {
       header: 'Protocol Status',
       accessor: (request) => (
         <Badge variant={statusColors[request.status]} className="shadow-xl">{request.status}</Badge>
       )
    }
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none drop-shadow-sm">Absence Registry</h1>
          <p className="text-xs text-slate-400 font-black uppercase tracking-[0.3em] mt-6 opacity-70">
             Strategic Reserve Management & Capacity Intelligence
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative group">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="appearance-none pl-10 pr-16 py-5 border border-white/60 rounded-[2rem] text-[11px] font-black text-slate-900 bg-white/40 backdrop-blur-xl focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer uppercase tracking-[0.2em] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:bg-white hover:border-white/80 ring-1 ring-white/10"
            >
              <option value={currentYear}>{currentYear} Cycle</option>
              <option value={currentYear - 1}>{currentYear - 1} Cycle</option>
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-900 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <Button 
            variant="primary" 
            size="md" 
            onClick={() => setIsModalOpen(true)}
          >
            Initiate Protocol
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <StatCard
          title="Consolidated Events"
          value={summary?.totalRequests || 0}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          title="Utilized Bandwidth"
          value={summary?.totalDaysTaken || 0}
          trend={{ value: 5, isPositive: true }}
          icon={
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
           title="Telemetry Pending"
           value={summary?.pendingRequests || 0}
           icon={
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           }
        />
        <StatCard
           title="Protocol Yield"
           value={summary?.totalRequests ? `${Math.round((summary.approvedRequests / summary.totalRequests) * 100)}%` : '0%'}
           icon={
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Balances */}
        <div className="lg:col-span-1 space-y-12">
          <Card 
            title="Resource Reserves" 
            subtitle={`Capacity allocation for ${selectedYear}`}
          >
            <div className="space-y-12 py-8">
              {balanceLoading ? (
                 Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-[1.5rem] border border-slate-200"></div>
                    <div className="flex-1 space-y-4">
                       <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                       <div className="h-2 bg-slate-100 rounded w-3/4"></div>
                    </div>
                  </div>
                ))
              ) : !balance || balance.length === 0 ? (
                <div className="text-center py-16">
                   <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">No Reserves Allocated</p>
                </div>
              ) : (
                balance.map((item) => (
                   <BalanceRecord key={item.id} balance={item} />
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Recent Applications */}
        <div className="lg:col-span-2 space-y-12">
           <Card title="Audit Dashboard" subtitle="Sequential telemetry history" noPadding>
              <DataTable
                 columns={columns}
                 data={recentRequests || []}
                 isLoading={requestsLoading}
                 className="border-none bg-transparent"
              />
              <div className="p-10 bg-slate-50 border-t border-slate-200 flex justify-center backdrop-blur-md">
                <a href="/leave/requests" className="text-[11px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-[0.3em] transition-all hover:scale-105">
                    Access Complete Audit Stream →
                </a>
              </div>
           </Card>
        </div>
      </div>

      {/* Initiate Request Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Protocol Initiation: Absence"
        size="lg"
      >
        <form onSubmit={handleInitiateRequest} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reserve Category</label>
              <select 
                required
                value={formData.leaveTypeId}
                onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 tracking-tighter focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none transition-all"
              >
                <option value="">Select Category</option>
                {leaveTypes?.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              {/* Empty placeholder to maintain grid */}
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commencement Date</label>
              <input 
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 tracking-tighter focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Termination Date</label>
              <input 
                type="date"
                required
                value={formData.endDate}
                 onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 tracking-tighter focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Rationale (Reason)</label>
            <textarea 
              required
              rows={4}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 tracking-tighter focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none transition-all resize-none"
              placeholder="Provide strategic rationale for leave allocation..."
            />
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Abort</Button>
            <Button variant="primary" type="submit" isLoading={createRequest.isPending}>
              Push to Registry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function BalanceRecord({ balance }: { balance: LeaveBalance }) {
  const percentage = (balance.usedDays / balance.totalDays) * 100;
  
  return (
    <div className="group space-y-5">
      <div className="flex justify-between items-end">
        <div>
          <h4 className="text-lg font-black text-slate-900 tracking-tighter drop-shadow-sm group-hover:text-indigo-600 transition-colors uppercase">{balance.leaveType?.name || 'Leave'}</h4>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Inventory: {balance.remainingDays} Units Remaining</p>
        </div>
        <div className="text-right">
          <span className="text-sm font-black text-slate-900 drop-shadow-sm">{Math.round(percentage)}%</span>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 opacity-60">Burn Rate</p>
        </div>
      </div>
      <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-200/60 p-0.5 shadow-inner backdrop-blur-sm">
        <div 
          className="h-full bg-slate-900 rounded-full transition-all duration-1000 group-hover:bg-indigo-600 shadow-[0_0_20px_rgba(15,23,42,0.3)] group-hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
