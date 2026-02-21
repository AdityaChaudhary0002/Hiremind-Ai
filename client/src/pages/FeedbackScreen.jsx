import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { CheckCircle, XCircle, ChevronRight, Activity, Zap, Brain, MessageSquare, ArrowRight, Loader2, Target } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { MOTION, STYLES } from '@/lib/design-system';
import Logo from '@/components/ui/logo';
import Confetti from 'react-confetti';

const FeedbackScreen = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const token = await getToken();
                const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
                const response = await axios.get(`${apiUrl}/api/interview/${interviewId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFeedback(response.data.feedback);
            } catch (error) {
                console.error("Error fetching feedback:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, [interviewId, getToken]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-glass">
            <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                <div className="text-xs font-mono text-subtle uppercase tracking-widest">Compiling Mission Report...</div>
            </div>
        </div>
    );

    if (!feedback || !feedback.questions) return (
        <div className="min-h-screen flex items-center justify-center text-heading">
            <div className="text-center">
                <div className="text-xl font-bold mb-2">Analysis Pending</div>
                <div className="text-subtle">The report is still being generated or is unavailable.</div>
                <Button onClick={() => navigate('/dashboard')} className="mt-4 bg-white text-black">Return Home</Button>
            </div>
        </div>
    );

    const scoreColor = (feedback.overallScore || 0) >= 80 ? 'text-green-400' : (feedback.overallScore || 0) >= 60 ? 'text-yellow-400' : 'text-red-400';
    const scoreBorder = (feedback.overallScore || 0) >= 80 ? 'border-green-400/20' : (feedback.overallScore || 0) >= 60 ? 'border-yellow-400/20' : 'border-red-400/20';

    return (
        <div className="min-h-screen relative flex flex-col overflow-hidden selection:bg-white/20">
            {feedback.overallScore >= 80 && <Confetti recycle={false} numberOfPieces={200} colors={['#ffffff', '#818cf8']} />}

            {/* HUD */}
            <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-50 pointer-events-none">
                <div className="pointer-events-auto">
                    <Logo className="scale-75 origin-top-left opacity-50 hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] font-mono text-muted-text uppercase tracking-[0.2em]">Mission Debrief // ID: {interviewId.slice(-6)}</div>
            </div>

            <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24">

                {/* Header */}
                <motion.div variants={MOTION.drift} initial="hidden" animate="visible" className="text-center mb-16">
                    <h1 className={`${STYLES.h1_hero} text-5xl md:text-7xl mb-4`}>Performance Analysis</h1>
                    <p className={`${STYLES.p_body} max-w-2xl mx-auto`}>
                        Simulation complete. Review your tactical decisions and linguistic patterns below.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT: Score Card */}
                    <motion.div
                        variants={MOTION.drift}
                        initial="hidden"
                        animate="visible"
                        className="lg:col-span-1"
                    >
                        <div className={`${STYLES.glass_card} p-8 text-center flex flex-col items-center justify-center h-fit sticky top-24`}>
                            <div className="text-xs font-mono text-muted-text uppercase tracking-widest mb-6">Overall Rating</div>

                            <div className={`w-40 h-40 rounded-full flex items-center justify-center border-4 ${scoreBorder} mb-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-glass`}>
                                <div className={`text-6xl font-heading font-bold ${scoreColor}`}>
                                    {feedback.overallScore}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full mt-4">
                                <div className="bg-glass-hover p-4 rounded-xl">
                                    <div className="text-xs text-muted-text uppercase mb-1">Duration</div>
                                    <div className="text-xl font-mono text-heading">24m</div>
                                </div>
                                <div className="bg-glass-hover p-4 rounded-xl">
                                    <div className="text-xs text-muted-text uppercase mb-1">Status</div>
                                    <div className="text-xl font-mono text-heading">PASSED</div>
                                </div>
                            </div>

                            <Button onClick={() => navigate('/dashboard')} className="w-full mt-8 bg-white text-black hover:bg-white/90 font-bold">
                                Return to Command
                            </Button>
                        </div>

                        {/* SMART SUGGESTION CARD */}
                        {feedback.suggestedGoal && (
                            <motion.div
                                variants={MOTION.drift}
                                initial="hidden"
                                animate="visible"
                                className="mt-8 relative group cursor-pointer"
                                onClick={() => navigate('/goals', { state: { prefillGoal: feedback.suggestedGoal } })}
                            >
                                <div className={`${STYLES.glass_card} p-6 border-primary/20 hover:border-primary/50 transition-all overflow-hidden relative`}>
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-primary uppercase tracking-widest mb-4">
                                        <Zap className="w-3 h-3 fill-primary" /> System Suggestion
                                    </div>
                                    <h4 className="text-heading text-lg font-medium mb-2 pr-8 leading-snug">
                                        Focus Area Identified: <br /> {feedback.suggestedGoal.title}
                                    </h4>
                                    <p className="text-subtle text-xs font-mono mb-6">
                                        This topic has been flagged in your recent simulations.
                                    </p>
                                    <Button variant="outline" className="w-full border-[var(--border-medium)] hover:bg-white hover:text-black hover:border-white font-mono text-xs uppercase transition-all flex items-center gap-2">
                                        <Target className="w-3 h-3" /> SET AS GOAL
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* RIGHT: Detailed Analysis */}
                    <motion.div
                        variants={MOTION.container}
                        initial="hidden"
                        animate="visible"
                        className="lg:col-span-2 space-y-6"
                    >
                        {(feedback.questions || []).map((q, i) => (
                            <motion.div
                                key={i}
                                variants={MOTION.drift}
                                className={`${STYLES.glass_card} p-6 relative overflow-hidden group`}
                            >
                                <div className="absolute inset-0 bg-glass-hover opacity-0 group-hover:opacity-10 transition-opacity" />

                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-[var(--glass-hover)] flex items-center justify-center text-xs font-bold text-subtle">
                                        Q{i + 1}
                                    </div>
                                    <h3 className="text-lg font-medium text-heading leading-relaxed">
                                        {q.question}
                                    </h3>
                                </div>

                                <div className="bg-glass rounded-xl p-4 mb-4 border-l-2 border-primary/50">
                                    <div className="flex items-center gap-2 text-xs font-mono text-primary uppercase tracking-widest mb-2">
                                        <MessageSquare className="w-3 h-3" /> Your Response
                                    </div>
                                    <p className="text-body italic text-sm">"{q.userAnswer}"</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/10">
                                        <div className="flex items-center gap-2 text-xs font-mono text-green-400 uppercase tracking-widest mb-2">
                                            <CheckCircle className="w-3 h-3" /> Strengths
                                        </div>
                                        <p className="text-sm text-body">{q.feedback}</p>
                                    </div>
                                    <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/10">
                                        <div className="flex items-center gap-2 text-xs font-mono text-yellow-400 uppercase tracking-widest mb-2">
                                            <Brain className="w-3 h-3" /> Improvement
                                        </div>
                                        <p className="text-sm text-body">{q.improvement}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default FeedbackScreen;
