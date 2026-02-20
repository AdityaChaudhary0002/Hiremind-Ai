import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, CircleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

import InterviewHeader from '../components/interview/InterviewHeader';
import InterviewLeftPanel from '../components/interview/InterviewLeftPanel';
import InterviewRightPanel from '../components/interview/InterviewRightPanel';
import { useInterviewEngine, INTERVIEW_STATUS } from '../hooks/useInterviewEngine';

// Simple Error Boundary
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) { return { hasError: true }; }
    componentDidCatch(error, errorInfo) { console.error("Screen Error:", error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return (
                <div className="w-full h-full flex items-center justify-center bg-black/50 border border-white/10 rounded-xl p-4">
                    <div className="text-center">
                        <CircleAlert className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <div className="text-xs font-mono text-white/50">SYSTEM FAILURE</div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

const InterviewScreen = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();

    // --- INTEGRATE ENGINE ---
    const { state, actions } = useInterviewEngine(interviewId);

    // Destructure State
    const {
        status, questions, currentQuestionIndex, role, difficulty,
        transcript, code, language, output, mode,
        isSpeaking, isAnalyzing, isRecording, error, isCodingInterview
    } = state;

    // Destructure Actions
    const {
        setTranscript, setCode, setLanguage, setMode, setOutput,
        startSession, submitAnswer, executeCode, speakQuestion
    } = actions;


    // --- RENDER: Loading / Error ---
    if (status === INTERVIEW_STATUS.GENERATING) return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white font-sans">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <div className="text-xs font-mono uppercase tracking-widest text-white/50">
                Initializing Environment...
            </div>
        </div>
    );

    if (status === INTERVIEW_STATUS.EVALUATING && questions.length === 0) return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white font-sans">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <div className="text-xs font-mono uppercase tracking-widest text-white/50">
                Generating Performance Report...
            </div>
        </div>
    );

    if (status === INTERVIEW_STATUS.ERROR || error) return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white font-sans">
            <CircleAlert className="w-12 h-12 text-red-500 mb-4" />
            <div className="text-lg font-medium">{error}</div>
            <Button onClick={() => navigate('/dashboard')} variant="ghost" className="mt-4">Return to Dashboard</Button>
        </div>
    );

    // --- RENDER: Start Overlay (only after questions load) ---
    if (status === INTERVIEW_STATUS.IDLE && questions.length > 0) {
        return (
            <div className="flex items-center justify-center h-screen bg-black relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/noise.svg')] opacity-20 pointer-events-none" />
                <div className="z-10 text-center space-y-8 p-6">
                    <h1 className="text-4xl md:text-6xl font-heading font-bold text-white tracking-tighter">
                        System Online
                    </h1>
                    <p className="text-white/60 max-w-md mx-auto">
                        Neural Core initialized. Click below to establish audio link and begin session.
                    </p>
                    <Button
                        onClick={() => startSession()}
                        className="h-16 px-12 rounded-full text-xl font-bold bg-white text-black hover:bg-white/90 shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:scale-105 transition-all"
                    >
                        START INTERVIEW
                    </Button>
                </div>
            </div>
        );
    }

    // --- RENDER: Main Screen ---
    return (
        <div className="h-screen bg-[#050505] text-white overflow-hidden flex flex-col font-sans selection:bg-purple-500/30">
            <InterviewHeader role={role} difficulty={difficulty} currentQuestionIndex={currentQuestionIndex} />

            <div className="flex-1 flex flex-col lg:flex-row pt-14 relative bg-[#050505] overflow-hidden">
                {/* Unified Noise Overlay */}
                <div className="bg-noise !absolute !inset-0 !z-0 !opacity-[0.05] mix-blend-overlay pointer-events-none" />

                <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-purple-900/5 via-transparent to-blue-900/5" />

                <ErrorBoundary>
                    <InterviewLeftPanel
                        questions={questions}
                        currentQuestionIndex={currentQuestionIndex}
                        isSpeaking={isSpeaking}
                        isRecording={isRecording}
                        isAnalyzing={isAnalyzing}
                        speakQuestion={speakQuestion}
                    />
                </ErrorBoundary>

                <ErrorBoundary>
                    <InterviewRightPanel
                        mode={mode} setMode={setMode}
                        transcript={transcript} setTranscript={setTranscript}
                        isRecording={isRecording} setIsRecording={() => { }} // Controlled strictly by FSM Engine now
                        code={code} setCode={setCode}
                        language={language} setLanguage={setLanguage}
                        output={output} setOutput={setOutput}
                        runCode={executeCode}
                        handleSubmitAnswer={() => {
                            if (isAnalyzing) return; // Prevent double submission
                            submitAnswer();
                        }}
                        isCodingInterview={isCodingInterview}
                        isAnalyzing={isAnalyzing}
                    />
                </ErrorBoundary>
            </div>
        </div>
    );
};

export default InterviewScreen;
