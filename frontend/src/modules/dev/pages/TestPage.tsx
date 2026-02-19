import { useState } from 'react';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { payrollApi } from '../../payroll/services/payroll.api';
import { recruitmentApi } from '../../recruitment/services/recruitment.api';
import { performanceApi } from '../../performance/services/performance.api';
import { useAuthContext } from '../../../core/auth/use-auth-context';
import { apiClient } from '../../../core/api/api-client';

export default function TestPage() {
    const { } = useAuthContext();
    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const log = (msg: string, data?: any) => {
        const timestamp = new Date().toLocaleTimeString();
        const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';
        setLogs(prev => [`[${timestamp}] ${msg}${dataStr}`, ...prev]);
    };

    const clearLogs = () => setLogs([]);

    // ============ PAYROLL TESTS ============
    const testPayroll = {
        getRuns: async () => {
            try {
                setLoading(true);
                const res = await payrollApi.getPayrollRuns();
                log('Fetched Payroll Runs', res);
            } catch (e: any) {
                log('Error fetching runs', e.message);
            } finally { setLoading(false); }
        },
        createRun: async () => {
            try {
                setLoading(true);
                const res = await payrollApi.createPayrollRun({
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear(),
                });
                log('Created Payroll Run', res);
            } catch (e: any) {
                log('Error creating run', e.message);
            } finally { setLoading(false); }
        },
        downloadPayslip: async () => {
            const entryId = prompt('Enter Payroll Entry ID:');
            if (!entryId) return;
            try {
                setLoading(true);
                await payrollApi.downloadPayslip(entryId);
                // payslip download is handled inside the api method
                log('Downloaded Payslip');
            } catch (e: any) {
                log('Error creating payslip', e.message);
            } finally { setLoading(false); }
        },
    };

    // ============ RECRUITMENT TESTS ============
    const testRecruitment = {
        getJobs: async () => {
            try {
                setLoading(true);
                const res = await recruitmentApi.getJobs();
                log('Fetched Jobs', res);
            } catch (e: any) {
                log('Error fetching jobs', e.message);
            } finally { setLoading(false); }
        },
        createJob: async () => {
            try {
                setLoading(true);
                // First fetch a department
                const depts = await apiClient.get<any[]>('/departments');
                const randomDept = depts.length > 0 ? depts[0] : null;

                const res = await recruitmentApi.createJob({
                    title: 'Test Engineer ' + Date.now(),
                    description: 'Test Description',
                    departmentId: randomDept?.id, // Use valid ID or undefined
                    openings: 5
                });

                // Publish the job so we can apply to it
                await recruitmentApi.publishJob(res.id);

                log('Created & Published Job', res);
            } catch (e: any) {
                log('Error creating job', e.message);
            } finally { setLoading(false); }
        },
        createCandidate: async () => {
            try {
                setLoading(true);
                // Fetch jobs to get a valid ID (must be OPEN)
                const jobs = await recruitmentApi.getJobs({ status: 'open' });
                if (jobs.length === 0) {
                    log('No OPEN jobs found. Create a job first.');
                    return;
                }
                const job = jobs[0];

                const res = await recruitmentApi.createCandidate({
                    jobId: job.id,
                    firstName: 'John',
                    lastName: 'Doe ' + Date.now(),
                    email: `john.doe.${Date.now()}@example.com`,
                    phone: '1234567890',
                    resumeUrl: 'https://example.com/resume.pdf',
                    source: 'Website'
                });
                log('Created Candidate', res);
            } catch (e: any) {
                log('Error creating candidate', e.message);
            } finally { setLoading(false); }
        },
        scheduleInterview: async () => {
            try {
                setLoading(true);
                // Fetch candidate
                const candidatesRes = await recruitmentApi.getCandidates();
                log('Candidates Response', candidatesRes);

                // Handle both array and paginated response
                const candidates = Array.isArray(candidatesRes) ? candidatesRes : ((candidatesRes as any).data || []);

                if (candidates.length === 0) {
                    log('No candidates found. Create one first.');
                    return;
                }
                const candidate = candidates[0];

                // Fetch interviewer (employee)
                const employeesRes = await apiClient.get<any[]>('/employees');
                log('Employees Response', employeesRes); // DEBUG

                const employees = Array.isArray(employeesRes) ? employeesRes : ((employeesRes as any).data || []);

                if (employees.length === 0) {
                    log('No employees found to interview.');
                    return;
                }
                const interviewer = employees[0];
                log('Selected Interviewer', interviewer); // DEBUG

                const payload = {
                    candidateId: candidate.id,
                    interviewerId: interviewer.id,
                    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
                    type: 'technical' as any
                };
                log('Sending Schedule Payload', payload); // DEBUG

                const res = await recruitmentApi.scheduleInterview(payload);
                log('Scheduled Interview', res);
            } catch (e: any) {
                log('Error scheduling interview', e.message);
                if (e.response && e.response.data) {
                    log('Error Details', e.response.data);
                }
            } finally { setLoading(false); }
        },
        downloadOfferLetter: async () => {
            try {
                setLoading(true);
                // Fetch candidate
                const candidatesRes = await recruitmentApi.getCandidates();
                const candidates = Array.isArray(candidatesRes) ? candidatesRes : ((candidatesRes as any).data || []);

                if (candidates.length === 0) {
                    log('No candidates found. Create one first.');
                    return;
                }
                const candidate = candidates[0];

                const blob = await recruitmentApi.generateOfferLetter(candidate.id);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'offer_letter.pdf';
                a.click();
                log('Downloaded Offer Letter for ' + candidate.firstName);
            } catch (e: any) {
                log('Error downloading offer letter', e.message);
            } finally { setLoading(false); }
        },
    };

    // ============ PERFORMANCE TESTS ============
    const testPerformance = {
        createGoal: async () => {
            try {
                setLoading(true);
                // Fetch employee
                const employeesRes = await apiClient.get<any[]>('/employees');
                const employees = Array.isArray(employeesRes) ? employeesRes : ((employeesRes as any).data || []);

                if (employees.length === 0) {
                    log('No employees found. Create one first.');
                    return;
                }
                const employee = employees[0];
                log('Selected Employee for Goal', employee);

                const res = await performanceApi.createGoal({
                    employeeId: employee.id,
                    title: 'Test Goal ' + Date.now(),
                    description: 'Maximize testing coverage',
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + 86400000 * 30).toISOString(),
                    targetValue: 100
                });
                log('Created Goal', res);
            } catch (e: any) {
                log('Error creating goal', e.message);
                if (e.response && e.response.data) {
                    log('Error Details', e.response.data);
                }
            } finally { setLoading(false); }
        }
    }

    return (
        <div className="p-10 space-y-10">
            <h1 className="text-3xl font-black">Backend Verification Console</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                    <Card title="Payroll & Compliance">
                        <div className="flex flex-wrap gap-4">
                            <Button onClick={testPayroll.getRuns} disabled={loading} size="sm">Get Runs</Button>
                            <Button onClick={testPayroll.createRun} disabled={loading} size="sm">Create Run (Current Month)</Button>
                            <Button onClick={testPayroll.downloadPayslip} disabled={loading} size="sm" variant="outline">Download Payslip (Manual ID)</Button>
                        </div>
                    </Card>

                    <Card title="Recruitment">
                        <div className="flex flex-wrap gap-4">
                            <Button onClick={testRecruitment.getJobs} disabled={loading} size="sm">Get Jobs</Button>
                            <Button onClick={testRecruitment.createJob} disabled={loading} size="sm">Create Random Job</Button>
                            <Button onClick={testRecruitment.createCandidate} disabled={loading} size="sm">Create Candidate</Button>
                            <Button onClick={testRecruitment.scheduleInterview} disabled={loading} size="sm" variant="outline">Schedule Interview (Auto)</Button>
                            <Button onClick={testRecruitment.downloadOfferLetter} disabled={loading} size="sm" variant="outline">Download Offer Letter (Auto)</Button>
                        </div>
                    </Card>

                    <Card title="Performance">
                        <div className="flex flex-wrap gap-4">
                            <Button onClick={testPerformance.createGoal} disabled={loading} size="sm">Create Goal</Button>
                        </div>
                    </Card>
                </div>

                <Card title="Console Logs" className="h-[600px] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold uppercase text-slate-400">Output Stream</span>
                        <Button onClick={clearLogs} size="sm" variant="ghost">Clear</Button>
                    </div>
                    <div className="flex-1 bg-slate-900 rounded-xl p-4 overflow-y-auto font-mono text-xs text-green-400 shadow-inner">
                        {logs.length === 0 && <span className="text-slate-600">No logs yet...</span>}
                        {logs.map((L, i) => (
                            <div key={i} className="mb-2 whitespace-pre-wrap border-b border-slate-800/50 pb-2">{L}</div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
