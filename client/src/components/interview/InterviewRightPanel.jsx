import React from 'react';
import { Mic, Code as CodeIcon, ChevronRight, Play, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VoiceRecorder from '../VoiceRecorder';
import CodeEditor from '../CodeEditor';

// Force HMR Update
const InterviewRightPanel = ({
    mode, setMode,
    transcript, setTranscript,
    isRecording, setIsRecording,
    code, setCode,
    language, setLanguage,
    output, setOutput,
    runCode,
    handleSubmitAnswer,
    isCodingInterview = true, // Default to true
    isAnalyzing = false
}) => {
    return (
        <div className="flex-1 flex flex-col relative z-10 bg-[#050505]/50 backdrop-blur-sm">

            {/* INPUT MODE TABS - Only show if Coding Interview */}
            {isCodingInterview && (
                <div className="flex items-center gap-2 p-4 border-b border-white/5">
                    <div className="p-1 rounded-lg bg-white/5 border border-white/5 flex gap-1">
                        <button
                            onClick={() => setMode('speech')}
                            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${mode === 'speech' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                        >
                            <Mic className="w-3.5 h-3.5" /> Verbal
                        </button>
                        <button
                            onClick={() => setMode('code')}
                            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${mode === 'code' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                        >
                            <CodeIcon className="w-3.5 h-3.5" /> Code Environment
                        </button>
                    </div>
                </div>
            )}

            {/* ACTIVE INPUT AREA */}
            <div className="flex-1 relative overflow-hidden">
                {mode === 'speech' ? (
                    <div className="h-full flex flex-col pt-6 pb-0">
                        {/* Transcript / Notes Area */}
                        <div className="flex-1 w-full max-w-5xl mx-auto px-6 mb-6">
                            <div className="h-full relative group">
                                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl pointer-events-none" />
                                <textarea
                                    value={transcript}
                                    onChange={(e) => setTranscript(e.target.value)}
                                    placeholder="Transcription appears here. You can also type your notes..."
                                    className="w-full h-full bg-[#0a0a0c]/80 backdrop-blur-md rounded-2xl border border-white/10 p-8 resize-none outline-none text-lg leading-loose text-white/90 placeholder:text-white/10 font-sans shadow-inner transition-all focus:border-white/20 focus:bg-[#0a0a0c]"
                                    disabled={isRecording}
                                />
                            </div>
                        </div>

                        {/* Fixed Footer Dock */}
                        <div className="h-28 bg-[#050505] border-t border-white/5 flex items-center justify-center relative shrink-0 z-20">
                            <div className="w-full max-w-5xl px-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                                {/* Left: Status / Info */}
                                <div className="hidden md:flex flex-col justify-center">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-zinc-700'}`} />
                                        <span className={`text-xs font-bold tracking-widest uppercase ${isRecording ? 'text-white' : 'text-zinc-500'}`}>
                                            {isRecording ? 'RECORDING' : 'READY'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-zinc-600 mt-1 pl-4 truncate">System Nominal</span>
                                </div>
                                <div className="md:hidden"></div> {/* Spacer for mobile */}

                                {/* Center: Voice Recorder Trigger */}
                                <div className="flex justify-center">
                                    <VoiceRecorder
                                        isListening={isRecording}
                                        setIsListening={setIsRecording}
                                        onAnswerComplete={setTranscript}
                                    />
                                </div>

                                {/* Right: Submit Action */}
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSubmitAnswer}
                                        disabled={isRecording || isAnalyzing ? true : !transcript}
                                        className={`h-12 md:h-14 px-6 md:px-8 rounded-full font-bold transition-all flex items-center gap-3 ${transcript && !isAnalyzing
                                            ? 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105'
                                            : 'bg-zinc-900 text-zinc-500 border border-white/5 hover:bg-zinc-800'
                                            }`}
                                    >
                                        <span className="text-xs md:text-sm tracking-wide whitespace-nowrap">
                                            {isAnalyzing ? 'ANALYZING...' : (transcript ? 'SUBMIT' : 'NO ANSWER')}
                                        </span>
                                        {!isAnalyzing && (
                                            <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        )}
                                        {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        <div className="flex-1 relative flex flex-col h-full">
                            {/* Editor Toolbar with RUN button removed (handled internally by CodeEditor) */}

                            <CodeEditor
                                code={code}
                                setCode={setCode}
                                language={language}
                                setLanguage={setLanguage}
                                output={output}
                                setOutput={setOutput}
                            />

                            {/* Terminal Output Panel */}
                            {output && (
                                <div className="h-1/3 bg-[#0c0c0e] border-t border-white/10 p-4 font-mono text-xs overflow-y-auto">
                                    <div className="flex items-center justify-between mb-2 text-white/40">
                                        <span>CONSOLE OUTPUT</span>
                                        <button onClick={() => setOutput(null)} className="hover:text-white"><X className="w-3 h-3" /></button>
                                    </div>
                                    {output.status === 'running' ? (
                                        <div className="text-yellow-500 animate-pulse">Running script...</div>
                                    ) : (
                                        <>
                                            {output.run?.stdout && <pre className="text-green-400 whitespace-pre-wrap">{output.run.stdout}</pre>}
                                            {output.run?.stderr && <pre className="text-red-400 whitespace-pre-wrap">{output.run.stderr}</pre>}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="h-20 bg-[#18181b] border-t border-white/10 flex items-center justify-end px-8 shrink-0">
                            <Button
                                onClick={handleSubmitAnswer}
                                disabled={isAnalyzing}
                                className="h-12 rounded-full bg-white text-black hover:bg-gray-200 font-bold px-10 shadow-lg shadow-white/10 flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                            >
                                <span>{isAnalyzing ? 'Processing...' : 'Submit Solution'}</span>
                                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(InterviewRightPanel);
