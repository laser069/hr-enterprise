import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEmployee, useUpdateEmployee } from '../hooks/useEmployee';
import { useShifts } from '../../shifts/hooks/useShifts';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Spinner } from '../../../shared/components/ui/Spinner';
import type { UpdateEmployeeDto } from '../types';

export default function EditEmployeePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: employee, isLoading: isLoadingEmployee, error } = useEmployee(id!);
    const updateMutation = useUpdateEmployee();

    const [formData, setFormData] = useState<UpdateEmployeeDto>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        designation: '',
        shiftId: '',
    });

    useEffect(() => {
        if (employee) {
            setFormData({
                firstName: employee.firstName,
                lastName: employee.lastName,
                phone: employee.phone || '',
                designation: employee.designation || '',
                shiftId: employee.shiftId || '',
            });
        }
    }, [employee]);

    const { data: shifts } = useShifts();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateMutation.mutateAsync({ id: id!, data: formData });
            navigate(`/employees/${id}`);
        } catch (error) {
            console.error('Failed to update employee:', error);
        }
    };

    const handleChange = (field: keyof UpdateEmployeeDto, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (isLoadingEmployee) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error || !employee) {
        return (
            <Card className="max-w-2xl mx-auto mt-10 p-12 text-center">
                <h3 className="text-xl font-bold text-slate-900">Error Loading Employee</h3>
                <Button variant="outline" className="mt-6" onClick={() => navigate('/employees')}>Back to Directory</Button>
            </Card>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Update Profile</h1>
                <p className="text-xs text-slate-400 font-black uppercase tracking-[0.3em] mt-4 opacity-70">
                    Sync credentials and strategic personnel data
                </p>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-8 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                First Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-[1.5rem] transition-all outline-none font-bold text-sm tracking-tight"
                                placeholder="John"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Last Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.lastName}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-[1.5rem] transition-all outline-none font-bold text-sm tracking-tight"
                                placeholder="Doe"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Operational Role
                            </label>
                            <input
                                type="text"
                                value={formData.designation}
                                onChange={(e) => handleChange('designation', e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-[1.5rem] transition-all outline-none font-bold text-sm tracking-tight"
                                placeholder="Senior Engineer"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Communication Node
                            </label>
                            <input
                                type="tel"
                                value={formData.phone || ''}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-[1.5rem] transition-all outline-none font-bold text-sm tracking-tight"
                                placeholder="+1 234 567 890"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Assigned Shift
                            </label>
                            <select
                                value={formData.shiftId}
                                onChange={(e) => handleChange('shiftId', e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:bg-white rounded-[1.5rem] transition-all outline-none font-bold text-sm tracking-tight appearance-none"
                            >
                                <option value="">No Shift Assigned</option>
                                {shifts?.map(shift => (
                                    <option key={shift.id} value={shift.id}>
                                        {shift.name} ({shift.startTime} - {shift.endTime})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-8">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(`/employees/${id}`)}
                            className="flex-1 h-16 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest"
                        >
                            Discard Changes
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={updateMutation.isPending}
                            className="flex-1 h-16 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest"
                        >
                            {updateMutation.isPending ? 'Syncing...' : 'Update Records'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
