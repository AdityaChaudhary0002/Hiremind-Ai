import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import api from '../services/api';
import TTS from '../services/audioEngine';

// --- RIGID FINITE STATE MACHINE (FSM) ---
export const INTERVIEW_STATUS = {
    IDLE: 'idle',               // Waiting to start the session (System Online)
    GENERATING: 'generating',   // Preparing environment / fetching data
    ASKING: 'asking',           // Engine is speaking the question aloud
    RECORDING: 'recording',     // Waiting for candidate response (Mic Active)
    EVALUATING: 'evaluating',   // Processing submission & checking for follow-up
    COMPLETED: 'completed'      // Session over, sending feedback
};

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
    //   INITIALIZATION (FSM: GENERATING -> IDLE)
    // ====================
    useEffect(() => {
        const initialize = async () => {
            if (status !== INTERVIEW_STATUS.IDLE && status !== INTERVIEW_STATUS.GENERATING) return;
            if (initializingRef.current) return;
            initializingRef.current = true;

            setStatus(INTERVIEW_STATUS.GENERATING);

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
    //   SPEAK & STATE TRANSITIONS
    // ====================
    const speakCurrentQuestion = useCallback(() => {
        const text = questions[currentQuestionIndex];
        if (!text) return;

        console.log(`[TTS] Speak Q${currentQuestionIndex}: "${text.substring(0, 40)}..."`);
        setStatus(INTERVIEW_STATUS.ASKING);

        TTS.speak(
            text,
            null, // onStart is fired internally in TTS
            () => setStatus(INTERVIEW_STATUS.RECORDING), // onEnd
            () => setStatus(INTERVIEW_STATUS.RECORDING)  // onError
        );
    }, [questions, currentQuestionIndex]);

    const stopAudio = useCallback(() => {
        TTS.stop();
    }, []);

    // FSM: Auto-trigger asking if we navigate to a new question 
    // AND we are not idle, not evaluating, not completed.
    useEffect(() => {
        // If we are evaluating, generating, completed, or idle, do not auto-speak.
        if (
            status === INTERVIEW_STATUS.IDLE ||
            status === INTERVIEW_STATUS.GENERATING ||
            status === INTERVIEW_STATUS.COMPLETED ||
            status === INTERVIEW_STATUS.EVALUATING
        ) return;

        if (questions.length === 0) return;

        // Dedup: Ensure we don't speak the same question twice
        if (hasSpoken.current[currentQuestionIndex]) {
            if (status !== INTERVIEW_STATUS.RECORDING) {
                setStatus(INTERVIEW_STATUS.RECORDING);
            }
            return;
        }

        hasSpoken.current[currentQuestionIndex] = true;

        const timer = setTimeout(() => {
            speakCurrentQuestion();
        }, 500);

        return () => clearTimeout(timer);
    }, [status, questions.length, currentQuestionIndex, speakCurrentQuestion]);

    // ====================
    //   ACTIONS: START
    // ====================
    const startSession = useCallback(() => {
        if (status !== INTERVIEW_STATUS.IDLE) return;
        if (questions.length === 0) return;

        hasSpoken.current = {}; // Reset dedup

        // This triggers the useEffect above because it moves away from IDLE
        // We set to recording temporarily, the useEffect intercepts the fresh index and triggers ASKING
        setStatus(INTERVIEW_STATUS.RECORDING);
    }, [status, questions.length]);

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

        // FSM: Shift to EVALUATING
        setStatus(INTERVIEW_STATUS.EVALUATING);
        TTS.stop();

        try {
            const currentQ = questions[currentQuestionIndex];
            const currentA = transcript;
            setTranscript('');

            let nextIndex = currentQuestionIndex + 1;

            if (currentQuestionIndex < questions.length) {
                console.log('[ENGINE] Evaluating response...');

                const token = await getToken();
                const analysis = await api.submitFollowup({
                    question: currentQ,
                    answer: currentA,
                    role,
                    difficulty,
                    history: memory
                }, token);

                const { followUp, confidenceScore, weakTopics } = analysis.data;

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

                if (followUp) {
                    console.log('[ENGINE] ⚡️ Adaptive Follow-up Triggered');
                    setQuestions(prev => {
                        const updated = [...prev];
                        updated.splice(currentQuestionIndex + 1, 0, followUp);
                        return updated;
                    });
                }
            }

            // FSM: Evaluate next move (continue or finish)
            setCurrentQuestionIndex(prev => prev + 1);
            setStatus(INTERVIEW_STATUS.RECORDING);

        } catch (err) {
            console.error('Submission Error:', err);
            setCurrentQuestionIndex(prev => prev + 1);
            setStatus(INTERVIEW_STATUS.RECORDING);
        }
    }, [transcript, questions, currentQuestionIndex, interviewId, getToken, role, difficulty, memory]);

    // FSM: Handle generic Completion
    useEffect(() => {
        // If we crossed the boundary of total questions, finalize
        if (
            questions.length > 0 &&
            currentQuestionIndex >= questions.length &&
            status !== INTERVIEW_STATUS.COMPLETED &&
            status !== INTERVIEW_STATUS.EVALUATING // Wait for evaluating to finish before marking complete
        ) {
            const finalize = async () => {
                setStatus(INTERVIEW_STATUS.COMPLETED);
                const token = await getToken();
                try {
                    await api.submitInterview(interviewId, {}, token);
                } catch (err) {
                    if (err.response?.status === 409) {
                        console.log('[ENGINE] Idempotency: Session already completed on server.');
                    } else {
                        console.error('Finalization Error:', err);
                    }
                }
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
            isSpeaking: status === INTERVIEW_STATUS.ASKING,
            isAnalyzing: status === INTERVIEW_STATUS.EVALUATING,
            isRecording: status === INTERVIEW_STATUS.RECORDING,
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
                setStatus(INTERVIEW_STATUS.RECORDING);
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
