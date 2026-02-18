import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { Upload, FileText, Scan, ShieldCheck, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MOTION, STYLES } from '@/lib/design-system';
import Logo from '@/components/ui/logo';
import { useNavigate } from 'react-router-dom';

const ResumeScan = () => {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // State
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, scanning, complete, error
    const [scanProgress, setScanProgress] = useState(0);
    const [analysis, setAnalysis] = useState(null);

    // Handlers
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'application/pdf') {
            startScan(droppedFile);
        } else {
            alert("Only PDF files are supported for intelligence extraction.");
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) startScan(selectedFile);
    };

    const startScan = async (uploadedFile) => {
        setFile(uploadedFile);
        setStatus('scanning');
        setScanProgress(0);

        // Simulate Scan Progress
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 2;
            });
        }, 50);

        try {
            const token = await getToken();
            const formData = new FormData();
            formData.append('resume', uploadedFile);

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/resume/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            clearInterval(interval);
            setScanProgress(100);

            // Artificial delay for "Completion" effect
            setTimeout(() => {
                setAnalysis(res.data); // Assuming { text, skills, ... }
                setStatus('complete');
            }, 800);

        } catch (err) {
            console.error(err);
            clearInterval(interval);
            setStatus('error');
        }
    };

    // --- ANIMATION VARIANTS ---
    const scanLineVariants = {
        scanning: {
            top: ["0%", "100%", "0%"],
            opacity: [0, 1, 0],
            transition: { duration: 2, repeat: Infinity, ease: "linear" }
        }
    };

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden selection:bg-primary/30">
            {/* Top HUD */}
            <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-50 pointer-events-none">
                <div className="pointer-events-auto">
                    <Logo className="scale-75 origin-top-left opacity-50 hover:opacity-100 transition-opacity" />
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 text-white/20 hover:text-white transition-colors cursor-pointer pointer-events-auto"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center">

                {/* Header Text */}
                <motion.div variants={MOTION.drift} initial="hidden" animate="visible" className="text-center mb-12">
                    <h1 className={`${STYLES.h2} mb-4`}>Resume Intelligence</h1>
                    <p className={`${STYLES.p_body} max-w-xl mx-auto`}>
                        Upload your dossier. Our neural link will extract key patterns to personalize your simulation.
                    </p>
                </motion.div>

                {/* Main Interaction Area */}
                <div className="w-full relative">

                    <AnimatePresence mode="wait">
                        {status === 'idle' && (
                            <motion.div
                                key="dropzone"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`
                                    relative border-2 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center transition-all cursor-pointer group
                                    ${isDragging ? 'border-primary bg-primary/5 shadow-[0_0_50px_rgba(139,92,246,0.2)]' : 'border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10'}
                                `}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current.click()}
                            >
                                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileSelect} />

                                <div className="p-6 rounded-full bg-white/5 mb-6 group-hover:scale-110 transition-transform border border-white/5 shadow-inner">
                                    <Upload className="w-10 h-10 text-white/60" />
                                </div>
                                <h3 className="text-xl font-heading font-medium text-white mb-2">Initiate Data Transfer</h3>
                                <p className="text-sm font-mono text-white/40 uppercase tracking-widest">Drop PDF or Click to Browse</p>
                            </motion.div>
                        )}

                        {(status === 'scanning' || status === 'error') && (
                            <motion.div
                                key="scanning"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0 }}
                                className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-12 relative overflow-hidden flex flex-col items-center"
                            >
                                {/* File Icon with Scanner */}
                                <div className="relative w-24 h-32 bg-white/5 rounded-lg border border-white/20 flex items-center justify-center mb-8 overflow-hidden">
                                    <FileText className="w-10 h-10 text-white/40" />

                                    {/* Laser Scan Line */}
                                    <motion.div
                                        variants={scanLineVariants}
                                        animate={status === 'scanning' ? "scanning" : ""}
                                        className={`absolute left-0 right-0 h-1 bg-primary shadow-[0_0_15px_rgba(139,92,246,0.8)] z-10 ${status === 'error' ? 'bg-red-500 shadow-red-500/50' : ''}`}
                                    />

                                    {/* Grid Overlay */}
                                    <div className="absolute inset-0 opacity-20 bg-center" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.1)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")` }} />
                                </div>

                                <div className="w-full max-w-md space-y-4 text-center">
                                    <div className="flex justify-between text-xs font-mono text-white/50 uppercase tracking-widest">
                                        <span>Status: {status === 'error' ? 'FAILED' : 'DECRYPTING'}</span>
                                        <span>{scanProgress}%</span>
                                    </div>
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full ${status === 'error' ? 'bg-red-500' : 'bg-primary'}`}
                                            animate={{ width: `${scanProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-white/40 animate-pulse">
                                        {status === 'error' ? 'Data packet corrupted. Please retry.' : 'Analyzing semantic structures...'}
                                    </p>
                                </div>

                                {status === 'error' && (
                                    <Button onClick={() => setStatus('idle')} variant="ghost" className="mt-8 text-white/60 hover:text-white">
                                        Try Again
                                    </Button>
                                )}
                            </motion.div>
                        )}

                        {status === 'complete' && (
                            <motion.div
                                key="complete"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Success Card */}
                                    <div className={`${STYLES.glass_card} p-8 flex flex-col items-center justify-center text-center relative overflow-hidden`}>
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 border border-green-500/20">
                                            <ShieldCheck className="w-8 h-8 text-green-500" />
                                        </div>
                                        <h3 className="text-2xl font-heading font-medium text-white mb-2">Identity Verified</h3>
                                        <p className="text-white/60 text-sm">Resume data has been successfully integrated into the simulation matrix.</p>

                                        <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                                            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                                <div className="text-xs text-white/40 uppercase mb-1">Keywords</div>
                                                <div className="text-lg font-mono text-white">
                                                    {analysis?.skills?.length || 12}
                                                </div>
                                            </div>
                                            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                                <div className="text-xs text-white/40 uppercase mb-1">Parse Time</div>
                                                <div className="text-lg font-mono text-white">0.8s</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Card */}
                                    <div className="flex flex-col gap-4">
                                        <div className={`${STYLES.glass_card} p-6 flex-1 flex flex-col justify-center`}>
                                            <h4 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-4">Recommended Next Step</h4>
                                            <p className="text-lg text-white mb-6">
                                                Based on your profile, we recommend simulating a <strong className="text-primary">Senior Frontend</strong> scenario.
                                            </p>
                                            <Button
                                                onClick={() => navigate('/role-selection')}
                                                className={STYLES.glass_button + " w-full justify-center"}
                                            >
                                                Proceed to Role Selection
                                            </Button>
                                        </div>

                                        <button
                                            onClick={() => setStatus('idle')}
                                            className="p-4 rounded-xl border border-white/5 hover:bg-white/5 text-sm text-white/40 hover:text-white transition-colors text-center"
                                        >
                                            Scan Another Document
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
};

export default ResumeScan;
