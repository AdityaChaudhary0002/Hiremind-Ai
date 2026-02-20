import React, { useEffect, useState, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Activity, Zap, TrendingUp, Calendar, BrainCircuit, Sparkles } from "lucide-react";
import Magnetic from "@/components/ui/magnetic";
import AiCore from "@/components/ui/ai-core";
import Logo from "@/components/ui/logo";
import { useDashboardEngine } from '../hooks/useDashboardEngine';

const AiCore3D = React.lazy(() => import("@/components/ui/ai-core-3d"));

class ThreeErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError(error) { return { hasError: true }; }
    componentDidCatch(error, errorInfo) { console.error("3D Core Failed:", error, errorInfo); }
    render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

// Insight Skeleton Component
const InsightSkeleton = () => (
    <div className="space-y-3 max-w-md animate-pulse">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-4 bg-white/10 rounded w-1/2" />
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const { interviews, latestFull, stats, insight, intelligence, loading, insightLoading, orbState, greeting, user } = useDashboardEngine();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [orbPanelOpen, setOrbPanelOpen] = useState(false);

    // --- MICRO PARALLAX ---
    useEffect(() => {
        let rafId;
        const handleMouseMove = (e) => {
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                const x = (e.clientX / window.innerWidth) * 2 - 1;
                const y = (e.clientY / window.innerHeight) * 2 - 1;
                setMousePos({ x, y });
                rafId = null;
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Memoized weak zones computation
    const weakZones = useMemo(() => {
        if (!intelligence?.weakTopics) return [];
        return Object.entries(intelligence.weakTopics)
            .sort((a, b) => b[1] - a[1]) // highest frequency first
            .slice(0, 3)
            .map(([topic]) => topic);
    }, [intelligence]);

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen relative flex flex-col overflow-x-hidden selection:bg-white/20 bg-black">

            {/* BACKGROUND: Micro Parallax Starfield */}
            <motion.div
                className="fixed inset-0 pointer-events-none z-0 opacity-30"
                animate={{ x: mousePos.x * -15, y: mousePos.y * -15 }}
                transition={{ type: "tween", ease: "linear", duration: 0.2 }}
            >
                <div className="absolute top-10 left-20 w-1 h-1 bg-white rounded-full opacity-50" />
                <div className="absolute top-40 right-40 w-1 h-1 bg-white rounded-full opacity-30" />
                <div className="absolute bottom-20 left-1/3 w-1 h-1 bg-white rounded-full opacity-40" />
                <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-white rounded-full opacity-20" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
            </motion.div>



            <motion.div
                className="max-w-[1600px] mx-auto w-full relative z-10 min-h-screen p-6 md:p-12 flex flex-col lg:flex-row justify-between"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* LEFT: Intelligent Narrative Spire */}
                <div className="lg:w-5/12 flex flex-col justify-center h-[85vh] z-20 space-y-12">

                    {/* Time Greeting + Title */}
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-xs font-mono text-white/40 uppercase tracking-widest"
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${orbState === 'flux' ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
                            {greeting}{user?.firstName ? `, ${user.firstName}` : ''}
                        </motion.div>

                        <h1 className="text-6xl md:text-8xl font-heading font-bold tracking-tighter text-white/90 leading-[0.9]">
                            Create.<br />
                            <span className="text-white/40">Refine.</span><br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Ascend.</span>
                        </h1>
                    </div>

                    {/* 1. INTELLIGENT INSIGHT ENGINE */}
                    <div className="pl-6 border-l-4 border-white/10 relative group min-h-[120px] flex flex-col justify-center transition-colors duration-500 hover:border-emerald-500/50">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">
                            <BrainCircuit className="w-3 h-3 text-emerald-500" /> System Insight
                        </div>

                        {/* STATE HANDLING */}
                        {insightLoading ? (
                            <InsightSkeleton />
                        ) : interviews.length === 0 ? (
                            <div className="text-white/60 text-lg font-light flex flex-col items-start gap-2">
                                <span className="text-white/80">Calibration required.</span>
                                <span className="text-sm opacity-60">Complete your first simulation to generate baseline analysis.</span>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="relative"
                            >
                                <div className={`absolute -left-[27px] top-0 bottom-0 w-1 ${insight?.type === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                <div className="space-y-4">
                                    <p className="text-xl text-white/90 font-light leading-relaxed max-w-md">
                                        {insight?.message}
                                    </p>

                                    {/* INTELLIGENCE VISIBILITY */}
                                    {(intelligence && (intelligence.improvement !== 0 || weakZones.length > 0)) && (
                                        <div className="pt-2">
                                            {/* Improvement Metric */}
                                            {intelligence.improvement !== 0 && (
                                                <div className="flex items-center gap-2 mb-3">
                                                    <TrendingUp className={`w-4 h-4 ${intelligence.improvement > 0 ? 'text-emerald-500' : 'text-amber-500'}`} />
                                                    <span className={`text-sm font-mono ${intelligence.improvement > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                        {intelligence.improvement > 0 ? '+' : ''}{intelligence.improvement}% vs previous average
                                                    </span>
                                                </div>
                                            )}

                                            {/* Weak Zones Minimal */}
                                            {weakZones.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {weakZones.map(zone => (
                                                        <span key={zone} className="text-[10px] font-mono text-white/50 bg-white/5 border border-white/10 px-2 py-1 rounded-sm">
                                                            Needs Focus: {zone}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* CORE ACTION */}
                    <Magnetic>
                        <button
                            onClick={() => navigate('/role-selection')}
                            className="w-fit group relative px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-heading font-bold text-lg tracking-wide overflow-hidden transition-all hover:bg-white hover:text-black hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                {interviews.length === 0 ? "Start Calibration" : "Initiate Simulation"}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                    </Magnetic>

                    {/* LAST SESSION SNAPSHOT (Embedded) */}
                    {(latestFull || interviews[0]) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-6 mt-4 opacity-60 hover:opacity-100 transition-opacity"
                        >
                            <div>
                                <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-1">Last Score</div>
                                <div className="text-xl font-bold font-heading text-white">
                                    {(latestFull || interviews[0]).feedback?.overallScore || 0}%
                                </div>
                            </div>
                            <div className="h-8 w-[1px] bg-white/10" />
                            <div onClick={() => navigate(`/history/${(latestFull || interviews[0])._id}`)} className="cursor-pointer group">
                                <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-1 group-hover:text-white transition-colors">Latest</div>
                                <div className="text-sm text-white/50 group-hover:text-white transition-colors flex items-center gap-1">
                                    View Breakdown <ArrowRight className="w-3 h-3" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* RIGHT: REAL ANALYTICS & REACTIVE ORB */}
                <div className="lg:w-6/12 relative h-[500px] lg:h-auto flex items-center justify-center">

                    {/* 2. REACTIVE ORB SYSTEM */}
                    <div className="relative w-[600px] h-[600px] z-0 flex items-center justify-center">
                        {/* Dynamic Background Glow - Connected to Avg Score */}
                        <motion.div
                            animate={{
                                scale: orbState === 'pulse' ? [1, 1.1, 1] : [1, 1.05, 1],
                                opacity: orbState === 'idle' ? 0.3 + ((stats.avgScore || 0) / 200) : 0.6
                            }}
                            transition={{ duration: orbState === 'pulse' ? 4 : 8, repeat: Infinity, ease: "easeInOut" }}
                            className={`absolute inset-0 blur-[100px] rounded-full transition-colors duration-1000 ${orbState === 'flux' ? 'bg-amber-500/10' : 'bg-emerald-500/5'}`}
                        />

                        {/* Interactive Wrapper */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setOrbPanelOpen(!orbPanelOpen)}
                            className="relative w-full h-full cursor-pointer transition-transform duration-500 preserve-3d"
                        >
                            <ThreeErrorBoundary fallback={<AiCore />}>
                                <Suspense fallback={<AiCore />}>
                                    <AiCore3D />
                                </Suspense>
                            </ThreeErrorBoundary>

                            {/* Extra Ring for High Streak (Flux State) */}
                            {orbState === 'flux' && (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-[10%] border border-amber-500/20 rounded-full border-dashed pointer-events-none"
                                />
                            )}
                        </motion.div>

                        {/* 3. REAL ANALYTICS CARD */}
                        <AnimatePresence>
                            {orbPanelOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="absolute top-[80%] bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 p-6 rounded-2xl w-72 shadow-2xl z-30"
                                >
                                    <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-3 h-3 text-emerald-500" />
                                            <span className="text-[10px] font-mono uppercase text-white/50 tracking-widest">Live Metrics</span>
                                        </div>
                                        <button onClick={() => setOrbPanelOpen(false)} className="text-white/30 hover:text-white">✕</button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-[9px] font-mono text-white/40 uppercase mb-1">Total Sims</div>
                                            <div className="text-xl font-heading font-bold text-white"><AnimatedCounter value={stats.total} /></div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-mono text-white/40 uppercase mb-1">Avg Performance</div>
                                            <div className={`text-xl font-heading font-bold ${stats.avgScore >= 80 ? 'text-emerald-400' : stats.avgScore >= 60 ? 'text-yellow-400' : 'text-white'}`}>
                                                {stats.avgScore}%
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-mono text-white/40 uppercase mb-1">Current Streak</div>
                                            <div className="flex items-center gap-1.5 text-xl font-heading font-bold text-white">
                                                <Zap className={`w-3 h-3 ${stats.streak > 0 ? 'text-amber-500 fill-amber-500' : 'text-white/20'}`} />
                                                {stats.streak} <span className="text-[8px] font-mono font-normal text-white/30 self-end mb-1">DAYS</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-mono text-white/40 uppercase mb-1">Last Active</div>
                                            <div className="text-xs font-mono text-white/60 mt-1">
                                                {stats.lastDate ? stats.lastDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* PREDICTIVE ENGINE UI */}
                                    {intelligence?.projection && (
                                        <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
                                            <div className="flex gap-2 items-center">
                                                <Zap className={`w-3 h-3 ${intelligence.projection.possible ? 'text-blue-400' : 'text-white/30'}`} />
                                                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50">Trajectory</div>
                                            </div>
                                            <div className={`text-[10px] font-mono font-medium ${intelligence.projection.possible ? 'text-blue-400' : 'text-white/40'}`}>
                                                {intelligence.projection.message}
                                            </div>
                                        </div>
                                    )}

                                    {/* SMALL SPARKLINE */}
                                    {intelligence?.trend && intelligence.trend.length > 0 && (
                                        <div className="mt-6 pt-5 border-t border-white/10">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="text-[9px] font-mono text-white/40 uppercase">Performance Trend</div>
                                                <div className="text-[9px] font-mono text-white/30">Last {intelligence.trend.length} Series</div>
                                            </div>
                                            <div className="flex items-end gap-1.5 h-10 w-full">
                                                {intelligence.trend.map((score, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex-1 rounded-t-[2px] transition-all bg-emerald-500/20 hover:bg-emerald-500/40"
                                                        style={{ height: `${Math.max(10, score)}%` }}
                                                        title={`Score: ${score}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
