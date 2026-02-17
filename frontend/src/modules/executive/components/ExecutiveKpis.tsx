import { StatCard } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
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
        icon={<LucideIcons.Users className="w-6 h-6" />}
      />
      <StatCard
        title="Capacity Rate"
        value={activeEmployees}
        trend={{ value: 4, isPositive: true, label: 'utilization' }}
        icon={<LucideIcons.Zap className="w-6 h-6" />}
      />
      <StatCard
        title="New Hirings"
        value={newJoinings}
        icon={<LucideIcons.UserPlus className="w-6 h-6" />}
        trend={{
          value: 12,
          isPositive: true,
          label: 'MoM Growth'
        }}
        progress={78}
      />
      <StatCard
        title="Attrition Risk"
        value={`${attritionRate.toFixed(1)}%`}
        trend={{
          value: 2.1,
          isPositive: false,
          label: 'Above Target'
        }}
        icon={<LucideIcons.TrendingDown className="w-6 h-6" />}
        progress={92}
        action={
          <Button variant="ghost" size="sm" className="rounded-full font-black text-[9px] uppercase tracking-widest px-8 hover:text-indigo-600 transition-all duration-500">
            View Details
          </Button>
        }
      />
    </div>
  );
}
