import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../../core/api/api-client';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setIsSent(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tighter">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 font-medium">
            {isSent 
              ? 'Check your email for the reset link'
              : 'Enter your email to receive a password reset link'}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold uppercase tracking-widest border border-red-100">
            {error}
          </div>
        )}

        {!isSent ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="space-y-3">
                <label htmlFor="email" className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full px-6 py-4 border border-slate-200 rounded-2xl text-xs font-black text-slate-900 bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all tracking-widest"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
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
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center mt-6">
            <Link to="/login" className="font-bold text-slate-900 hover:text-slate-700 transition-colors uppercase tracking-widest text-xs">
              Return to Login
            </Link>
          </div>
        )}

        {!isSent && (
          <div className="text-center mt-4">
            <Link to="/login" className="font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest text-[10px]">
              Back to Login
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
