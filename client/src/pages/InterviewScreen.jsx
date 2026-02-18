import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import api from '../services/api';
import { Loader2, CircleAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import InterviewHeader from '../components/interview/InterviewHeader';
import InterviewLeftPanel from '../components/interview/InterviewLeftPanel';
import InterviewRightPanel from '../components/interview/InterviewRightPanel';

// Simple Error Boundary Implementation in same file for now (could be extracted)
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

// Logic hook could be extracted further, but keeping here for now as "Smart Component"
const InterviewScreen = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const { role, difficulty } = location.state || {};

    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [transcript, setTranscript] = useState('');
    const [code, setCode] = useState('// Write your solution here...');
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [interviewId, setInterviewId] = useState(null);
    const [mode, setMode] = useState('speech');

    // --- EFFECT: Initialization ---
    useEffect(() => {
        if (!role || !difficulty) {
            navigate('/role-selection');
            return;
        }

        const fetchQuestions = async () => {
            try {
                const token = await getToken();
                const data = await api.generateQuestions(role, difficulty, token);

                if (data.questions?.length > 0) {
                    setQuestions(data.questions);
                    setInterviewId(data._id);
                    setLoading(false);
                } else {
                    setError("No questions generated. Please try again.");
                    setLoading(false);
                }
            } catch (err) {
                console.error("Init failed:", err);
                const msg = err.response?.data?.message || err.message || "Failed to initialize interview.";
                setError(msg);
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [role, difficulty, getToken, navigate]);


    // --- STATE: Audio Context Unlock ---
    const [hasStarted, setHasStarted] = useState(false);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const lastSpokenIndex = React.useRef(-1);



    // --- FUNCTION: Speak Question ---
    const speakQuestion = React.useCallback((text) => {
        if (!isAudioEnabled) return;

        console.log("🔊 speakQuestion called with:", text);

        if (!text) return;
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        const synth = window.speechSynthesis;
        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
            console.warn("⚠️ Audio Playback Failed. Disabling Audio Engine.", e);
            setIsSpeaking(false);
            setIsAudioEnabled(false); // STOP FUTURE ERRORS
        };

        // Speak with delay
        setTimeout(() => {
            if (window.speechSynthesis) synth.speak(utterance);
        }, 50);
    }, [isAudioEnabled]);

    // --- EFFECT: Auto-Speak (Only after start) ---
    useEffect(() => {
        if (hasStarted && questions.length > 0 && !loading && isAudioEnabled) {
            // Only speak if we haven't spoken this index yet
            if (lastSpokenIndex.current !== currentQuestionIndex) {
                console.log("🗣️ Triggering Auto-Speak for Index:", currentQuestionIndex);
                lastSpokenIndex.current = currentQuestionIndex;
                const timeout = setTimeout(() => speakQuestion(questions[currentQuestionIndex]), 800);
                return () => clearTimeout(timeout);
            }
        }
    }, [questions, currentQuestionIndex, loading, hasStarted, speakQuestion, isAudioEnabled]);

    // --- HANDLER: Start Interview (Unlocks Audio) ---
    const handleStart = () => {
        // Unlock Audio Context with audible feedback
        if (window.speechSynthesis) {
            console.log("🔓 Unlocking Audio Context...");
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance('Session Initialized.');
            utterance.volume = 0.2; // Quiet
            window.speechSynthesis.speak(utterance);
        }
        setHasStarted(true);
    };

    // --- FUNCTION: Run Code ---
    const runCode = async () => {
        if (!code || loading) return;
        setOutput({ status: 'running', run: { stdout: 'Compiling...', stderr: null } });
        try {
            const response = await api.runCode(language, code);
            setOutput(response.data);
        } catch (err) {
            setOutput({ status: 'error', run: { stdout: null, stderr: `Execution Error: ${err.message}` } });
        }
    };

    // --- FUNCTION: Submit Answer ---
    const handleSubmitAnswer = async () => {
        if (isRecording) setIsRecording(false);
        const currentAnswer = mode === 'code'
            ? `[CODE - ${language}]:\n${code}\n[OUTPUT]:\n${output?.run?.stdout || ''}`
            : transcript;

        if (!currentAnswer.trim() && !code.trim()) return;

        const updatedAnswers = [...userAnswers];
        updatedAnswers[currentQuestionIndex] = currentAnswer;
        setUserAnswers(updatedAnswers);
        setTranscript(''); setOutput(null);

        if (currentQuestionIndex < questions.length - 1) {
            setIsAnalyzing(true);
            try {
                const token = await getToken();
                // Fire & Forget update
                api.submitFollowup({
                    question: questions[currentQuestionIndex], answer: currentAnswer, role, difficulty
                }, token).catch(console.error);

                // Simulate processing time
                await new Promise(r => setTimeout(r, 1500));
            } finally {
                setIsAnalyzing(false);
                setCurrentQuestionIndex(prev => prev + 1);
            }
        } else {
            setLoading(true);
            try {
                const token = await getToken();
                await api.submitInterview(interviewId, updatedAnswers, token);
                navigate(`/feedback/${interviewId}`);
            } catch (e) {
                console.error("Submit failed", e);
                setLoading(false);
                setError("Failed to submit interview.");
            }
        }
    };

    // --- RENDER: Loading / Error ---
    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white font-sans">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <div className="text-xs font-mono uppercase tracking-widest text-white/50">Initializing Environment...</div>
        </div>
    );
    if (error) return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white font-sans">
            <CircleAlert className="w-12 h-12 text-red-500 mb-4" />
            <div className="text-lg font-medium">{error}</div>
            <Button onClick={() => navigate('/dashboard')} variant="ghost" className="mt-4">Return to Dashboard</Button>
        </div>
    );

    // --- RENDER: Start Overlay ---
    if (!hasStarted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/noise.svg')] opacity-20 pointer-events-none" />
                <div className="z-10 text-center space-y-8 p-6">
                    <h1 className="text-4xl md:text-6xl font-heading font-bold text-white tracking-tighter">
                        Ready to Begin?
                    </h1>
                    <p className="text-white/60 max-w-md mx-auto">
                        Headphones recommended. Click below to initialize the neural link and enable audio.
                    </p>
                    <Button
                        onClick={handleStart}
                        className="h-16 px-12 rounded-full text-xl font-bold bg-white text-black hover:bg-white/90 shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:scale-105 transition-all"
                    >
                        INITIALIZE SESSION
                    </Button>
                </div>
            </div>
        );
    }

    // --- RENDER: Main Screen ---
    return (
        <div className="h-screen bg-[#050505] text-white overflow-hidden flex flex-col font-sans selection:bg-purple-500/30">
            <InterviewHeader role={role} difficulty={difficulty} currentQuestionIndex={currentQuestionIndex} />

            <div className="flex-1 flex pt-14 relative bg-[#050505]">
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
                        isRecording={isRecording} setIsRecording={setIsRecording}
                        code={code} setCode={setCode}
                        language={language} setLanguage={setLanguage}
                        output={output} setOutput={setOutput}
                        runCode={runCode}
                        handleSubmitAnswer={handleSubmitAnswer}
                    />
                </ErrorBoundary>
            </div>
        </div>
    );
};

export default InterviewScreen;
