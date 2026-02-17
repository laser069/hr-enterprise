import { useParams, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useDepartment } from '../hooks/useDepartment';
import { Badge } from '../../../shared/components/ui/Badge';
import { Card, StatCard } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { DataTable, type Column } from '../../../shared/components/ui/DataTable';
import { Spinner } from '../../../shared/components/ui/Spinner';
import type { Employee } from '../../employees/types';

export default function DepartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: department, isLoading } = useDepartment(id || '');
  const lastSyncTime = useMemo(() => new Date().toLocaleString(), []);

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Spinner size="lg" /></div>;
  if (!department) return <div className="text-center py-20 text-slate-400 uppercase tracking-widest font-black">Department Node Not Found</div>;

  const employeeColumns: Column<Employee>[] = [
    {
      header: 'Consultant',
      accessor: (emp: Employee) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 relative group">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {emp.profilePicture ? (
              <img className="h-10 w-10 rounded-full object-cover border border-slate-200 relative z-10" src={emp.profilePicture} alt="" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200 relative z-10 text-[10px] font-black uppercase tracking-tighter">
                {emp.firstName[0]}{emp.lastName[0]}
              </div>
            )}
          </div>
          <div className="ml-5">
            <div className="text-sm font-black text-slate-900 tracking-tighter leading-none">{emp.firstName} {emp.lastName}</div>
            <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">{emp.employeeCode}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Designation',
      accessor: (emp: Employee) => <span className="text-xs font-black text-slate-600 tracking-tighter bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">{emp.designation}</span>
    },
    {
      header: 'Status',
      accessor: (emp: Employee) => (
        <Badge 
          variant={emp.employmentStatus === 'active' || emp.employmentStatus === 'ACTIVE' ? 'success' : 'default'} 
          className="font-black text-[9px] uppercase tracking-widest"
        >
          {emp.employmentStatus || (emp as unknown as { status: string }).status}
        </Badge>
      )
    },
    {
       header: 'Action',
       accessor: (emp: Employee) => (
         <Link to={`/employees/${emp.id}`} className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-widest transition-colors">
            Profile →
         </Link>
       )
    }
  ];

  const stats = [
    {
      title: 'Active Nodes',
      value: department.employees?.filter(e => e.employmentStatus === 'active' || e.employmentStatus === 'ACTIVE').length || 0,
      icon: 'UserCheck',
      trend: { value: 2.5, isPositive: true }
    },
    {
      title: 'Current Head',
      value: department.head ? `${department.head.firstName[0]}. ${department.head.lastName}` : 'N/A',
      icon: 'Command',
      trend: { value: 0, isPositive: true, label: 'Lead' }
    },
    {
      title: 'Utilization',
      value: '94.8%',
      icon: 'Activity',
      trend: { value: 1.2, isPositive: true }
    },
    {
      title: 'Budget Node',
      value: '$242k',
      icon: 'Briefcase',
      trend: { value: 0, isPositive: true, label: 'Stable' }
    }
  ];

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-4">
              <div className="h-1 w-12 bg-indigo-500 rounded-full"></div>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] animate-pulse">Department Core</span>
           </div>
           <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-3">
              {department.name}
           </h1>
           <p className="text-slate-400 text-sm max-w-xl font-medium tracking-tight uppercase tracking-widest opacity-80 font-black">
              {department.description || 'Primary structural node within the enterprise ecosystem.'}
           </p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="rounded-2xl h-14 px-8 border-slate-200 hover:border-slate-300">
              Export Metadata
           </Button>
           <Button className="rounded-2xl h-14 px-8 shadow-2xl shadow-indigo-500/20">
              Modify Structure
           </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            className="animate-in slide-in-from-bottom-4 duration-700"
            style={{ animationDelay: `${index * 100}ms` }}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Detail View */}
          <div className="lg:col-span-1 space-y-10">
            <Card title="Organization Mapping" subtitle="Entity relationships">
                <div className="space-y-8 pt-4">
                   <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="h-12 w-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white font-black shadow-xl ring-4 ring-indigo-500/10 shrink-0">
                         {department.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Branch Root</div>
                         <div className="text-sm font-black text-slate-900 tracking-tighter leading-none">Corporate Headquarters</div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Allocated Capacity</div>
                         <div className="flex items-center gap-3">
                            <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                               <div className="h-full bg-indigo-500 w-[84%] rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)] anim-width transition-all duration-1000"></div>
                            </div>
                            <span className="text-xs font-black text-slate-900">84%</span>
                         </div>
                      </div>

                      <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                         <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Last Sync</div>
                         <div className="text-xs font-black text-slate-900 tracking-tighter truncate">{lastSyncTime}</div>
                      </div>
                   </div>
                </div>
            </Card>

            <Card title="Structural Details" subtitle="Architecture identifiers">
                <div className="space-y-6 pt-4">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                         <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Created</div>
                         <div className="text-xs font-black text-slate-900 tracking-tighter">{department.createdAt ? new Date(department.createdAt).toLocaleDateString() : 'N/A'}</div>
                      </div>
                   </div>
                </div>
            </Card>
          </div>

          {/* Employee List */}
          <div className="lg:col-span-2 space-y-10">
             <Card title="Consultant Registry" subtitle="Sequential node allocation" noPadding>
                <DataTable
                   columns={employeeColumns}
                   data={(department.employees || []) as unknown as Employee[]}
                   className="border-none bg-transparent"
                />
                <div className="p-10 bg-slate-50 border-t border-slate-200 flex justify-center backdrop-blur-md">
                  <button className="text-[11px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-[0.3em] transition-all hover:scale-105">
                     Access Comprehensive Node Matrix →
                  </button>
                </div>
             </Card>
          </div>
      </div>
    </div>
  );
}
