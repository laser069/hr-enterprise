import { Link } from 'react-router-dom';
import { useJobs, useCandidates, useRecruitmentStats, useRecruitmentSummary } from '../hooks/useRecruitment';
import { Badge } from '../../../shared/components/ui/Badge';
import { StatCard, Card } from '../../../shared/components/ui/Card';

const stageColors: Record<string, string> = {
  applied: 'bg-slate-100 text-slate-500 border-slate-200',
  screening: 'bg-amber-50 text-amber-700 border-amber-200',
  interview: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  offer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  hired: 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

export default function RecruitmentDashboard() {
  const { data: jobs, isLoading: jobsLoading } = useJobs({ status: 'open' });
  const { data: candidates, isLoading: candidatesLoading } = useCandidates();
  const { data: stats } = useRecruitmentStats();
  const { data: summary } = useRecruitmentSummary();

  const getJobStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'default' | 'danger'> = {
      open: 'success',
      draft: 'warning',
      closed: 'default',
      archived: 'danger',
    };
    return colors[status] || 'default';
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none drop-shadow-sm">Talent Pipeline</h1>
          <p className="text-sm text-slate-400 font-black uppercase tracking-[0.3em] mt-6 opacity-70">
            Strategic workforce acquisition & recruitment telemetry
          </p>
        </div>
        <div className="flex gap-6">
          <Link to="/recruitment/jobs">
            <Badge variant="info" className="cursor-pointer shadow-2xl h-10 px-6">
              Archive Protocol
            </Badge>
          </Link>
          <Link to="/recruitment/candidates">
            <Badge variant="success" className="cursor-pointer shadow-2xl h-10 px-6">
               Candidate Registry
            </Badge>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <StatCard
          title="Active Directives"
          value={stats?.openJobs || 0}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          title="Total Headcount Registry"
          value={stats?.totalCandidates || 0}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          title="Cycle Throughput (Monthly)"
          value={stats?.newCandidatesThisMonth || 0}
          trend={{ value: 14, isPositive: true }}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <StatCard
          title="Conversion Protocol"
          value={stats?.hiredThisMonth || 0}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Pipeline Overview */}
      {summary?.candidatesByStage && (
        <Card title="Hiring Pipeline" subtitle="Sequential funnel telemetry">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 py-4">
            {Object.entries(summary.candidatesByStage).map(([stage, count]) => (
              <div key={stage} className="group text-center">
                <div className={`glass h-24 flex items-center justify-center rounded-[2rem] mb-6 border border-slate-200 group-hover:bg-slate-50 transition-all duration-500 shadow-xl group-hover:scale-105 active:scale-95`}>
                   <p className="text-4xl font-black text-slate-900 drop-shadow-sm">{count}</p>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] group-hover:text-slate-600 transition-colors capitalize">{stage}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Open Jobs */}
        <Card title="Open Directives" subtitle="Active requisition telemetry" noPadding>
          <div className="divide-y divide-slate-100">
            {jobsLoading ? (
              <div className="px-10 py-20 text-center text-slate-400 font-black uppercase tracking-[0.3em] animate-pulse">Synchronizing...</div>
            ) : !jobs || jobs.length === 0 ? (
              <div className="px-10 py-20 text-center text-slate-400 font-black uppercase tracking-[0.3em]">No active directives detected</div>
            ) : (
              jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="px-10 py-8 hover:bg-slate-50 transition-all cursor-default group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-black text-slate-900 tracking-tighter drop-shadow-sm group-hover:scale-[1.01] transition-transform">{job.title}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">
                        {job.department?.name || 'Central Unit'} • {job.location || 'Remote Vector'}
                      </p>
                    </div>
                    <Badge variant={getJobStatusColor(job.status)} className="shadow-lg">
                      {job.status}
                    </Badge>
                  </div>
                  <div className="mt-6 flex items-center gap-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div> {job.candidateCount || 0} NODES</span>
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div> {job.openings} SLOTS</span>
                    {job.postedAt && (
                      <span className="opacity-40">TIMESTAMP {new Date(job.postedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-10 bg-slate-50 border-t border-slate-200 flex justify-center backdrop-blur-md">
             <Link to="/recruitment/jobs" className="text-[11px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-[0.3em] transition-all hover:scale-105">
                Access Requisition Protocol →
             </Link>
          </div>
        </Card>

        {/* Recent Candidates */}
        <Card title="Candidate Stream" subtitle="Sequential applicant telemetry" noPadding>
          <div className="divide-y divide-slate-100">
            {candidatesLoading ? (
              <div className="px-10 py-20 text-center text-slate-400 font-black uppercase tracking-[0.3em] animate-pulse">Synchronizing...</div>
            ) : !candidates?.data || candidates.data.length === 0 ? (
              <div className="px-10 py-20 text-center text-slate-400 font-black uppercase tracking-[0.3em]">No candidate telemetry detected</div>
            ) : (
              candidates.data.slice(0, 5).map((candidate) => (
                <div key={candidate.id} className="px-10 py-8 hover:bg-slate-50 transition-all cursor-default group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shadow-md group-hover:bg-white transition-all">
                        <span className="text-slate-900 font-black text-lg drop-shadow-sm">
                          {candidate.firstName[0]}{candidate.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-900 tracking-tighter drop-shadow-sm">
                          {candidate.firstName} {candidate.lastName}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">
                          {candidate.job?.title} • {candidate.source || 'Direct Link'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default" className={`shadow-lg ${stageColors[candidate.stage]}`}>
                      {candidate.stage}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-10 bg-slate-50 border-t border-slate-200 flex justify-center backdrop-blur-md">
             <Link to="/recruitment/candidates" className="text-[11px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-[0.3em] transition-all hover:scale-105">
                Access Personnel Pipeline →
             </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
