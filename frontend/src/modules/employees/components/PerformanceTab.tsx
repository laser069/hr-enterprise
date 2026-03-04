import { useFeedback, usePromotions } from '../../performance/hooks/usePerformance';
import { Spinner } from '../../../shared/components/ui/Spinner';
import { format } from 'date-fns';
import { TrendingUp, MessageSquare, Star } from 'lucide-react';

interface PerformanceTabProps {
    employeeId: string;
}

export function PerformanceTab({ employeeId }: PerformanceTabProps) {
    const { data: feedback, isLoading: feedbackLoading } = useFeedback({ employeeId });
    const { data: promotions, isLoading: promotionsLoading } = usePromotions(employeeId);

    if (feedbackLoading || promotionsLoading) return <Spinner />;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Promotion History */}
            <div className="space-y-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <TrendingUp size={18} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-widest">Career Trajectory</h3>
                </div>

                <div className="relative pl-8 space-y-8">
                    <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-100" />

                    {promotions?.length === 0 ? (
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest py-4">No advancement records found</p>
                    ) : (
                        promotions?.map((promo) => (
                            <div key={promo.id} className="relative">
                                <div className="absolute left-[-25px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-indigo-500 shadow-sm" />
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-black text-slate-900 text-sm">{promo.newDesignation}</h4>
                                        <span className="text-[10px] font-bold text-slate-400">
                                            {format(new Date(promo.effectiveDate), 'MMM yyyy')}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        {promo.oldDesignation || 'Initial Entry'} → {promo.newDesignation}
                                    </p>
                                    {promo.notes && (
                                        <p className="mt-3 text-[11px] text-slate-500 leading-relaxed italic border-l-2 border-slate-100 pl-3">
                                            "{promo.notes}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Recent Feedback */}
            <div className="space-y-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <MessageSquare size={18} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-widest">Growth Insights</h3>
                </div>

                <div className="space-y-4">
                    {feedback?.filter(f => f.status === 'completed').length === 0 ? (
                        <div className="p-8 text-center border-2 border-dashed border-slate-50 rounded-3xl">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No feedback finalized</p>
                        </div>
                    ) : (
                        feedback?.filter(f => f.status === 'completed').slice(0, 5).map((f) => (
                            <div key={f.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white transition-all duration-300 group">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center font-black text-[10px] text-slate-900">
                                            {f.reviewer?.firstName?.[0]}{f.reviewer?.lastName?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-900 uppercase">Peer Insight</p>
                                            <p className="text-[9px] text-slate-400 font-bold">{format(new Date(f.createdAt), 'MMMM d, yyyy')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 px-3 py-1 bg-white rounded-full shadow-sm">
                                        <Star size={10} className="text-amber-500 fill-amber-500" />
                                        <span className="text-[10px] font-black">{f.rating}/5</span>
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-600 leading-relaxed">
                                    {f.comments}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
