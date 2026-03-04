import { useState } from 'react';
import { useFeedback, useRequestFeedback, useSubmitFeedback } from '../hooks/usePerformance';
import { useEmployees } from '../../employees/hooks/useEmployee';
import { useAuthContext } from '../../../core/auth/use-auth-context';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Modal } from '../../../shared/components/ui/Modal';
import type { ChangeEvent } from 'react';

export default function FeedbackPage() {
    const { user } = useAuthContext();
    const { data: feedbackReceived } = useFeedback({ employeeId: user?.employeeId });
    const { data: feedbackRequests } = useFeedback({ reviewerId: user?.employeeId });
    const { data: employees } = useEmployees();

    const requestMutation = useRequestFeedback();
    const submitMutation = useSubmitFeedback();

    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
    const [newRequest, setNewRequest] = useState({
        reviewerId: '',
        message: ''
    });

    const [feedbackContent, setFeedbackContent] = useState({
        rating: 5,
        comments: ''
    });

    const handleRequestFeedback = () => {
        if (!user?.employeeId) return;
        requestMutation.mutate({
            ...newRequest,
            employeeId: user.employeeId,
            requesterId: user.employeeId
        }, {
            onSuccess: () => {
                setIsRequestModalOpen(false);
                setNewRequest({ reviewerId: '', message: '' });
            }
        });
    };

    const handleSubmitFeedback = () => {
        if (!selectedFeedback) return;
        submitMutation.mutate({
            id: selectedFeedback.id,
            ...feedbackContent
        }, {
            onSuccess: () => {
                setSelectedFeedback(null);
                setFeedbackContent({ rating: 5, comments: '' });
            }
        });
    };

    return (
        <div className="space-y-12 pb-12">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">360° Feedback</h1>
                    <p className="text-sm text-slate-400 font-black uppercase tracking-[0.3em] mt-6 opacity-70">
                        Multi-rater performance insights & peer alignment
                    </p>
                </div>
                <Button
                    onClick={() => setIsRequestModalOpen(true)}
                    className="h-12 px-8 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-2xl"
                >
                    Request Feedback
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Outgoing Requests (Feedback to Give) */}
                <Card
                    title="Feedback Tasks"
                    subtitle="Reviews requested from you by colleagues"
                    className="glass-strong"
                >
                    <div className="space-y-4">
                        {feedbackRequests?.filter(f => f.status === 'pending').map((request) => (
                            <div key={request.id} className="p-6 rounded-3xl bg-white/40 border border-white/60 flex items-center justify-between group hover:bg-white/80 transition-all duration-500">
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Request From</p>
                                    <p className="text-xl font-black text-slate-900 tracking-tight">
                                        {request.employee?.firstName} {request.employee?.lastName}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-2 italic">"{request.message}"</p>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => setSelectedFeedback(request)}
                                    className="bg-indigo-600 text-white rounded-xl px-6 py-2"
                                >
                                    Provide Feedback
                                </Button>
                            </div>
                        ))}
                        {feedbackRequests?.filter(f => f.status === 'pending').length === 0 && (
                            <div className="text-center py-12 text-slate-400">
                                <p className="font-black uppercase tracking-widest text-[10px]">No pending requests</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Incoming Feedback (Feedback Received) */}
                <Card
                    title="Insight Registry"
                    subtitle="Performance feedback you've received"
                    className="glass-strong"
                >
                    <div className="space-y-4">
                        {feedbackReceived?.filter(f => f.status === 'completed').map((feedback) => (
                            <div key={feedback.id} className="p-6 rounded-3xl bg-white/40 border border-white/60 hover:bg-white/80 transition-all duration-500">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">From Reviewer</p>
                                        <p className="text-lg font-black text-slate-900">{feedback.reviewer?.firstName} {feedback.reviewer?.lastName}</p>
                                    </div>
                                    <Badge variant="info" className="h-8 px-4 rounded-xl text-lg font-black">
                                        {feedback.rating}/5
                                    </Badge>
                                </div>
                                <p className="text-slate-600 leading-relaxed">{feedback.comments}</p>
                            </div>
                        ))}
                        {feedbackReceived?.filter(f => f.status === 'completed').length === 0 && (
                            <div className="text-center py-12 text-slate-400">
                                <p className="font-black uppercase tracking-widest text-[10px]">No feedback recorded yet</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Request Modal */}
            <Modal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                title="Request Feedback Protocol"
            >
                <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Select Colleague</label>
                        <select
                            className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50/50 px-6 focus:ring-2 focus:ring-slate-900 transition-all outline-none appearance-none uppercase tracking-widest text-[11px] font-black"
                            value={newRequest.reviewerId}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewRequest({ ...newRequest, reviewerId: e.target.value })}
                        >
                            <option value="">SELECT PROTOCOL TARGET</option>
                            {employees?.data && employees.data.map((e: any) => (
                                <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Engagement Message</label>
                        <textarea
                            className="w-full h-32 rounded-3xl border-slate-200 bg-slate-50/50 p-4 focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                            placeholder="Why are you requesting this feedback?"
                            value={newRequest.message}
                            onChange={(e) => setNewRequest({ ...newRequest, message: e.target.value })}
                        />
                    </div>
                    <Button
                        onClick={handleRequestFeedback}
                        className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest"
                        isLoading={requestMutation.isPending}
                    >
                        Initialize Request
                    </Button>
                </div>
            </Modal>

            {/* Submit Feedback Modal */}
            <Modal
                isOpen={!!selectedFeedback}
                onClose={() => setSelectedFeedback(null)}
                title={`Provide Feedback for ${selectedFeedback?.employee?.firstName}`}
            >
                <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Intensity Rating (1-5)</label>
                        <div className="flex gap-4">
                            {[1, 2, 3, 4, 5].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setFeedbackContent({ ...feedbackContent, rating: num })}
                                    className={`flex-1 h-14 rounded-2xl font-black text-xl transition-all ${feedbackContent.rating === num
                                        ? 'bg-slate-900 text-white shadow-xl scale-110'
                                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Feedback Payload</label>
                        <textarea
                            className="w-full h-40 rounded-3xl border-slate-200 bg-slate-50/50 p-6 focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                            placeholder="Share your detailed insights..."
                            value={feedbackContent.comments}
                            onChange={(e) => setFeedbackContent({ ...feedbackContent, comments: e.target.value })}
                        />
                    </div>
                    <Button
                        onClick={handleSubmitFeedback}
                        className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl"
                        isLoading={submitMutation.isPending}
                    >
                        Transmit Feedback
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
