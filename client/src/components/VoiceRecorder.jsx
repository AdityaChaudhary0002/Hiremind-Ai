import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, RotateCcw, Activity, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

const VoiceRecorder = ({ onAnswerComplete, isListening, setIsListening }) => {
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);
    // eslint-disable-next-line no-unused-vars
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(true);

    // Debug Props
    useEffect(() => {
        if (!setIsListening) console.error("VoiceRecorder: setIsListening is MISSING!", { isListening, setIsListening });
    }, [setIsListening, isListening]);

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("Browser does not support Speech Recognition. Please use Chrome.");
            setIsSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setError(null);
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interim = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }

            if (finalTranscript) {
                onAnswerComplete(prev => (prev || '') + ' ' + finalTranscript);
                setInterimTranscript('');
            } else if (interim) {
                console.log("Interim:", interim);
                setInterimTranscript(interim);
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech Error:", event.error);
            if (event.error === 'not-allowed') {
                setError("Microphone access blocked. Please allow permissions.");
                setIsListening(false);
            } else if (event.error === 'no-speech') {
                // Ignore silent errors
            } else {
                setError(`Error: ${event.error}`);
                setIsListening(false);
            }
        };

        recognition.onend = () => {
            if (isListening) {
                try {
                    recognition.start();
                } catch (e) {
                    setIsListening(false);
                }
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    // Control Effect
    useEffect(() => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        if (isListening) {
            try {
                recognition.start();
            } catch (e) {
                // Already started
            }
        } else {
            recognition.stop();
        }
    }, [isListening]);


    const handleToggle = () => {
        setIsListening(!isListening);
    };

    const handleReset = () => {
        onAnswerComplete("");
        setIsListening(true);
    };

    if (!isSupported) {
        return <div className="text-red-500 text-sm font-mono text-center p-4 border border-red-500/20 rounded">{error}</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center gap-6 w-full h-full relative">
            <div className="flex flex-col items-center gap-4">
                <Button
                    onClick={handleToggle}
                    className={`h-16 px-8 rounded-full text-lg font-bold tracking-wider transition-all shadow-lg ${isListening
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-red-500/20'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                        }`}
                >
                    {isListening ? (
                        <div className="flex items-center gap-3">
                            <MicOff className="w-6 h-6" /> STOP SPEAKING
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Mic className="w-6 h-6" /> START SPEAKING
                        </div>
                    )}
                </Button>

                <div className="text-center h-8 flex flex-col items-center justify-center">
                    {error ? (
                        <span className="text-red-400 text-xs font-bold bg-red-950/50 px-3 py-1 rounded border border-red-500/30 flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" /> {error}
                        </span>
                    ) : isListening ? (
                        <span className="text-emerald-400 text-xs font-mono animate-pulse flex items-center gap-2">
                            <Activity className="w-3 h-3" /> LISTENING...
                        </span>
                    ) : (
                        <span className="text-muted-foreground text-xs font-mono">
                            Microphone Ready
                        </span>
                    )}
                </div>

                {/* VISIBLE LIVE TRANSCRIPT */}
                {isListening && interimTranscript && (
                    <div className="mt-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 max-w-md w-full">
                        <p className="text-sm text-white/80 font-mono text-center animate-pulse">
                            "{interimTranscript}"
                        </p>
                    </div>
                )}
            </div>

            {/* Reset Button (Top Corner) */}
            {!isListening && (
                <div className="absolute top-0 right-0 p-4">
                    <Button
                        onClick={handleReset}
                        variant="ghost"
                        size="sm"
                        className="text-white/20 hover:text-white hover:bg-white/10 text-xs px-3 h-8 rounded-full transition-all"
                    >
                        <RotateCcw className="mr-1.5 h-3 w-3" /> Clear Format
                    </Button>
                </div>
            )}
        </div>
    );
};

export default VoiceRecorder;
