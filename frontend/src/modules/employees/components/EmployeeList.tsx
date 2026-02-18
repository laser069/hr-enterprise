import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Employee, EmployeeListParams, EmployeeStatus } from '../types';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { DataTable, type Column } from '../../../shared/components/ui/DataTable';

interface EmployeeListProps {
  employees: Employee[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  params: EmployeeListParams;
  onParamsChange: (params: Partial<EmployeeListParams>) => void;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  ACTIVE: 'success',
  ON_LEAVE: 'warning',
  TERMINATED: 'danger',
  SUSPENDED: 'danger',
};

export function EmployeeList({
  employees,
  isLoading,
  onDelete,
  params,
  onParamsChange,
  meta,
}: EmployeeListProps) {
  const [searchQuery, setSearchQuery] = useState(params.search || '');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onParamsChange({ search: searchQuery, page: 1 });
  };

  const columns: Column<Employee>[] = useMemo(() => [
    {
      header: 'Consultant',
      accessor: (employee) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 relative group">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {employee.profilePicture ? (
              <img
                className="h-10 w-10 rounded-full object-cover border border-white/20 relative z-10"
                src={employee.profilePicture}
                alt={`${employee.firstName} ${employee.lastName}`}
                loading="lazy"
                width={40}
                height={40}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center border border-white/20 relative z-10">
                <span className="font-black text-[10px] tracking-tighter">
                  {employee.firstName[0]}
                  {employee.lastName[0]}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-black text-white tracking-tight leading-none">
              {employee.firstName} {employee.lastName}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1.5 font-bold uppercase tracking-wider opacity-70">{employee.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'System ID',
      accessor: (employee) => (
        <span className="font-mono text-[10px] font-black text-zinc-500 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
          {employee.employeeCode}
        </span>
      ),
    },
    {
      header: 'Operational Unit',
      accessor: (employee) => (
        <span className="text-xs font-bold text-zinc-300 tracking-tight">
          {employee.department?.name || '-'}
        </span>
      ),
    },
    {
      header: 'Designation',
      accessor: (employee) => (
        <span className="text-xs font-medium text-zinc-400 tracking-tight">
          {employee.designation || '-'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (employee) => (
        <Badge variant={employee.status ? statusColors[employee.status] : 'default'} className="font-black text-[9px] uppercase tracking-widest px-2.5 py-1">
          {employee.status?.replace('_', ' ') || 'UNKNOWN'}
        </Badge>
      ),
    },
    {
      header: 'Tenure Start',
      accessor: (employee) => (
        <span className="text-xs text-zinc-500 font-bold tracking-tight">
          {new Date(employee.dateOfJoining).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      ),
    },
    {
      header: 'Operations',
      align: 'right',
      accessor: (employee) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/employees/${employee.id}`); }}
            className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Profile"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/employees/${employee.id}/edit`); }}
            className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Update"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(employee.id); }}
            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
            title="Terminate"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ], [navigate, onDelete]);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="glass p-6 flex flex-col md:flex-row gap-6 justify-between items-center">
        <form onSubmit={handleSearch} className="relative w-full md:w-[450px]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search resources by name, email or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs placeholder-zinc-500 text-white focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/20 transition-all font-bold tracking-tight"
          />
        </form>

        <div className="flex w-full md:w-auto items-center gap-4">
          <select
            value={params.status || ''}
            onChange={(e) => onParamsChange({ status: e.target.value as EmployeeStatus | undefined, page: 1 })}
            className="flex-1 md:flex-none px-6 py-3 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all cursor-pointer appearance-none min-w-[160px]"
          >
            <option value="">Status: All</option>
            <option value="ACTIVE text-emerald-600">Active Only</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="TERMINATED">Terminated</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <Link to="/employees/new" className="flex-1 md:flex-none">
            <Button variant="primary" size="md" className="w-full flex items-center gap-3">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
              Onboard Talent
            </Button>
          </Link>
        </div>
      </div>

      {/* Modern Table */}
      <DataTable
        columns={columns}
        data={employees}
        isLoading={isLoading}
        onRowClick={(employee) => navigate(`/employees/${employee.id}`)}
        pagination={
          meta
            ? {
                currentPage: meta.page,
                totalPages: meta.totalPages,
                totalItems: meta.total,
                itemsPerPage: meta.limit,
                onPageChange: (page) => onParamsChange({ page }),
              }
            : undefined
        }
      />
    </div>
  );
}
