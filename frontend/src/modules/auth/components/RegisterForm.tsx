import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../../core/auth/auth-service';
import { Button } from '../../../shared/components/ui/Button';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const data = await authService.register({
        email,
        password,
        firstName,
        lastName,
      });
      
      localStorage.setItem('accessToken', data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-emerald-500/20 selection:text-emerald-900">
      {/* Ambient Depth Elements */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-100/40 rounded-full blur-[150px] pointer-events-none z-0 animate-pulse delay-1000"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-violet-100/40 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900 rounded-[2rem] mb-6 shadow-2xl shadow-slate-900/20 group hover:scale-110 transition-transform duration-500">
            <span className="text-white text-3xl font-black tracking-tighter">HR</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-4 drop-shadow-sm">
            Initialize Node
          </h2>
          <p className="text-sm text-slate-500 font-black uppercase tracking-widest opacity-70">
            Join the Enterprise Intelligence Network
          </p>
        </div>

        <div className="glass p-12 border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden backdrop-blur-xl ring-1 ring-black/5">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-2xl bg-red-500/10 p-4 border border-red-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                 <svg className="h-5 w-5 text-red-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                 </svg>
                 <span className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-tight">{error}</span>
              </div>
            )}
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label htmlFor="firstName" className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                    First Denotation
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="w-full px-6 py-4 border border-slate-200 rounded-2xl text-xs font-black text-slate-900 bg-white/60 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase tracking-widest placeholder:text-slate-400"
                    placeholder="JANE"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <label htmlFor="lastName" className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                    Last Denotation
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="w-full px-6 py-4 border border-slate-200 rounded-2xl text-xs font-black text-slate-900 bg-white/60 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase tracking-widest placeholder:text-slate-400"
                    placeholder="DOE"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label htmlFor="email" className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                  Access Identifier
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-6 py-4 border border-slate-200 rounded-2xl text-xs font-black text-slate-900 bg-white/60 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase tracking-widest placeholder:text-slate-400"
                  placeholder="JANE.DOE@ENTERPRISE.COM"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label htmlFor="password" className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                    Security Protocol
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full px-6 py-4 border border-slate-200 rounded-2xl text-xs font-black text-slate-900 bg-white/60 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase tracking-widest placeholder:text-slate-400"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-3">
                  <label htmlFor="confirmPassword" className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                    Confirm Protocol
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="w-full px-6 py-4 border border-slate-200 rounded-2xl text-xs font-black text-slate-900 bg-white/60 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase tracking-widest placeholder:text-slate-400"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                variant="primary"
                className="w-full rounded-2xl py-5 shadow-xl shadow-slate-900/20"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Provisioning Node...
                  </span>
                ) : (
                  'Establish Core Access'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-200 text-center">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
              Existing identity?{' '}
              <Link
                to="/login"
                className="text-slate-900 hover:text-slate-700 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
        
        <p className="mt-10 text-center text-[9px] text-slate-400 font-black uppercase tracking-[0.3em]">
          &copy; 2026 HR ENTERPRISE &bull; SECURE DEPLOYMENT
        </p>
      </div>
    </div>
  );
}
