import { useEmployeeAttendance, useEmployeeSummary } from '../../attendance/hooks/useAttendance';
import { Card } from '../../../shared/components/ui/Card';
import { Spinner } from '../../../shared/components/ui/Spinner';
import { format } from 'date-fns';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface AttendanceTabProps {
    employeeId: string;
}

export function AttendanceTab({ employeeId }: AttendanceTabProps) {
    const { data: attendance, isLoading: attendanceLoading } = useEmployeeAttendance(employeeId);
    const { data: summary, isLoading: summaryLoading } = useEmployeeSummary(employeeId);

    if (attendanceLoading || summaryLoading) return <Spinner />;

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'present': return <CheckCircle className="text-emerald-500" size={16} />;
            case 'absent': return <XCircle className="text-rose-500" size={16} />;
            case 'late': return <AlertCircle className="text-amber-500" size={16} />;
            default: return <Clock className="text-slate-400" size={16} />;
        }
    };

    return (
        <div className="space-y-10">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard label="Present" value={summary?.totalPresent || 0} color="emerald" />
                <MetricCard label="Absent" value={summary?.totalAbsent || 0} color="rose" />
                <MetricCard label="Late" value={summary?.totalLate || 0} color="amber" />
                <MetricCard label="On Leave" value={summary?.totalOnLeave || 0} color="indigo" />
            </div>

            {/* Attendance List */}
            <Card title="Operational Registry" subtitle="Sequential logs of personnel presence" noPadding>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-50 bg-slate-50/30">
                                <th className="px-8 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Date Vector</th>
                                <th className="px-8 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                <th className="px-8 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Check In</th>
                                <th className="px-8 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Check Out</th>
                                <th className="px-8 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Work Shift</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {attendance?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">
                                        No presence telemetry recorded
                                    </td>
                                </tr>
                            ) : (
                                attendance?.map((record) => (
                                    <tr key={record.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-black text-slate-900 tracking-tight">
                                                {format(new Date(record.date), 'MMMM d, yyyy')}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(record.status)}
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                                                    {record.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-black text-slate-900">
                                                {record.checkIn ? format(new Date(record.checkIn), 'hh:mm a') : '--:--'}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-black text-slate-900">
                                                {record.checkOut ? format(new Date(record.checkOut), 'hh:mm a') : '--:--'}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                Standard Protocol
                                            </p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
    const colors: Record<string, string> = {
        emerald: 'bg-emerald-500/10 text-emerald-600',
        rose: 'bg-rose-500/10 text-rose-600',
        amber: 'bg-amber-500/10 text-amber-600',
        indigo: 'bg-indigo-500/10 text-indigo-600',
    };

    return (
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col items-center justify-center">
            <span className={`text-3xl font-black mb-1 ${colors[color].split(' ')[1]}`}>{value}</span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</span>
        </div>
    );
}
