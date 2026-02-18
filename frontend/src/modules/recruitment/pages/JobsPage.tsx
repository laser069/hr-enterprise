import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useJobs, useCreateJob, useCloseJob } from '../hooks/useRecruitment';
import { useDepartments } from '../../departments/hooks/useDepartment';
import type { JobStatus } from '../types';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { Card } from '../../../shared/components/ui/Card';

const jobStatuses: JobStatus[] = ['published', 'closed', 'draft'];

export default function JobsPage() {
  const [status, setStatus] = useState<JobStatus | ''>('');
  const { data: jobs, isLoading } = useJobs();
  const { data: departments } = useDepartments();
  
  const createMutation = useCreateJob();
  const closeMutation = useCloseJob();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    departmentId: '',
    openings: 1,
  });

  const handleCreate = async () => {
    await createMutation.mutateAsync(newJob);
    setShowCreateModal(false);
    setNewJob({
      title: '',
      description: '',
      departmentId: '',
      openings: 1,
    });
  };

  const handleClose = async (id: string) => {
    await closeMutation.mutateAsync(id);
  };

  const getStatusColor = (status: JobStatus) => {
    const colors: Record<JobStatus, 'success' | 'warning' | 'default'> = {
      published: 'success',
      draft: 'warning',
      closed: 'default',
    };
    return colors[status] || 'default';
  };

  // Filter jobs locally since the hook doesn't support params yet
  const filteredJobs = jobs?.filter(j => 
    (!status || j.status === status)
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none drop-shadow-sm">Requisition Pipeline</h1>
          <p className="text-xs text-slate-400 font-black uppercase tracking-[0.3em] mt-6 opacity-70">
            Enterprise Talent Acquisition & Strategic Placement Oversight
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center p-2 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-xl ring-1 ring-white/10">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as JobStatus | '')}
              className="bg-transparent px-8 py-3 text-[10px] font-black text-slate-900 uppercase tracking-widest outline-none cursor-pointer hover:text-indigo-600 transition-colors appearance-none"
            >
              <option value="" className="bg-white">Global Status</option>
              {jobStatuses.map((s) => (
                <option key={s} value={s} className="bg-white">
                  {s} Protocol
                </option>
              ))}
            </select>
          </div>
          <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
            Initialize Posting
          </Button>
        </div>
      </div>

      <Card title="Opportunity Ledger" subtitle="Sequential talent acquisition telemetry" noPadding>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/60">
            <thead className="bg-slate-50/50 backdrop-blur-md">
              <tr>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Opportunity Identifier</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Division</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pipeline Status</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resource Quantum</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocols</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 bg-white/40">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center">
                    <div className="flex justify-center"><div className="animate-spin h-6 w-6 border-2 border-slate-900 border-t-transparent rounded-full"></div></div>
                  </td>
                </tr>
              ) : !filteredJobs || filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center">
                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">No active requisitions found</p>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="group hover:bg-white/80 transition-all duration-500">
                    <td className="px-10 py-8">
                      <div>
                        <p className="text-sm font-black text-slate-900 tracking-tighter leading-none mb-2">{job.title}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-70">
                          PROVISIONED {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-sm font-black text-slate-900 tracking-tighter">
                      {job.department?.name || '-'}
                    </td>
                    <td className="px-10 py-8 whitespace-nowrap">
                      <Badge variant={getStatusColor(job.status)} className="shadow-lg">
                        {job.status}
                      </Badge>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">ALLOCATED NODES:</span>
                         <span className="text-sm font-black text-slate-900 tracking-tighter">{job.openings}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        {job.status === 'published' && (
                          <button
                            onClick={() => handleClose(job.id)}
                            className="p-3 text-amber-500 bg-white/40 hover:bg-white hover:shadow-xl rounded-2xl border border-white/60 transition-all duration-500"
                            title="Terminate Lifecycle"
                            disabled={closeMutation.isPending}
                          >
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        <Link
                          to={`/recruitment/candidates?jobId=${job.id}`}
                          className="p-3 text-indigo-500 bg-white/40 hover:bg-white hover:shadow-xl rounded-2xl border border-white/60 transition-all duration-500"
                          title="Candidate Hub"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </Link>
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
        title="Initialize Requisition"
        size="lg"
      >
        <div className="space-y-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Functional Title *</label>
            <input
              type="text"
              value={newJob.title}
              onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
              className="w-full px-8 py-5 border border-white/60 rounded-3xl text-sm font-black text-slate-900 bg-white/40 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase tracking-widest placeholder:text-slate-300 shadow-inner"
              placeholder="e.g., SENIOR SYSTEMS ARCHITECT"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Allocated Division</label>
               <select
                 value={newJob.departmentId}
                 onChange={(e) => setNewJob({ ...newJob, departmentId: e.target.value })}
                 className="w-full px-8 py-5 border border-white/60 rounded-3xl text-sm font-black text-slate-900 bg-white/40 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer uppercase tracking-widest shadow-inner appearance-none"
               >
                 <option value="" className="bg-white">Global Department</option>
                 {departments?.map((dept) => (
                   <option key={dept.id} value={dept.id} className="bg-white">
                     {dept.name}
                   </option>
                 ))}
               </select>
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Node Count</label>
               <input
                 type="number"
                 value={newJob.openings}
                 onChange={(e) => setNewJob({ ...newJob, openings: Number(e.target.value) })}
                 className="w-full px-8 py-5 border border-white/60 rounded-3xl text-sm font-black text-slate-900 bg-white/40 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase tracking-widest shadow-inner"
                 min={1}
               />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Objective Summary</label>
            <textarea
              value={newJob.description}
              onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
              className="w-full px-8 py-5 border border-white/60 rounded-3xl text-sm font-black text-slate-900 bg-white/40 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase tracking-widest h-48 placeholder:text-slate-300 shadow-inner"
              placeholder="Protocol narrative..."
            />
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
              disabled={!newJob.title || !newJob.departmentId || createMutation.isPending}
            >
              {createMutation.isPending ? 'Provisioning...' : 'Provision Requisition'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
