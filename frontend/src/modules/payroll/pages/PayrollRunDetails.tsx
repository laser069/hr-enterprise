import { useParams } from 'react-router-dom';
import { usePayrollRun, usePayrollSummary, useCalculatePayroll, useApprovePayroll, useProcessPayroll } from '../hooks/usePayroll';
import { useAuthContext } from '../../../core/auth/use-auth-context';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface PayrollSummary {
  totalEmployees: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetSalary: number;
}

export default function PayrollRunDetails() {
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = useAuthContext();
  
  const { data: run, isLoading: runLoading } = usePayrollRun(id || '');
  const { data: rawSummary, isLoading: summaryLoading } = usePayrollSummary(id || '');
  const summary = rawSummary as unknown as PayrollSummary | undefined;
  
  const calculateMutation = useCalculatePayroll();
  const approveMutation = useApprovePayroll();
  const processMutation = useProcessPayroll();

  const canManage = hasPermission('payroll:manage');

  const handleCalculate = async () => {
    if (id) await calculateMutation.mutateAsync(id);
  };

  const handleApprove = async () => {
    if (id && window.confirm('Are you sure you want to approve this payroll?')) {
      await approveMutation.mutateAsync(id);
    }
  };

  const handleProcess = async () => {
    if (id && window.confirm('Are you sure you want to process this payroll? This action cannot be undone.')) {
      await processMutation.mutateAsync(id);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'default'> = {
      processed: 'success',
      approved: 'success',
      draft: 'warning',
    };
    return colors[status] || 'default';
  };

  if (runLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Payroll run not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {months[run.month - 1]} {run.year} Payroll
          </h1>
          <p className="text-gray-600 mt-1">
            Payroll run details and employee entries
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={getStatusColor(run.status)} className="text-sm px-3 py-1">
            {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))
        ) : summary ? (
          <>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalEmployees}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Gross Salary</p>
              <p className="text-2xl font-bold text-gray-900">
                ${summary.totalGrossSalary.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Total Deductions</p>
              <p className="text-2xl font-bold text-gray-900">
                ${summary.totalDeductions.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Net Salary</p>
              <p className="text-2xl font-bold text-green-600">
                ${summary.totalNetSalary.toLocaleString()}
              </p>
            </div>
          </>
        ) : null}
      </div>

      {/* Action Buttons */}
      {canManage && run.status !== 'PROCESSED' && (
        <div className="flex gap-3">
          {run.status === 'DRAFT' && (
            <>
              <Button
                variant="primary"
                onClick={handleCalculate}
                disabled={calculateMutation.isPending}
              >
                Calculate Payroll
              </Button>
              <Button
                variant="success"
                onClick={handleApprove}
                disabled={approveMutation.isPending || !run.entries?.length}
              >
                Approve Payroll
              </Button>
            </>
          )}
          {run.status === 'APPROVED' && (
            <Button
              variant="success"
              onClick={handleProcess}
              disabled={processMutation.isPending}
            >
              Process Payments
            </Button>
          )}
        </div>
      )}

      {/* Approval Info */}
      {(run.approvedBy || run.approvedAt) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">
              Approved by {run.approvedByUser?.firstName} {run.approvedByUser?.lastName}
              {run.approvedAt && ` on ${new Date(run.approvedAt).toLocaleDateString()}`}
            </span>
          </div>
        </div>
      )}

      {/* Employee Entries Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Employee Payroll Entries ({run.entries?.length || 0})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LOP Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deductions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Salary
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!run.entries || run.entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No payroll entries yet. Click "Calculate Payroll" to generate entries.
                  </td>
                </tr>
              ) : (
                run.entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {entry.employee?.profilePicture ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={entry.employee.profilePicture}
                              alt=""
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {entry.employee?.firstName?.[0]}
                                {entry.employee?.lastName?.[0]}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {entry.employee?.firstName} {entry.employee?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{entry.employee?.employeeCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.employee?.department?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${entry.grossSalary.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.lopDays > 0 ? (
                        <span className="text-red-600">{entry.lopDays} days</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      -${entry.deductions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${entry.netSalary.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
