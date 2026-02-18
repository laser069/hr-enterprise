import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePayrollRuns, useCreatePayrollRun, useDeletePayrollRun } from '../hooks/usePayroll';
import { useAuthContext } from '../../../core/auth/use-auth-context';
import type { PayrollRun, CreatePayrollRunDto } from '../types';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
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

export default function PayrollRuns() {
  const { hasPermission } = useAuthContext();
  const { data: runs, isLoading } = usePayrollRuns();
  const createMutation = useCreatePayrollRun();
  const deleteMutation = useDeletePayrollRun();

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

  const handleDelete = async (id: string, period: string) => {
    if (window.confirm(`Are you sure you want to delete the payroll run for ${period}?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const columns: Column<PayrollRun>[] = [
    {
      header: 'Payroll Period',
      accessor: (run) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-black text-slate-900 leading-none">
              {months[run.month - 1]} {run.year}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">Processing Period</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (run) => (
        <Badge variant={statusColors[run.status]}>
          {run.status}
        </Badge>
      ),
    },
    {
       header: 'Run Summary',
       accessor: (run) => (
         <div className="flex items-center gap-4">
            <div className="flex flex-col">
               <span className="text-xs font-black text-slate-700">{run.entries?.length || 0}</span>
               <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Employees</span>
            </div>
            <div className="w-px h-6 bg-slate-100"></div>
            <div className="flex flex-col">
               <span className="text-xs font-black text-emerald-600">Calculated</span>
               <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Net Pay</span>
            </div>
         </div>
       )
    },
    {
      header: 'Approval',
      accessor: (run) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-700">
             {run.approvedByUser
              ? `${run.approvedByUser.firstName} ${run.approvedByUser.lastName}`
              : <span className="italic opacity-50 font-normal">Pending Approval</span>}
          </span>
          {run.approvedAt && (
            <span className="text-[10px] text-slate-400 font-medium">
              {new Date(run.approvedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Processed',
      accessor: (run) => (
        <span className="text-xs font-bold text-slate-600">
           {run.processedAt
            ? new Date(run.processedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
            : '-'}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (run) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`/payroll/runs/${run.id}`}
            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
            title="View Details"
          >
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </Link>
          {canManage && run.status.toLowerCase() === 'draft' && (
            <button
              onClick={() => handleDelete(run.id, `${months[run.month - 1]} ${run.year}`)}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Delete Run"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Payroll Runs</h1>
          <p className="text-sm text-slate-500 font-medium mt-3">
            Manage and process your organization's monthly payroll cycles
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            Salary Structures
          </button>
          {canManage && (
            <Button variant="primary" onClick={() => setShowCreateModal(true)} className="shadow-lg shadow-primary/20 flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
              Initialize Run
            </Button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={runs || []}
        isLoading={isLoading}
      />

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
             <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Initialize Payroll</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">Select the period for which you want to calculate and process payroll.</p>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Process Month</label>
                  <select
                    value={newPayroll.month}
                    onChange={(e) => setNewPayroll({ ...newPayroll, month: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    {months.map((month, index) => (
                      <option key={index + 1} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fiscal Year</label>
                  <input
                    type="number"
                    value={newPayroll.year}
                    onChange={(e) => setNewPayroll({ ...newPayroll, year: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
               <Button
                variant="outline"
                className="flex-1 rounded-xl py-3"
                onClick={() => setShowCreateModal(false)}
              >
                Dismiss
              </Button>
              <Button
                variant="primary"
                className="flex-1 rounded-xl py-3 shadow-lg shadow-primary/20"
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Processing...' : 'Start Run'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
