import { Link } from 'react-router-dom';
import { useGoals, useReviews, usePerformanceStats } from '../hooks/usePerformance';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { StatCard, Card } from '../../../shared/components/ui/Card';
import type { GoalStatus, ReviewStatus } from '../types';

const goalStatusColors: Record<GoalStatus, 'success' | 'warning' | 'default' | 'danger'> = {
  COMPLETED: 'success',
  IN_PROGRESS: 'warning',
  PENDING: 'default',
  CANCELLED: 'danger',
};

const reviewStatusColors: Record<ReviewStatus, 'success' | 'warning' | 'default'> = {
  ACKNOWLEDGED: 'success',
  SUBMITTED: 'success',
  DRAFT: 'warning',
};

export default function PerformanceDashboard() {
  const { data: goals, isLoading: goalsLoading } = useGoals();
  const { data: reviews, isLoading: reviewsLoading } = useReviews();
  const { data: stats } = usePerformanceStats();

  // Filter and limit locally
  const activeGoals = goals?.filter(g => g.status === 'IN_PROGRESS').slice(0, 5) || [];
  const pendingReviews = reviews?.filter(r => r.status === 'DRAFT').slice(0, 5) || [];

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
           <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none drop-shadow-sm">Performance</h1>
           <p className="text-xs text-slate-400 font-black uppercase tracking-[0.3em] mt-6 opacity-70">
             Strategic alignment & merit-based appraisals
           </p>
        </div>
        
        <div className="flex gap-4">
           <Link to="/performance/goals">
             <Button variant="ghost" size="md" className="rounded-3xl">Objectives</Button>
           </Link>
           <Link to="/performance/reviews">
             <Button variant="primary" size="md" className="rounded-3xl shadow-xl shadow-indigo-500/20">Evaluation Hub</Button>
           </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <StatCard
           title="Strategic Goals"
           value={stats?.totalGoals || goals?.length || 0}
           icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <StatCard
           title="Avg. Rating"
           value={stats?.averageRating ? stats.averageRating.toFixed(1) : (reviews?.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '--')}
           icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
        />
        <StatCard
           title="Review Queue"
           value={stats?.pendingReviews || pendingReviews.length || 0}
           icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
           title="OKR Yield"
           value={`${Math.round(((stats?.completedGoals || goals?.filter(g => g.status === 'COMPLETED').length || 0) / (stats?.totalGoals || goals?.length || 1)) * 100)}%`}
           icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Card title="Operational OKRs" subtitle="Current strategic objectives" noPadding>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/60">
              <thead className="bg-slate-50/50 backdrop-blur-md">
                <tr>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Objective</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Telemetry</th>
                  <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 bg-white/40">
                {goalsLoading ? (
                  <tr><td colSpan={3} className="px-10 py-20 text-center animate-pulse text-slate-300 font-black uppercase tracking-widest text-xs">Accessing Data...</td></tr>
                ) : activeGoals.length === 0 ? (
                  <tr><td colSpan={3} className="px-10 py-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">No active objectives</td></tr>
                ) : (
                  activeGoals.map((goal) => {
                    const percentage = Math.round((goal.achievedValue / goal.targetValue) * 100);
                    return (
                      <tr key={goal.id} className="group hover:bg-white/80 transition-all duration-500">
                        <td className="px-10 py-8">
                          <div>
                            <p className="text-sm font-black text-slate-900 tracking-tighter leading-none mb-2">{goal.title}</p>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest opacity-60">
                               TARGET: {new Date(goal.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="w-48">
                            <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                               <span>{goal.achievedValue} / {goal.targetValue}</span>
                               <span className="text-slate-900">{percentage}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden p-[1px] border border-white">
                               <div 
                                  className="h-full bg-slate-900 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                                  style={{ width: `${Math.min(percentage, 100)}%` }}
                               />
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <Badge variant={goalStatusColors[goal.status]}>{goal.status}</Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="p-10 bg-slate-50/50 backdrop-blur-md border-t border-slate-100/50 flex justify-center">
             <Link to="/performance/goals" className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-[0.4em] transition-all">
                Access All Objectives
             </Link>
          </div>
        </Card>

        <Card title="Active Appraisal Cycle" subtitle="Pending performance evaluations" noPadding>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/60">
              <thead className="bg-slate-50/50 backdrop-blur-md">
                <tr>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Associate</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rating</th>
                  <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 bg-white/40">
                {reviewsLoading ? (
                  <tr><td colSpan={3} className="px-10 py-20 text-center animate-pulse text-slate-300 font-black uppercase tracking-widest text-xs">Accessing Data...</td></tr>
                ) : pendingReviews.length === 0 ? (
                  <tr><td colSpan={3} className="px-10 py-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">No pending reviews</td></tr>
                ) : (
                  pendingReviews.map((review) => (
                    <tr key={review.id} className="group hover:bg-white/80 transition-all duration-500">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black uppercase tracking-tighter shadow-lg">
                             {review.employee?.firstName?.[0]}{review.employee?.lastName?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 tracking-tighter leading-none mb-1">{review.employee?.firstName} {review.employee?.lastName}</p>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{review.period}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2">
                           <span className="text-xs font-black text-slate-900">{review.rating || '--'}</span>
                           {review.rating > 0 && <span className="text-amber-500 text-xs">★</span>}
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <Badge variant={reviewStatusColors[review.status]}>{review.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-10 bg-slate-50/50 backdrop-blur-md border-t border-slate-100/50 flex justify-center">
             <Link to="/performance/reviews" className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-[0.4em] transition-all">
                Evaluation History
             </Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
         {[
           { title: 'Competency Matrix', sub: 'Standardize skills across departments', icon: <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, color: 'primary' },
           { title: '360° Feedback', sub: 'Collect peer and team insights', icon: <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, color: 'amber-500' },
           { title: 'Succession Planning', sub: 'Identify future leadership pipeline', icon: <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, color: 'emerald-500' }
         ].map((item, idx) => (
           <div key={idx} className="glass-strong p-10 flex flex-col items-center text-center group hover:scale-[1.02] transition-all duration-500 rounded-[3rem]">
              <div className={`w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mb-10 border border-slate-100 shadow-inner group-hover:scale-110 transition-all duration-500 group-hover:bg-indigo-50 group-hover:text-indigo-500 group-hover:border-indigo-100`}>
                 {item.icon}
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-4 tracking-tight">{item.title}</h4>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-10 opacity-70">{item.sub}</p>
              <Button variant="ghost" size="sm" className="w-full rounded-2xl h-14 border-slate-100 text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-widest text-[10px] font-black">Analyze Pipeline</Button>
           </div>
         ))}
      </div>
    </div>
  );
}
