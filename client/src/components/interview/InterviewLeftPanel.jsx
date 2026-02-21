import React, { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2 } from 'lucide-react';
// Force HMR Refresh: 456
import { Button } from '@/components/ui/button';
import Avatar from '../Avatar';
import WebcamMonitor from '../WebcamMonitor';

// Local Error Boundary (Simplified for sub-components)
class ComponentErrorBoundary extends React.Component {
    state = { hasError: false };
    static getDerivedStateFromError() { return { hasError: true }; }
    render() {
        if (this.state.hasError) return <div className="w-full h-full bg-glass-hover animate-pulse rounded-lg" />;
        return this.props.children;
    }
}

const InterviewLeftPanel = ({
    questions,
    currentQuestionIndex,
    isSpeaking,
    isRecording,
    isAnalyzing,
    speakQuestion
}) => {
    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="w-[420px] border-r border-[var(--border-subtle)] bg-glass backdrop-blur-sm flex flex-col relative z-20 shadow-2xl">

            {/* AVATAR STAGE */}
            <div className="p-6 shrink-0 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--border-medium)] to-transparent" />

                {/* Avatar Frame */}
                <div className="aspect-video w-full rounded-2xl bg-surface border border-[var(--border-medium)] relative overflow-hidden shadow-inner">
                    {/* Grid Background */}
                    <ComponentErrorBoundary>
                        <Suspense fallback={
                            <div className="flex items-center justify-center w-full h-full text-xs font-mono text-faint animate-pulse">
                                INITIALIZING NEURAL CORE...
                            </div>
                        }>
                            {/* Scale corrected for better framing */}
                            <div className="w-full h-full scale-110 translate-y-4">
                                <Avatar isSpeaking={isSpeaking} isListening={isRecording} isAnalyzing={isAnalyzing} />
                            </div>
                        </Suspense>
                    </ComponentErrorBoundary>

                    {/* Status Indicators */}
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-1 pointer-events-none">
                        {isSpeaking && <span className="text-[9px] font-mono text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20 backdrop-blur-md">AUDIO OUT</span>}
                        {isRecording && <span className="text-[9px] font-mono text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 backdrop-blur-md">AUDIO IN</span>}
                        {isAnalyzing && <span className="text-[9px] font-mono text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 backdrop-blur-md">PROCESSING</span>}
                    </div>
                </div>
            </div>

            {/* QUESTION DISPLAY */}
            <div className="flex-1 px-6 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6 pb-6"
                    >
                        <div className="space-y-2">
                            <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                Current Inquiry
                            </div>
                            <h2 className="text-lg font-light leading-relaxed text-heading font-sans tracking-tight">
                                {currentQuestion}
                            </h2>
                        </div>
                        <Button
                            onClick={() => speakQuestion(currentQuestion)}
                            className="h-9 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold tracking-wide shadow-lg shadow-indigo-500/20 rounded-lg flex items-center gap-2"
                        >
                            <Volume2 className="w-4 h-4" /> REPLAY AUDIO
                        </Button>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* WEBCAM AREA (Embedded) */}
            <div className="p-4 bg-surface border-t border-[var(--border-subtle)]">
                <div className="w-full aspect-video rounded-xl bg-white/[0.02] border border-[var(--border-subtle)] overflow-hidden relative shadow-inner">
                    <ComponentErrorBoundary>
                        <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-glass-hover animate-pulse text-[10px] text-zinc-500 font-mono">LOADING CAMERA...</div>}>
                            <WebcamMonitor onEmotionDetect={() => { }} />
                        </Suspense>
                    </ComponentErrorBoundary>
                </div>
                <div className="flex items-center justify-between mt-3 px-1">
                    <div className="text-xs font-medium text-subtle">Live Emotion Analysis</div>
                    <div className="text-[10px] text-emerald-500 flex items-center gap-1.5">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        Active
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(InterviewLeftPanel);
