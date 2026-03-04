import { usePromotions, useCreatePromotion } from '../hooks/usePerformance';
import { useEmployees } from '../../employees/hooks/useEmployee';
import { useAuthContext } from '../../../core/auth/use-auth-context';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { format } from 'date-fns';
import { useState } from 'react';

export default function PromotionsPage() {
    const { user } = useAuthContext();
    const isAdmin = user?.role?.name === 'admin' || user?.role?.name === 'hr';
    const { data: promotions } = usePromotions(user?.employeeId || '');
    const { data: employees } = useEmployees();
    const createMutation = useCreatePromotion();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        employeeId: '',
        newDesignation: '',
        newSalary: 0,
        effectiveDate: format(new Date(), 'yyyy-MM-dd'),
        notes: ''
    });

    const handleSubmit = () => {
        const selectedEmp = employees?.data.find(e => e.id === formData.employeeId);
        createMutation.mutate({
            ...formData,
            oldDesignation: selectedEmp?.designation,
            newSalary: Number(formData.newSalary)
        }, {
            onSuccess: () => {
                setIsModalOpen(false);
                setFormData({
                    employeeId: '',
                    newDesignation: '',
                    newSalary: 0,
                    effectiveDate: format(new Date(), 'yyyy-MM-dd'),
                    notes: ''
                });
            }
        });
    };

    return (
        <div className="space-y-12 pb-12">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Career Progression</h1>
                    <p className="text-sm text-slate-400 font-black uppercase tracking-[0.3em] mt-6 opacity-70">
                        Temporal log of professional advancement & compensation scaling
                    </p>
                </div>
                {isAdmin && (
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="h-12 px-8 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-2xl"
                    >
                        Record Advancement
                    </Button>
                )}
            </div>

            <Card
                title="Professional Timeline"
                subtitle="Historical trajectory of roles and remuneration"
                className="max-w-4xl glass-strong"
            >
                <div className="relative pl-12 space-y-12 py-8">
                    {/* Timeline Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200 shadow-[0_0_15px_rgba(0,0,0,0.05)]" />

                    {promotions?.map((promotion) => (
                        <div key={promotion.id} className="relative group">
                            {/* Dot */}
                            <div className="absolute left-[-24px] top-2 w-12 h-12 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:border-indigo-200">
                                <div className="w-5 h-5 rounded-full bg-slate-900 group-hover:bg-indigo-600" />
                            </div>

                            <div className="p-8 rounded-[2.5rem] bg-white/40 border border-white/80 transition-all duration-700 hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] group-hover:translate-x-2">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                                    <div>
                                        <Badge variant="info" className="mb-4 h-7 text-[10px] font-black uppercase tracking-widest px-4">
                                            {format(new Date(promotion.effectiveDate), 'MMMM d, yyyy')}
                                        </Badge>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                            {promotion.newDesignation}
                                        </h3>
                                        {promotion.oldDesignation && (
                                            <p className="text-slate-400 font-bold mt-2 flex items-center gap-2">
                                                <span className="line-through">{promotion.oldDesignation}</span>
                                                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                                <span className="text-indigo-600 uppercase tracking-widest text-[10px]">Evolution</span>
                                            </p>
                                        )}
                                    </div>
                                    <div className="bg-slate-900 rounded-3xl p-6 text-right shadow-2xl flex flex-col items-end">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 opacity-60">Quantum Shift</p>
                                        <p className="text-2xl font-black text-white tracking-tighter">
                                            {Number(promotion.newSalary).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                        </p>
                                    </div>
                                </div>
                                {promotion.notes && (
                                    <div className="mt-6 pt-6 border-t border-slate-100/50">
                                        <p className="text-slate-500 leading-relaxed font-medium">"{promotion.notes}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {(!promotions || promotions.length === 0) && (
                        <div className="text-center py-20 text-slate-400 pr-12">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <p className="font-black uppercase tracking-[0.3em] text-[11px]">No career shift events recorded</p>
                        </div>
                    )}
                </div>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Execute Advancement Protocol"
            >
                <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Target Personnel</label>
                        <select
                            className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50/50 px-6 focus:ring-2 focus:ring-slate-900 transition-all outline-none uppercase font-black text-[11px]"
                            value={formData.employeeId}
                            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        >
                            <option value="">SELECT EMPLOYEE</option>
                            {employees?.data.map(e => (
                                <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.designation})</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">New Designation</label>
                            <input
                                className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50/50 px-6 focus:ring-2 focus:ring-slate-900 transition-all outline-none uppercase font-black text-[11px]"
                                value={formData.newDesignation}
                                onChange={(e) => setFormData({ ...formData, newDesignation: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">New Salary (INR)</label>
                            <input
                                type="number"
                                className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50/50 px-6 focus:ring-2 focus:ring-slate-900 transition-all outline-none font-black text-[14px]"
                                value={formData.newSalary}
                                onChange={(e) => setFormData({ ...formData, newSalary: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Effective Date</label>
                        <input
                            type="date"
                            className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50/50 px-6 focus:ring-2 focus:ring-slate-900 transition-all outline-none font-black"
                            value={formData.effectiveDate}
                            onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Strategic Justification</label>
                        <textarea
                            className="w-full h-32 rounded-3xl border-slate-200 bg-slate-50/50 p-6 focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                    <Button
                        onClick={handleSubmit}
                        className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl"
                        isLoading={createMutation.isPending}
                        disabled={!formData.employeeId || !formData.newDesignation || !formData.newSalary}
                    >
                        Authorize Advancement
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
