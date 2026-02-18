import { useState } from 'react';
import { useReviews, useCreateReview, useSubmitReview, useAcknowledgeReview } from '../hooks/usePerformance';
import { useAuthContext } from '../../../core/auth/use-auth-context';
import { useEmployees } from '../../employees/hooks/useEmployee';
import type { ReviewStatus, CreateReviewDto } from '../types';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Modal } from '../../../shared/components/ui/Modal';

const reviewStatuses: ReviewStatus[] = ['draft', 'submitted', 'acknowledged'];

const statusColors: Record<ReviewStatus, 'success' | 'warning' | 'default'> = {
  acknowledged: 'success',
  submitted: 'success',
  draft: 'warning',
};

export default function ReviewsPage() {
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | ''>('');
  const { user } = useAuthContext();
  const { data: reviews, isLoading } = useReviews();
  const { data: employees } = useEmployees({ limit: 100 });
  
  const createMutation = useCreateReview();
  const submitMutation = useSubmitReview();
  const acknowledgeMutation = useAcknowledgeReview();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReview, setNewReview] = useState({
    employeeId: '',
    reviewPeriod: '',
    rating: 3,
    comments: '',
    strengths: '',
    improvements: '',
  });

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      ...newReview,
      reviewerId: user?.id || '',
      overallRating: Number(newReview.rating),
      reviewPeriodStart: new Date().toISOString(),
      reviewPeriodEnd: new Date().toISOString(),
      comments: newReview.comments,
      strengths: newReview.strengths,
      improvements: newReview.improvements
    } as any);
    setShowCreateModal(false);
    setNewReview({
      employeeId: '',
      reviewPeriod: '',
      rating: 3,
      comments: '',
      strengths: '',
      improvements: '',
    });
  };

  const handleSubmit = async (id: string) => {
    await submitMutation.mutateAsync(id);
  };

  const handleAcknowledge = async (id: string) => {
    await acknowledgeMutation.mutateAsync(id);
  };

  const filteredReviews = reviews?.filter(r => 
    (!statusFilter || r.status === statusFilter)
  ) || [];

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
           <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none drop-shadow-sm">Appraisal Ledger</h1>
           <p className="text-xs text-slate-400 font-black uppercase tracking-[0.3em] mt-6 opacity-70">
             Lifecycle management for employee evaluations and 360° feedback
           </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center p-2 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-xl ring-1 ring-white/10">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReviewStatus | '')}
              className="bg-transparent px-8 py-3 text-[10px] font-black text-slate-900 uppercase tracking-widest outline-none cursor-pointer hover:text-indigo-600 transition-colors appearance-none"
            >
              <option value="" className="bg-white">Global Status</option>
              {reviewStatuses.map((s) => (
                <option key={s} value={s} className="bg-white">{s} Protocol</option>
              ))}
            </select>
          </div>
          <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
             Initiate Review
          </Button>
        </div>
      </div>

      <Card title="Review Registry" subtitle="Sequential performance telemetry" noPadding>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/60">
            <thead className="bg-slate-50/50 backdrop-blur-md">
              <tr>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Period</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rating</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocols</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 bg-white/40">
              {isLoading ? (
                <tr><td colSpan={5} className="px-10 py-20 text-center animate-pulse text-slate-300 font-black uppercase tracking-widest text-xs">Accessing Records...</td></tr>
              ) : filteredReviews.length === 0 ? (
                <tr><td colSpan={5} className="px-10 py-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">No appraisal records found</td></tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review.id} className="group hover:bg-white/80 transition-all duration-500">
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black uppercase tracking-tighter">
                           {review.employee?.firstName?.[0]}{review.employee?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 tracking-tighter leading-none mb-1">{review.employee?.firstName} {review.employee?.lastName}</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest opacity-60">ID: {review.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-xs font-black text-slate-900 tracking-widest uppercase">
                      {new Date(review.reviewPeriodStart).toLocaleDateString()} - {new Date(review.reviewPeriodEnd).toLocaleDateString()}
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">{review.overallRating || '-'}</span>
                        <div className="flex text-amber-500 text-[10px]">
                          {'★'.repeat(Math.round(review.overallRating || 0))}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <Badge variant={statusColors[review.status]} className="shadow-lg">{review.status}</Badge>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                        {review.status === 'draft' && (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest"
                            onClick={() => handleSubmit(review.id)}
                            disabled={submitMutation.isPending}
                          >
                            Submit
                          </Button>
                        )}
                        {review.status === 'submitted' && (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 border-none"
                            onClick={() => handleAcknowledge(review.id)}
                            disabled={acknowledgeMutation.isPending}
                          >
                            Acknowledge
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900"
                          onClick={() => alert('Detail stream access coming soon')}
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Initiate Appraisal"
        size="lg"
      >
        <div className="space-y-10">
          <div className="grid grid-cols-1 gap-10">
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Subject Associate</label>
               <select
                 value={newReview.employeeId}
                 onChange={(e) => setNewReview({ ...newReview, employeeId: e.target.value })}
                 className="w-full px-8 py-5 border border-white/60 rounded-3xl text-sm font-black text-slate-900 bg-white/40 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer uppercase tracking-widest shadow-inner appearance-none"
               >
                 <option value="" className="bg-white">Select Associate</option>
                 {employees?.data?.map((emp) => (
                   <option key={emp.id} value={emp.id} className="bg-white">{emp.firstName} {emp.lastName}</option>
                 ))}
               </select>
            </div>
            
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Appraisal Period</label>
               <input
                 type="text"
                 value={newReview.reviewPeriod}
                 onChange={(e) => setNewReview({ ...newReview, reviewPeriod: e.target.value })}
                 className="w-full px-8 py-5 border border-white/60 rounded-3xl text-sm font-black text-slate-900 bg-white/40 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase tracking-widest placeholder:text-slate-300 shadow-inner"
                 placeholder="e.g., ANNUAL REVIEW 2024"
               />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Merit Rating</label>
               <span className="text-2xl font-black text-slate-900">{newReview.rating} <span className="text-xs text-slate-400 font-black uppercase tracking-widest ml-1">/ 5.0</span></span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={newReview.rating}
              onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
              className="w-full accent-slate-900 h-2 bg-slate-100 rounded-full appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Qualitative Commentary</label>
            <textarea
              value={newReview.comments}
              onChange={(e) => setNewReview({ ...newReview, comments: e.target.value })}
              className="w-full px-8 py-5 border border-white/60 rounded-3xl text-sm font-black text-slate-900 bg-white/40 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase tracking-widest h-32 placeholder:text-slate-300 shadow-inner"
              placeholder="Narrative summary..."
            />
          </div>

          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Core Strengths</label>
               <textarea
                 value={newReview.strengths}
                 onChange={(e) => setNewReview({ ...newReview, strengths: e.target.value })}
                 className="w-full px-8 py-5 border border-white/60 rounded-3xl text-sm font-black text-slate-900 bg-white/40 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase tracking-widest h-24 placeholder:text-slate-300 shadow-inner"
                 placeholder="Competencies..."
               />
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Evolution Vectors</label>
               <textarea
                 value={newReview.improvements}
                 onChange={(e) => setNewReview({ ...newReview, improvements: e.target.value })}
                 className="w-full px-8 py-5 border border-white/60 rounded-3xl text-sm font-black text-slate-900 bg-white/40 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase tracking-widest h-24 placeholder:text-slate-300 shadow-inner"
                 placeholder="Growth areas..."
               />
            </div>
          </div>

          <div className="flex justify-end gap-6 mt-16 pt-10 border-t border-slate-100/50">
            <Button variant="ghost" size="lg" onClick={() => setShowCreateModal(false)}>
              Abort Protocol
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="px-12 shadow-2xl shadow-indigo-500/20"
              onClick={handleCreate}
              disabled={!newReview.employeeId || !newReview.reviewPeriod || createMutation.isPending}
            >
              {createMutation.isPending ? 'Processing...' : 'Provision Appraisal'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
