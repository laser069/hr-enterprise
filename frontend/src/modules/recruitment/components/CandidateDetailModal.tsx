import React, { useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Card } from '../../../shared/components/ui/Card';
import { useInterviews, useScheduleInterview, useMoveCandidateStage, useGenerateOfferLetter } from '../hooks/useRecruitment';
import { useEmployees } from '../../employees/hooks/useEmployee';
import type { Candidate, CandidateStage, InterviewType } from '../types';

interface CandidateDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: Candidate | null;
}

const stageColors: Record<CandidateStage, string> = {
    applied: 'bg-slate-100 text-slate-500 border-slate-200',
    screening: 'bg-amber-50 text-amber-700 border-amber-200',
    interview: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    offer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    hired: 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    rejected: 'bg-red-50 text-red-700 border-red-200',
};

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({ isOpen, onClose, candidate }) => {
    const [activeTab, setActiveTab] = useState<'details' | 'interviews' | 'schedule'>('details');
    const { data: interviews, isLoading: interviewsLoading } = useInterviews(candidate?.id);
    const { data: employees } = useEmployees();
    const scheduleMutation = useScheduleInterview();
    const moveStageMutation = useMoveCandidateStage();
    const offerMutation = useGenerateOfferLetter();

    const [scheduleData, setScheduleData] = useState({
        interviewerId: '',
        scheduledAt: '',
        type: 'technical' as InterviewType,
    });

    if (!candidate) return null;

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!candidate.id) return;
        try {
            await scheduleMutation.mutateAsync({
                candidateId: candidate.id,
                ...scheduleData,
            });
            setActiveTab('interviews');
            setScheduleData({ interviewerId: '', scheduledAt: '', type: 'technical' });
        } catch (err) {
            console.error('Failed to schedule interview:', err);
        }
    };

    const handleGenerateOffer = async () => {
        try {
            await offerMutation.mutateAsync(candidate.id);
        } catch (err) {
            console.error('Failed to generate offer letter:', err);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Candidate Protocol Management" size="xl">
            <div className="flex flex-col h-full max-h-[80vh]">
                {/* Header Section */}
                <div className="flex items-center gap-6 mb-8 p-6 glass rounded-3xl border-slate-100">
                    <div className="h-20 w-20 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-2xl">
                        {candidate.firstName[0]}{candidate.lastName[0]}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
                            {candidate.firstName} {candidate.lastName}
                        </h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">
                            {candidate.job?.title} • {candidate.email}
                        </p>
                    </div>
                    <Badge variant="default" className={`px-6 py-2 shadow-xl ${stageColors[candidate.stage]}`}>
                        {candidate.stage.toUpperCase()}
                    </Badge>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-slate-100">
                    {(['details', 'interviews', 'schedule'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 px-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full animate-in slide-in-from-bottom-1" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-2">
                    {activeTab === 'details' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8">
                            <Card title="Personnel Intel" subtitle="Static candidate data">
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Phone Vector</label>
                                        <p className="text-sm font-bold text-slate-900">{candidate.phone || 'Unknown'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Source Origin</label>
                                        <p className="text-sm font-bold text-slate-900 capitalize">{candidate.source || 'Direct'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Submission Date</label>
                                        <p className="text-sm font-bold text-slate-900">{new Date(candidate.appliedAt).toLocaleDateString()}</p>
                                    </div>
                                    {candidate.resumeUrl && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full h-12 rounded-2xl border-slate-200"
                                            onClick={() => window.open(candidate.resumeUrl, '_blank')}
                                        >
                                            Retrieve Resume
                                        </Button>
                                    )}
                                </div>
                            </Card>

                            <Card title="Decision Protocols" subtitle="Strategic hiring actions">
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">Transition Phase</label>
                                        <select
                                            value={candidate.stage}
                                            onChange={(e) => moveStageMutation.mutate({ id: candidate.id, stage: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none ring-slate-100 focus:ring-4"
                                        >
                                            {['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'].map(s => (
                                                <option key={s} value={s}>{s.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {candidate.stage === 'offer' && (
                                        <Button
                                            variant="primary"
                                            className="w-full h-14 shadow-indigo-500/20 shadow-2xl rounded-2xl"
                                            onClick={handleGenerateOffer}
                                            isLoading={offerMutation.isPending}
                                        >
                                            Generate Offer Protocol
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'interviews' && (
                        <div className="space-y-6 pb-8">
                            {interviewsLoading ? (
                                <div className="text-center py-20 font-black text-slate-300 uppercase tracking-widest text-xs">Synchronizing...</div>
                            ) : !interviews || interviews.length === 0 ? (
                                <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                    <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No Scheduled Engagements</p>
                                    <Button variant="ghost" className="mt-4" onClick={() => setActiveTab('schedule')}>Initialize Schedule</Button>
                                </div>
                            ) : (
                                interviews.map((interview) => (
                                    <div key={interview.id} className="p-8 glass-strong rounded-[2rem] border border-white/60 relative group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <Badge variant="info" className="mb-4 uppercase tracking-[0.2em] text-[8px]">{interview.type} protocol</Badge>
                                                <h4 className="text-xl font-black text-slate-900 tracking-tighter">
                                                    Interviewer: {interview.interviewer?.firstName} {interview.interviewer?.lastName}
                                                </h4>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                                                    {new Date(interview.scheduledAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <Badge variant={interview.status === 'completed' ? 'success' : 'warning'}>
                                                {interview.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                        {interview.feedback && (
                                            <div className="p-4 bg-white/40 rounded-2xl text-xs text-slate-700 italic border border-white/60">
                                                "{interview.feedback}"
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="pb-8 max-w-2xl mx-auto">
                            <form onSubmit={handleSchedule} className="space-y-8 glass p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Engagement Vector (Interviewer)</label>
                                    <select
                                        required
                                        value={scheduleData.interviewerId}
                                        onChange={(e) => setScheduleData({ ...scheduleData, interviewerId: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 text-sm focus:ring-4 focus:ring-indigo-100 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Select Interviewer</option>
                                        {employees?.data?.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.designation})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temporal Alignment</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={scheduleData.scheduledAt}
                                            onChange={(e) => setScheduleData({ ...scheduleData, scheduledAt: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 text-sm focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Type</label>
                                        <select
                                            value={scheduleData.type}
                                            onChange={(e) => setScheduleData({ ...scheduleData, type: e.target.value as InterviewType })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-900 text-sm focus:ring-4 focus:ring-indigo-100 outline-none transition-all appearance-none"
                                        >
                                            <option value="screening">Screening</option>
                                            <option value="technical">Technical</option>
                                            <option value="behavioral">Behavioral</option>
                                            <option value="final">Final</option>
                                        </select>
                                    </div>
                                </div>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-full h-16 shadow-2xl shadow-indigo-500/20 rounded-3xl"
                                    isLoading={scheduleMutation.isPending}
                                >
                                    Confirm Engagement
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};
