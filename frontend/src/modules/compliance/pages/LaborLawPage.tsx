import { useLaborLawReport } from '../hooks/useCompliance';
import { Card } from '../../../shared/components/ui/Card';
import { Spinner } from '../../../shared/components/ui/Spinner';
import { Badge } from '../../../shared/components/ui/Badge';
import { DataTable, type Column } from '../../../shared/components/ui/DataTable';

export interface LaborViolation {
    id: string; // Added for DataTable compatibility
    employee: {
        id: string;
        firstName: string;
        lastName: string;
        designation: string | null;
    };
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
}

export default function LaborLawPage() {
    const { data: report, isLoading } = useLaborLawReport();

    const columns: Column<LaborViolation>[] = [
        {
            header: 'Employee',
            accessor: (violation) => (
                <div className="flex flex-col">
                    <span className="font-bold text-white uppercase text-xs">{violation.employee.firstName} {violation.employee.lastName}</span>
                    <span className="text-[9px] text-white/40 uppercase tracking-widest">{violation.employee.designation || 'N/A'}</span>
                </div>
            )
        },
        {
            header: 'Anomaly Class',
            accessor: (violation) => (
                <Badge variant={violation.type === 'OVERTIME_VIOLATION' ? 'danger' : 'warning'}>
                    {violation.type.split('_').join(' ')}
                </Badge>
            )
        },
        {
            header: 'Severity',
            accessor: (violation) => (
                <span className={`text-[10px] font-black uppercase tracking-widest ${violation.severity === 'high' ? 'text-rose-500' : 'text-amber-500'
                    }`}>
                    {violation.severity}
                </span>
            )
        },
        {
            header: 'Telemetry Data',
            accessor: 'message'
        }
    ];

    return (
        <div className="space-y-12 pb-10">
            <div>
                <h1 className="text-5xl font-black text-white tracking-tighter leading-none">Labor Protocol Registry</h1>
                <p className="text-sm text-white/40 font-black uppercase tracking-[0.3em] mt-6 opacity-70">
                    Labor law monitoring & operational rest compliance
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <Card title="Law Monitoring Status" subtitle="Real-time compliance validation">
                    <div className="py-8 space-y-10">
                        <div className="flex items-center gap-8">
                            <div className={`w-28 h-28 rounded-full border-8 flex items-center justify-center ${report?.totalViolations > 0 ? 'border-rose-500/20 text-rose-500' : 'border-emerald-500/20 text-emerald-500'
                                }`}>
                                <span className="text-4xl font-black">{report?.totalViolations || 0}</span>
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-white leading-none">Detected Anomalies</h4>
                                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-4">
                                    Violations recognized by the intelligence core for the current organizational cycle.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                <h4 className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Overtime Limit</h4>
                                <p className="text-xl font-black text-white uppercase leading-none mt-2">48h / Week</p>
                            </div>
                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                <h4 className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Rest-Day Sync</h4>
                                <p className="text-xl font-black text-white uppercase leading-none mt-2">Active</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="Risk Analysis" subtitle="Predictive compliance assessment">
                    <div className="space-y-8 py-4">
                        <p className="text-[11px] text-white/30 font-black leading-relaxed uppercase tracking-widest">
                            The intelligence engine analyzes current workforce occupancy and presence vectors to ensure operational alignment with governmental labor protocols.
                        </p>
                        <div className={`p-8 rounded-[2rem] border ${report?.totalViolations > 0
                            ? 'bg-rose-500/5 border-rose-500/20'
                            : 'bg-emerald-500/5 border-emerald-500/20'
                            }`}>
                            <h5 className={`text-[10px] font-black uppercase tracking-widest mb-4 ${report?.totalViolations > 0 ? 'text-rose-400' : 'text-emerald-400'
                                }`}>
                                Compliance Threat Level
                            </h5>
                            <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${report?.totalViolations > 5 ? 'bg-rose-500 w-full' : report?.totalViolations > 0 ? 'bg-amber-500 w-[40%]' : 'bg-emerald-500 w-[5%]'
                                        }`}
                                />
                            </div>
                            <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mt-6">
                                Current status: {report?.totalViolations > 0 ? 'INTERVENTION REQUIRED' : 'NOMINAL STABILITY'}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            <Card noPadding title="Detailed Anomaly Log" subtitle="Telemetrical violation data">
                {isLoading ? (
                    <div className="p-20 flex justify-center"><Spinner /></div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={(report?.violations || []).map((v: any, i: number) => ({ ...v, id: v.id || `v-${i}` }))}
                    />
                )}
            </Card>
        </div>
    );
}
