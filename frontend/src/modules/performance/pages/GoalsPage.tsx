import { useState } from 'react';
import { useGoals, useCreateGoal, useUpdateGoalProgress, useDeleteGoal } from '../hooks/usePerformance';
import { useEmployees } from '../../employees/hooks/useEmployee';
import type { GoalStatus } from '../types';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Modal } from '../../../shared/components/ui/Modal';

const goalStatuses: GoalStatus[] = ['draft', 'active', 'completed', 'cancelled'];

const statusColors: Record<GoalStatus, 'success' | 'warning' | 'default' | 'danger'> = {
  completed: 'success',
  active: 'warning',
  draft: 'default',
  cancelled: 'danger',
};

export default function GoalsPage() {
  const [statusFilter, setStatusFilter] = useState<GoalStatus | ''>('');
  const { data: goals, isLoading } = useGoals();
  const { data: employees } = useEmployees({ limit: 100 });
  
  const createMutation = useCreateGoal();
  const updateProgressMutation = useUpdateGoalProgress();
  const deleteMutation = useDeleteGoal();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    employeeId: '',
    title: '',
    description: '',
    targetValue: 100,
    startDate: '',
    endDate: '',
  });

  const handleCreate = async () => {
    await createMutation.mutateAsync(newGoal);
    setShowCreateModal(false);
    setNewGoal({
      employeeId: '',
      title: '',
      description: '',
      targetValue: 100,
      startDate: '',
      endDate: '',
    });
  };

  const handleProgressUpdate = async (id: string, current: number) => {
    const newValue = prompt('Enter new achieved value:', String(current));
    if (newValue !== null) {
      const val = Number(newValue);
      if (!isNaN(val)) {
        await updateProgressMutation.mutateAsync({ id, achievedValue: val });
      }
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the goal: "${title}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const filteredGoals = goals?.filter(g => 
    (!statusFilter || g.status === statusFilter)
  ) || [];

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
           <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none drop-shadow-sm">Objectives Ledger</h1>
           <p className="text-xs text-slate-400 font-black uppercase tracking-[0.3em] mt-6 opacity-70">
             Set, manage and track strategic Key Performance Indicators (KPIs)
           </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center p-2 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-xl ring-1 ring-white/10">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as GoalStatus | '')}
              className="bg-transparent px-8 py-3 text-[10px] font-black text-slate-900 uppercase tracking-widest outline-none cursor-pointer hover:text-indigo-600 transition-colors appearance-none"
            >
              <option value="" className="bg-white">Global Status</option>
              {goalStatuses.map((s) => (
                <option key={s} value={s} className="bg-white">{s.replace('_', ' ')} Protocol</option>
              ))}
            </select>
          </div>
          <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
             Define Goal
          </Button>
        </div>
      </div>

      <Card title="Objective Repository" subtitle="Sequential performance telemetry" noPadding>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/60">
            <thead className="bg-slate-50/50 backdrop-blur-md">
              <tr>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Objective</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Associate</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vector Progress</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lifecycle</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocols</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 bg-white/40">
              {isLoading ? (
                <tr><td colSpan={5} className="px-10 py-20 text-center animate-pulse text-slate-300 font-black uppercase tracking-widest text-xs">Accessing Records...</td></tr>
              ) : filteredGoals.length === 0 ? (
                <tr><td colSpan={5} className="px-10 py-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">No objective records found</td></tr>
              ) : (
                filteredGoals.map((goal) => {
                  const percentage = Math.round((goal.achievedValue / goal.targetValue) * 100);
                  return (
                    <tr key={goal.id} className="group hover:bg-white/80 transition-all duration-500">
                      <td className="px-10 py-8">
                        <div>
                          <p className="text-sm font-black text-slate-900 tracking-tighter leading-none mb-2">{goal.title}</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest opacity-60 line-clamp-1 max-w-xs">{goal.description}</p>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                         <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[9px] font-black uppercase tracking-tighter">
                             {goal.employee?.firstName?.[0]}{goal.employee?.lastName?.[0]}
                          </div>
                          <span className="text-xs font-black text-slate-900 tracking-tighter">{goal.employee?.firstName} {goal.employee?.lastName}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="w-48">
                          <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            <span>{goal.achievedValue} / {goal.targetValue}</span>
                            <span className="text-slate-900">{percentage}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden p-[1px] border border-white">
                             <div 
                                className="h-full bg-slate-900 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                             />
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <Badge variant={statusColors[goal.status]} className="shadow-lg">{goal.status.replace('_', ' ')}</Badge>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          {goal.status !== 'completed' && goal.status !== 'cancelled' && (
                            <button
                              onClick={() => handleProgressUpdate(goal.id, goal.achievedValue)}
                              className="p-3 text-indigo-500 bg-white/40 hover:bg-white hover:shadow-xl rounded-2xl border border-white/60 transition-all duration-500"
                              title="Update Progress"
                            >
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(goal.id, goal.title)}
                            className="p-3 text-rose-500 bg-white/40 hover:bg-rose-50 hover:shadow-xl rounded-2xl border border-white/60 transition-all duration-500"
                            title="Terminate Goal"
                          >
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Define Objective"
        size="lg"
      >
        <div className="space-y-10">
          <div className="grid grid-cols-1 gap-10">
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Assigned Associate</label>
               <select
                 value={newGoal.employeeId}
                 onChange={(e) => setNewGoal({ ...newGoal, employeeId: e.target.value })}
                 className="w-full px-8 py-5 border border-white/60 rounded-3xl text-sm font-black text-slate-900 bg-white/40 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer uppercase tracking-widest shadow-inner appearance-none"
               >
                 <option value="" className="bg-white">Select Associate</option>
                 {employees?.data?.map((emp) => (
                   <option key={emp.id} value={emp.id} className="bg-white">{emp.firstName} {emp.lastName}</option>
                 ))}
               </select>
            </div>
            
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Objective Identifier</label>
               <input
                 type="text"
                 value={newGoal.title}
                 onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                 className="w-full px-8 py-5 border border-white/60 rounded-3xl text-sm font-black text-slate-900 bg-white/40 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase tracking-widest placeholder:text-slate-300 shadow-inner"
                 placeholder="e.g., Q3 REVENUE GROWTH"
               />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Contextual Description</label>
            <textarea
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              className="w-full px-8 py-5 border border-white/60 rounded-3xl text-sm font-black text-slate-900 bg-white/40 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase tracking-widest h-32 placeholder:text-slate-300 shadow-inner"
              placeholder="Primary success criteria..."
            />
          </div>

          <div className="grid grid-cols-3 gap-10">
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Target Magnitude</label>
               <input
                 type="number"
                 value={newGoal.targetValue}
                 onChange={(e) => setNewGoal({ ...newGoal, targetValue: Number(e.target.value) })}
                 className="w-full px-8 py-5 border border-white/60 rounded-3xl text-sm font-black text-slate-900 bg-white/40 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase tracking-widest shadow-inner"
               />
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Commencement</label>
               <input
                 type="date"
                 value={newGoal.startDate}
                 onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                 className="w-full px-8 py-5 border border-white/60 rounded-3xl text-sm font-black text-slate-900 bg-white/40 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase tracking-widest shadow-inner cursor-pointer"
               />
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Termination</label>
               <input
                 type="date"
                 value={newGoal.endDate}
                 onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value })}
                 className="w-full px-8 py-5 border border-white/60 rounded-3xl text-sm font-black text-slate-900 bg-white/40 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase tracking-widest shadow-inner cursor-pointer"
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
              disabled={!newGoal.employeeId || !newGoal.title || createMutation.isPending}
            >
              {createMutation.isPending ? 'Provisioning...' : 'Establish Objective'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
