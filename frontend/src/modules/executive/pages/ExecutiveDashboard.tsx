import { useExecutiveSummary } from '../hooks/useExecutive';
import { ExecutiveKpis } from '../components/ExecutiveKpis';
import { ExecutiveCharts } from '../components/ExecutiveCharts';
import { Spinner } from '../../../shared/components/ui/Spinner';
import { Card } from '../../../shared/components/ui/Card';

function ExecutiveDashboard() {
  const { data, isLoading, error } = useExecutiveSummary();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 animate-shake">
        <h3 className="font-bold flex items-center gap-2 mb-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Error Loading Dashboard
        </h3>
        <p className="text-sm opacity-90">Please check your connection and try again later.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="text-center py-12">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Data Found</h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">
          We couldn't find any executive metrics for your organization at this time.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none drop-shadow-sm">Executive Dashboard</h1>
        </div>
      </div>

      <ExecutiveKpis data={data} />

      <ExecutiveCharts data={data} />
    </div>
  );
}

export default ExecutiveDashboard;
