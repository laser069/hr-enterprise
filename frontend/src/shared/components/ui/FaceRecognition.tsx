import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

interface FaceRecognitionProps {
    onVerify: (descriptor: number[]) => void;
    onError: (error: string) => void;
    isLoading?: boolean;
}

const FaceRecognition: React.FC<FaceRecognitionProps> = ({ onVerify, onError, isLoading }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);

    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models';
                console.log('[FaceRecognition] Loading models from:', MODEL_URL);

                // Track progress
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                ]);

                console.log('[FaceRecognition] All models loaded successfully');
                setModelsLoaded(true);
            } catch (err) {
                console.error('[FaceRecognition] Error loading models:', err);
                const errorMessage = err instanceof Error ? err.message : String(err);
                onError(`Model initialization failed: ${errorMessage}. Check if all 3 manifest JSONs and their shard files are in /public/models/`);
            }
        };
        loadModels();
    }, [onError]);

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setCameraActive(true);
                }
            })
            .catch((err) => {
                console.error('Error accessing camera:', err);
                onError('Camera access denied or not available.');
            });
    };

    useEffect(() => {
        if (modelsLoaded) {
            startVideo();
        }
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [modelsLoaded]);

    const handleCapture = async () => {
        if (!videoRef.current) return;

        const detections = await faceapi.detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceDescriptor();

        if (detections) {
            onVerify(Array.from(detections.descriptor));
        } else {
            onError('No face detected. Please position yourself clearly in front of the camera.');
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 p-6 glass-strong rounded-[2.5rem] border border-white/20">
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-900 shadow-2xl ring-1 ring-white/10">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover mirror"
                />
                {!cameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-black uppercase tracking-widest text-[10px]">
                        {modelsLoaded ? 'Initializing Camera...' : 'Loading Models...'}
                    </div>
                )}
                {cameraActive && (
                    <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-3xl pointer-events-none animate-pulse"></div>
                )}
            </div>

            <button
                onClick={handleCapture}
                disabled={!cameraActive || isLoading}
                className="w-full py-6 bg-white hover:bg-slate-50 text-slate-900 font-black uppercase tracking-[0.4em] text-[11px] rounded-2xl transition-all active:scale-95 disabled:opacity-50 shadow-xl border border-white/80"
            >
                {isLoading ? 'VERIFYING...' : 'CAPTURE & VERIFY'}
            </button>

            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-60">
                Position your face within the frame
            </p>
        </div>
    );
};

export default FaceRecognition;
