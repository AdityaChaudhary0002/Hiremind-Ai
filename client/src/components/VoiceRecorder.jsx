import React, { useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, RotateCcw, Activity } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';

const VoiceRecorder = ({ onAnswerComplete, isListening, setIsListening }) => {
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        if (isListening) {
            SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
        } else {
            SpeechRecognition.stopListening();
        }
    }, [isListening]);

    // Sync transcript with parent component when recording stops or transcript updates
    useEffect(() => {
        if (transcript) {
            onAnswerComplete(transcript);
        }
    }, [transcript, onAnswerComplete]);

    if (!browserSupportsSpeechRecognition) {
        return <span className="text-red-500 font-mono text-sm">Browser Error: Web Speech API missing.</span>;
    }

    const handleToggle = () => {
        setIsListening(!isListening);
    };

    const handleReset = () => {
        resetTranscript();
        onAnswerComplete(""); // Clear parent state too
        setIsListening(true); // Auto-restart? User preference. Let's just reset text.
    };

    return (
        <div className="flex flex-col items-center justify-center gap-6 w-full h-full">
            {/* Visualizer Circle */}
            <div className="relative">
                {isListening && (
                    <>
                        <motion.div
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute inset-0 bg-primary/50 rounded-full z-0"
                        />
                        <motion.div
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.2, opacity: 0 }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                            className="absolute inset-0 bg-primary/30 rounded-full z-0"
                        />
                    </>
                )}

                <Button
                    onClick={handleToggle}
                    variant="outline"
                    size="icon"
                    className={`relative w-24 h-24 rounded-full border-4 transition-all z-10 ${isListening
                        ? 'bg-primary/20 border-primary shadow-[0_0_40px_var(--color-primary)] text-primary hover:bg-primary/30'
                        : 'bg-card border-border hover:border-muted-foreground text-muted-foreground hover:text-foreground'
                        }`}
                >
                    {isListening ? (
                        <Mic className="w-10 h-10 animate-pulse" />
                    ) : (
                        <MicOff className="w-10 h-10" />
                    )}
                </Button>
            </div>

            {/* Status Text */}
            <div className="h-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {isListening ? (
                        <motion.div
                            key="listening"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="flex items-center gap-2 text-primary font-mono text-sm tracking-widest uppercase"
                        >
                            <Activity className="w-4 h-4 animate-bounce" />
                            Recording Audio Stream...
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-muted-foreground font-mono text-sm tracking-widest uppercase"
                        >
                            Microphone Standby
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {transcript && !isListening && (
                <Button onClick={handleReset} variant="ghost" size="sm" className="text-muted-foreground hover:text-red-400">
                    <RotateCcw className="mr-2 h-3 w-3" /> Clear Transcript
                </Button>
            )}
        </div>
    );
};

export default VoiceRecorder;
