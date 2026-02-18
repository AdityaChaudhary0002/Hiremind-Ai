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
    handleSubmitAnswer
}) => {
    return (
        <div className="flex-1 flex flex-col relative z-10 bg-[#050505]/50 backdrop-blur-sm">

            {/* INPUT MODE TABS */}
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

            {/* ACTIVE INPUT AREA */}
            <div className="flex-1 relative overflow-hidden">
                {mode === 'speech' ? (
                    <div className="h-full flex flex-col">
                        <textarea
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            placeholder="Start speaking or type your response here..."
                            className="flex-1 w-full bg-transparent p-8 resize-none outline-none text-xl leading-relaxed text-white/80 placeholder:text-white/10 font-sans selection:bg-purple-900/50"
                            disabled={isRecording}
                        />
                        {/* Bottom Controls */}
                        <div className="p-6 border-t border-white/5 bg-gradient-to-t from-black/80 to-transparent">
                            <div className="flex items-center justify-between gap-6 max-w-3xl mx-auto">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="relative group">
                                        <VoiceRecorder
                                            isListening={isRecording}
                                            setIsListening={setIsRecording}
                                            onAnswerComplete={setTranscript}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-xs font-bold tracking-widest uppercase ${isRecording ? 'text-red-500 animate-pulse' : 'text-white/40'}`}>
                                            {isRecording ? 'Recording Active' : 'Mic Off'}
                                        </span>
                                        <span className="text-white/20 text-[10px]">Click orb to toggle</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSubmitAnswer}
                                    disabled={isRecording ? false : !transcript}
                                    className="h-12 px-8 rounded-full bg-white text-black hover:bg-gray-200 font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                >
                                    {isRecording ? "Stop & Submit" : "Submit Answer"}
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
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

                        <div className="h-16 bg-[#18181b] border-t border-white/10 flex items-center justify-end px-8 shrink-0">
                            <Button
                                onClick={handleSubmitAnswer}
                                className="rounded-full bg-white text-black hover:bg-gray-200 font-bold px-8 shadow-lg shadow-white/10"
                            >
                                Submit Solution <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(InterviewRightPanel);
