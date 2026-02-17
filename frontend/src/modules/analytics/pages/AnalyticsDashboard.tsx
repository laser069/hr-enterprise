import { Link } from 'react-router-dom';
import { Card, StatCard } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { useDepartmentMetrics, useTodayAttendance } from '../hooks/useAnalytics';
import { Spinner } from '../../../shared/components/ui/Spinner';

export default function AnalyticsDashboard() {
  const { data: departmentData, isLoading: isDeptLoading, error: deptError } = useDepartmentMetrics();
  const { data: attendanceData, isLoading: isAttendanceLoading, error: attError } = useTodayAttendance();

  if (isDeptLoading || isAttendanceLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (deptError || attError) {
    return (
      <div className="p-12 text-center bg-red-50/10 rounded-[3rem] border border-red-500/20 backdrop-blur-xl">
        <h3 className="text-xl font-black text-white tracking-tighter">Incomplete Intelligence Data</h3>
        <p className="text-sm text-white/40 font-black uppercase tracking-widest mt-4">
          Unable to synchronize with the analytics engine. Please verify connectivity.
        </p>
      </div>
    );
  }

  const deptList = Array.isArray(departmentData) ? departmentData : [];
  const totalEmployees = deptList.reduce((sum, d) => sum + (d.totalEmployees || d.employeeCount || 0), 0);
  const attendanceRate = typeof attendanceData?.attendanceRate === 'string' 
    ? parseFloat(attendanceData.attendanceRate) 
    : (attendanceData?.attendanceRate || 0);

  return (
    <div className="space-y-12 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-none drop-shadow-2xl">Analytics</h1>
          <p className="text-sm text-white/40 font-black uppercase tracking-[0.3em] mt-6 opacity-70">
            Comprehensive data insights & workforce intelligence
          </p>
        </div>
      </div>

      {/* High Level Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <StatCard
           title="Total Workforce"
           value={totalEmployees}
           icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />
        <StatCard
           title="Today's Attendance"
           value={`${attendanceRate}%`}
           trend={{ value: 2, isPositive: true, label: 'vs yesterday' }}
           icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
           title="Departments"
           value={deptList.length}
           icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        />
        <StatCard
           title="Open Positions"
           value={deptList.reduce((sum, d) => sum + (d.openPositions || 0), 0)}
           trend={{ value: 12, isPositive: false, label: 'Capacity' }}
           icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
        />
      </div>

      {/* Analytics Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Card title="Attrition & Retention" subtitle="Workforce turnover analysis">
          <div className="space-y-10 py-6">
            <p className="text-sm text-white/40 font-black leading-relaxed uppercase tracking-widest">
              Track voluntary and involuntary exits, analyze retention rates by year, and view monthly headcount trends to optimize your talent strategy.
            </p>
            <Link to="/analytics/attrition">
              <Button variant="outline" size="md" className="w-full rounded-[2.5rem] h-16 border-white/20">View Attrition Report</Button>
            </Link>
          </div>
        </Card>

        <Card title="Department Matrix" subtitle="Organizational performance data">
          <div className="space-y-10 py-6">
            <p className="text-sm text-white/40 font-black leading-relaxed uppercase tracking-widest">
              Compare performance, attendance, and payroll costs across your entire organizational structure to identify high-performing units.
            </p>
            <Link to="/analytics/departments">
              <Button variant="outline" size="md" className="w-full rounded-[2.5rem] h-16 border-white/20">View Matrix Comparison</Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Insights Section */}
      <Card title="Analytics Insights" subtitle="Automated intelligence engine">
        <div className="flex flex-col items-center justify-center py-24 text-center group">
          <div className="w-24 h-24 bg-white/5 rounded-[3rem] flex items-center justify-center text-white/20 mb-10 border border-white/10 shadow-2xl group-hover:scale-110 transition-all duration-500 backdrop-blur-xl">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-3xl font-black text-white tracking-tighter drop-shadow-2xl">AI Insights Coming Soon</h3>
          <p className="text-[11px] text-white/40 font-black uppercase tracking-[0.3em] max-w-md mx-auto mt-6 opacity-70">
            Predictive modeling and trend detection
          </p>
        </div>
      </Card>
    </div>
  );
}
