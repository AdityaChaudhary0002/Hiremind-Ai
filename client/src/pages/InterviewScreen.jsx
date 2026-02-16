import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mic, MicOff, Square, Play, Send, Cpu, Activity, Clock, AlertCircle, Volume2, VolumeX, Terminal, ShieldAlert, Code2, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from '@clerk/clerk-react';
import Editor from "@monaco-editor/react";
import { executeCode, CODE_SNIPPETS } from '@/lib/codeExecution';
import Avatar from "@/components/Avatar";
import WebcamMonitor from "@/components/WebcamMonitor";

const InterviewScreen = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { role, difficulty, resumeText } = location.state || {};
    const { getToken, userId } = useAuth();

    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interviewId, setInterviewId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timer, setTimer] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [userAnswers, setUserAnswers] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const messagesEndRef = useRef(null);
    const [audioEnabled, setAudioEnabled] = useState(true);

    // Code Editor State
    const [activeTab, setActiveTab] = useState('transcript'); // 'transcript' | 'code'
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState(CODE_SNIPPETS['javascript']);
    const [output, setOutput] = useState(null);
    const [isRunning, setIsRunning] = useState(false);

    // Speech Recognition
    const {
        transcript: speechTranscript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        if (!role || !difficulty) {
            navigate('/role-selection');
        } else {
            initializeInterview();
        }
    }, []);

    useEffect(() => {
        if (listening) {
            setTranscript(speechTranscript);
        }
    }, [speechTranscript, listening]);

    // Timer effect
    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const initializeInterview = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const response = await axios.post('/api/interview/generate', {
                role,
                difficulty,
                resumeText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setQuestions(response.data.questions);
            setInterviewId(response.data._id);
            setLoading(false);

            // Speak first question after short delay
            setTimeout(() => speakQuestion(response.data.questions[0]), 1000);

        } catch (error) {
            console.error("Failed to start interview:", error);
            // navigate('/dashboard'); // Optional: redirect on error
            setLoading(false);
        }
    };

    const speakQuestion = (text) => {
        if (!audioEnabled) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        // Error handling
        utterance.onerror = (e) => console.error("TTS Error:", e);

        window.speechSynthesis.speak(utterance);
    };

    const handleStartAnswer = () => {
        setIsRecording(true);
        resetTranscript();
        SpeechRecognition.startListening({ continuous: true });
    };

    const handleStopAnswer = () => {
        setIsRecording(false);
        SpeechRecognition.stopListening();
    };

    const handleSubmitAnswer = async () => {
        // Save answer and move to next
        const currentAnswer = activeTab === 'code' ? `[CODE SUBMISSION]:\n${code}\n[OUTPUT]:\n${output?.run?.stdout || output?.run?.stderr || 'No Output'}` : transcript;

        const updatedAnswers = [...userAnswers];
        updatedAnswers[currentQuestionIndex] = currentAnswer;
        setUserAnswers(updatedAnswers);

        setTranscript('');
        resetTranscript();
        setOutput(null); // Reset output

        if (currentQuestionIndex < questions.length - 1) {
            setIsAnalyzing(true);
            // Simulate "Thinking" time for AI realism
            setTimeout(() => {
                setIsAnalyzing(false);
                setCurrentQuestionIndex(prev => prev + 1);
                speakQuestion(questions[currentQuestionIndex + 1]);
            }, 1500);
        } else {
            finishInterview(updatedAnswers);
        }
    };

    const finishInterview = async (finalAnswers) => {
        setLoading(true);
        try {
            const token = await getToken();
            const response = await axios.post('/api/interview/submit', {
                interviewId,
                userAnswers: finalAnswers,
                questions // Send questions back for context if needed, though backend has them
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate(`/feedback/${interviewId}`, { state: { feedback: response.data } });
        } catch (error) {
            console.error("Error submitting interview:", error);
            setLoading(false);
        }
    };

    const toggleAudio = () => {
        setAudioEnabled(!audioEnabled);
        if (audioEnabled) window.speechSynthesis.cancel();
    };

    const runCode = async () => {
        setIsRunning(true);
        setOutput(null);
        try {
            const result = await executeCode(language, code);
            setOutput(result);
        } catch (error) {
            setOutput({ run: { stderr: "Execution Failed: " + error.message } });
        } finally {
            setIsRunning(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center font-mono">
                <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin mb-8"></div>
                <h2 className="text-xl font-heading font-bold animate-pulse">INITIALIZING NEURAL LINK...</h2>
                <p className="text-muted-foreground mt-2 text-sm">Configuring simulation parameters for {role}...</p>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground overflow-hidden flex flex-col transition-colors duration-300">

            {/* HUD Header */}
            <header className="h-16 border-b border-border bg-background/50 backdrop-blur flex justify-between items-center px-6 z-10">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-heading font-bold tracking-tight">LIVE SESSION</span>
                    </div>
                    <div className="h-6 w-px bg-border" />
                    <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(timer)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Progress Bar */}
                    <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                        Q{currentQuestionIndex + 1}/{questions.length}
                    </span>
                    <Button variant="ghost" size="icon" onClick={toggleAudio}>
                        {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
                    </Button>
                    <ThemeToggle />
                </div>
            </header>

            {/* Main Split Layout */}
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 relative">

                {/* Left: AI/Question Interface - Glassmorphic Redesign */}
                <div className="relative overflow-hidden flex flex-col justify-center p-8 border-r border-white/10">
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-black to-background z-0" />

                    {/* 3D AVATAR CONTAINER */}
                    <div className="absolute inset-0 z-0 opacity-100 pointer-events-none">
                        <Avatar isSpeaking={isSpeaking} isListening={isRecording} isAnalyzing={isAnalyzing} />
                    </div>

                    <div className="max-w-xl mx-auto w-full z-10 space-y-8 relative">
                        {/* AI Status Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-xl"
                        >
                            <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-pink-500 animate-ping' : isRecording ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`} />
                            <span className="text-xs font-mono tracking-widest text-white/70 uppercase">
                                {isSpeaking ? "AI SPEAKING" : isAnalyzing ? "PROCESSING..." : isRecording ? "LISTENING" : "READY"}
                            </span>
                        </motion.div>

                        {/* Question Card - Glassmorphism */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentQuestionIndex}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl relative group"
                            >
                                <h2 className="text-2xl md:text-3xl font-heading font-medium leading-tight text-white drop-shadow-lg">
                                    {currentQuestion}
                                </h2>

                                {/* Manual TTS Control */}
                                <button
                                    onClick={() => speakQuestion(currentQuestion)}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Replay Audio"
                                >
                                    <Volume2 className="w-5 h-5 text-white/80" />
                                </button>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right: User Input / Terminal */}
                <div className="bg-muted/10 flex flex-col relative h-[calc(100vh-4rem)]">

                    {/* Add Webcam Monitor Overlay */}
                    <WebcamMonitor />

                    {/* Tabs / Toggle */}
                    <div className="flex border-b border-border bg-background/50 backdrop-blur z-20">
                        <button
                            onClick={() => setActiveTab('transcript')}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2
                                ${activeTab === 'transcript' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        >
                            <Terminal className="w-4 h-4" /> Transcript Mode
                        </button>
                        <button
                            onClick={() => setActiveTab('code')}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2
                                ${activeTab === 'code' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        >
                            <Code2 className="w-4 h-4" /> Code Sandbox
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden relative">

                        {/* TRANSCRIPT MODE */}
                        {activeTab === 'transcript' && (
                            <div className="h-full flex flex-col p-8 bg-muted/30">
                                {/* Transcript Area */}
                                <div className="flex-1 bg-card border border-border rounded-lg p-6 font-mono text-sm overflow-y-auto mb-6 shadow-inner relative">
                                    <div className="absolute top-4 right-4 text-[10px] text-muted-foreground border border-border px-2 py-1 rounded">
                                        TERMINAL LOG
                                    </div>
                                    {userAnswers.map((ans, i) => (
                                        <div key={i} className="mb-4 opacity-70">
                                            <span className="text-primary mr-2">➜</span>
                                            <span className="text-muted-foreground font-bold">Q{i + 1}:</span>
                                            <div className="pl-4 text-foreground mt-1 border-l-2 border-border whitespace-pre-wrap">{ans}</div>
                                        </div>
                                    ))}
                                    <div className="mt-4">
                                        <span className="text-primary mr-2">➜</span>
                                        <span className="typing-cursor text-foreground">{transcript || (isRecording ? "Listening..." : "Type or speak your answer...")}</span>
                                    </div>
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Controls */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <textarea
                                        className="md:col-span-2 bg-card border border-border rounded-lg p-4 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none h-24 font-mono text-sm"
                                        placeholder="Type your answer here if you prefer (or edit transcript)..."
                                        value={transcript}
                                        onChange={(e) => setTranscript(e.target.value)}
                                        disabled={isRecording}
                                    />
                                    <div className="md:col-span-2 text-xs text-muted-foreground text-right -mt-2 mb-2">
                                        * You can edit the text above if voice recognition was inaccurate.
                                    </div>

                                    <Button
                                        variant="destructive"
                                        className="h-12 w-full md:w-auto"
                                        onClick={() => navigate('/dashboard')}
                                    >
                                        End Session
                                    </Button>

                                    <Button
                                        variant={isRecording ? "destructive" : "default"}
                                        className="h-12 text-base font-medium flex items-center gap-2 flex-1"
                                        onClick={isRecording ? handleStopAnswer : handleStartAnswer}
                                    >
                                        {isRecording ? (
                                            <>
                                                <Square className="w-4 h-4 fill-current" /> Stop Recording
                                            </>
                                        ) : (
                                            <>
                                                <Mic className="w-4 h-4" /> Start Recording
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        variant="secondary"
                                        className="h-12 text-base font-medium flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 md:col-span-2"
                                        onClick={handleSubmitAnswer}
                                        disabled={!transcript && !isRecording}
                                    >
                                        <Send className="w-4 h-4" /> Submit Transcript
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* CODE SANDBOX MODE */}
                        {activeTab === 'code' && (
                            <div className="h-full flex flex-col bg-[#1e1e1e]">
                                {/* Toolbar */}
                                <div className="h-12 border-b border-[#333] flex items-center px-4 justify-between bg-[#252526]">
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={language}
                                            onChange={(e) => {
                                                setLanguage(e.target.value);
                                                setCode(CODE_SNIPPETS[e.target.value] || "");
                                            }}
                                            className="bg-[#3c3c3c] text-white text-xs rounded px-2 py-1 border border-[#555] outline-none focus:border-blue-500"
                                        >
                                            <option value="javascript">JavaScript</option>
                                            <option value="python">Python</option>
                                            <option value="java">Java</option>
                                            <option value="c">C</option>
                                            <option value="cpp">C++</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            onClick={runCode}
                                            disabled={isRunning}
                                            className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs gap-2"
                                        >
                                            {isRunning ? <Activity className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                            Run Code
                                        </Button>
                                    </div>
                                </div>

                                {/* Editor Area */}
                                <div className="flex-1 relative">
                                    <Editor
                                        height="100%"
                                        language={language}
                                        value={code}
                                        onChange={(value) => setCode(value)}
                                        theme="vs-dark"
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 14,
                                            padding: { top: 16 },
                                            fontFamily: 'JetBrains Mono, Menlo, monospace',
                                        }}
                                    />
                                </div>

                                {/* Output Panel */}
                                <div className="h-1/3 border-t border-[#333] bg-[#000] flex flex-col">
                                    <div className="px-4 py-1 bg-[#252526] text-[10px] text-gray-400 uppercase tracking-widest border-b border-[#333] flex justify-between">
                                        <span>Console Output</span>
                                        {output && (
                                            <span className={output.run?.code === 0 ? "text-green-500" : "text-red-500"}>
                                                Exit Code: {output.run?.code}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 p-4 font-mono text-sm text-gray-300 overflow-auto whitespace-pre-wrap">
                                        {output ? (output.run?.stdout || output.run?.stderr) : <span className="text-gray-600 italic">// Output will appear here...</span>}
                                    </div>
                                    <div className="p-2 border-t border-[#333] flex justify-end">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleSubmitAnswer}
                                            className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 text-xs w-full"
                                        >
                                            <Check className="w-3 h-3 mr-2" /> Submit This Solution
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
};

export default InterviewScreen;
