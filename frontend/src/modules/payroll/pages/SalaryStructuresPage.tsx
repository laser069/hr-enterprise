import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { payrollApi } from '../services/payroll.api';
import { useCreateSalaryStructure } from '../hooks/usePayroll';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import type { CreateSalaryStructureDto } from '../types';

export const SalaryStructuresPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreateSalaryStructureDto>({
    name: '',
    description: '',
    basic: 0,
    da: 0,
    hra: 0,
    conveyance: 0,
    medicalAllowance: 0,
    specialAllowance: 0,
    professionalTax: 0,
    pf: 0,
    esi: 0,
    overtimeRate: 1.5,
  });

  const { data: structures, isLoading } = useQuery({
    queryKey: ['salary-structures'],
    queryFn: payrollApi.getSalaryStructures,
  });

  const createMutation = useCreateSalaryStructure();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        basic: 0,
        da: 0,
        hra: 0,
        conveyance: 0,
        medicalAllowance: 0,
        specialAllowance: 0,
        professionalTax: 0,
        pf: 0,
        esi: 0,
        overtimeRate: 1.5,
      });
    } catch (error: any) {
      const message = error.response?.data?.message;
      alert(`Failed to create salary structure: ${Array.isArray(message) ? message.join(', ') : message || error.message}`);
    }
  };

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
        <Button variant="primary" className="rounded-2xl px-8 shadow-xl" onClick={() => setShowModal(true)}>
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
                    Basic: {structure.basic.toLocaleString()} | DA: {(structure.da || 0).toLocaleString()}
                  </p>
                </div>
                <Badge variant="primary" className="uppercase tracking-widest text-[8px]">
                  {structure.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-400 uppercase tracking-widest">HRA</span>
                  <span className="text-slate-900">{structure.hra.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-400 uppercase tracking-widest">OT Rate</span>
                  <span className="text-slate-900">{structure.overtimeRate || 1.5}x</span>
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

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6">Create Salary Structure</h2>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Basic</label>
                  <input
                    type="number"
                    required
                    value={formData.basic}
                    onChange={(e) => setFormData({ ...formData, basic: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DA (Dearness Allowance)</label>
                  <input
                    type="number"
                    value={formData.da}
                    onChange={(e) => setFormData({ ...formData, da: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">HRA</label>
                  <input
                    type="number"
                    required
                    value={formData.hra}
                    onChange={(e) => setFormData({ ...formData, hra: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Allowance</label>
                  <input
                    type="number"
                    value={formData.medicalAllowance}
                    onChange={(e) => setFormData({ ...formData, medicalAllowance: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overtime Rate (e.g. 1.5)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.overtimeRate}
                    onChange={(e) => setFormData({ ...formData, overtimeRate: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1 rounded-xl" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Model'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {structures?.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">No salary structures defined</p>
          <Button variant="primary" className="mt-6 rounded-2xl mx-auto block px-8" onClick={() => setShowModal(true)}>Define Initial Model</Button>
        </div>
      )}
    </div>
  );
};

export default SalaryStructuresPage;
