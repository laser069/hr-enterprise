import React, { useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { useCreateCandidate, useJobs } from '../hooks/useRecruitment';
import { uploadApi } from '../../../core/api/services/upload.api';

interface CreateCandidateModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultJobId?: string;
}

export const CreateCandidateModal: React.FC<CreateCandidateModalProps> = ({ isOpen, onClose, defaultJobId }) => {
    const { data: jobs } = useJobs({ status: 'open' });
    const createMutation = useCreateCandidate();
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        jobId: defaultJobId || '',
        source: 'Manual',
        notes: '',
    });

    const [resumeFile, setResumeFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let resumeUrl = '';

            if (resumeFile) {
                setIsUploading(true);
                const uploadRes = await uploadApi.upload(resumeFile, 'resume');
                resumeUrl = uploadRes.data.url;
                setIsUploading(false);
            }

            await createMutation.mutateAsync({
                ...formData,
                resumeUrl,
            });

            onClose();
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                jobId: defaultJobId || '',
                source: 'Manual',
                notes: '',
            });
            setResumeFile(null);
        } catch (err) {
            setIsUploading(false);
            console.error('Failed to create candidate:', err);
            alert('Failed to process candidate submission. Please check the logs.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manual Candidate Integration" size="lg">
            <form onSubmit={handleSubmit} className="space-y-8 pb-6">
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name *</label>
                        <input
                            required
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 text-sm focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-inner"
                            placeholder="e.g. ALAN"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name *</label>
                        <input
                            required
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 text-sm focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-inner"
                            placeholder="e.g. TURING"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Identifier *</label>
                        <input
                            required
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 text-sm focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-inner"
                            placeholder="alan@turing.org"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Vector (Phone)</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 text-sm focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-inner"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Requisition *</label>
                    <select
                        required
                        value={formData.jobId}
                        onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 text-sm focus:ring-4 focus:ring-indigo-100 outline-none transition-all appearance-none"
                    >
                        <option value="">Select Open Job</option>
                        {jobs?.map(job => (
                            <option key={job.id} value={job.id}>{job.title} ({job.department?.name})</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resume Payload (PDF/DOCX)</label>
                    <div className="relative group">
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                            className="hidden"
                            id="resume-upload"
                        />
                        <label
                            htmlFor="resume-upload"
                            className="flex items-center justify-between w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem] px-8 py-10 cursor-pointer group-hover:bg-slate-100 group-hover:border-indigo-300 transition-all text-center"
                        >
                            <div className="flex-1">
                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">
                                    {resumeFile ? resumeFile.name : 'Initialize Payload Upload'}
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">Maximum file size: 10MB</p>
                            </div>
                            <svg className="w-8 h-8 text-slate-300 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-6 pt-10 border-t border-slate-100/50">
                    <Button variant="ghost" type="button" onClick={onClose}>Abort</Button>
                    <Button
                        variant="primary"
                        type="submit"
                        className="px-12 h-16 rounded-3xl shadow-xl shadow-indigo-500/20"
                        isLoading={createMutation.isPending || isUploading}
                    >
                        {isUploading ? 'Uploading Payload...' : 'Complete Integration'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
