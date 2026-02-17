import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card } from '../../../shared/components/ui/Card';
import type { ExecutiveSummary } from '../types';

interface ExecutiveChartsProps {
  data: ExecutiveSummary;
}

const COLORS = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];

interface ChartDataItem {
  name: string;
  value: number;
}

export function ExecutiveCharts({ data }: ExecutiveChartsProps) {
  // Handle backend response formats - actual properties are departmentBreakdown and attendanceSummary
  const departmentBreakdown = Array.isArray(data.departmentBreakdown) ? data.departmentBreakdown : [];
  const departmentData: ChartDataItem[] = departmentBreakdown.map((dept) => ({
    name: dept.department,
    value: dept.count,
  }));

  // Backend returns attendance summary
  const attendance = data.attendanceSummary;
  const attendanceData: ChartDataItem[] = [
    { name: 'Present', value: attendance?.present ?? 0 },
    { name: 'Absent', value: attendance?.absent ?? 0 },
    { name: 'Late', value: attendance?.late ?? 0 },
    { name: 'On Leave', value: attendance?.onLeave ?? 0 },
  ];

  const tooltipStyle = {
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.6)',
    boxShadow: '0 30px 60px -15px rgba(0,0,0,0.1)',
    backgroundColor: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(16px) saturate(180%)',
    padding: '16px 20px',
    fontSize: '10px',
    fontWeight: '900',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: '#0f172a',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
      {/* Department Distribution */}
      <Card title="Workforce Distribution" subtitle="Headcount breakdown by operational unit">
        <div className="h-[350px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="45%"
                labelLine={false}
                outerRadius={100}
                innerRadius={75}
                paddingAngle={8}
                dataKey="value"
                animationBegin={0}
                animationDuration={1500}
              >
                {departmentData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend 
                verticalAlign="bottom" 
                height={60}
                iconType="circle"
                iconSize={10}
                formatter={(value) => <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.1em] ml-2">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Today's Attendance */}
      <Card title="Operational Status" subtitle="Real-time personnel availability">
        <div className="h-[350px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={attendanceData}
                cx="50%"
                cy="45%"
                labelLine={false}
                outerRadius={100}
                innerRadius={75}
                paddingAngle={8}
                dataKey="value"
                animationBegin={200}
                animationDuration={1500}
              >
                <Cell fill="#0f172a" stroke="none" className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none" />
                <Cell fill="#f1f5f9" stroke="none" className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none" />
                <Cell fill="#f59e0b" stroke="none" className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none" />
                <Cell fill="#3b82f6" stroke="none" className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none" />
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend 
                verticalAlign="bottom" 
                height={60}
                iconType="circle"
                iconSize={10}
                formatter={(value) => <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.1em] ml-2">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
