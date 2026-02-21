import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import {
    ArrowLeft, ChevronDown, ChevronUp, Activity, Brain, MessageSquare,
    CheckCircle, AlertTriangle, Zap, Target, RotateCcw, Loader2, Trophy,
    TrendingUp, TrendingDown, Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { MOTION, STYLES } from '@/lib/design-system';
import api from '../services/api';

// --- Score Ring Component ---
const ScoreRing = ({ score, size = 160, strokeWidth = 6, label }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 80 ? '#4ade80' : score >= 60 ? '#facc15' : '#f87171';

    return (
        <div className="relative flex flex-col items-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
                    stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius} fill="none"
                    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    className="text-4xl font-heading font-bold"
                    style={{ color }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, type: "spring" }}
                >
                    {score}
                </motion.span>
                {label && <span className="text-[10px] font-mono text-muted-text uppercase tracking-widest mt-1">{label}</span>}
            </div>
        </div>
    );
};

// --- Score Bar Component ---
const ScoreBar = ({ label, score, maxScore = 10, delay = 0 }) => {
    const pct = (score / maxScore) * 100;
    const color = score >= 7 ? 'bg-green-500' : score >= 5 ? 'bg-yellow-500' : 'bg-red-500';
    const textColor = score >= 7 ? 'text-green-400' : score >= 5 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm text-body font-medium truncate max-w-[70%]">{label}</span>
                <span className={`text-sm font-mono font-bold ${textColor}`}>{score}/{maxScore}</span>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 + delay * 0.1 }}
                />
            </div>
        </div>
    );
};

