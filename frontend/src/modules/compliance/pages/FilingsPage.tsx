import { useState } from 'react';
import { useFilings, useCreateFiling, useFileFiling } from '../hooks/useCompliance';
import { useAuthContext } from '../../../core/auth/use-auth-context';
import type { FilingType, FilingStatus } from '../types';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Modal } from '../../../shared/components/ui/Modal';

const filingTypes: FilingType[] = ['PF', 'ESI', 'TDS', 'GST', 'PT'];
const filingStatuses: FilingStatus[] = ['pending', 'filed', 'acknowledged'];

export default function FilingsPage() {
  const { hasPermission } = useAuthContext();
  const [selectedType, setSelectedType] = useState<FilingType | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<FilingStatus | ''>('');
  
  const { data: filings, isLoading } = useFilings();
  
  // Filter filings locally since the hook doesn't support params yet
  const filteredFilings = filings?.filter(f => 
    (!selectedType || f.type === selectedType) && 
    (!selectedStatus || f.status === selectedStatus)
  );
  
  const createMutation = useCreateFiling();
  const fileMutation = useFileFiling();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [selectedFilingId, setSelectedFilingId] = useState<string | null>(null);
  const [receiptNo, setReceiptNo] = useState('');
  
  const [newFiling, setNewFiling] = useState({
    type: 'PF' as FilingType,
    period: '',
    amount: undefined as number | undefined,
    dueDate: '',
    notes: '',
  });

  const canManage = hasPermission('compliance:manage');

  const handleCreate = async () => {
    await createMutation.mutateAsync(newFiling);
    setShowCreateModal(false);
    setNewFiling({
      type: 'PF',
      period: '',
      amount: undefined,
      dueDate: '',
      notes: '',
    });
  };

  const handleFile = async () => {
    if (selectedFilingId) {
      await fileMutation.mutateAsync({ 
        id: selectedFilingId, 
        data: { 
          filedDate: new Date().toISOString(), 
          referenceNumber: receiptNo 
        } 
      });
      setFileModalOpen(false);
      setReceiptNo('');
      setSelectedFilingId(null);
    }
  };


  const openFileModal = (id: string) => {
    setSelectedFilingId(id);
    setFileModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'default'> = {
      acknowledged: 'success',
      filed: 'success',
      pending: 'warning',
    };
    return colors[status] || 'default';
  };

  const isOverdue = (dueDate?: string) => {
    return dueDate ? new Date(dueDate) < new Date() : false;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none drop-shadow-sm">Statutory Pipeline</h1>
          <p className="text-xs text-slate-400 font-black uppercase tracking-[0.3em] mt-6 opacity-70">
            Enterprise Compliance Oversight & Regulatory Telemetry
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-4 p-2 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-xl ring-1 ring-white/10">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as FilingType | '')}
              className="bg-transparent px-6 py-3 text-[10px] font-black text-slate-900 uppercase tracking-widest outline-none cursor-pointer hover:text-indigo-600 transition-colors appearance-none"
            >
              <option value="">All Vectors</option>
              {filingTypes.map((type) => (
                <option key={type} value={type} className="bg-white">{type} Protocol</option>
              ))}
            </select>
            <div className="w-px bg-slate-200/60 my-2" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as FilingStatus | '')}
              className="bg-transparent px-6 py-3 text-[10px] font-black text-slate-900 uppercase tracking-widest outline-none cursor-pointer hover:text-indigo-600 transition-colors appearance-none"
            >
              <option value="">System Status</option>
              {filingStatuses.map((status) => (
                <option key={status} value={status} className="bg-white">
                  {status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          {canManage && (
            <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
              Inject Filing
            </Button>
          )}
        </div>
      </div>

      <Card title="Statutory Ledger" subtitle="Sequential compliance telemetry" noPadding>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/60">
            <thead className="bg-slate-50/50 backdrop-blur-md">
              <tr>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vector</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cycle</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deadline</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Quantum</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 bg-white/40">
              {isLoading ? (
                <tr>
                   <td colSpan={6} className="px-10 py-20 text-center">
                      <div className="flex justify-center"><div className="animate-spin h-6 w-6 border-2 border-slate-900 border-t-transparent rounded-full"></div></div>
                   </td>
                </tr>
              ) : !filteredFilings || filteredFilings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-10 py-20 text-center">
                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">No records found</p>
                  </td>
                </tr>
              ) : (
                filteredFilings.map((filing) => (
                  <tr key={filing.id} className="group hover:bg-white/80 transition-all duration-500">
                    <td className="px-10 py-8 whitespace-nowrap">
                       <span className="inline-flex px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black tracking-widest shadow-lg shadow-slate-900/10">
                          {filing.type}
                       </span>
                    </td>
                    <td className="px-10 py-8 whitespace-nowrap">
                       <span className="text-[11px] font-black text-slate-900 tracking-tighter">{filing.period}</span>
                    </td>
                    <td className="px-10 py-8 whitespace-nowrap">
                       <Badge variant={getStatusColor(filing.status.toLowerCase())} className="shadow-lg">{filing.status}</Badge>
                    </td>
                    <td className="px-10 py-8 whitespace-nowrap">
                       <span className={`text-[10px] font-black uppercase tracking-widest ${isOverdue(filing.dueDate) && filing.status === 'pending' ? 'text-rose-500' : 'text-slate-400'}`}>
                          {new Date(filing.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                       </span>
                    </td>
                    <td className="px-10 py-8 whitespace-nowrap text-[11px] font-black text-slate-900 tracking-tighter">
                       {filing.amount ? `₹${filing.amount.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-10 py-8 whitespace-nowrap text-right">
                       <div className="flex justify-end gap-3">
                          {filing.status === 'pending' && canManage && (
                            <Button variant="ghost" size="sm" onClick={() => openFileModal(filing.id)}>Execute</Button>
                          )}
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
        title="Initialize Filing"
        size="md"
      >
        <div className="space-y-10">
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Vector Protocol</label>
              <select
                value={newFiling.type}
                onChange={(e) => setNewFiling({ ...newFiling, type: e.target.value as FilingType })}
                className="w-full px-8 py-5 border border-white/60 rounded-3xl text-sm font-black text-slate-900 bg-white/40 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer uppercase tracking-widest shadow-inner appearance-none"
              >
                {filingTypes.map((type) => (
                  <option key={type} value={type} className="bg-white">{type} Protocol</option>
                ))}
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Fiscal Cycle</label>
              <input
                type="text"
                value={newFiling.period}
                onChange={(e) => setNewFiling({ ...newFiling, period: e.target.value })}
                className="w-full px-8 py-5 border border-white/60 rounded-3xl text-sm font-black text-slate-900 bg-white/40 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase tracking-widest placeholder:text-slate-300 shadow-inner"
                placeholder="e.g., APR 2024"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Deadline Date</label>
              <input
                type="date"
                value={newFiling.dueDate}
                onChange={(e) => setNewFiling({ ...newFiling, dueDate: e.target.value })}
                className="w-full px-8 py-5 border border-white/60 rounded-3xl text-sm font-black text-slate-900 bg-white/40 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer uppercase tracking-widest shadow-inner"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Quantum (Optional)</label>
              <input
                type="number"
                value={newFiling.amount || ''}
                onChange={(e) => setNewFiling({ ...newFiling, amount: Number(e.target.value) || undefined })}
                className="w-full px-8 py-5 border border-white/60 rounded-3xl text-sm font-black text-slate-900 bg-white/40 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase tracking-widest shadow-inner placeholder:text-slate-300"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex justify-end gap-6 mt-16 pt-10 border-t border-slate-100/50">
            <Button variant="ghost" size="lg" onClick={() => setShowCreateModal(false)}>
              Abort
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="px-12 shadow-2xl shadow-indigo-500/20"
              onClick={handleCreate}
              disabled={!newFiling.period || !newFiling.dueDate || createMutation.isPending}
            >
              {createMutation.isPending ? 'Propagating...' : 'Initialize Protocol'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* File Modal */}
      <Modal
        isOpen={fileModalOpen}
        onClose={() => setFileModalOpen(false)}
        title="Execute Filing"
        size="sm"
      >
        <div className="space-y-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Telemetry Reference Number</label>
            <input
              type="text"
              value={receiptNo}
              onChange={(e) => setReceiptNo(e.target.value)}
              className="w-full px-8 py-5 border border-white/60 rounded-3xl text-sm font-black text-slate-900 bg-white/40 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase tracking-widest placeholder:text-slate-300 shadow-inner"
              placeholder="e.g., REF-990-AX-2"
            />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4 opacity-70 ml-1">
              Finalize protocol via external gateway
            </p>
          </div>

          <div className="flex justify-end gap-6 mt-16 pt-10 border-t border-slate-100/50">
            <Button variant="ghost" size="lg" onClick={() => setFileModalOpen(false)}>
              Abort
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="px-12 shadow-2xl shadow-indigo-500/20"
              onClick={handleFile}
              disabled={!receiptNo || fileMutation.isPending}
            >
              {fileMutation.isPending ? 'Executing...' : 'Execute Protocol'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
