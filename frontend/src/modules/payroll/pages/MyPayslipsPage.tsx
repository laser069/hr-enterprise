import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { payrollApi } from '../services/payroll.api';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { DataTable } from '../../../shared/components/ui/DataTable';
import { Download, FileText, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { Column } from '../../../shared/components/ui/DataTable';
import type { PayrollEntry } from '../types';

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

  const columns: Column<PayrollEntry>[] = [
    {
      header: 'Period',
      accessor: (entry) => {
        const run = entry.payrollRun;
        if (!run) return '-';
        return (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-medium">{format(new Date(run.year, run.month - 1), 'MMMM yyyy')}</span>
          </div>
        );
      },
    },
    {
      header: 'Gross Salary',
      accessor: (entry) => (
        <div className="font-medium text-slate-700">
          ${Number(entry.grossSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      ),
    },
    {
      header: 'Additions',
      accessor: (entry) => {
        const additions = entry.additions;
        const total = (Number(additions?.da) || 0) + (Number(additions?.overtime) || 0);
        return total > 0 ? (
          <div className="text-xs text-slate-500">
            {Number(additions?.da) > 0 && <div>DA: ${Number(additions?.da).toLocaleString()}</div>}
            {Number(additions?.overtime) > 0 && <div className="text-indigo-600">OT: ${Number(additions?.overtime).toLocaleString()}</div>}
          </div>
        ) : '-';
      },
    },
    {
      header: 'Net Pay',
      accessor: (entry) => (
        <div className="flex items-center text-green-600 font-semibold">
          <DollarSign className="w-3 h-3 mr-1" />
          {Number(entry.netSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      ),
    },
    {
      header: 'Paid Date',
      accessor: (entry) => entry.payrollRun?.paidDate ? format(new Date(entry.payrollRun.paidDate), 'MMM d, yyyy') : '-',
    },
    {
      header: 'Status',
      accessor: (entry) => {
        const status = entry.payrollRun?.status;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize 
            ${status === 'processed' ? 'bg-green-100 text-green-700' : 
              status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {status || 'draft'}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      accessor: (entry) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload(entry.id);
          }}
          className="flex items-center gap-2"
        >
          <Download className="w-3 h-3" />
          Download
        </Button>
      ),
    },
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
