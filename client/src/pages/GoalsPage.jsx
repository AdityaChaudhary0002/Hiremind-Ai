import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import {
    Target, Trophy, Flame, TrendingUp, Award, Calendar, ChevronRight,
    Loader2, Star, Shield, Activity, Check, Trash2, Wand2, Brain,
    ChevronDown, ChevronUp, Clock, Zap, ArrowRight, Crosshair, Globe
} from 'lucide-react';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

import LevelUpOverlay from '@/components/LevelUpOverlay';

// --- MICRO-COMPONENTS ---

const BreathingIndicator = ({ status = 'active' }) => (
    <div className="relative flex items-center justify-center w-3 h-3">
        <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute w-full h-full rounded-full ${status === 'critical' ? 'bg-red-500' : 'bg-green-500'}`}
        />
        <div className={`w-1.5 h-1.5 rounded-full ${status === 'critical' ? 'bg-red-500' : 'bg-green-500'}`} />
    </div>
);

const SpringNumber = ({ value, label, subLabel }) => {
    const spring = useSpring(0, { bounce: 0, duration: 2000 });
    const display = useTransform(spring, (current) => Math.floor(current));

    useEffect(() => {
        const numericValue = parseInt(value) || 0;
        spring.set(numericValue);
    }, [value, spring]);

    return (
        <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
                <motion.span className="text-3xl font-heading font-light text-heading tracking-tighter">
                    {display}
                </motion.span>
                {typeof value === 'string' && value.includes('%') && <span className="text-sm text-subtle font-medium">%</span>}
                {typeof value === 'string' && value.includes('Day') && <span className="text-sm text-subtle font-medium">DAYS</span>}
            </div>
            <span className="text-[10px] font-mono text-subtle uppercase tracking-[0.2em] font-medium">{label}</span>
        </div>
    );
};

const MissionRadar = ({ level, progress }) => {
    return (
        <div className="relative w-full aspect-square max-w-[200px] mx-auto flex items-center justify-center">
            {/* Organic Radar Pulse */}
            <div className="absolute inset-0 border border-[var(--border-medium)] rounded-full" />
            <div className="absolute inset-[15%] border border-[var(--border-medium)] rounded-full" />
            <div className="absolute inset-[30%] border border-[var(--border-medium)] rounded-full placeholder-radar" />

            {/* Rotating Scanner */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full"
                style={{
                    background: 'conic-gradient(from 0deg, transparent 0deg, var(--glow-color, rgba(139,92,246,0.15)) 30deg, transparent 90deg)',
                }}
            />

            {/* Data Points */}
            <div className="relative z-10 text-center">
                <div className="text-[10px] font-mono text-subtle uppercase tracking-widest mb-1">Clearance</div>
                <div className="text-xl font-heading text-heading tracking-widest font-bold">{level?.toUpperCase() || 'N/A'}</div>
                <div className="mt-2 text-[10px] font-mono text-body">SYNC {Math.round(progress || 0)}%</div>
            </div>
        </div>
    );
};

const GoalsPage = () => {
    const { getToken, userId, isLoaded } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const [newGoal, setNewGoal] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("daily");
    const [goalLoading, setGoalLoading] = useState(false);
    const [goals, setGoals] = useState([]);
    const [expandedGoalId, setExpandedGoalId] = useState(null);
    const [generatingStrategy, setGeneratingStrategy] = useState(null);
    const [showLevelUp, setShowLevelUp] = useState(null);

    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await getToken();
                const res = await api.getGoals(token);
                setData(res);
                setGoals(res.goals || []);

                const currentLevel = res.stats?.level;
                const storedLevel = localStorage.getItem(`userLevel_${userId}`);
                if (storedLevel && currentLevel && storedLevel !== currentLevel) {
                    const levels = ["Recruit", "Operative", "Specialist", "Architect", "System Legend"];
                    if (levels.indexOf(currentLevel) > levels.indexOf(storedLevel)) {
                        setShowLevelUp(currentLevel);
                    }
                }
                if (currentLevel) localStorage.setItem(`userLevel_${userId}`, currentLevel);

            } catch (err) {
                console.error("Goals Fetch Error:", err);
                setError(err.message || "Failed to load goals");
            } finally {
                setLoading(false);
            }
        };

        if (isLoaded && userId) fetchData();
        else if (isLoaded && !userId) setLoading(false);
    }, [userId, isLoaded, getToken]);

    // Handle Prefill from Smart Suggestion
    useEffect(() => {
        if (location.state?.prefillGoal) {
            setNewGoal(location.state.prefillGoal.title);
            if (location.state.prefillGoal.category) {
                setSelectedCategory(location.state.prefillGoal.category);
            }
            // Optional: clear state so it doesn't linger on refresh
            window.history.replaceState({}, document.title)
        }
    }, [location.state]);

    const handleAddGoal = async () => {
        if (!newGoal.trim()) return;
        setGoalLoading(true);
        try {
            const token = await getToken();
            console.log("🎯 Creating goal:", { title: newGoal, category: selectedCategory, hasToken: !!token });
            const created = await api.createGoal(newGoal, selectedCategory, token);
            console.log("✅ Goal created:", created);
            setGoals([created, ...goals]);
            setNewGoal("");
        } catch (err) {
            console.error("❌ Failed to add goal:", err?.response?.data || err?.message || err);
            alert(`Failed to add goal: ${err?.response?.data?.message || err?.response?.data?.errors?.join(', ') || err?.message || 'Unknown error'}`);
        } finally {
            setGoalLoading(false);
        }
    };

    const handleToggleGoal = async (id) => {
        try {
            const token = await getToken();
            const updated = await api.toggleGoal(id, token);
            setGoals(goals.map(g => g._id === id ? updated : g));
            const res = await api.getGoals(token);
            setData(res);
        } catch (err) {
            console.error("Failed to toggle goal", err);
        }
    };

    const handleDeleteGoal = async (id) => {
        try {
            const token = await getToken();
            await api.deleteGoal(id, token);
            setGoals(goals.filter(g => g._id !== id));
            const res = await api.getGoals(token);
            setData(res);
        } catch (err) {
            console.error("Failed to delete goal", err);
        }
    };

    const handleGenerateStrategy = async (id, e) => {
        e.stopPropagation();
        setGeneratingStrategy(id);
        setExpandedGoalId(id);
        try {
            const token = await getToken();
            const updated = await api.generateStrategy(id, token);
            setGoals(goals.map(g => g._id === id ? updated : g));
        } catch (err) {
            console.error("Strategy Gen Failed", err);
            alert("Failed to generate strategy. AI might be busy.");
        } finally {
            setGeneratingStrategy(null);
        }
    };


    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-page text-heading/50 font-mono">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <span className="text-xs tracking-[0.3em] uppercase">Connect to Mainframe...</span>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-page text-heading p-6 text-center">
            <Shield className="w-12 h-12 text-muted-text mb-4" />
            <h2 className="text-xl font-heading font-medium mb-2">Uplink Failed</h2>
            <p className="text-subtle mb-6 font-mono text-sm">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="font-mono text-xs">RETRY CONNECTION</Button>
        </div>
    );

    const { stats = {}, skillMatrix = [], recentActivity = [] } = data || {};

    return (
        <div className="min-h-screen relative flex flex-col selection:bg-white/20 pb-20 bg-page overflow-x-hidden font-sans">
            <AnimatePresence>
                {showLevelUp && (
                    <LevelUpOverlay
                        newLevel={showLevelUp}
                        onClose={() => setShowLevelUp(null)}
                    />
                )}
            </AnimatePresence>

            {/* ORBITAL BACKGROUND ELEMENTS */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full border border-[var(--border-medium)] opacity-20 border-dashed"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] rounded-full border border-[var(--border-medium)] opacity-20"
                />
            </div>

            {/* MISSION CONTROL HEADER */}
            <header className="relative z-10 w-full border-b border-[var(--border-medium)] bg-glass backdrop-blur-xl sticky top-0">
                <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <BreathingIndicator status={error ? 'critical' : 'active'} />
                        <span className="font-mono text-[10px] text-subtle uppercase tracking-[0.2em] font-medium">
                            System Status: Online
                        </span>
                    </div>
                    <div className="hidden md:flex gap-12">
                        <div className="flex gap-2 text-[10px] font-mono text-subtle uppercase tracking-widest font-medium">
                            <span>S.Y.N.C Rate</span>
                            <span className="text-heading">{Math.round(stats.progress || 0)}%</span>
                        </div>
                        <div className="flex gap-2 text-[10px] font-mono text-subtle uppercase tracking-widest font-medium">
                            <span>Grid Load</span>
                            <span className="text-heading">OPTIMAL</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 pt-12">

                {/* HEADLINE */}
                <div className="mb-16 relative">
                    <motion.h1
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-6xl md:text-9xl font-heading font-bold text-white/5 absolute -top-20 -left-10 select-none z-0 pointer-events-none"
                    >
                        PROTOCOL
                    </motion.h1>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-heading font-bold text-heading tracking-tighter mb-4 relative z-10"
                    >
                        Command Center.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-subtle font-mono text-sm uppercase tracking-widest relative z-10 font-medium"
                    >
                        Objective Management & Tactical Analysis
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LEFT COLUMN: ACTIVE OBJECTIVES (8 cols) */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* Input Panel (Console) - INCREASED VISIBILITY & FIXED LAYOUT */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative group bg-glass backdrop-blur-sm border border-[var(--border-medium)] p-2 flex flex-col md:flex-row items-center gap-4 rounded-[2rem] overflow-hidden hover:border-[var(--border-medium)] transition-colors"
                        >
                            <div className="flex items-center w-full md:w-auto flex-1 pl-4 gap-4">
                                <Crosshair className="w-5 h-5 text-subtle" />
                                <input
                                    type="text"
                                    value={newGoal}
                                    onChange={(e) => setNewGoal(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddGoal();
                                    }}
                                    placeholder="ENTER NEW PROTOCOL..."
                                    className="w-full bg-transparent border-none text-heading font-mono text-sm focus:ring-0 placeholder:text-muted-text h-10"
                                />
                            </div>

                            {/* Categories - Better responsiveness */}
                            <div className="flex w-full md:w-auto bg-glass-hover rounded-xl md:rounded-full overflow-hidden p-1 gap-1">
                                {['daily', 'weekly', 'milestone'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-3 md:px-5 h-10 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all ${selectedCategory === cat ? 'bg-primary text-primary-foreground font-bold shadow-lg' : 'text-subtle hover:text-heading hover:bg-glass-hover'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                                <button
                                    onClick={handleAddGoal}
                                    disabled={goalLoading || !newGoal.trim()}
                                    className="px-5 h-10 bg-primary text-primary-foreground hover:opacity-90 rounded-full font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ml-1 font-bold disabled:opacity-40"
                                >
                                    {goalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span className="hidden md:inline">ADD</span><ArrowRight className="w-4 h-4" /></>}
                                </button>
                            </div>
                        </motion.div>

                        {/* LIST */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-[var(--border-medium)] pb-4 mb-8">
                                <h3 className="text-sm font-mono text-body uppercase tracking-widest font-bold">Active Protocols</h3>
                                <div className="text-[10px] font-mono text-subtle font-medium">{goals.length} CHECKLIST ITEMS</div>
                            </div>

                            <AnimatePresence mode="popLayout">
                                {goals.filter(g => (g.category || 'daily') === selectedCategory).map((goal, i) => (
                                    <motion.div
                                        key={goal._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`group relative bg-glass border border-[var(--border-medium)] hover:border-[var(--border-medium)] transition-all cursor-pointer overflow-hidden rounded-[2rem] ${goal.isCompleted ? 'opacity-50' : 'opacity-100'}`}
                                        onClick={() => setExpandedGoalId(expandedGoalId === goal._id ? null : goal._id)}
                                        whileHover={{ scale: 1.01, y: -2 }}
                                    >
                                        <div className="p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleToggleGoal(goal._id); }}
                                                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${goal.isCompleted ? 'bg-primary border-primary' : 'border-[var(--border-medium)] hover:border-primary bg-transparent'}`}
                                            >
                                                {goal.isCompleted && <Check className="w-4 h-4 text-black" />}
                                            </button>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-[10px] font-mono text-subtle uppercase tracking-widest px-3 py-1 rounded-full border border-[var(--border-medium)] bg-glass-hover font-medium">
                                                        {goal.category || 'DIRECTIVE'}
                                                    </span>
                                                    {goal.isPriority && <Star className="w-3 h-3 text-heading fill-primary" />}
                                                </div>
                                                <h4 className={`text-2xl font-light ${goal.isCompleted ? 'text-muted-text line-through' : 'text-heading'}`}>
                                                    {goal.title}
                                                </h4>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteGoal(goal._id); }} className="p-2 hover:bg-glass-hover rounded-full text-subtle hover:text-red-400 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <ChevronDown className={`w-4 h-4 text-subtle transition-transform ${expandedGoalId === goal._id ? 'rotate-180' : ''}`} />
                                            </div>
                                        </div>

                                        {/* EXPANDED CONTENT */}
                                        <AnimatePresence>
                                            {expandedGoalId === goal._id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="bg-glass-hover border-t border-[var(--border-medium)] px-8 py-6"
                                                >
                                                    <div className="flex items-center justify-between mb-6">
                                                        <div className="flex items-center gap-2 text-subtle font-mono text-xs uppercase tracking-widest font-medium">
                                                            <Brain className="w-3 h-3" /> Tactical Analysis
                                                        </div>
                                                        {!goal.aiStrategy && !generatingStrategy && (
                                                            <Button size="sm" variant="ghost" className="rounded-full border border-[var(--border-medium)] hover:bg-primary hover:text-primary-foreground uppercase text-[10px] tracking-widest h-8" onClick={(e) => handleGenerateStrategy(goal._id, e)}>
                                                                Generate Strategy
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {generatingStrategy === goal._id && (
                                                        <div className="py-4 text-subtle font-mono text-xs animate-pulse flex items-center gap-2">
                                                            <Loader2 className="w-3 h-3 animate-spin" /> ANALYZING TRAJECTORY...
                                                        </div>
                                                    )}

                                                    {goal.aiStrategy && (
                                                        <div className="grid md:grid-cols-2 gap-8">
                                                            <div className="space-y-4">
                                                                <div className="text-[10px] text-subtle uppercase tracking-[0.2em] mb-4 font-bold">ROADMAP</div>
                                                                {goal.aiStrategy.roadmap?.slice(0, 3).map((step, k) => (
                                                                    <div key={k} className="flex gap-3 text-sm font-light text-body">
                                                                        <span className="text-muted-text font-mono">0{k + 1}</span>
                                                                        {step}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="space-y-4">
                                                                <div className="text-[10px] text-subtle uppercase tracking-[0.2em] mb-4 font-bold">EXECUTION</div>
                                                                {goal.aiStrategy.weeklyPlan?.slice(0, 2).map((step, k) => (
                                                                    <div key={k} className="pl-4 border-l border-[var(--border-medium)] text-sm font-light text-body">
                                                                        {step}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {!goal.aiStrategy && !generatingStrategy && (
                                                        <div className="text-muted-text text-xs font-mono">No strategic data initialized.</div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: CIRCULAR ANALYTICS (4 cols) */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* RADAR ORB */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="aspect-square rounded-full border border-[var(--border-medium)] bg-glass backdrop-blur-md relative flex items-center justify-center group overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <MissionRadar level={stats.level} progress={stats.progress} />

                            <div className="absolute bottom-12 text-center pointer-events-none">
                                <div className="text-[10px] text-subtle font-mono uppercase tracking-[0.2em] mb-1">Velocity</div>
                                <div className="text-2xl font-light text-heading">{data?.predictions?.velocity || '0.0'}</div>
                            </div>
                        </motion.div>

                        {/* FLOATING METRICS PILS */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Streak', value: stats.streak || 0, sub: 'DAYS' },
                                { label: 'Success', value: `${Math.round(stats.passedInterviews / (stats.totalInterviews || 1) * 100)}`, sub: '%' },
                                { label: 'Missions', value: stats.totalInterviews || 0, sub: 'TOTAL' },
                                { label: 'Avg Score', value: stats.averageScore || 0, sub: '%' }
                            ].map((stat, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + (idx * 0.1) }}
                                    whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(255,255,255,0.1)" }}
                                    className="aspect-square rounded-[2rem] border border-[var(--border-medium)] bg-glass-hover flex flex-col items-center justify-center hover:bg-glass-hover transition-colors cursor-default"
                                >
                                    <h4 className="text-4xl font-heading font-light text-heading mb-2">{stat.value}<span className="text-lg text-muted-text ml-1">{stat.sub}</span></h4>
                                    <span className="text-[10px] font-mono text-subtle uppercase tracking-widest font-bold">{stat.label}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Recent Activity Pill */}
                        <div className="rounded-[2rem] border border-[var(--border-medium)] bg-glass-hover p-8 space-y-6">
                            <h3 className="text-xs font-mono text-subtle uppercase tracking-widest flex items-center gap-2 font-bold">
                                <Activity className="w-3 h-3" /> Recent Signals
                            </h3>
                            <div className="space-y-4">
                                {recentActivity.slice(0, 3).map((activity, idx) => (
                                    <div key={idx} onClick={() => navigate(`/feedback/${activity._id}`)} className="flex justify-between items-center group cursor-pointer border-b border-[var(--border-subtle)] pb-2 last:border-0">
                                        <div>
                                            <div className="text-sm text-heading group-hover:text-heading transition-colors font-medium">{activity.role}</div>
                                            <div className="text-[9px] text-subtle font-mono uppercase">{new Date(activity.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <ArrowRight className="w-3 h-3 text-muted-text group-hover:translate-x-1 transition-transform" />
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => navigate('/history')} className="text-[10px] font-mono text-subtle hover:text-heading uppercase tracking-widest flex items-center gap-2 transition-colors pt-4 border-t border-[var(--border-medium)] w-full font-bold">
                                Full Archives <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoalsPage;
