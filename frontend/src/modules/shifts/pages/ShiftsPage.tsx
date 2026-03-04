import React, { useState } from 'react';
import { useShifts, useDeleteShift, useCreateShift, useUpdateShift } from '../hooks/useShifts';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Modal } from '../../../shared/components/ui/Modal';
import type { Shift, CreateShiftDto, UpdateShiftDto } from '../types';

export const ShiftsPage: React.FC = () => {
  const { data: shifts, isLoading } = useShifts();
  const deleteMutation = useDeleteShift();
  const createMutation = useCreateShift();
  const updateMutation = useUpdateShift();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [formData, setFormData] = useState<CreateShiftDto & { isActive?: boolean }>({
    name: '',
    startTime: '09:00',
    endTime: '18:00',
    workDays: [1, 2, 3, 4, 5],
    isActive: true,
  });

  const handleOpenModal = (shift?: Shift) => {
    if (shift) {
      setEditingShift(shift);
      setFormData({
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        workDays: shift.workDays,
        isActive: shift.isActive,
      });
    } else {
      setEditingShift(null);
      setFormData({
        name: '',
        startTime: '09:00',
        endTime: '18:00',
        workDays: [1, 2, 3, 4, 5],
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingShift) {
        await updateMutation.mutateAsync({
          id: editingShift.id,
          data: formData as UpdateShiftDto
        });
      } else {
        await createMutation.mutateAsync(formData as CreateShiftDto);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save shift:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const toggleDay = (day: number) => {
    setFormData(prev => {
      const workDays = prev.workDays.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day].sort();
      return { ...prev, workDays };
    });
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">Loading operational shifts...</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Shift Management</h1>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-4">
            Configure enterprise working hours
          </p>
        </div>
        <Button variant="primary" className="rounded-2xl px-8 shadow-xl" onClick={() => handleOpenModal()}>
          Create Shift
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shifts?.map((shift) => (
          <Card key={shift.id} className="group hover:border-slate-900 transition-colors duration-500">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">{shift.name}</h3>
                <Badge variant={shift.isActive ? 'success' : 'default'} className="uppercase tracking-widest text-[8px]">
                  {shift.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span className="uppercase tracking-widest text-[10px]">Timing:</span>
                  <span className="text-slate-900">{shift.startTime} - {shift.endTime}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {dayNames.map((day, index) => (
                    <span
                      key={day}
                      className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${shift.workDays.includes(index)
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-400'
                        }`}
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-2 border-t border-slate-100">
                <Button variant="outline" size="sm" className="flex-1 rounded-xl uppercase tracking-widest text-[9px] font-black" onClick={() => handleOpenModal(shift)}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl uppercase tracking-widest text-[9px] font-black text-red-500 hover:bg-red-50 hover:border-red-200"
                  onClick={() => handleDelete(shift.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {shifts?.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">No shifts defined in the system</p>
          <Button variant="primary" className="mt-6 rounded-2xl mx-auto block px-8" onClick={() => handleOpenModal()}>Initialize First Shift</Button>
        </div>
      )}

      {/* Shift Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingShift ? "Edit Shift" : "Create New Shift"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 tracking-tighter focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none transition-all"
              placeholder="e.g. Day Shift, Night Shift"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Time</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 tracking-tighter focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Time</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 tracking-tighter focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Working Days</label>
            <div className="flex flex-wrap gap-2 pt-2">
              {dayNames.map((day, index) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(index)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.workDays.includes(index)
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-200 rounded-full peer-checked:bg-emerald-500 transition-all"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-all shadow-sm"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active Status</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Shift is available for assignment</span>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingShift ? "Update Shift" : "Create Shift"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ShiftsPage;
