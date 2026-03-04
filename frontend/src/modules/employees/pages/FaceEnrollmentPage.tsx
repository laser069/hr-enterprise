import React, { useState } from 'react';
import { useAuthContext } from '../../../core/auth/use-auth-context';
import { Card } from '../../../shared/components/ui/Card';
import FaceRecognition from '../../../shared/components/ui/FaceRecognition';
import { attendanceApi } from '../../attendance/services/attendance.api';

export default function FaceEnrollmentPage() {
    const { user } = useAuthContext();
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleEnroll = async (descriptor: number[]) => {
        if (!user?.employeeId) return;

        setIsEnrolling(true);
        setMessage(null);
        try {
            await attendanceApi.enrollFace(user.employeeId, descriptor);
            setMessage({ type: 'success', text: 'Biometric profile registered successfully!' });
        } catch (err) {
            console.error('Enrollment failed:', err);
            setMessage({ type: 'error', text: 'Failed to register biometric profile. Please try again.' });
        } finally {
            setIsEnrolling(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-10 py-10">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Biometric Enrollment</h1>
                <p className="text-xs text-slate-400 font-black uppercase tracking-[0.3em]">Register your identity for secure attendance tracking</p>
            </div>

            <Card title="Face Scan" subtitle="Capturing 128-point biometric signature">
                <div className="space-y-8">
                    {message && (
                        <div className={`p-6 rounded-[1.5rem] border font-black text-[11px] uppercase tracking-widest text-center shadow-xl ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <FaceRecognition
                        onVerify={handleEnroll}
                        onError={(err) => setMessage({ type: 'error', text: err })}
                        isLoading={isEnrolling}
                    />
                </div>
            </Card>

            <div className="glass-strong p-8 rounded-[2rem] border border-white/20">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Privacy Note</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    Your biometric data is converted into a mathematical descriptor (a list of numbers) and stored securely.
                    Original images are never saved to our servers. This signature is used exclusively for identity verification
                    during attendance protocols.
                </p>
            </div>
        </div>
    );
}
