import { useState } from 'react';
import { usePayrollReport } from '../hooks/useAnalytics';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { DataTable, type Column } from '../../../shared/components/ui/DataTable';
import { Spinner } from '../../../shared/components/ui/Spinner';
import { Badge } from '../../../shared/components/ui/Badge';

export default function PayrollReportPage() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState<number | undefined>(undefined);

    const { data: reportData, isLoading } = usePayrollReport(year, month);

    const columns: Column<any>[] = [
        { header: 'Period', accessor: 'period' },
        { header: 'Employee', accessor: 'employeeName' },
        { header: 'Code', accessor: 'employeeCode' },
        { header: 'Department', accessor: 'department' },
        {
            header: 'Gross Salary',
            accessor: (r) => (
                <span className="font-mono text-emerald-400">₹{r.grossSalary.toLocaleString()}</span>
            )
        },
        {
            header: 'Deductions',
            accessor: (r) => (
                <span className="font-mono text-rose-400">₹{r.deductions.toLocaleString()}</span>
            )
        },
        {
            header: 'Net Salary',
            accessor: (r) => (
                <span className="font-mono font-bold text-white">₹{r.netSalary.toLocaleString()}</span>
            )
        },
        {
            header: 'Status',
            accessor: (r) => (
                <Badge variant={r.status === 'processed' ? 'success' : 'warning'}>
                    {r.status}
                </Badge>
            )
        }
    ];

    const handleExport = () => {
        if (!reportData) return;
        const headers = ['Period', 'Employee', 'Code', 'Department', 'Gross Salary', 'Deductions', 'Net Salary', 'Status'];
        const csvContent = [
            headers.join(','),
            ...reportData.map(r => [
                r.period,
                r.employeeName,
                r.employeeCode,
                r.department,
                r.grossSalary,
                r.deductions,
                r.netSalary,
                r.status
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payroll_report_${year}_${month || 'all'}.csv`;
        a.click();
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">Finance Audit</h1>
                    <p className="text-xs text-white/40 font-black uppercase tracking-widest mt-2">Payroll & compensation analysis</p>
                </div>
                <Button onClick={handleExport} disabled={!reportData?.length} variant="outline" className="rounded-2xl">
                    Export CSV
                </Button>
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
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Month</label>
                        <select
                            value={month || ''}
                            onChange={(e) => setMonth(e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        >
                            <option value="">All Months</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            <Card noPadding>
                {isLoading ? (
                    <div className="p-20 flex justify-center"><Spinner /></div>
                ) : (
                    <DataTable columns={columns} data={reportData || []} />
                )}
            </Card>
        </div>
    );
}
