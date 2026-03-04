import { useEmployeeHistory } from '../hooks/useEmployee';
import { Card } from '../../../shared/components/ui/Card';
import { Spinner } from '../../../shared/components/ui/Spinner';
import { Edit, Trash, UserPlus, FileText, Activity } from 'lucide-react';

interface HistoryTabProps {
    employeeId: string;
}

const actionIcons: Record<string, any> = {
    create: UserPlus,
    update: Edit,
    delete: Trash,
    upload: FileText,
};

const actionColors: Record<string, string> = {
    create: 'text-emerald-500 bg-emerald-50',
    update: 'text-blue-500 bg-blue-50',
    delete: 'text-rose-500 bg-rose-50',
    upload: 'text-amber-500 bg-amber-50',
};

export function HistoryTab({ employeeId }: HistoryTabProps) {
    const { data: history, isLoading } = useEmployeeHistory(employeeId);

    if (isLoading) return <Spinner />;

    return (
        <div className="max-w-4xl space-y-10">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">System Audit & Lifecycle Trail</h3>
            </div>

            <div className="relative space-y-12">
                {/* Timeline bar */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-100 -z-10" />

                {history?.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                        <Activity className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No ledger entries found</p>
                    </div>
                ) : (
                    history?.map((log: any) => {
                        const Icon = actionIcons[log.action.toLowerCase()] || Activity;
                        const colorClass = actionColors[log.action.toLowerCase()] || 'text-slate-500 bg-slate-50';

                        return (
                            <div key={log.id} className="relative pl-16">
                                <div className={`absolute left-0 w-12 h-12 rounded-2xl ${colorClass} flex items-center justify-center shadow-lg border-4 border-white`}>
                                    <Icon size={20} />
                                </div>

                                <Card className="hover:border-slate-900 transition-all duration-500">
                                    <div className="p-8">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    {log.action} ENTITY
                                                </span>
                                                <h4 className="font-black text-slate-900 tracking-tight text-lg mt-1">
                                                    Profile state modification recorded
                                                </h4>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    {new Date(log.createdAt).toLocaleDateString()}
                                                </p>
                                                <p className="text-[9px] font-bold text-slate-400 mt-1">
                                                    {new Date(log.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[10px] font-black uppercase">
                                                    {log.user?.email?.[0] || 'S'}
                                                </div>
                                                <span className="text-xs font-black text-slate-900">
                                                    {log.user?.email || 'System'}
                                                    <span className="text-slate-400 ml-2 font-normal">initiated this change</span>
                                                </span>
                                            </div>

                                            {log.newValues && Object.keys(log.newValues).length > 0 && (
                                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {Object.entries(log.newValues).map(([key, value]: [string, any]) => (
                                                        <div key={key} className="flex flex-col">
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">{key}</span>
                                                            <span className="text-[10px] font-bold text-slate-900 truncate">
                                                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
