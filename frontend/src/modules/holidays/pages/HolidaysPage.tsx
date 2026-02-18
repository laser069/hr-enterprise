import React, { useState } from 'react';
import { useHolidays, useDeleteHoliday } from '../hooks/useHolidays';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import type { HolidayType } from '../types';

export const HolidaysPage: React.FC = () => {
  const [year] = useState(new Date().getFullYear());
  const { data: holidays, isLoading } = useHolidays(year);
  const deleteMutation = useDeleteHoliday();

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
        <Button variant="primary" className="rounded-2xl px-8 shadow-xl">
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
                <Button variant="outline" size="sm" className="flex-1 rounded-xl uppercase tracking-widest text-[9px] font-black">
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
          <Button variant="primary" className="mt-6 rounded-2xl mx-auto block px-8">Add First Holiday</Button>
        </div>
      )}
    </div>
  );
};

export default HolidaysPage;
