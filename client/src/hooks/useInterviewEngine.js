import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import api from '../services/api';

// --- CONSTANTS ---
export const INTERVIEW_STATUS = {
    IDLE: 'idle',
    INITIALIZING: 'initializing',
    THINKING: 'thinking',
    SPEAKING: 'speaking',
    LISTENING: 'listening',
    PROCESSING: 'processing',
    COMPLETED: 'completed'
};

// ============================================================
// MODULE-LEVEL TTS MANAGER
// Lives OUTSIDE React — component crashes can't touch it.
// ============================================================
const TTS = {
    _speaking: false,
    _currentText: '',

    speak(text, onStart, onEnd, onError) {
        const synth = window.speechSynthesis;
        if (!synth || !text) return;

        // Already speaking the same thing? Do nothing.
        if (this._speaking && this._currentText === text) {
            console.log('[TTS] Already speaking this text, ignoring duplicate');
            return;
        }

        // Already speaking something ELSE? Also ignore — don't interrupt.
        if (synth.speaking && !synth.paused) {
            console.log('[TTS] Synth busy, ignoring');
            return;
        }

        this._speaking = true;
        this._currentText = text;

        const utterance = new SpeechSynthesisUtterance(text);

        // Pick a voice
        const voices = synth.getVoices();
        const pick = voices.find(v =>
            v.name.includes('Google US English') ||
            v.name.includes('Microsoft David') ||
            v.name.includes('Samantha')
        ) || voices[0];
        if (pick) utterance.voice = pick;

        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
            console.log('[TTS] ▶ Speaking started');
            this._speaking = true;
            if (onStart) onStart();
        };
        utterance.onend = () => {
            console.log('[TTS] ■ Speaking ended');
            this._speaking = false;
            this._currentText = '';
            if (onEnd) onEnd();
        };
        utterance.onerror = (e) => {
            // 'interrupted' and 'canceled' are expected when user skips/stops
            if (e.error === 'interrupted' || e.error === 'canceled') {
                console.log('[TTS] Speech interrupted (expected)');
            } else {
                console.error('[TTS] ✖ Unexpected error:', e.error);
            }
            this._speaking = false;
            this._currentText = '';
            if (onError) onError(e.error);
        };

        // DO NOT call synth.cancel() here! That's the bug.
        // Just speak. The queue will handle it.
        synth.speak(utterance);

        // Chrome bug: if it auto-paused, resume
        if (synth.paused) synth.resume();

        // Keep utterance reference alive (prevents GC)
        window.__ttsUtterance = utterance;
    },

    stop() {
        const synth = window.speechSynthesis;
        if (synth) synth.cancel();
        this._speaking = false;
        this._currentText = '';
    },

    isBusy() {
        return this._speaking || window.speechSynthesis?.speaking;
    }
};

// ============================================================