// --- Transcript Item (Accordion) ---
const TranscriptItem = ({ index, question, answer, analysis, isWeak }) => {
    const [open, setOpen] = useState(false);
    const scoreColor = (analysis?.score || 0) >= 7 ? 'text-green-400' : (analysis?.score || 0) >= 5 ? 'text-yellow-400' : 'text-red-400';
    const scoreBg = (analysis?.score || 0) >= 7 ? 'bg-green-500/10 border-green-500/20' : (analysis?.score || 0) >= 5 ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20';

    return (
        <motion.div
            variants={MOTION.drift}
            className={`${STYLES.glass_card} overflow-hidden transition-all ${isWeak ? 'ring-1 ring-red-500/20' : ''}`}
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full p-6 flex items-start gap-4 text-left hover:bg-white/[0.02] transition-colors"
            >
                {/* Question Number Badge */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 border ${scoreBg}`}>
                    <span className={scoreColor}>Q{index + 1}</span>
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-heading leading-relaxed line-clamp-2">
                        {question}
                    </h3>
                    {analysis?.topic && (
                        <span className="inline-block mt-2 text-[10px] font-mono uppercase tracking-widest text-muted-text bg-glass-hover px-3 py-1 rounded-full">
                            {analysis.topic}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-lg font-mono font-bold ${scoreColor}`}>
                        {analysis?.score || 0}/10
                    </span>
                    {open ? <ChevronUp className="w-4 h-4 text-muted-text" /> : <ChevronDown className="w-4 h-4 text-muted-text" />}
                </div>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 space-y-4 border-t border-[var(--glass-border)] pt-4">
                            {/* User Answer */}
                            <div className="bg-glass rounded-xl p-4 border-l-2 border-blue-500/40">
                                <div className="flex items-center gap-2 text-[10px] font-mono text-blue-400 uppercase tracking-widest mb-2">
                                    <MessageSquare className="w-3 h-3" /> Your Response
                                </div>
                                <p className="text-subtle text-sm italic leading-relaxed">"{answer || 'No response recorded'}"</p>
                            </div>

                            {/* AI Feedback */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-green-500/5 rounded-xl p-4 border border-green-500/10">
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-green-400 uppercase tracking-widest mb-2">
                                        <CheckCircle className="w-3 h-3" /> Feedback
                                    </div>
                                    <p className="text-sm text-body leading-relaxed">{analysis?.feedback || 'N/A'}</p>
                                </div>
                                <div className="bg-purple-500/5 rounded-xl p-4 border border-purple-500/10">
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-purple-400 uppercase tracking-widest mb-2">
                                        <Sparkles className="w-3 h-3" /> Ideal Answer
                                    </div>
                                    <p className="text-sm text-body leading-relaxed">{analysis?.idealAnswer || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};


// ===== MAIN PAGE =====
const InterviewBreakdown = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await getToken();
                const data = await api.getInterviewById(interviewId, token);
                setInterview(data);
            } catch (err) {
                console.error("Breakdown Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [interviewId, getToken]);

    // --- Loading State ---
    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-page-alt text-subtle">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-body" />
            <span className="font-mono text-xs tracking-[0.2em] uppercase">Decrypting Mission Data...</span>
        </div>
    );

    // --- No Data State ---
    if (!interview) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-page-alt text-subtle">
            <AlertTriangle className="w-10 h-10 mb-4 text-yellow-500/60" />
            <span className="font-mono text-xs tracking-[0.2em] uppercase mb-4">Archive Not Found</span>
            <Button onClick={() => navigate('/history')} className="bg-white text-black hover:bg-white/90 font-mono text-xs uppercase">
                Return to Archives
            </Button>
        </div>
    );

    const feedback = interview.feedback || {};
    const questionAnalysis = feedback.questionAnalysis || [];
    const questions = interview.questions || [];
    const answers = interview.answers || [];
    const overallScore = feedback.overallScore || 0;
    const technicalScore = feedback.technicalScore || 0;
    const communicationScore = feedback.communicationScore || 0;

    // Build analysis map by question text for lookup
    const analysisMap = {};
    questionAnalysis.forEach(qa => { analysisMap[qa.question] = qa; });

    // Detect weak topics (score < 6)
    const weakQuestions = questionAnalysis.filter(q => (q.score || 0) < 6);
    const strongQuestions = questionAnalysis.filter(q => (q.score || 0) >= 7);

    const scoreColor = overallScore >= 80 ? 'text-green-400' : overallScore >= 60 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="min-h-screen relative flex flex-col selection:bg-white/20 pb-24 bg-page overflow-x-hidden font-sans">

            {/* AMBIENT ORBS */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <motion.div
                    animate={{ y: [0, -30, 0], opacity: [0.08, 0.15, 0.08] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 right-[10%] w-72 h-72 bg-blue-500/5 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{ y: [0, 25, 0], opacity: [0.05, 0.12, 0.05] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-40 left-[5%] w-96 h-96 bg-purple-500/5 blur-[140px] rounded-full"
                />
                <motion.div
                    animate={{ x: [0, 15, 0], opacity: [0.03, 0.08, 0.03] }}
                    transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[50%] left-[40%] w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full"
                />
            </div>

            {/* BACK NAVIGATION */}
            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 pt-8">
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate('/history')}
                    className="flex items-center gap-2 text-xs font-mono text-muted-text hover:text-body uppercase tracking-widest transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Archives
                </motion.button>
            </div>

            {/* HERO HEADER */}
            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 pt-8 pb-12 border-b border-[var(--border-subtle)]">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <div className="flex items-center gap-3 text-xs font-mono text-muted-text mb-4 uppercase tracking-[0.2em]">
                        <Activity className="w-3 h-3" />
                        <span>Mission Debrief</span>
                        <span className="text-faint">•</span>
                        <span>{new Date(interview.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-heading font-bold text-heading tracking-tighter mb-3">
                        {interview.role}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <span className="px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-full border border-[var(--border-medium)] text-subtle bg-glass-hover">
                            {interview.difficulty}
                        </span>
                        <span className="px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-full border border-[var(--border-medium)] text-subtle bg-glass-hover">
                            {interview.type || 'Technical'}
                        </span>
                        <span className="px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-full border border-[var(--border-medium)] text-subtle bg-glass-hover">
                            {questions.length} Questions
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* CONTENT GRID */}
            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* LEFT SIDEBAR — Score Metrics (Sticky) */}
                    <motion.div
                        className="lg:col-span-4 xl:col-span-3"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="lg:sticky lg:top-8 space-y-8">

                            {/* Overall Score Ring */}
                            <div className={`${STYLES.glass_card} p-8 flex flex-col items-center`}>
                                <div className="text-[10px] font-mono text-muted-text uppercase tracking-widest mb-6">Overall Rating</div>
                                <ScoreRing score={overallScore} label="Score" />

                                {/* Sub-scores */}
                                <div className="w-full grid grid-cols-2 gap-3 mt-8">
                                    <div className="bg-glass-hover rounded-xl p-4 text-center border border-[var(--glass-border)]">
                                        <div className="text-[9px] font-mono text-muted-text uppercase tracking-widest mb-1">Technical</div>
                                        <div className={`text-2xl font-heading font-bold ${technicalScore >= 70 ? 'text-green-400' : technicalScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {technicalScore}
                                        </div>
                                    </div>
                                    <div className="bg-glass-hover rounded-xl p-4 text-center border border-[var(--glass-border)]">
                                        <div className="text-[9px] font-mono text-muted-text uppercase tracking-widest mb-1">Communication</div>
                                        <div className={`text-2xl font-heading font-bold ${communicationScore >= 70 ? 'text-green-400' : communicationScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {communicationScore}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Topic-wise Score Bars */}
                            {questionAnalysis.length > 0 && (
                                <div className={`${STYLES.glass_card} p-6`}>
                                    <div className="text-[10px] font-mono text-muted-text uppercase tracking-widest mb-5 flex items-center gap-2">
                                        <Target className="w-3 h-3" /> Topic Breakdown
                                    </div>
                                    <div className="space-y-4">
                                        {questionAnalysis.map((qa, i) => (
                                            <ScoreBar key={i} label={qa.topic || `Q${i + 1}`} score={qa.score || 0} delay={i} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Weak Areas Alert */}
                            {weakQuestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className={`${STYLES.glass_card} p-6 border-red-500/10`}
                                >
                                    <div className="text-[10px] font-mono text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <TrendingDown className="w-3 h-3" /> Weak Areas Detected
                                    </div>
                                    <div className="space-y-2 mb-5">
                                        {weakQuestions.map((wq, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-subtle">
                                                <AlertTriangle className="w-3 h-3 text-red-400/60 shrink-0" />
                                                <span className="truncate">{wq.topic || wq.question?.slice(0, 40)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        onClick={() => navigate('/role-selection')}
                                        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-mono text-[10px] uppercase tracking-widest rounded-full py-3 transition-all hover:scale-[1.02]"
                                    >
                                        <RotateCcw className="w-3 h-3 mr-2" />
                                        Reattempt Weak Questions
                                    </Button>
                                </motion.div>
                            )}

                            {/* Summary */}
                            {feedback.summary && (
                                <div className={`${STYLES.glass_card} p-6`}>
                                    <div className="text-[10px] font-mono text-muted-text uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Brain className="w-3 h-3" /> AI Summary
                                    </div>
                                    <p className="text-sm text-subtle leading-relaxed">{feedback.summary}</p>
                                </div>
                            )}

                            {/* Improvements */}
                            {feedback.improvements?.length > 0 && (
                                <div className={`${STYLES.glass_card} p-6`}>
                                    <div className="text-[10px] font-mono text-muted-text uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-3 h-3" /> Key Improvements
                                    </div>
                                    <div className="space-y-3">
                                        {feedback.improvements.map((imp, i) => (
                                            <div key={i} className="flex items-start gap-3 text-sm text-subtle">
                                                <Zap className="w-3 h-3 text-yellow-400/60 mt-1 shrink-0" />
                                                <span className="leading-relaxed">{imp}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* RIGHT — Full Transcript + Per-Question Feedback */}
                    <motion.div
                        className="lg:col-span-8 xl:col-span-9"
                        variants={MOTION.container}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="text-[10px] font-mono text-muted-text uppercase tracking-widest flex items-center gap-2">
                                <MessageSquare className="w-3 h-3" /> Full Transcript & Analysis
                            </div>
                            <div className="text-[10px] font-mono text-muted-text uppercase tracking-widest">
                                {questions.length} Questions • {strongQuestions.length} Strong • {weakQuestions.length} Weak
                            </div>
                        </div>

                        <div className="space-y-4">
                            {questions.map((q, i) => {
                                const analysis = analysisMap[q] || questionAnalysis[i] || {};
                                const isWeak = (analysis.score || 0) < 6;
                                return (
                                    <TranscriptItem
                                        key={i}
                                        index={i}
                                        question={q}
                                        answer={answers[i]}
                                        analysis={analysis}
                                        isWeak={isWeak}
                                    />
                                );
                            })}
                        </div>

                        {/* Bottom CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <Button
                                onClick={() => navigate('/role-selection')}
                                className="bg-white text-black hover:bg-white/90 font-mono text-xs uppercase tracking-widest py-3 px-8 rounded-full hover:scale-105 transition-transform"
                            >
                                <RotateCcw className="w-3 h-3 mr-2" />
                                New Simulation
                            </Button>
                            <Button
                                onClick={() => navigate('/history')}
                                variant="ghost"
                                className="text-muted-text hover:text-heading font-mono text-xs uppercase tracking-widest py-3 px-8 rounded-full"
                            >
                                Back to Archives
                            </Button>
                        </motion.div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default InterviewBreakdown;
