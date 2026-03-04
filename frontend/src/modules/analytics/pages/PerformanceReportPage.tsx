import { useState } from 'react';
import { usePerformanceMetrics, useDepartmentMetrics } from '../hooks/useAnalytics';
import { Card, StatCard } from '../../../shared/components/ui/Card';
import { Spinner } from '../../../shared/components/ui/Spinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function PerformanceReportPage() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [departmentId, setDepartmentId] = useState('');

    const { data: departments } = useDepartmentMetrics();
    const { data: metrics, isLoading } = usePerformanceMetrics(year, departmentId);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

    const chartData = [
        { name: 'Avg Rating', value: parseFloat(metrics?.averageRating || '0') * 20 }, // Normalize to 100 for chart
        { name: 'Goal Completion', value: parseFloat(metrics?.goalCompletionRate || '0') },
    ];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">Performance Matrix</h1>
                    <p className="text-xs text-white/40 font-black uppercase tracking-widest mt-2">Organizational growth telemetry</p>
                </div>
            </div>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Fiscal Year</label>
                        <select
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        >
                            {[2023, 2024, 2025, 2026].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Department</label>
                        <select
                            value={departmentId}
                            onChange={(e) => setDepartmentId(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        >
                            <option value="">All Departments</option>
                            {departments?.map((d: any) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {isLoading ? (
                <div className="p-20 flex justify-center"><Spinner /></div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <StatCard
                            title="Average Rating"
                            value={`${metrics?.averageRating || '0.0'}/5.0`}
                            icon={<div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">⭐</div>}
                        />
                        <StatCard
                            title="Goal Success Rate"
                            value={`${metrics?.goalCompletionRate || '0.0'}%`}
                            icon={<div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">🎯</div>}
                        />
                        <StatCard
                            title="Total Reviews"
                            value={metrics?.totalReviews || 0}
                            icon={<div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">📋</div>}
                        />
                    </div>

                    <Card title="Engagement Visualization" subtitle="Comparative metric assessment">
                        <div className="h-[400px] w-full mt-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="rgba(255,255,255,0.3)"
                                        fontSize={10}
                                        tickFormatter={(v) => v.toUpperCase()}
                                    />
                                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            fontSize: '10px',
                                            color: 'white'
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                                        {chartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}
