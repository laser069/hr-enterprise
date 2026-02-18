import React from 'react';
import { useShifts, useDeleteShift } from '../hooks/useShifts';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';

export const ShiftsPage: React.FC = () => {
  const { data: shifts, isLoading } = useShifts();
  const deleteMutation = useDeleteShift();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      await deleteMutation.mutateAsync(id);
    }
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
        <Button variant="primary" className="rounded-2xl px-8 shadow-xl">
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
                      className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${
                        shift.workDays.includes(index) 
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
                <Button variant="outline" size="sm" className="flex-1 rounded-xl uppercase tracking-widest text-[9px] font-black">
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
          <Button variant="primary" className="mt-6 rounded-2xl mx-auto block px-8">Initialize First Shift</Button>
        </div>
      )}
    </div>
  );
};

export default ShiftsPage;
