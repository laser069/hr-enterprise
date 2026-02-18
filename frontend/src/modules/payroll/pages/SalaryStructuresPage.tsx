import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { payrollApi } from '../services/payroll.api';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';

export const SalaryStructuresPage: React.FC = () => {
  const { data: structures, isLoading } = useQuery({
    queryKey: ['salary-structures'],
    queryFn: payrollApi.getSalaryStructures,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">Loading salary protocols...</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Salary Structures</h1>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-4">
            Configure enterprise compensation models
          </p>
        </div>
        <Button variant="primary" className="rounded-2xl px-8 shadow-xl">
          Create Structure
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {structures?.map((structure) => (
          <Card key={structure.id} className="group hover:border-slate-900 transition-colors duration-500">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{structure.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    Base Model: {structure.baseSalary.toLocaleString()} UI
                  </p>
                </div>
                <Badge variant="primary" className="uppercase tracking-widest text-[8px]">
                  Standard
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-400 uppercase tracking-widest">Allowances</span>
                  <span className="text-slate-900">{(structure as any).allowances?.length || 0} Components</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-400 uppercase tracking-widest">Deductions</span>
                  <span className="text-slate-900">{(structure as any).deductions?.length || 0} Elements</span>
                </div>
              </div>

              <div className="pt-4 flex gap-2 border-t border-slate-100">
                <Button variant="outline" size="sm" className="flex-1 rounded-xl uppercase tracking-widest text-[9px] font-black">
                  Edit Model
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 rounded-xl uppercase tracking-widest text-[9px] font-black"
                >
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {structures?.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">No salary structures defined</p>
          <Button variant="primary" className="mt-6 rounded-2xl mx-auto block px-8">Define Initial Model</Button>
        </div>
      )}
    </div>
  );
};

export default SalaryStructuresPage;
