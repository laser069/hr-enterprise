import { useState } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { apiClient } from '../../../core/api/api-client';
import { Spinner } from '../../../shared/components/ui/Spinner';

type ReportModule = 'employees' | 'attendance' | 'leave' | 'payroll' | 'recruitment' | 'performance';

interface ModuleConfig {
    label: string;
    endpoint: string;
    fields: string[];
}

const MODULE_CONFIGS: Record<ReportModule, ModuleConfig> = {
    employees: {
        label: 'Workforce Registry',
        endpoint: '/employees',
        fields: ['employeeCode', 'firstName', 'lastName', 'email', 'designation', 'employmentStatus'],
    },
    attendance: {
        label: 'Presence Logs',
        endpoint: '/analytics/reports/attendance',
        fields: ['date', 'employeeName', 'status', 'checkIn', 'checkOut'],
    },
    leave: {
        label: 'Absence Records',
        endpoint: '/leave/requests',
        fields: ['employeeName', 'leaveType', 'startDate', 'endDate', 'status', 'days'],
    },
    payroll: {
        label: 'Finance Audit',
        endpoint: '/analytics/reports/payroll',
        fields: ['period', 'employeeName', 'grossSalary', 'netSalary', 'status'],
    },
    recruitment: {
        label: 'Talent Acquisition',
        endpoint: '/recruitment/jobs',
        fields: ['title', 'status', 'openings', 'postedAt'],
    },
    performance: {
        label: 'Evaluation Matrix',
        endpoint: '/analytics/performance/metrics',
        fields: ['year', 'averageRating', 'goalCompletionRate', 'totalReviews'],
    }
};

export default function CustomReportPage() {
    const [selectedModule, setSelectedModule] = useState<ReportModule>('employees');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const config = MODULE_CONFIGS[selectedModule];
            // Note: In a real system, we'd add filter params here
            let params = {};

            // Default params for certain reports to avoid errors
            if (selectedModule === 'attendance') {
                params = {
                    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0]
                };
            } else if (selectedModule === 'payroll' || selectedModule === 'performance') {
                params = { year: new Date().getFullYear() };
            }

            const response = await apiClient.get<any>(config.endpoint, { params });
            const data = Array.isArray(response) ? response : (response as any).data || [response];

            if (!data || data.length === 0) {
                alert('No data found for this module.');
                return;
            }

            const headers = config.fields;
            const csvContent = [
                headers.join(','),
                ...data.map((row: any) =>
                    headers.map(field => {
                        const val = row[field];
                        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
                    }).join(',')
                )
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `custom_report_${selectedModule}_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
        } catch (err) {
            console.error('Report generation failed:', err);
            alert('Failed to generate report. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-12 pb-10">
            <div>
                <h1 className="text-5xl font-black text-white tracking-tighter leading-none">Intelligence Engine</h1>
                <p className="text-sm text-white/40 font-black uppercase tracking-[0.3em] mt-6 opacity-70">
                    Custom data extraction & protocol generation
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <Card title="Module Selection" subtitle="Choose the data source for extraction">
                    <div className="grid grid-cols-2 gap-6 py-6">
                        {(Object.keys(MODULE_CONFIGS) as ReportModule[]).map((mod) => (
                            <button
                                key={mod}
                                onClick={() => setSelectedModule(mod)}
                                className={`flex flex-col items-center justify-center p-8 rounded-[2rem] border transition-all duration-500 ${selectedModule === mod
                                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)]'
                                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${selectedModule === mod ? 'bg-indigo-500 text-white' : 'bg-white/10'
                                    }`}>
                                    <span className="text-lg font-black">{mod[0].toUpperCase()}</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">{MODULE_CONFIGS[mod].label}</span>
                            </button>
                        ))}
                    </div>
                </Card>

                <Card title="Protocol Execution" subtitle="Finalize parameters and generate report">
                    <div className="space-y-10 py-6">
                        <div className="p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-[2rem]">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-6">Extraction Fields</h4>
                            <div className="flex flex-wrap gap-3">
                                {MODULE_CONFIGS[selectedModule].fields.map(f => (
                                    <span key={f} className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-black text-indigo-300 uppercase tracking-widest">
                                        {f}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <p className="text-[11px] text-white/30 font-black leading-relaxed uppercase tracking-widest">
                            Executing this protocol will synchronize current production data for the **{MODULE_CONFIGS[selectedModule].label}** module and generate an encoded CSV dataset for external auditing.
                        </p>

                        <Button
                            size="lg"
                            className="w-full rounded-[2.5rem] h-20 text-md"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                        >
                            {isGenerating ? <Spinner size="sm" /> : 'EXECUTE EXTRACTION PROTOCOL →'}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
