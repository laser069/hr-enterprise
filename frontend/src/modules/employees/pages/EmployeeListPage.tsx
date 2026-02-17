import { useState } from 'react';
import { useEmployees, useDeleteEmployee } from '../hooks/useEmployee';
import { Link } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/Button';
import { EmployeeList } from '../components/EmployeeList';
import type { EmployeeListParams } from '../types';

export default function EmployeeListPage() {
  const [params, setParams] = useState<EmployeeListParams>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useEmployees(params);
  const deleteMutation = useDeleteEmployee();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleParamsChange = (newParams: Partial<EmployeeListParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  return (
    <div className="space-y-12 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none drop-shadow-sm">Resource Directory</h1>
          <p className="text-xs text-slate-400 font-black uppercase tracking-[0.3em] mt-6 opacity-70">
            Enterprise Talent Repository & Workforce Intelligence
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" size="md">
            Export Roster
          </Button>
          <Link to="/employees/new">
            <Button variant="primary" size="md">
              Initiate Onboarding
            </Button>
          </Link>
        </div>
      </div>

      <EmployeeList
        employees={data?.data || []}
        isLoading={isLoading}
        onDelete={handleDelete}
        params={params}
        onParamsChange={handleParamsChange}
        meta={data?.meta}
      />
    </div>
  );
}
