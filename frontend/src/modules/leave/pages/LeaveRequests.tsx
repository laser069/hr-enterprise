import { useState } from 'react';
import { useLeaveRequests, useApproveLeaveRequest, useRejectLeaveRequest, useCancelLeaveRequest } from '../hooks/useLeave';
import { useAuthContext } from '../../../core/auth/use-auth-context';
import type { LeaveRequest, LeaveListParams, LeaveStatus } from '../types';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { DataTable, type Column } from '../../../shared/components/ui/DataTable';

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  APPROVED: 'success',
  PENDING: 'warning',
  REJECTED: 'danger',
  CANCELLED: 'default',
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
  cancelled: 'default',
};

export default function LeaveRequests() {
  const { hasPermission } = useAuthContext();
  const [params, setParams] = useState<LeaveListParams>({
    page: 1,
    limit: 10,
  });
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data, isLoading } = useLeaveRequests(params);
  const approveMutation = useApproveLeaveRequest();
  const rejectMutation = useRejectLeaveRequest();
  const cancelMutation = useCancelLeaveRequest();

  const handleParamsChange = (newParams: Partial<LeaveListParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  const handleApprove = async (id: string, employeeName: string) => {
    if (window.confirm(`Are you sure you want to approve leave for ${employeeName}?`)) {
      await approveMutation.mutateAsync({ id });
    }
  };

  const handleReject = async () => {
    if (selectedRequestId && rejectionReason) {
      await rejectMutation.mutateAsync({
        id: selectedRequestId,
        comments: rejectionReason,
      });
      setRejectModalOpen(false);
      setRejectionReason('');
      setSelectedRequestId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this leave request?')) {
      await cancelMutation.mutateAsync(id);
    }
  };

  const openRejectModal = (id: string) => {
    setSelectedRequestId(id);
    setRejectModalOpen(true);
  };

  const canApprove = hasPermission('leave:approve');

  const columns: Column<LeaveRequest>[] = [
    {
      header: 'Employee',
      accessor: (request) => (
        <div className="flex items-center">
          <div className="h-8 w-8 flex-shrink-0">
            {request.employee?.profilePicture ? (
              <img
                className="h-8 w-8 rounded-full object-cover border border-slate-200"
                src={request.employee.profilePicture}
                alt=""
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="text-primary font-bold text-[10px]">
                  {request.employee?.firstName?.[0]}
                  {request.employee?.lastName?.[0]}
                </span>
              </div>
            )}
          </div>
          <div className="ml-3">
            <div className="text-sm font-bold text-slate-900 leading-none">
              {request.employee?.firstName} {request.employee?.lastName}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-medium">{request.employee?.employeeCode}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Type & Period',
      accessor: (request) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700">{request.leaveType?.name}</span>
          <span className="text-[10px] text-slate-400 font-medium">
            {new Date(request.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(request.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      ),
    },
    {
      header: 'Duration',
      accessor: (request) => (
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-black text-slate-900">{request.days}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Days</span>
        </div>
      ),
    },
    {
       header: 'Reason',
       accessor: (request) => (
         <span className="text-xs text-slate-500 font-medium truncate max-w-[150px] inline-block" title={request.reason}>
           {request.reason || <span className="italic opacity-50">No reason provided</span>}
         </span>
       )
    },
    {
      header: 'Status',
      accessor: (request) => (
        <Badge variant={statusColors[request.status]}>
          {request.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (request) => (
        <div className="flex items-center justify-end gap-2">
          {request.status === 'PENDING' && canApprove && (
            <>
              <button
                onClick={() => handleApprove(request.id, `${request.employee?.firstName} ${request.employee?.lastName}`)}
                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                title="Approve"
                disabled={approveMutation.isPending}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={() => openRejectModal(request.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Reject"
                disabled={rejectMutation.isPending}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
          {request.status === 'PENDING' && (
             <button
              onClick={() => handleCancel(request.id)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              title="Cancel Request"
              disabled={cancelMutation.isPending}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Leave Requests</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Review and manage employee leave applications
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            Leave Calendar
          </button>
          <Button variant="primary" className="shadow-lg shadow-primary/20 flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            Apply for Leave
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={params.status || ''}
            onChange={(e) => handleParamsChange({ status: (e.target.value as LeaveStatus) || undefined, page: 1 })}
            className="flex-1 md:w-48 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <button 
            onClick={() => setParams({ page: 1, limit: 10 })}
            className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl border border-slate-100 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data || []}
        isLoading={isLoading}
      />

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Reject Request</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">Please provide a reason for rejecting this leave application.</p>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ex: Insufficient coverage for the project during these dates..."
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all mb-6"
              rows={4}
            />
            
            <div className="flex gap-3">
               <Button
                variant="outline"
                className="flex-1 rounded-xl py-3"
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectionReason('');
                  setSelectedRequestId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1 rounded-xl py-3 shadow-lg shadow-red-200"
                onClick={handleReject}
                disabled={!rejectionReason || rejectMutation.isPending}
              >
                Reject Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
