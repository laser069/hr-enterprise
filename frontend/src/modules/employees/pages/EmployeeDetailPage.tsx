import { useParams, Link } from 'react-router-dom';
import { useEmployee } from '../hooks/useEmployee';
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
  const { data: employee, isLoading, error } = useEmployee(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <Card className="max-w-2xl mx-auto mt-10 p-12 text-center animate-shake">
         <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900">Error Loading Profile</h3>
        <p className="text-slate-500 mt-2">We couldn't retrieve the details for this employee. They might have been deleted or moved.</p>
        <Link to="/employees" className="inline-block mt-6">
          <Button variant="outline">Back to Directory</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      {/* Header & Back Link */}
      <div className="flex flex-col gap-6">
        <Link to="/employees" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-all font-black text-[10px] uppercase tracking-[0.2em]">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
          Resource Directory
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="h-32 w-32 flex-shrink-0 relative">
              <div className="absolute inset-0 bg-gray-900/5 rounded-[2rem] blur-2xl"></div>
              {employee.profilePicture ? (
                <img
                  className="h-32 w-32 rounded-[2rem] object-cover border-4 border-white shadow-2xl relative z-10"
                  src={employee.profilePicture}
                  alt=""
                />
              ) : (
                <div className="h-32 w-32 rounded-[2rem] bg-gray-900 text-white flex items-center justify-center shadow-2xl relative z-10 border-4 border-white">
                  <span className="text-4xl font-black tracking-tighter">
                    {employee.firstName[0]}
                    {employee.lastName[0]}
                  </span>
                </div>
              )}
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
                <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                <span className="text-sm text-gray-500 font-black uppercase tracking-wider opacity-80">{employee.designation || 'Principal Associate'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to={`/employees/${employee.id}/edit`}>
              <Button variant="outline" size="md" className="border-gray-100 bg-white/50 backdrop-blur-md">
                Edit Protocol
              </Button>
            </Link>
            <Button variant="primary" size="md">Provision Access</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Essential Info */}
        <div className="lg:col-span-2 space-y-10">
          {/* General Information */}
          <Card title="Structural Intelligence" subtitle="Core organizational & contact identification">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 py-4">
              <DetailItem label="Digital Identity" value={employee.email} isLink href={`mailto:${employee.email}`} />
              <DetailItem label="Secure Line" value={employee.phone} />
              <DetailItem label="Operational Unit" value={employee.department?.name} />
              <DetailItem label="Reporting Line" value={employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : 'Direct Ownership'} />
              <DetailItem label="Contractual Model" value={employee.employmentType.replace('_', ' ')} />
              <DetailItem label="Tenure Initiation" value={new Date(employee.dateOfJoining).toLocaleDateString(undefined, { dateStyle: 'long' })} />
            </div>
          </Card>

          {/* Contact & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <Card title="Geographic Base" subtitle="Primary residency data">
              {employee.address ? (
                <div className="space-y-2 py-2">
                  <p className="text-base font-black text-gray-900 tracking-tight">{employee.address}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 font-medium italic py-4">Resource location not verified</p>
              )}
            </Card>

            <Card title="Escalation Contact" subtitle="Emergency response identification">
              {employee.emergencyContact ? (
                <div className="space-y-4 py-2">
                  <p className="text-sm font-black text-gray-900 tracking-tight">{employee.emergencyContact}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 font-medium italic py-4">No escalation protocol defined</p>
              )}
            </Card>
          </div>

          {/* Financial Details */}
          <Card title="Financial Protocol" subtitle="Banking & disbursement configuration">
            {employee.bankDetails ? (
              <div className="py-4">
                <p className="text-sm font-black text-gray-900 tracking-tight uppercase">{employee.bankDetails}</p>
              </div>
            ) : (
              <div className="bg-gray-50/50 border border-gray-100 rounded-[2rem] p-8 flex items-center gap-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-tight">Banking verification pending executive review.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Mini Stats/Actions */}
        <div className="space-y-10">
          <Card title="Performance Index" noPadding>
            <div className="divide-y divide-gray-100">
               <div className="p-6 flex justify-between items-center group cursor-default">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-900 transition-colors">Availability Rank</span>
                 <span className="text-xs font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">#12 / TOP 10%</span>
               </div>
               <div className="p-6 flex justify-between items-center group cursor-default">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-900 transition-colors">Leave Capacity</span>
                 <span className="text-xs font-black text-gray-900">14 RESERVE</span>
               </div>
               <div className="p-6 flex justify-between items-center group cursor-default">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-900 transition-colors">KPI Status</span>
                 <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">EXCEPTIONAL</span>
               </div>
            </div>
            <div className="p-6 bg-gray-50/30">
               <button className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-black hover:shadow-xl hover:shadow-gray-200 shadow-lg shadow-gray-200/50">
                 Compute Full Analytics
               </button>
            </div>
          </Card>

          <Card title="Tenure History" subtitle="Milestone sequence visualization">
             <div className="relative space-y-8 py-4 before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px before:h-full before:w-[1px] before:bg-gray-100">
                <TimelineItem date="Initial Entry" label="Strategic Talent Acquisition" />
                <TimelineItem date="Evolution" label="Vertical Progression" isLatest />
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, isLink, href }: { label: string; value?: string | number; isLink?: boolean; href?: string }) {
  return (
    <div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 opacity-70">{label}</p>
      {isLink ? (
        <a href={href} className="text-sm font-black text-gray-900 border-b-2 border-transparent hover:border-gray-900 transition-all pb-0.5">{value || '-'}</a>
      ) : (
        <p className="text-sm font-black text-gray-900 tracking-tight">{value || '-'}</p>
      )}
    </div>
  );
}

function TimelineItem({ date, label, isLatest }: { date: string; label: string; isLatest?: boolean }) {
  return (
    <div className="relative pl-8">
      <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-white -translate-x-1/2 z-10 transition-all ${isLatest ? 'bg-gray-900 shadow-lg shadow-gray-200 scale-125' : 'bg-gray-200'}`}></div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 opacity-70">{date}</p>
      <p className="text-xs font-black text-gray-900 tracking-tight">{label}</p>
    </div>
  );
}
