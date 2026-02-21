import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Activity, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

const VoiceRecorder = ({ onAnswerComplete, isListening, setIsListening }) => {
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);
    const isListeningRef = useRef(isListening);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(true);

    // Keep ref in sync
    useEffect(() => {
        isListeningRef.current = isListening;
    }, [isListening]);

    // Initialize Speech Recognition once
    useEffect(() => {
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
                setInterimTranscript(interim);
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech Error:", event.error);
            if (event.error === 'not-allowed') {
                setError("Mic blocked. Click lock icon in address bar → Allow Microphone → Reload.");
                setIsListening(false);
            } else if (event.error === 'no-speech') {
                // Ignore
            } else {
                setError(`Error: ${event.error}`);
            }
        };

        recognition.onend = () => {
            // Use ref to get latest value (avoids stale closure)
            if (isListeningRef.current) {
                try {
                    recognition.start();
                } catch (e) {
                    // Already running or failed
                }
            }
        };

        recognitionRef.current = recognition;

        return () => {
            try { recognition.stop(); } catch (e) { }
        };
    }, []);

    // Control Effect - start/stop based on isListening
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
            try {
                recognition.stop();
            } catch (e) { }
        }
    }, [isListening]);

    const handleToggle = useCallback(async () => {
        if (isListening) {
            setIsListening(false);
            return;
        }

        // Request mic permission explicitly via getUserMedia before starting SpeechRecognition
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Permission granted — stop the stream immediately (we only needed the permission)
            stream.getTracks().forEach(track => track.stop());
            setError(null);
            setIsListening(true);
        } catch (err) {
            console.error('Mic permission denied:', err);
            setError("Mic blocked. Click lock icon in address bar → Allow Microphone → Reload.");
        }
    }, [isListening, setIsListening]);

    if (!isSupported) {
        return <div className="text-red-500 text-sm font-mono text-center p-4 border border-red-500/20 rounded">{error}</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center gap-2 w-full h-full relative">
            <div className="flex flex-col items-center gap-2">
                <Button
                    onClick={handleToggle}
                    className={`h-14 px-8 rounded-full text-sm font-bold tracking-wider transition-all shadow-lg ${isListening
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-red-500/20'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                        }`}
                >
                    {isListening ? (
                        <div className="flex items-center gap-2">
                            <MicOff className="w-5 h-5" /> STOP
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Mic className="w-5 h-5" /> START SPEAKING
                        </div>
                    )}
                </Button>

                <div className="text-center h-6 flex flex-col items-center justify-center overflow-visible">
                    {error ? (
                        <span className="text-red-400 text-[10px] font-bold bg-red-950/50 px-2 py-0.5 rounded border border-red-500/30 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {error}
                        </span>
                    ) : isListening ? (
                        <span className="text-emerald-400 text-[10px] font-mono animate-pulse flex items-center gap-2">
                            <Activity className="w-3 h-3" /> LISTENING...
                        </span>
                    ) : (
                        <span className="text-faint text-[10px] font-mono tracking-tight">
                            Microphone Ready
                        </span>
                    )}
                </div>

                {/* VISIBLE LIVE TRANSCRIPT */}
                {isListening && interimTranscript && (
                    <div className="mt-2 px-4 py-2 bg-glass-hover rounded-lg border border-[var(--border-medium)] max-w-md w-full">
                        <p className="text-sm text-body font-mono text-center animate-pulse">
                            "{interimTranscript}"
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceRecorder;
