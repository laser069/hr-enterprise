import { StatCard } from '../../../shared/components/ui/Card';
import type { ExecutiveSummary } from '../types';
import * as LucideIcons from 'lucide-react';

interface ExecutiveKpisProps {
  data: ExecutiveSummary;
}

export function ExecutiveKpis({ data }: ExecutiveKpisProps) {
  const totalEmployees = data.totalEmployees ?? 0;
  const activeEmployees = data.activeEmployees ?? 0;
  const newJoinings = data.newJoinings ?? 0;
  const attritionCount = data.attritionCount ?? 0;

  // Calculate rate if not provided in the data (assuming 0.0% if no employees)
  const attritionRate = totalEmployees > 0 ? (attritionCount / totalEmployees) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      <StatCard
        title="Total Talent"
        value={totalEmployees}
        icon={<div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500"><LucideIcons.Users className="w-8 h-8" /></div>}
      />
      <StatCard
        title="Capacity Rate"
        value={activeEmployees}
        icon={<div className="p-4 bg-indigo-500/10 text-indigo-600 rounded-2xl group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500"><LucideIcons.Zap className="w-8 h-8" /></div>}
      />
      <StatCard
        title="New Hirers"
        value={newJoinings}
        icon={<div className="p-4 bg-amber-500/10 text-amber-600 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-all duration-500"><LucideIcons.UserPlus className="w-8 h-8" /></div>}
      />
      <StatCard
        title="Attrition Risk"
        value={`${attritionRate.toFixed(1)}%`}
        icon={<div className="p-4 bg-rose-500/10 text-rose-600 rounded-2xl group-hover:bg-rose-500 group-hover:text-white transition-all duration-500"><LucideIcons.TrendingDown className="w-8 h-8" /></div>}
      />
    </div>
  );
}
