import { useState } from 'react';
import { useAuditLogs } from '../hooks/useAudit';
import { Card } from '../../../shared/components/ui/Card';
import { Spinner } from '../../../shared/components/ui/Spinner';
import { DataTable, type Column } from '../../../shared/components/ui/DataTable';
import { Badge } from '../../../shared/components/ui/Badge';
import { format } from 'date-fns';

export default function AuditLogPage() {
    const [filters, setFilters] = useState({
        entity: '',
        action: '',
        startDate: '',
        endDate: '',
    });

    const { data: logsData, isLoading } = useAuditLogs({
        ...filters,
        take: 50,
    });

    const columns: Column<any>[] = [
        {
            header: 'Timestamp',
            accessor: (log) => (
                <span className="font-mono text-[10px] text-white/60">
                    {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                </span>
            )
        },
        {
            header: 'User',
            accessor: (log) => log.user?.email || 'System'
        },
        {
            header: 'Protocol',
            accessor: (log) => (
                <Badge variant="info" className="font-mono text-[9px]">
                    {log.action}
                </Badge>
            )
        },
        {
            header: 'Entity Class',
            accessor: (log) => (
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    {log.entity}
                </span>
            )
        },
        {
            header: 'Entity ID',
            accessor: (log) => (
                <span className="font-mono text-[9px] text-white/30 truncate max-w-[100px]">
                    {log.entityId || '-'}
                </span>
            )
        },
        {
            header: 'IP Address',
            accessor: (log) => (
                <span className="font-mono text-[10px] text-white/40">
                    {log.ipAddress || 'Internal'}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">System Audit Log</h1>
                    <p className="text-xs text-white/40 font-black uppercase tracking-widest mt-2">Historical data mutation telemetry</p>
                </div>
            </div>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Entity</label>
                        <input
                            type="text"
                            placeholder="e.g. Employee"
                            value={filters.entity}
                            onChange={(e) => setFilters(prev => ({ ...prev, entity: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Protocol</label>
                        <input
                            type="text"
                            placeholder="e.g. Update"
                            value={filters.action}
                            onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Start Date</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">End Date</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                </div>
            </Card>

            <Card noPadding>
                {isLoading ? (
                    <div className="p-20 flex justify-center"><Spinner /></div>
                ) : (
                    <DataTable columns={columns} data={logsData?.data || []} />
                )}
            </Card>
        </div>
    );
}