const useInterviewEngine = () => {
    const navigate = useNavigate();
    const { getToken, userId, isLoaded } = useAuth();

    // --- CORE STATE ---
    const [status, setStatus] = useState(INTERVIEW_STATUS.IDLE);
    const [interviewId, setInterviewId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [role, setRole] = useState(null);
    const [difficulty, setDifficulty] = useState(null);

    // --- CODING STATE ---
    const [code, setCode] = useState('// Write your solution here...');
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState(null);
    const [mode, setMode] = useState('speech');
    const [isCodingInterview, setIsCodingInterview] = useState(false);

    // --- REFS ---
    const initializingRef = useRef(false);
    const hasSpoken = useRef({});

    // ====================
    //   INITIALIZATION
    // ====================
    useEffect(() => {
        const initialize = async () => {
            if (status !== INTERVIEW_STATUS.IDLE || initializingRef.current) return;
            initializingRef.current = true;

            setStatus(INTERVIEW_STATUS.INITIALIZING);

            try {
                const token = await getToken();
                const locationState = window.history.state?.usr;

                if (locationState?.role && locationState?.difficulty) {
                    console.log('Starting New Interview:', locationState);
                    setRole(locationState.role);
                    setDifficulty(locationState.difficulty);

                    const r = locationState.role.toLowerCase();
                    const isTech = ['tech', 'developer', 'engineer', 'architect', 'stack', 'sde', 'program', 'software', 'full', 'front', 'back', 'devops', 'data'].some(k => r.includes(k));
                    setIsCodingInterview(isTech);

                    const sessionData = await api.generateQuestions(
                        locationState.role,
                        locationState.difficulty,
                        token,
                        locationState.resumeText
                    );

                    setInterviewId(sessionData._id);
                    setQuestions(sessionData.questions);
                    setStatus(INTERVIEW_STATUS.IDLE);
                } else {
                    const savedId = sessionStorage.getItem('currentInterviewId');
                    if (savedId) {
                        const data = await api.getInterviewById(savedId, token);
                        setInterviewId(data._id);
                        setQuestions(data.questions);
                        setRole(data.role);
                        setDifficulty(data.difficulty);
                        setIsCodingInterview(data.type === 'Technical');
                        setStatus(INTERVIEW_STATUS.IDLE);
                    } else {
                        navigate('/dashboard');
                    }
                }
            } catch (err) {
                console.error('Initialization Failed:', err);
                alert('Failed to start interview. Please try again.');
                navigate('/dashboard');
            }
        };

        if (isLoaded && userId) initialize();
    }, [isLoaded, userId, navigate, getToken, status]);

    // ====================
    //   VOICE PRELOAD
    // ====================
    useEffect(() => {
        const load = () => window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = load;
        load();
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, []);

    // ====================
    //   SPEAK — via module-level TTS manager
    // ====================
    const speakCurrentQuestion = useCallback(() => {
        const text = questions[currentQuestionIndex];
        if (!text) return;

        console.log(`[TTS] Speak Q${currentQuestionIndex}: "${text.substring(0, 40)}..."`);

        TTS.speak(
            text,
            () => setStatus(INTERVIEW_STATUS.SPEAKING),
            () => setStatus(INTERVIEW_STATUS.LISTENING),
            () => setStatus(INTERVIEW_STATUS.LISTENING)
        );
    }, [questions, currentQuestionIndex]);

    const stopAudio = useCallback(() => {
        TTS.stop();
    }, []);

    // ====================
    //   AUTO-SPEAK on THINKING
    // ====================
    useEffect(() => {
        if (status !== INTERVIEW_STATUS.THINKING) return;
        if (questions.length === 0) return;

        if (hasSpoken.current[currentQuestionIndex]) {
            console.log(`[TTS] Q${currentQuestionIndex} already spoken, → LISTENING`);
            setStatus(INTERVIEW_STATUS.LISTENING);
            return;
        }

        hasSpoken.current[currentQuestionIndex] = true;

        // Use a timeout so the render settles first
        const timer = setTimeout(() => {
            speakCurrentQuestion();
        }, 500);

        return () => clearTimeout(timer);
    }, [status, questions, currentQuestionIndex, speakCurrentQuestion]);

    // ====================
    //   ACTIONS
    // ====================
    const startSession = useCallback(() => {
        console.log('[ENGINE] startSession called');
        if (questions.length === 0) {
            console.warn('[ENGINE] No questions loaded');
            return;
        }
        // Guard: prevent double-click
        if (status !== INTERVIEW_STATUS.IDLE) return;

        // Reset dedup
        hasSpoken.current = {};

        // The button click IS the user gesture — that's enough for Chrome.
        // Just go straight to THINKING. The auto-speak effect handles the rest.
        setStatus(INTERVIEW_STATUS.THINKING);
    }, [questions, status]);

    const executeCode = useCallback(async () => {
        if (!code) return;
        setOutput({ status: 'running', result: 'Executing...' });
        try {
            const res = await api.runCode(language, code);
            setOutput({ status: 'success', result: res.data?.run?.output || 'Done' });
        } catch (err) {
            console.error('Code Execution Error:', err);
            setOutput({ status: 'error', result: 'Execution Failed' });
        }
    }, [code, language]);

    // --- MEMORY STATE (New) ---
    const [memory, setMemory] = useState([]);

    const submitAnswer = useCallback(async () => {
        if (!transcript.trim()) return;
        setStatus(INTERVIEW_STATUS.PROCESSING);
        TTS.stop();

        try {
            // 1. Capture current interaction
            const currentQ = questions[currentQuestionIndex];
            const currentA = transcript;

            setTranscript('');

            // 2. Check for Adaptive Follow-up
            let nextIndex = currentQuestionIndex + 1;

            // Only generate follow-up if we are NOT already on the last question
            // (or maybe we allow one last follow-up even at the end? Let's stick to flow for now)
            if (currentQuestionIndex < questions.length) { // Allow growing
                console.log('[ENGINE] Analyzing for Follow-up...');

                const token = await getToken();
                const analysis = await api.submitFollowup({
                    question: currentQ,
                    answer: currentA,
                    role,
                    difficulty,
                    history: memory // Pass accumulated memory
                }, token);

                const { followUp, confidenceScore, weakTopics } = analysis.data;

                // 3. Update Memory
                const newMemory = [
                    ...memory,
                    {
                        question: currentQ,
                        answer: currentA,
                        feedback: followUp ? "Triggered Follow-up" : "Satisfactory",
                        weakTopics: weakTopics || [],
                        confidenceScore
                    }
                ];
                setMemory(newMemory);

                // 4. Handle Follow-up Injection
                if (followUp) {
                    console.log('[ENGINE] ⚡️ Adaptive Event Triggered:', followUp);
                    // Inject follow-up at next index
                    setQuestions(prev => {
                        const updated = [...prev];
                        updated.splice(currentQuestionIndex + 1, 0, followUp);
                        return updated;
                    });
                    // We will naturally advance to this new question at nextIndex
                }
            }

            // 5. Advance or Complete
            if (nextIndex < questions.length + (questions.length > currentQuestionIndex + 1 ? 0 : 0)) { // Logic check: Questions array might have grown!
                // We re-check length after update provided via functional update? 
                // Actually `questions` in closure is stale. 
                // But we used setQuestions. 
                // We need to rely on the fact that if we added a question, the length increased.
                // But we can't see it yet.
                // We just blindly go to nextIndex.
                setCurrentQuestionIndex(prev => prev + 1);
                setStatus(INTERVIEW_STATUS.THINKING);
            } else {
                // Check if we exhausted the (potentially grown) list
                // Since we can't see the new length in this closure, we might need a useEffect or a refs?
                // OR simpler: compare nextIndex with *current* length + 1 if followUp existed?
                // Let's rely on effect? No, we need explicit nav.

                // Hack/Fix: If we added a question, we definitely aren't done.
                // If we didn't, we might be done.
                // We'll trust the state update will allow rendering the new question.
                // But we need to know IF we are done.

                setCurrentQuestionIndex(prev => prev + 1); // This moves to next.
                // The useEffect for `questions` change might be needed? 
                // `startSession` or `auto-speak` depends on index changing.
                setStatus(INTERVIEW_STATUS.THINKING);
            }

        } catch (err) {
            console.error('Submission Error:', err);
            setCurrentQuestionIndex(prev => prev + 1);
            setStatus(INTERVIEW_STATUS.THINKING);
        }
    }, [transcript, questions, currentQuestionIndex, interviewId, getToken, role, difficulty, memory]);

    // Check for completion in an effect
    useEffect(() => {
        if (currentQuestionIndex >= questions.length && questions.length > 0 && status !== INTERVIEW_STATUS.COMPLETED && status !== INTERVIEW_STATUS.PROCESSING) {
            const finalize = async () => {
                setStatus(INTERVIEW_STATUS.COMPLETED);
                const token = await getToken();
                await api.submitInterview(interviewId, {}, token);
            };
            finalize();
        }
    }, [currentQuestionIndex, questions.length, status, interviewId, getToken]);

    // NO cleanup cancel on unmount — that was the whole bug!
    // WebGL Context Lost → unmount → cancel → audio dies.
    // TTS module lives outside React. Crashes can't kill it.

    // ====================
    //   RETURN
    // ====================
    return {
        state: {
            status,
            interviewId,
            questions,
            currentQuestionIndex,
            currentQuestion: questions[currentQuestionIndex] || 'Loading...',
            totalQuestions: questions.length,
            transcript,
            role,
            difficulty,
            isSpeaking: status === INTERVIEW_STATUS.SPEAKING,
            isAnalyzing: status === INTERVIEW_STATUS.PROCESSING,
            isRecording: status === INTERVIEW_STATUS.LISTENING,
            code,
            language,
            output,
            mode,
            isCodingInterview,
            error: null
        },
        actions: {
            setTranscript,
            submitAnswer,
            speakQuestion: speakCurrentQuestion,
            stopAudio,
            skipQuestion: () => {
                TTS.stop();
                setCurrentQuestionIndex(p => Math.min(p + 1, questions.length - 1));
                setStatus(INTERVIEW_STATUS.THINKING);
            },
            setCode,
            setLanguage,
            setMode,
            setOutput,
            executeCode,
            startSession
        }
    };
};

export { useInterviewEngine };
export default useInterviewEngine;
