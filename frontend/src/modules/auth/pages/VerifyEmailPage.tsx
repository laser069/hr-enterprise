import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../../core/api/api-client';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        return;
      }

      try {
        await apiClient.get('/auth/verify-email', { params: { token } });
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full p-8 text-center space-y-6 bg-white shadow-2xl rounded-3xl border border-slate-100">
        {status === 'loading' && (
          <>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Verifying...</h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
          </>
        )}
        
        {status === 'success' && (
          <>
            <h2 className="text-2xl font-black text-emerald-600 tracking-tighter">Email Verified!</h2>
            <p className="text-slate-500 font-medium text-sm">Your email has been successfully verified. You can now log in to your account.</p>
            <Button className="w-full rounded-2xl" variant="primary" onClick={() => navigate('/login')}>Go to Login</Button>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="text-2xl font-black text-red-600 tracking-tighter">Verification Failed</h2>
            <p className="text-slate-500 font-medium text-sm">The verification link is invalid, expired, or has already been used.</p>
            <div className="space-y-4">
              <Button className="w-full rounded-2xl" variant="primary" onClick={() => navigate('/login')}>Back to Login</Button>
              <Link to="/forgot-password" title="Resend" className="block text-slate-900 font-bold text-xs uppercase tracking-widest hover:text-slate-700 transition-colors">
                Resend verification email?
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default VerifyEmailPage;
