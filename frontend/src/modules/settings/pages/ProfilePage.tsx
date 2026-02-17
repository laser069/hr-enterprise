import { useState } from 'react';
import { useAuthContext } from '../../../core/auth/use-auth-context';
import { useUpdateUser } from '../../users/hooks/useUsers';
import { Badge } from '../../../shared/components/ui/Badge';
import { Card } from '../../../shared/components/ui/Card';

export default function ProfilePage() {
  const { user } = useAuthContext();
  const updateUser = useUpdateUser();
  const [isEditing, setIsEditing] = useState(false);
  
  // Local state for form fields
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });

  const handleSave = async () => {
    if (!user?.id) return;
    try {
      await updateUser.mutateAsync({
        id: user.id,
        data: {
          email: formData.email,
        },
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none drop-shadow-sm">Identity Matrix</h1>
          <p className="text-sm text-slate-400 font-black uppercase tracking-[0.3em] mt-6 opacity-70 flex items-center gap-3">
            <span className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(99,102,241,0.5)]"></span>
            Personal core telemetry & security protocols
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Avatar & Quick Stats */}
        <div className="lg:col-span-1 space-y-10">
          <Card className="text-center py-12">
            <div className="relative inline-block group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative h-40 w-40 rounded-full bg-white/20 text-indigo-900 flex items-center justify-center border-4 border-white/60 shadow-2xl overflow-hidden backdrop-blur-xl mx-auto">
                <span className="text-5xl font-black tracking-tighter">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <button className="absolute bottom-2 right-2 p-3 bg-white border border-slate-200 rounded-xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            
            <h2 className="mt-8 text-2xl font-black text-slate-900 tracking-tighter">{user?.firstName} {user?.lastName}</h2>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2 opacity-70">{user?.roleName || 'Consultant'}</p>
            
            <div className="mt-10 pt-10 border-t border-slate-100 flex justify-center gap-6">
              <div className="text-center">
                <div className="text-lg font-black text-slate-900 tracking-tighter">84</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Trust Score</div>
              </div>
              <div className="w-px h-8 bg-slate-100"></div>
              <div className="text-center">
                <div className="text-lg font-black text-slate-900 tracking-tighter">12</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Certificates</div>
              </div>
               <div className="w-px h-8 bg-slate-100"></div>
              <div className="text-center">
                <div className="text-lg font-black text-slate-900 tracking-tighter">Active</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Node Status</div>
              </div>
            </div>
          </Card>

          <Card title="Operational Status" subtitle="Access & privilege layer">
             <div className="space-y-6 pt-4">
                <div className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                   <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Primary Node</span>
                   <Badge variant="success" className="font-black text-[9px] uppercase tracking-widest">Verified</Badge>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                   <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Access Level</span>
                   <span className="text-xs font-black text-slate-900 tracking-tighter">{user?.roleName}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                   <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee ID</span>
                   <span className="text-xs font-black text-slate-900 font-mono tracking-tighter">{user?.employeeId || 'N/A'}</span>
                </div>
             </div>
          </Card>
        </div>

        {/* Right Column: Profile Form & Security */}
        <div className="lg:col-span-2 space-y-10">
          <Card 
            title="Registry Data" 
            subtitle="Core operational identifiers"
            action={
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200"
              >
                {updateUser.isPending ? 'Syncing...' : isEditing ? 'Push Changes' : 'Override Protocol'}
              </button>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registry Designation (Email)</label>
                <input 
                  type="email" 
                  value={formData.email}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all font-black text-slate-900 tracking-tighter disabled:opacity-50"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Network ID (User ID)</label>
                <input 
                  type="text" 
                  value={user?.id || ''} 
                  disabled 
                  className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl px-6 py-5 font-mono text-xs text-slate-400 cursor-not-allowed tracking-tighter"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Genetic Identifier (First Name)</label>
                <input 
                  type="text" 
                  value={formData.firstName}
                  disabled={!isEditing}
                   onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all font-black text-slate-900 tracking-tighter disabled:opacity-50"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lineage Segment (Last Name)</label>
                <input 
                  type="text" 
                  value={formData.lastName}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all font-black text-slate-900 tracking-tighter disabled:opacity-50"
                />
              </div>
            </div>
            {isEditing && (
              <div className="mt-8 flex justify-end gap-4 p-6 bg-amber-50 rounded-[2rem] border border-amber-100">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest self-center flex-1">Warning: Protocol override will be logged in audit history</p>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all"
                >
                  Abort
                </button>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <Card title="Encryption Layer" subtitle="Password & token rotation">
               <div className="space-y-8 pt-4">
                  <div className="flex items-center justify-between">
                     <div>
                        <div className="text-xs font-black text-slate-900 tracking-tighter">System Password</div>
                         <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Last rotated 42 days ago</div>
                     </div>
                     <button className="px-4 py-2 bg-slate-100 text-[9px] font-black text-slate-900 uppercase tracking-[0.2em] rounded-lg hover:bg-slate-200 transition-all">Rotate</button>
                  </div>
                  <div className="flex items-center justify-between">
                     <div>
                        <div className="text-xs font-black text-slate-900 tracking-tighter">Two-Factor Encryption</div>
                         <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: Operational</div>
                     </div>
                     <button className="px-4 py-2 bg-slate-100 text-[9px] font-black text-slate-900 uppercase tracking-[0.2em] rounded-lg hover:bg-slate-200 transition-all">Config</button>
                  </div>
               </div>
            </Card>

            <Card title="Telemetry Stream" subtitle="Recent node activity">
               <div className="space-y-8 pt-4">
                  <div className="flex gap-6 items-start">
                     <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full mt-1 px-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
                     <div>
                        <div className="text-xs font-black text-slate-900 tracking-tighter leading-tight">Successful uplink from 192.168.1.1</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">2 hours ago</div>
                     </div>
                  </div>
                  <div className="flex gap-6 items-start">
                     <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full mt-1 px-1.5 shadow-[0_0_15px_rgba(99,102,241,0.3)]"></div>
                     <div>
                        <div className="text-xs font-black text-slate-900 tracking-tighter leading-tight">Identity Designation Modified</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Yesterday</div>
                     </div>
                  </div>
                  <div className="flex gap-6 items-start opacity-50">
                     <div className="w-2.5 h-2.5 bg-slate-300 rounded-full mt-1 px-1.5"></div>
                     <div>
                        <div className="text-xs font-black text-slate-900 tracking-tighter leading-tight">Protocol Seed Verified</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Last week</div>
                     </div>
                  </div>
               </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
