import { useState } from 'react';
import { useStatutoryReport, useGenerateFilings } from '../hooks/useCompliance';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Spinner } from '../../../shared/components/ui/Spinner';
import { Badge } from '../../../shared/components/ui/Badge';

export default function StatutoryCompliancePage() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);

    const { data: report, isLoading, refetch } = useStatutoryReport(year, month);
    const generateFilings = useGenerateFilings();

    const handleGenerate = async () => {
        try {
            await generateFilings.mutateAsync({ year, month });
            refetch();
        } catch (err) {
            console.error('Protocol initialization failed', err);
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">Statutory Registry</h1>
                    <p className="text-xs text-white/40 font-black uppercase tracking-widest mt-2">EPF, ESI, and TDS compliance</p>
                </div>
                <Button
                    onClick={handleGenerate}
                    isLoading={generateFilings.isPending}
                    variant="primary"
                    className="rounded-2xl"
                >
                    Initialize Filing Cycle
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
                            {[2024, 2025, 2026].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Reporting Month</label>
                        <select
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {isLoading ? (
                <div className="p-20 flex justify-center"><Spinner /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card title="Provident Fund (EPF)" subtitle="Employee/Employer contributions">
                        <div className="py-6 space-y-6">
                            <div className="flex justify-between items-end">
                                <span className="text-3xl font-black text-white">₹{(report?.pf?.amount || 0).toLocaleString()}</span>
                                <Badge variant={report?.pf?.status === 'filed' ? 'success' : 'warning'}>
                                    {report?.pf?.status?.toUpperCase()}
                                </Badge>
                            </div>
                            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest leading-relaxed">
                                Aggregated statutory liability for the selected period across the authorized workforce.
                            </p>
                            <Button variant="outline" size="sm" className="w-full rounded-xl border-white/10">View Detailed Schedule</Button>
                        </div>
                    </Card>

                    <Card title="Insured Health (ESI)" subtitle="Medical infrastructure levy">
                        <div className="py-6 space-y-6">
                            <div className="flex justify-between items-end">
                                <span className="text-3xl font-black text-white">₹{(report?.esi?.amount || 0).toLocaleString()}</span>
                                <Badge variant={report?.esi?.status === 'filed' ? 'success' : 'warning'}>
                                    {report?.esi?.status?.toUpperCase()}
                                </Badge>
                            </div>
                            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest leading-relaxed">
                                Mandatory health insurance premiums computed based on current salary distributions.
                            </p>
                            <Button variant="outline" size="sm" className="w-full rounded-xl border-white/10">View Detailed Schedule</Button>
                        </div>
                    </Card>

                    <Card title="Source Withholding (TDS)" subtitle="Direct tax compliance">
                        <div className="py-6 space-y-6">
                            <div className="flex justify-between items-end">
                                <span className="text-3xl font-black text-white">₹{(report?.tds?.amount || 0).toLocaleString()}</span>
                                <Badge variant={report?.tds?.status === 'filed' ? 'success' : 'warning'}>
                                    {report?.tds?.status?.toUpperCase()}
                                </Badge>
                            </div>
                            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest leading-relaxed">
                                Withheld income tax components destined for governmental fiscal channels.
                            </p>
                            <Button variant="outline" size="sm" className="w-full rounded-xl border-white/10">View Detailed Schedule</Button>
                        </div>
                    </Card>
                </div>
            )}

            {!isLoading && (
                <Card title="Compliance Health Indicators" subtitle="Organizational risk assessment">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-6">
                        <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl">
                            <h4 className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Status</h4>
                            <p className="text-xl font-black text-white uppercase">Nominal</p>
                        </div>
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                            <h4 className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Filings</h4>
                            <p className="text-xl font-black text-white">03 Pending</p>
                        </div>
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                            <h4 className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Coverage</h4>
                            <p className="text-xl font-black text-white">100% Sync</p>
                        </div>
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                            <h4 className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Drift</h4>
                            <p className="text-xl font-black text-white">± 0.00%</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
