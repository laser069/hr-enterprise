import React, { useState } from 'react';
import { useHolidays, useDeleteHoliday, useCreateHoliday, useUpdateHoliday } from '../hooks/useHolidays';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Modal } from '../../../shared/components/ui/Modal';
import type { Holiday, HolidayType, CreateHolidayDto } from '../types';

export const HolidaysPage: React.FC = () => {
  const [year] = useState(new Date().getFullYear());
  const { data: holidays, isLoading } = useHolidays(year);
  const deleteMutation = useDeleteHoliday();
  const createMutation = useCreateHoliday();
  const updateMutation = useUpdateHoliday();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [formData, setFormData] = useState<CreateHolidayDto>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    type: 'PUBLIC',
    description: '',
    isRecurring: false,
  });

  const handleOpenModal = (holiday?: Holiday) => {
    if (holiday) {
      setEditingHoliday(holiday);
      setFormData({
        name: holiday.name,
        date: new Date(holiday.date).toISOString().split('T')[0],
        type: holiday.type,
        description: holiday.description || '',
        isRecurring: holiday.isRecurring,
      });
    } else {
      setEditingHoliday(null);
      setFormData({
        name: '',
        date: new Date().toISOString().split('T')[0],
        type: 'PUBLIC',
        description: '',
        isRecurring: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingHoliday) {
        await updateMutation.mutateAsync({ id: editingHoliday.id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save holiday:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const getBadgeVariant = (type: HolidayType) => {
    switch (type) {
      case 'PUBLIC': return 'primary';
      case 'COMPANY': return 'success';
      case 'OPTIONAL': return 'default';
      default: return 'default';
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">Loading holiday calendar...</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Holiday Calendar</h1>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-4">
            Manage enterprise non-working days for {year}
          </p>
        </div>
        <Button variant="primary" className="rounded-2xl px-8 shadow-xl" onClick={() => handleOpenModal()}>
          Add Holiday
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {holidays?.map((holiday) => (
          <Card key={holiday.id} className="group hover:border-slate-900 transition-colors duration-500">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{holiday.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {new Date(holiday.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <Badge variant={getBadgeVariant(holiday.type)} className="uppercase tracking-widest text-[8px]">
                  {holiday.type}
                </Badge>
              </div>

              {holiday.description && (
                <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">
                  {holiday.description}
                </p>
              )}

              <div className="pt-4 flex gap-2 border-t border-slate-100">
                <Button variant="outline" size="sm" className="flex-1 rounded-xl uppercase tracking-widest text-[9px] font-black" onClick={() => handleOpenModal(holiday)}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl uppercase tracking-widest text-[9px] font-black text-red-500 hover:bg-red-50 hover:border-red-200"
                  onClick={() => handleDelete(holiday.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {holidays?.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">No holidays found for this year</p>
          <Button variant="primary" className="mt-6 rounded-2xl mx-auto block px-8" onClick={() => handleOpenModal()}>Add First Holiday</Button>
        </div>
      )}

      {/* Holiday Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHoliday ? "Edit Holiday" : "Add New Holiday"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Holiday Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 tracking-tighter focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none transition-all"
              placeholder="e.g. Independence Day"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 tracking-tighter focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as HolidayType })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 tracking-tighter focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none transition-all"
              >
                <option value="PUBLIC">Public</option>
                <option value="COMPANY">Company</option>
                <option value="OPTIONAL">Optional</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 tracking-tighter focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none transition-all resize-none"
              placeholder="Brief description of the holiday..."
            />
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-200 rounded-full peer-checked:bg-indigo-600 transition-all"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-all shadow-sm"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Recurring Holiday</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Repeat annually on this date</span>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingHoliday ? "Update Holiday" : "Save Holiday"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HolidaysPage;
