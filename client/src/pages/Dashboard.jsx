import React, { useEffect, useState, useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { getRandomTip } from '@/data/tips';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios'; // For pre-fetch
import api from '../services/api';
import { ArrowRight, History, Activity } from "lucide-react";
import Magnetic from "@/components/ui/magnetic";
import AiCore from "@/components/ui/ai-core"; // Fallback
import Logo from "@/components/ui/logo";

// Lazy Load 3D Core
const AiCore3D = React.lazy(() => import("@/components/ui/ai-core-3d"));

// Simple Error Boundary for 3D Component
class ThreeErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        console.error("3D Core Failed:", error, errorInfo);
        // You can also log the error to an error reporting service
    }
    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return this.props.fallback;
        }

        return this.props.children;
    }
}

const Dashboard = () => {
    const navigate = useNavigate();
    const { getToken, user, isLoaded } = useAuth();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dailyTip, setDailyTip] = useState('');
    const [prefetchedFeedback, setPrefetchedFeedback] = useState({});

    // Safety ref
    const forcedLoad = useRef(false);

    // Calculate Stats
    const stats = React.useMemo(() => {
        if (!interviews.length) return { total: 0, avgScore: 0, streak: 0 };
        const total = interviews.length;
        // Simple mock calculation logic
        const avgScore = Math.round(interviews.reduce((acc, curr) => acc + (curr.feedback?.overallScore || 0), 0) / total);
        return { total, avgScore, streak: total > 0 ? 1 : 0 };
    }, [interviews]);

    useEffect(() => {
        let isMounted = true;

        // Failsafe timer: IF Clerk or API hangs, force UI show after 2s
        const safetyTimer = setTimeout(() => {
            if (isMounted && loading) {
                console.warn("Dashboard: Safety timer triggered (1.5s). Forcing UI.");
                forcedLoad.current = true;
                setLoading(false);
            }
        }, 1500);

        const fetchData = async () => {
            if (!isLoaded || !user) return;
            try {
                if (forcedLoad.current) return;
                const token = await getToken();
                if (!token) throw new Error("No token");

                // Refactored call:
                const data = await api.getUserInterviews(token);
                if (isMounted) setInterviews(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
                if (isMounted) setInterviews([]);
            } finally {
                if (isMounted && !forcedLoad.current) setLoading(false);
            }
        };

        if (isLoaded) {
            fetchData();
            setDailyTip(getRandomTip());
        }

        return () => {
            isMounted = false;
            clearTimeout(safetyTimer);
        };
    }, [user, isLoaded, getToken]);

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const driftVariants = {
        hidden: { opacity: 0, y: 50, rotate: 2 },
        visible: {
            opacity: 1,
            y: 0,
            rotate: 0,
            transition: {
                type: "spring",
                stiffness: 30,
                damping: 20
            }
        }
    };

    if ((loading || !isLoaded) && !forcedLoad.current) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black">
                <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
                <div className="text-sm font-mono text-white/40 tracking-widest animate-pulse">INITIALIZING HIREMIND...</div>
            </div>
        );
    }


    return (
        <div className="min-h-screen relative flex flex-col overflow-x-hidden selection:bg-white/20">

            {/* Top Minimal Header */}
            <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-50 pointer-events-none">
                <div className="pointer-events-auto">
                    <Logo />
                </div>
                <div className="text-[10px] font-mono text-white/30 tracking-[0.3em] uppercase mix-blend-difference hidden md:block">
                    Status: <span className="text-white/60">ONLINE</span>
                </div>
            </div>

            <motion.div
                className="max-w-[1600px] mx-auto w-full relative z-10 min-h-screen p-6 md:p-12 flex flex-col lg:flex-row justify-between"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* LEFT: The Narrative Spire */}
                <div className="lg:w-5/12 flex flex-col justify-between h-[80vh] z-20 pt-20 pb-10">
                    <div className="space-y-4">
                        <motion.h1 variants={driftVariants} className="text-7xl md:text-8xl font-heading font-bold tracking-tighter text-white/90 transform -rotate-1 origin-left">
                            Create.
                        </motion.h1>
                        <motion.h1 variants={driftVariants} className="text-7xl md:text-8xl font-heading font-bold tracking-tighter text-white/50 ml-12 transform rotate-1">
                            Prepare.
                        </motion.h1>
                        <motion.div variants={driftVariants} className="ml-24">
                            <span className="text-7xl md:text-8xl font-heading font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white/80 to-transparent">
                                Ascend.
                            </span>
                        </motion.div>
                    </div>

                    <motion.div variants={driftVariants} className="pl-6 border-l border-white/10 space-y-8 max-w-sm mt-12 lg:mt-0">
                        <p className="text-lg text-white/60 font-light leading-relaxed">
                            Welcome back, {user?.firstName}. <br />
                            <span className="text-white/40 italic text-sm">"{dailyTip}"</span>
                        </p>

                        <Magnetic>
                            <button
                                onClick={() => navigate('/role-selection')}
                                className="group relative px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-heading font-bold text-lg tracking-wide overflow-hidden transition-all hover:bg-white hover:text-black hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    Initiate Simulation <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>
                        </Magnetic>
                    </motion.div>
                </div>

                {/* RIGHT: Core & Floating Stats */}
                <div className="lg:w-6/12 relative h-[600px] lg:h-auto flex items-center justify-center">

                    {/* The Living Core */}
                    <div className="absolute top-[40%] right-[10%] -translate-y-1/2 w-[800px] h-[800px] scale-125 z-0 pointer-events-none">
                        <ThreeErrorBoundary fallback={<AiCore />}>
                            <Suspense fallback={<AiCore />}>
                                <AiCore3D />
                            </Suspense>
                        </ThreeErrorBoundary>
                    </div>

                    {/* Floating Stat: Avg Score */}
                    <motion.div
                        variants={driftVariants}
                        className="absolute top-[15%] left-[0%] lg:left-[10%] w-32 h-32 md:w-48 md:h-48 rounded-full border border-white/10 bg-black/20 backdrop-blur-md flex flex-col items-center justify-center z-10 hover:bg-white/5 transition-all cursor-crosshair group"
                    >
                        <div className="text-[10px] md:text-xs font-mono text-white/40 mb-2 group-hover:text-white/70">PERFORMANCE</div>
                        <div className="text-4xl md:text-5xl font-bold font-heading text-white tracking-tighter group-hover:scale-110 transition-transform">
                            <AnimatedCounter value={stats.avgScore} />%
                        </div>
                    </motion.div>

                    {/* Floating Stat: Log Count */}
                    <motion.div
                        variants={driftVariants}
                        className="absolute top-[50%] right-[0%] lg:-right-[5%] px-8 py-4 rounded-full border border-white/10 bg-black/20 backdrop-blur-md z-10 flex items-center gap-4 hover:border-white/30 transition-all rotate-3"
                    >
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <div className="text-xl font-bold font-heading text-white">
                            <AnimatedCounter value={stats.total} /> <span className="text-xs font-normal text-white/40 font-mono">LOGS</span>
                        </div>
                    </motion.div>

                    {/* Floating Recent Card */}
                    <motion.div
                        variants={driftVariants}
                        className="absolute bottom-[5%] left-[0%] md:left-[10%] max-w-xs w-full p-1 z-20"
                    >
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors shadow-2xl skew-x-1">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xs font-mono text-white/50 tracking-widest uppercase">Latest Signal</h3>
                                <Activity className="w-3 h-3 text-white/30" />
                            </div>

                            {interviews.length > 0 ? (
                                <div
                                    className="group cursor-pointer"
                                    onClick={() => navigate(`/feedback/${interviews[0]._id}`, { state: { preloadedData: prefetchedFeedback[interviews[0]._id] } })}
                                    onMouseEnter={async () => {
                                        if (!prefetchedFeedback[interviews[0]._id]) {
                                            const token = await getToken();
                                            axios.get(`${import.meta.env.VITE_API_URL}/api/interview/${interviews[0]._id}`, { headers: { Authorization: `Bearer ${token}` } })
                                                .then(res => setPrefetchedFeedback(prev => ({ ...prev, [interviews[0]._id]: res.data })));
                                        }
                                    }}
                                >
                                    <div className="text-xl font-heading font-medium text-white group-hover:underline decoration-1 underline-offset-4">
                                        {interviews[0].role}
                                    </div>
                                    <div className="flex justify-between items-end mt-2">
                                        <div className="text-xs text-white/40">
                                            {new Date(interviews[0].createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-white/0 -translate-x-2 group-hover:text-white group-hover:translate-x-0 transition-all" />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-white/30 italic">No recent data.</div>
                            )}
                        </div>
                    </motion.div>

                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
