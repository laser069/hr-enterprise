import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEmployee, useSubordinates } from '../hooks/useEmployee';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Spinner } from '../../../shared/components/ui/Spinner';
import { Card } from '../../../shared/components/ui/Card';

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  ACTIVE: 'success',
  ON_LEAVE: 'warning',
  TERMINATED: 'danger',
  SUSPENDED: 'danger',
};

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'info' | 'team' | 'hierarchy'>('info');
  const { data: employee, isLoading, error } = useEmployee(id!);
  const { data: subordinates, isLoading: isLoadingTeam } = useSubordinates(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <Card className="max-w-2xl mx-auto mt-10 p-12 text-center">
        <h3 className="text-xl font-bold text-slate-900">Error Loading Profile</h3>
        <Button variant="outline" className="mt-6" onClick={() => window.history.back()}>Go Back</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col gap-6">
        <Link to="/employees" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-all font-black text-[10px] uppercase tracking-[0.2em]">
          Resource Directory
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="h-32 w-32 flex-shrink-0 relative">
              <div className="h-32 w-32 rounded-[2rem] bg-gray-900 text-white flex items-center justify-center shadow-2xl relative z-10 border-4 border-white">
                <span className="text-4xl font-black tracking-tighter">
                  {employee.firstName[0]}{employee.lastName[0]}
                </span>
              </div>
              <div className="absolute -bottom-3 -right-3 z-20">
                 <Badge variant={statusColors[employee.status]} className="h-10 px-4 border-4 border-white shadow-xl text-[10px] font-black uppercase tracking-widest rounded-2xl">
                   {employee.status}
                 </Badge>
              </div>
            </div>
            
            <div className="pt-2">
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">
                {employee.firstName} <span className="text-gray-400">{employee.lastName}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-6">
                <span className="px-3 py-1 bg-gray-900 text-white font-mono text-[9px] font-black rounded-lg uppercase tracking-widest">
                  ID: {employee.employeeCode}
                </span>
                <span className="text-sm text-gray-500 font-black uppercase tracking-wider opacity-80">{employee.designation}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-100">
        <TabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')}>Information</TabButton>
        <TabButton active={activeTab === 'team'} onClick={() => setActiveTab('team')}>Direct Reports</TabButton>
        <TabButton active={activeTab === 'hierarchy'} onClick={() => setActiveTab('hierarchy')}>Hierarchy</TabButton>
      </div>

      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <Card title="Structural Intelligence">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 py-4">
                <DetailItem label="Digital Identity" value={employee.email} />
                <DetailItem label="Operational Unit" value={employee.department?.name} />
                <DetailItem label="Reporting Line" value={employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : 'No Manager'} />
                <DetailItem label="Tenure Initiation" value={new Date(employee.dateOfJoining).toLocaleDateString()} />
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingTeam ? <Spinner /> : subordinates?.length === 0 ? (
            <p className="col-span-full text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-xs">No direct reports found</p>
          ) : subordinates?.map(sub => (
            <Card key={sub.id} className="p-6">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                    {sub.firstName[0]}{sub.lastName[0]}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 tracking-tight">{sub.firstName} {sub.lastName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{sub.designation}</p>
                  </div>
               </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'hierarchy' && (
        <Card className="p-12 text-center bg-slate-50 border-dashed border-2">
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Strategic Hierarchy View Processing...</p>
          <p className="text-[9px] text-slate-400 mt-2">Visual organization map is being computed from central governance node.</p>
        </Card>
      )}
    </div>
  );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`pb-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all relative ${
        active ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      {children}
      {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900 rounded-full" />}
    </button>
  );
}

function DetailItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{label}</p>
      <p className="text-sm font-black text-gray-900 tracking-tight">{value || '-'}</p>
    </div>
  );
}
