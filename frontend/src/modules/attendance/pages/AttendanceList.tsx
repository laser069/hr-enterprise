import { useState } from 'react';
import { useAttendance, useDeleteAttendance } from '../hooks/useAttendance';
import type { Attendance, AttendanceListParams, AttendanceStatus } from '../types';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { DataTable, type Column } from '../../../shared/components/ui/DataTable';

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  PRESENT: 'success',
  ABSENT: 'danger',
  LATE: 'warning',
  HALF_DAY: 'warning',
  ON_LEAVE: 'default',
};

export default function AttendanceList() {
  const [params, setParams] = useState<AttendanceListParams>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useAttendance(params);
  const deleteMutation = useDeleteAttendance();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleParamsChange = (newParams: Partial<AttendanceListParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  const columns: Column<Attendance>[] = [
    {
      header: 'Date',
      accessor: (record) => (
        <span className="font-bold text-slate-700">
          {new Date(record.date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'Employee',
      accessor: (record) => (
        <div className="flex items-center">
          <div className="h-8 w-8 flex-shrink-0">
            {record.employee?.profilePicture ? (
              <img
                className="h-8 w-8 rounded-full object-cover border border-slate-200"
                src={record.employee.profilePicture}
                alt=""
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="text-primary font-bold text-[10px]">
                  {record.employee?.firstName?.[0]}
                  {record.employee?.lastName?.[0]}
                </span>
              </div>
            )}
          </div>
          <div className="ml-3">
            <div className="text-sm font-bold text-slate-900 leading-none">
              {record.employee?.firstName} {record.employee?.lastName}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-medium">{record.employee?.employeeCode}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Check In',
      accessor: (record) => (
        <span className="text-sm font-medium text-slate-600">
          {record.checkIn
            ? new Date(record.checkIn).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '-'}
        </span>
      ),
    },
    {
      header: 'Check Out',
      accessor: (record) => (
        <span className="text-sm font-medium text-slate-600">
          {record.checkOut
            ? new Date(record.checkOut).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '-'}
        </span>
      ),
    },
    {
      header: 'Work Hours',
      accessor: (record) => (
        record.workHours ? (
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-slate-900">{record.workHours}h</span>
            {record.overtimeHours ? (
               <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 rounded">+{record.overtimeHours} OT</span>
            ) : null}
          </div>
        ) : '-'
      ),
    },
    {
      header: 'Status',
      accessor: (record) => (
        <Badge variant={statusColors[record.status]}>
          {record.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (record) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => alert('Edit functionality coming soon')}
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(record.id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Attendance Records</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Monitor and manage organization-wide workforce presence
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            Export Logs
          </button>
          <Button variant="primary" className="shadow-lg shadow-primary/20 flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            Add Record
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="date"
            value={params.startDate || ''}
            onChange={(e) => handleParamsChange({ startDate: e.target.value, page: 1 })}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">to</span>
          <input
            type="date"
            value={params.endDate || ''}
            onChange={(e) => handleParamsChange({ endDate: e.target.value, page: 1 })}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto ml-auto">
          <select
            value={params.status || ''}
            onChange={(e) => handleParamsChange({ status: (e.target.value as AttendanceStatus) || undefined, page: 1 })}
            className="flex-1 md:w-48 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LATE">Late</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="ON_LEAVE">On Leave</option>
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
        data={data?.data || []}
        isLoading={isLoading}
        pagination={
          data?.meta
            ? {
                currentPage: data.meta.page,
                totalPages: data.meta.totalPages,
                totalItems: data.meta.total,
                itemsPerPage: data.meta.limit,
                onPageChange: (page) => handleParamsChange({ page }),
              }
            : undefined
        }
      />
    </div>
  );
}
