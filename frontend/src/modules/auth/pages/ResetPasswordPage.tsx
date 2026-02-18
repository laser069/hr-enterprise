import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../core/api/api-client';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!token) {
      setError('Invalid or missing token');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post('/auth/reset-password', { token, newPassword: password });
      navigate('/login');
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full p-8 text-center bg-white shadow-2xl rounded-3xl border border-slate-100">
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Invalid Link</h2>
          <p className="mt-4 text-slate-500 font-medium">The password reset link is invalid or has expired.</p>
          <Button className="mt-8 w-full rounded-2xl" variant="primary" onClick={() => navigate('/login')}>Back to Login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-black text-slate-900 tracking-tighter">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 font-medium">
            Enter your new password below
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold uppercase tracking-widest border border-red-100">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                New Password
              </label>
              <input
                type="password"
                required
                className="w-full px-6 py-4 border border-slate-200 rounded-2xl text-xs font-black text-slate-900 bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all tracking-widest"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                className="w-full px-6 py-4 border border-slate-200 rounded-2xl text-xs font-black text-slate-900 bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all tracking-widest"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full rounded-2xl py-4 shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
