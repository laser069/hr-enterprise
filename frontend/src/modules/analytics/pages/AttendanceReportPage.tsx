import { useState } from 'react';
import { useAttendanceReport } from '../hooks/useAnalytics';
import { useDepartmentMetrics } from '../hooks/useAnalytics';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { DataTable, type Column } from '../../../shared/components/ui/DataTable';
import { Spinner } from '../../../shared/components/ui/Spinner';
import { Badge } from '../../../shared/components/ui/Badge';

export default function AttendanceReportPage() {
    const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [departmentId, setDepartmentId] = useState('');

    const { data: departments } = useDepartmentMetrics();
    const { data: reportData, isLoading } = useAttendanceReport(startDate, endDate, departmentId);

    const columns: Column<any>[] = [
        { header: 'Date', accessor: 'date' },
        { header: 'Employee', accessor: 'employeeName' },
        { header: 'Code', accessor: 'employeeCode' },
        { header: 'Department', accessor: 'department' },
        {
            header: 'Status',
            accessor: (r) => (
                <Badge variant={r.status === 'present' ? 'success' : r.status === 'absent' ? 'danger' : 'warning'}>
                    {r.status}
                </Badge>
            )
        },
        {
            header: 'Check In',
            accessor: (r) => r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '-'
        },
        {
            header: 'Check Out',
            accessor: (r) => r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '-'
        },
        { header: 'Late (Min)', accessor: 'lateMinutes' },
    ];

    const handleExport = () => {
        if (!reportData) return;
        const headers = ['Date', 'Employee', 'Code', 'Department', 'Status', 'Check In', 'Check Out', 'Late Minutes'];
        const csvContent = [
            headers.join(','),
            ...reportData.map(r => [
                r.date,
                r.employeeName,
                r.employeeCode,
                r.department,
                r.status,
                r.checkIn || '',
                r.checkOut || '',
                r.lateMinutes
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_report_${startDate}_to_${endDate}.csv`;
        a.click();
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">Attendance Registry</h1>
                    <p className="text-xs text-white/40 font-black uppercase tracking-widest mt-2">Historical presence telemetry</p>
                </div>
                <Button onClick={handleExport} disabled={!reportData?.length} variant="outline" className="rounded-2xl">
                    Export CSV
                </Button>
            </div>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
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
