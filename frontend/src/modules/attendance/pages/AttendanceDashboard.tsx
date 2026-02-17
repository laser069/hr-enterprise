import { useState, useEffect } from 'react';
import { useTodayAttendanceStats, useAttendance, useCheckIn, useCheckOut } from '../hooks/useAttendance';
import { useAuthContext } from '../../../core/auth/use-auth-context';
import { Badge } from '../../../shared/components/ui/Badge';
import { StatCard, Card } from '../../../shared/components/ui/Card';
import { DataTable, type Column } from '../../../shared/components/ui/DataTable';
import type { Attendance } from '../types';

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  PRESENT: 'success',
  ABSENT: 'danger',
  LATE: 'warning',
  HALF_DAY: 'warning',
  ON_LEAVE: 'default',
};

export default function AttendanceDashboard() {
  const today = new Date().toISOString().split('T')[0];
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user } = useAuthContext();
  
  const { data: todayStats } = useTodayAttendanceStats();
  const { data: recentAttendance, isLoading: attendanceLoading } = useAttendance({
    limit: 5,
    startDate: today,
    endDate: today,
  });

  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const handlePunchIn = async () => {
    if (!user?.employeeId) {
      alert('No employee record found for your user account.');
      return;
    }
    try {
      await checkInMutation.mutateAsync({ employeeId: user.employeeId });
    } catch (err) {
      console.error('Punch In failed:', err);
    }
  };

  const handlePunchOut = async () => {
    if (!user?.employeeId) {
      alert('No employee record found for your user account.');
      return;
    }
    try {
      await checkOutMutation.mutateAsync({ employeeId: user.employeeId });
    } catch (err) {
      console.error('Punch Out failed:', err);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const columns: Column<Attendance>[] = [
    {
      header: 'Consultant',
      accessor: (record) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 relative group">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {record.employee?.profilePicture ? (
              <img
                className="h-10 w-10 rounded-full object-cover border border-slate-200 relative z-10"
                src={record.employee.profilePicture}
                alt=""
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center border border-white/20 relative z-10 shadow-2xl">
                <span className="font-black text-[10px] tracking-tighter">
                   {record.employee?.firstName?.[0]}
                   {record.employee?.lastName?.[0]}
                </span>
              </div>
            )}
          </div>
          <div className="ml-5">
            <div className="text-sm font-black text-slate-900 tracking-tighter leading-none drop-shadow-sm">
              {record.employee?.firstName} {record.employee?.lastName}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-black uppercase tracking-widest leading-none mt-2">{record.employee?.employeeCode}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Checkpoint',
      accessor: (record) => (
        <span className="text-xs font-black text-slate-600 font-mono tracking-tighter bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
           {record.checkIn
            ? new Date(record.checkIn).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Protocol Pending'}
        </span>
      )
    },
    {
       header: 'Protocol Status',
       accessor: (record) => (
         <Badge variant={statusColors[record.status]} className="font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1.5 shadow-xl backdrop-blur-md">
           {record.status}
         </Badge>
       )
    }
  ];

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none drop-shadow-sm">Presence Registry</h1>
          <p className="text-xs text-slate-400 font-black uppercase tracking-[0.3em] mt-6 opacity-70 flex items-center gap-3">
            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.5)]"></span>
            Real-time workforce intelligence telemetry
          </p>
        </div>
        
        <div className="glass-strong px-12 py-8 text-right flex flex-col items-end shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border-white/80 ring-1 ring-white/10 rounded-[2.5rem]">
          <div className="text-5xl font-black text-slate-900 font-mono tracking-tighter leading-none drop-shadow-sm">{formatTime(currentTime)}</div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.34em] mt-4 opacity-70">{formatDate(currentTime)}</div>
        </div>
      </div>

      {/* Quick Actions & High-level Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-10">
          <Card title="Operational Terminal" subtitle="Manual override & protocol logic">
            <div className="grid grid-cols-2 gap-8">
               <button 
                  onClick={handlePunchIn}
                  disabled={checkInMutation.isPending || !user?.employeeId}
                  className="group flex flex-col items-center justify-center p-12 bg-white/40 border border-white/60 rounded-[3rem] hover:bg-white hover:border-white/80 transition-all duration-700 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] hover:-translate-y-2 active:scale-95 text-slate-400 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ring-1 ring-white/10 backdrop-blur-md gloss-overlay"
               >
                  <div className="w-20 h-20 bg-white/60 rounded-[1.5rem] shadow-sm flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-700 border border-white group-hover:scale-110 group-hover:rotate-3">
                    {checkInMutation.isPending ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
                    ) : (
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    )}
                  </div>
                  <span className="mt-8 text-[11px] font-black group-hover:text-slate-900 uppercase tracking-[0.4em] transition-colors leading-none">
                    {checkInMutation.isPending ? 'PROCESSING' : 'PUNCH IN'}
                  </span>
               </button>
               <button 
                  onClick={handlePunchOut}
                  disabled={checkOutMutation.isPending || !user?.employeeId}
                  className="group flex flex-col items-center justify-center p-12 bg-white/40 border border-white/60 rounded-[3rem] hover:bg-white hover:border-white/80 transition-all duration-700 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] hover:-translate-y-2 active:scale-95 text-slate-400 hover:text-rose-600 disabled:opacity-50 disabled:cursor-not-allowed ring-1 ring-white/10 backdrop-blur-md gloss-overlay"
               >
                  <div className="w-20 h-20 bg-white/60 rounded-[1.5rem] shadow-sm flex items-center justify-center text-slate-400 group-hover:bg-rose-500 group-hover:text-white transition-all duration-700 border border-white group-hover:scale-110 group-hover:-rotate-3">
                     {checkOutMutation.isPending ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
                     ) : (
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                     )}
                  </div>
                  <span className="mt-8 text-[11px] font-black group-hover:text-rose-600 uppercase tracking-[0.4em] transition-colors leading-none">
                    {checkOutMutation.isPending ? 'PROCESSING' : 'PUNCH OUT'}
                  </span>
               </button>
            </div>
          </Card>
          
          <Card title="Vital Metrics" subtitle="Real-time organizational health">
             <div className="space-y-10 py-6">
                <HealthBar label="Operational Capacity" percentage={(todayStats?.totalPresent || 0) / ((todayStats?.totalPresent || 0) + (todayStats?.totalAbsent || 0) + (todayStats?.totalOnLeave || 0) || 1) * 100} color="emerald" />
                <HealthBar label="Punctuality Score" percentage={((todayStats?.totalPresent || 0) - (todayStats?.totalLate || 0)) / (todayStats?.totalPresent || 1) * 100} color="amber" />
                <HealthBar label="Abstinence Risk" percentage={(todayStats?.totalAbsent || 0) / ((todayStats?.totalPresent || 0) + (todayStats?.totalAbsent || 0) + (todayStats?.totalOnLeave || 0) || 1) * 100} color="red" />
             </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <StatCard
              title="Active Headcount"
              value={todayStats?.totalPresent || 0}
              trend={{ value: 12, isPositive: true }}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
            <StatCard
              title="Workforce Efficiency"
              value={`${Math.round(((todayStats?.totalPresent || 0) - (todayStats?.totalLate || 0)) / (todayStats?.totalPresent || 1) * 100)}%`}
              trend={{ value: 3, isPositive: false }}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          <Card title="Tactical Stream" subtitle="Sequential check-in telemetry" noPadding>
            <DataTable
              columns={columns}
              data={recentAttendance?.data || []}
              isLoading={attendanceLoading}
              className="border-none bg-transparent"
            />
            <div className="p-10 bg-slate-50 border-t border-slate-200 flex justify-center backdrop-blur-md">
               <a href="/attendance/list" className="text-[11px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-[0.3em] transition-all hover:scale-105">
                  Access Comprehensive Protocol Logs →
               </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function HealthBar({ label, percentage, color }: { label: string; percentage: number; color: 'emerald' | 'amber' | 'red' }) {
  const colors = {
    emerald: 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]',
    amber: 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    red: 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]',
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em]">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-900 drop-shadow-sm">{Math.round(percentage)}%</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
        <div className={`h-full ${colors[color]} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
