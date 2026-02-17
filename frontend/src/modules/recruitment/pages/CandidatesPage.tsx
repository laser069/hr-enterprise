import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCandidates, useJobs, useMoveCandidateStage, useConvertToEmployee, useDeleteCandidate } from '../hooks/useRecruitment';
import type { CandidateStage, Candidate } from '../types';

const stages: CandidateStage[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED'];

const stageColors: Record<CandidateStage, string> = {
  APPLIED: 'bg-slate-100 text-slate-500 border border-slate-200',
  SCREENING: 'bg-amber-50 text-amber-700 border border-amber-200',
  INTERVIEW: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  OFFERED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  HIRED: 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]',
  REJECTED: 'bg-red-50 text-red-700 border border-red-200',
};

export default function CandidatesPage() {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || '';
  
  const [selectedJob, setSelectedJob] = useState(initialJobId);
  const [selectedStage, setSelectedStage] = useState<CandidateStage | ''>('');
  
  const { data: candidatesResponse, isLoading } = useCandidates({
    jobId: selectedJob || undefined,
    stage: selectedStage || undefined,
  });
  const candidates = candidatesResponse?.data || [];
  const { data: jobs } = useJobs();
  
  const moveStageMutation = useMoveCandidateStage();
  const convertMutation = useConvertToEmployee();
  const deleteMutation = useDeleteCandidate();

  const handleMoveStage = async (id: string, newStage: CandidateStage) => {
    await moveStageMutation.mutateAsync({ id, stage: newStage });
  };

  const handleConvert = async (id: string) => {
    if (window.confirm('Convert this candidate to an employee?')) {
      await convertMutation.mutateAsync(id);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this candidate?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Candidates</h1>
          <p className="text-slate-500 mt-1 font-medium">
            Track and manage job candidates through the hiring pipeline
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-100 bg-white/60 text-slate-900 hover:bg-white"
          >
            <option value="" className="bg-white">All Jobs</option>
            {jobs?.map((job) => (
              <option key={job.id} value={job.id} className="bg-white">
                {job.title}
              </option>
            ))}
          </select>
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value as CandidateStage | '')}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-100 bg-white/60 text-slate-900 hover:bg-white"
          >
            <option value="" className="bg-white">All Stages</option>
            {stages.map((stage) => (
              <option key={stage} value={stage} className="bg-white">
                {stage.charAt(0).toUpperCase() + stage.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pipeline View */}
      <div className="glass p-4 border-slate-200">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {stages.map((stage) => {
            const count = candidates?.filter((c: Candidate) => c.stage === stage).length || 0;
            return (
              <button
                key={stage}
                onClick={() => setSelectedStage(selectedStage === stage ? '' : stage)}
                className={`p-3 rounded-lg text-center transition-all ${
                  selectedStage === stage
                    ? 'ring-2 ring-slate-200 ring-offset-2 ring-offset-white'
                    : ''
                } ${stageColors[stage]}`}
              >
                <p className="text-2xl font-black">{count}</p>
                <p className="text-xs capitalize font-bold opacity-80">{stage}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Candidates Table */}
      <div className="glass overflow-hidden border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-widest">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-widest">
                  Job Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-widest">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-widest">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-widest">
                  Applied
                </th>
                <th className="px-6 py-3 text-right text-xs font-black text-slate-400 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-transparent">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : !candidates || candidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No candidates found
                  </td>
                </tr>
              ) : (
                candidates.map((candidate: Candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                            <span className="text-slate-900 font-black">
                              {candidate.firstName[0]}{candidate.lastName[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">
                            {candidate.firstName} {candidate.lastName}
                          </div>
                          <div className="text-sm text-slate-500">{candidate.email}</div>
                          {candidate.phone && (
                            <div className="text-xs text-slate-500">{candidate.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {candidate.job?.title}
                      {candidate.job?.department && (
                        <p className="text-xs text-slate-500">{candidate.job.department.name}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={candidate.stage}
                        onChange={(e) => handleMoveStage(candidate.id, e.target.value as CandidateStage)}
                        className={`text-xs font-bold rounded px-2 py-1 ${stageColors[candidate.stage as CandidateStage]} bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-200`}
                        disabled={moveStageMutation.isPending}
                      >
                        {stages.map((stage) => (
                          <option key={stage} value={stage} className="bg-white text-slate-900">
                            {stage.charAt(0).toUpperCase() + stage.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 capitalize">
                      {candidate.source || 'Direct'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(candidate.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {candidate.stage === 'HIRED' && (
                        <button
                          onClick={() => handleConvert(candidate.id)}
                          className="text-emerald-500 hover:text-emerald-600 mr-3 transition-colors"
                          disabled={convertMutation.isPending}
                        >
                          Convert to Employee
                        </button>
                      )}
                      {candidate.resumeUrl && (
                        <a
                          href={candidate.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 mr-3 transition-colors"
                        >
                          Resume
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(candidate.id)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
