import { Link, useNavigate } from 'react-router-dom';
import { useDepartments, useDeleteDepartment } from '../hooks/useDepartment';
import type { Department } from '../types';
import { Button } from '../../../shared/components/ui/Button';
import { DataTable, type Column } from '../../../shared/components/ui/DataTable';

export default function DepartmentListPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useDepartments();
  const deleteMutation = useDeleteDepartment();

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the "${name}" department? This action cannot be undone.`)) {
      await deleteMutation.mutateAsync(id);
    }
  };


  const columns: Column<Department>[] = [
    {
      header: 'Department',
      accessor: (dept) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900">{dept.name}</span>
          {dept.description && (
            <span className="text-xs text-slate-500 font-medium truncate max-w-xs">{dept.description}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Head of Department',
      accessor: (dept) => (
        <div className="flex items-center gap-3">
          {dept.head ? (
            <>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="text-primary font-bold text-xs uppercase">
                  {dept.head.firstName[0]}{dept.head.lastName[0]}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700 leading-none">{dept.head.firstName} {dept.head.lastName}</span>
                <span className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tight">{dept.head.email}</span>
              </div>
            </>
          ) : (
             <div className="flex items-center gap-2 text-slate-400">
               <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                 </svg>
               </div>
               <span className="text-xs font-bold uppercase tracking-widest italic opacity-60">Unassigned</span>
             </div>
          )}
        </div>
      ),
    },
    {
      header: 'Workforce',
      accessor: (dept) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-slate-900">{dept.employeeCount || 0}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Employees</span>
        </div>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (dept) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => navigate(`/departments/${dept.id}`)}
            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
            title="View Details"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => navigate(`/departments/${dept.id}/edit`)}
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(dept.id, dept.name)}
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Departments</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Structure and organize your organizational functional units
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            Org Chart
          </button>
          <Link to="/departments/new">
            <Button variant="primary" className="shadow-lg shadow-primary/20 flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
              Add Department
            </Button>
          </Link>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        onRowClick={(dept) => navigate(`/departments/${dept.id}`)}
      />
    </div>
  );
}
