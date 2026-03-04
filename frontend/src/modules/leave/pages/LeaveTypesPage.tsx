import React, { useState } from 'react';
import { useLeaveTypes, useCreateLeaveType, useUpdateLeaveType, useDeleteLeaveType } from '../hooks/useLeave';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Modal } from '../../../shared/components/ui/Modal';
import type { LeaveType, CreateLeaveTypeDto } from '../types';

export const LeaveTypesPage: React.FC = () => {
    const { data: leaveTypes, isLoading } = useLeaveTypes();
    const createMutation = useCreateLeaveType();
    const updateMutation = useUpdateLeaveType();
    const deleteMutation = useDeleteLeaveType();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<LeaveType | null>(null);
    const [formData, setFormData] = useState<Partial<CreateLeaveTypeDto>>({
        name: '',
        description: '',
        annualLimit: 12,
        isPaid: true,
        carryForwardMax: 0,
        isActive: true,
    });

    const handleOpenModal = (type?: LeaveType) => {
        if (type) {
            setEditingType(type);
            setFormData({
                name: type.name,
                description: type.description || '',
                annualLimit: type.annualLimit,
                isPaid: type.isPaid,
                carryForwardMax: type.carryForwardMax,
                isActive: type.isActive,
            });
        } else {
            setEditingType(null);
            setFormData({
                name: '',
                description: '',
                annualLimit: 12,
                isPaid: true,
                carryForwardMax: 0,
                isActive: true,
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingType) {
                await updateMutation.mutateAsync({ id: editingType.id, data: formData });
            } else {
                await createMutation.mutateAsync(formData as CreateLeaveTypeDto);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error('Failed to save leave type:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this leave type? There might be balances or requests associated.')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">Loading leave configurations...</div>;
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Leave Types</h1>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-4">
                        Configure leave policies and annual limits
                    </p>
                </div>
                <Button variant="primary" className="rounded-2xl px-8 shadow-xl" onClick={() => handleOpenModal()}>
                    Add Leave Type
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leaveTypes?.map((type) => (
                    <Card key={type.id} className="group hover:border-slate-900 transition-colors duration-500">
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{type.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant={type.isPaid ? 'success' : 'default'} className="uppercase tracking-widest text-[7px]">
                                            {type.isPaid ? 'Paid' : 'Unpaid'}
                                        </Badge>
                                        <Badge variant={type.isActive ? 'primary' : 'default'} className="uppercase tracking-widest text-[7px]">
                                            {type.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-slate-900">{type.annualLimit}</span>
                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Days / Year</p>
                                </div>
                            </div>

                            {type.description && (
                                <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2 italic">
                                    "{type.description}"
                                </p>
                            )}

                            <div className="pt-4 flex gap-2 border-t border-slate-100">
                                <Button variant="outline" size="sm" className="flex-1 rounded-xl uppercase tracking-widest text-[9px] font-black" onClick={() => handleOpenModal(type)}>
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 rounded-xl uppercase tracking-widest text-[9px] font-black text-red-500 hover:bg-red-50 hover:border-red-200"
                                    onClick={() => handleDelete(type.id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Leave Type Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingType ? "Edit Leave Type" : "Add Leave Type"}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 tracking-tighter focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none transition-all"
                            placeholder="e.g. Sick Leave, Vacation"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Annual Limit (Days)</label>
                            <input
                                type="number"
                                required
                                value={formData.annualLimit}
                                onChange={(e) => setFormData({ ...formData, annualLimit: parseInt(e.target.value) })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 tracking-tighter focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carry Forward Max</label>
                            <input
                                type="number"
                                required
                                value={formData.carryForwardMax}
                                onChange={(e) => setFormData({ ...formData, carryForwardMax: parseInt(e.target.value) })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 tracking-tighter focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex gap-8 py-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.isPaid}
                                onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                                className="w-5 h-5 rounded-lg border-2 border-slate-200 text-indigo-600 focus:ring-indigo-500 transition-all"
                            />
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Paid Leave</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="w-5 h-5 rounded-lg border-2 border-slate-200 text-indigo-600 focus:ring-indigo-500 transition-all"
                            />
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active</span>
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 tracking-tighter focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none transition-all resize-none"
                            placeholder="Policy details..."
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
                            {editingType ? "Update Type" : "Create Type"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default LeaveTypesPage;
