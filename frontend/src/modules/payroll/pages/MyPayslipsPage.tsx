import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { payrollApi } from '../services/payroll.api';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { DataTable } from '../../../shared/components/ui/DataTable';
import { Download, FileText, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { CreateColumnHelper } from '@tanstack/react-table';

const MyPayslipsPage = () => {
  const { data: payslips, isLoading } = useQuery({
    queryKey: ['my-payslips'],
    queryFn: () => payrollApi.getMyPayslips(),
  });

  const handleDownload = async (entryId: string) => {
    try {
      await payrollApi.downloadPayslip(entryId);
    } catch (error) {
      console.error('Failed to download payslip:', error);
    }
  };

  const columnHelper = CreateColumnHelper<any>(); // Replace 'any' with PayrollEntry type if available

  const columns = [
    columnHelper.accessor('payrollRun', {
      header: 'Period',
      cell: (info) => {
        const run = info.getValue();
        return (
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="font-medium">{format(new Date(run.year, run.month - 1), 'MMMM yyyy')}</span>
            </div>
        );
      },
    }),
    columnHelper.accessor('netSalary', {
      header: 'Net Pay',
      cell: (info) => (
        <div className="flex items-center text-green-600 font-semibold">
          <DollarSign className="w-3 h-3 mr-1" />
          {Number(info.getValue()).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      ),
    }),
    columnHelper.accessor('payrollRun.paidDate', {
        header: 'Paid Date',
        cell: (info) => info.getValue() ? format(new Date(info.getValue()), 'MMM d, yyyy') : '-',
    }),
    columnHelper.accessor('status', { // Available on PayrollRun, need to check if accessible here easily or if we should use run status
        header: 'Status',
        cell: (info) => {
            const status = info.row.original.payrollRun.status;
             return (
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize 
                    ${status === 'processed' ? 'bg-green-100 text-green-700' : 
                      status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {status}
                </span>
            );
        }
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDownload(info.row.original.id)}
          className="flex items-center gap-2"
        >
          <Download className="w-3 h-3" />
          Download
        </Button>
      ),
    }),
  ];

  if (isLoading) return <div>Loading payslips...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Payslips</h1>
          <p className="text-slate-500 dark:text-slate-400">View and download your salary slips</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg flex items-center">
            <FileText className="w-5 h-5 mr-3" />
            <div>
                <div className="text-sm font-semibold">Total Payslips</div>
                <div className="text-xl font-bold leading-none">{payslips?.length || 0}</div>
            </div>
        </div>
      </div>

      <Card className="p-6">
        {payslips && payslips.length > 0 ? (
          <DataTable data={payslips} columns={columns} />
        ) : (
          <div className="text-center py-10 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No payslips available yet.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MyPayslipsPage;
