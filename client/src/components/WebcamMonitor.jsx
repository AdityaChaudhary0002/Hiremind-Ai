import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from '@vladmandic/face-api';
import { Activity, Camera, CameraOff, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";

const WebcamMonitor = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [confidence, setConfidence] = useState(0);
    const [status, setStatus] = useState("Initializing AI...");
    const [cameraActive, setCameraActive] = useState(true);
    const intervalRef = useRef(null);

    // Load Models
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
                ]);
                setIsModelLoaded(true);
                setStatus("AI Models Ready");
            } catch (error) {
                console.error("Failed to load models:", error);
                setStatus("AI Calibration Failed (Simulation Mode)");
                // Fallback simulation
                startSimulation();
            }
        };
        loadModels();
        return () => clearInterval(intervalRef.current);
    }, []);

    const startSimulation = () => {
        intervalRef.current = setInterval(() => {
            // Simulate confidence fluctuation (70-95%)
            const simConf = Math.floor(Math.random() * (95 - 70 + 1) + 70);
            setConfidence(simConf);
        }, 2000);
    };

    // Constant Detection Loop
    useEffect(() => {
        if (!isModelLoaded || !cameraActive) return;

        intervalRef.current = setInterval(async () => {
            if (webcamRef.current && webcamRef.current.video.readyState === 4) {
                const video = webcamRef.current.video;

                // Detect Face
                const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                    .withFaceExpressions();

                if (detections) {
                    const expressions = detections.expressions;
                    // Calculate "Confidence" = (Happy + Neutral) - (Fearful + Sad + Angry)
                    // Normalize to 0-100
                    const positive = expressions.happy + expressions.neutral + expressions.surprised;
                    const negative = expressions.sad + expressions.fearful + expressions.angry;

                    let score = (positive / (positive + negative + 0.1)) * 100;
                    if (score > 100) score = 100;
                    if (score < 0) score = 0;

                    setConfidence(prev => Math.round((prev * 0.7) + (score * 0.3))); // Smooth transition
                    status !== "Analyzing..." && setStatus("Analyzing...");
                } else {
                    setStatus("Face Not Detected");
                    setConfidence(prev => Math.max(0, prev - 5));
                }
            }
        }, 500); // Check every 500ms

        return () => clearInterval(intervalRef.current);
    }, [isModelLoaded, cameraActive]);

    const getStatusColor = () => {
        if (confidence > 80) return "text-green-500";
        if (confidence > 50) return "text-yellow-500";
        return "text-red-500";
    };

    if (!cameraActive) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl border border-white/5">
                <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-white/10 text-white/50 hover:text-white" onClick={() => setCameraActive(true)}>
                    <CameraOff className="w-6 h-6" />
                </Button>
            </div>
        )
    }

    return (
        <div className="relative w-full h-full bg-black/80 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden font-mono group">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-2 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] text-white/60 uppercase tracking-wider">REC</span>
                </div>
                <button onClick={() => setCameraActive(false)} className="text-white/40 hover:text-white transition-colors">
                    <Camera className="w-3 h-3" />
                </button>
            </div>

            {/* Video Feed */}
            <div className="relative w-full h-full bg-black">
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover transform scale-x-[-1]" // Mirror
                    videoConstraints={{ width: 320, height: 240, facingMode: "user" }}
                />

                {/* Overlay Stats */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-[10px] text-white/40 mb-0.5">Confidence</div>
                            <div className={`text-lg font-bold leading-none ${getStatusColor()}`}>
                                {confidence}%
                            </div>
                        </div>
                        <div className="text-right">
                            {confidence > 80 ? (
                                <ShieldCheck className="w-4 h-4 text-emerald-500 mb-1 ml-auto" />
                            ) : (
                                <AlertTriangle className="w-4 h-4 text-yellow-500 mb-1 ml-auto" />
                            )}
                            <div className="text-[9px] text-white/40 uppercase">{status}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 w-full">
                <div
                    className={`h-full transition-all duration-500 ${confidence > 80 ? 'bg-emerald-500' : confidence > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${confidence}%` }}
                />
            </div>
        </div>
    );
};

export default WebcamMonitor;
