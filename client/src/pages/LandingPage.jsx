import React, { Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import { ArrowRight, Terminal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { STYLES } from '@/lib/design-system';
import Navbar from '@/components/Navbar';

// Lazy load the 3D core so it doesn't block the main JS payload
const AiCore3D = React.lazy(() => import("@/components/ui/ai-core-3d"));

class ThreeErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError(error) { return { hasError: true }; }
    componentDidCatch(error, errorInfo) { console.error("3D Core Failed:", error, errorInfo); }
    render() { return this.state.hasError ? <div className="w-48 h-48 rounded-full bg-white/5 animate-pulse" /> : this.props.children; }
}

const LandingPage = () => {
    const navigate = useNavigate();
    const { isSignedIn } = useAuth();
    const [isProtocolsOpen, setIsProtocolsOpen] = useState(false);

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden selection:bg-white/20 bg-black">

            {/* Tactical Grid Background */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px] z-0 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] z-0 pointer-events-none" />

            {/* Navbar */}
            <div className="w-full z-50 absolute top-0">
                <Navbar />
            </div>

            {/* Hero Main */}
            <div className="relative z-10 text-center max-w-5xl mx-auto px-6 w-full mt-20 flex flex-col items-center">

                {/* Minimal Orb Area */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="w-48 h-48 mb-8 relative"
                >
                    {/* Subtle glow behind orb */}
                    <div className="absolute inset-0 bg-white/5 rounded-full blur-[40px] pointer-events-none" />
                    <div className="w-full h-full preserve-3d">
                        <ThreeErrorBoundary>
                            <Suspense fallback={<div className="w-full h-full rounded-full bg-white/5 animate-pulse" />}>
                                <AiCore3D />
                            </Suspense>
                        </ThreeErrorBoundary>
                    </div>
                </motion.div>

                {/* System Initialized Line */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex items-center gap-2 mb-6"
                >
                    <Terminal className="w-4 h-4 text-emerald-500/70" />
                    <span className="font-mono text-xs uppercase tracking-widest text-white/50">
                        System initialized. Awaiting operator authentication.
                    </span>
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    className={`${STYLES.h1_hero} text-5xl md:text-8xl lg:text-9xl mb-6 leading-[0.9] tracking-tighter text-white font-heading`}
                >
                    Master The<br />
                    <span className="text-white/40">Simulation.</span>
                </motion.h1>

                {/* Subtext */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 1 }}
                    className={`${STYLES.p_body} max-w-lg mx-auto mb-12 text-sm md:text-base text-white/40 font-mono`}
                >
                    AI-driven tactical analysis protocol. Calibrate your neural responses against state-of-the-art synthetic evaluators.
                </motion.p>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto z-20 relative"
                >
                    <button
                        onClick={() => navigate(isSignedIn ? '/dashboard' : '/register')}
                        className="h-14 px-8 rounded-full border border-white/20 bg-white text-black hover:bg-transparent hover:text-white hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] font-mono text-sm uppercase tracking-widest transition-all duration-300 group relative overflow-hidden flex items-center justify-center min-w-[280px] hover:-translate-y-1"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-black group-hover:bg-emerald-500 transition-colors animate-pulse" />
                            {isSignedIn ? 'Access Command Center' : 'Initialize Sequence'}
                            <ArrowRight className="w-4 h-4" />
                        </span>
                    </button>

                    <button
                        onClick={() => setIsProtocolsOpen(true)}
                        className="h-14 px-8 rounded-full border border-white/10 bg-transparent text-white/50 hover:text-white hover:bg-white/5 hover:border-white/30 font-mono text-sm uppercase tracking-widest transition-all duration-300 min-w-[280px] sm:min-w-[auto] hover:-translate-y-1"
                    >
                        View Protocols
                    </button>
                </motion.div>

                {/* Tactical Footer Metrics */}
                <motion.div
                    id="protocols-section"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 1 }}
                    className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 pt-12 border-t border-white/5 w-full max-w-3xl"
                >
                    {[
                        { label: 'Neural Sync Matrix', value: '99.9%' },
                        { label: 'System Latency', value: '4ms' },
                        { label: 'Active Sessions', value: '1,402' }
                    ].map((stat, i) => (
                        <div key={i} className="text-center flex flex-col items-center">
                            <div className="text-xl md:text-2xl font-mono text-white/80 mb-2">{stat.value}</div>
                            <div className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

            </div>

            {/* Protocols Modal Overlay */}
            <AnimatePresence>
                {isProtocolsOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsProtocolsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0a0a0a] border border-white/10 p-8 max-w-lg w-full relative overflow-hidden shadow-2xl"
                        >
                            {/* Decorative Background Glows */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />

                            <div className="flex items-center gap-3 mb-6">
                                <Terminal className="w-5 h-5 text-emerald-400" />
                                <h3 className="font-mono text-lg uppercase tracking-widest text-white/90">System Protocols</h3>
                            </div>

                            <div className="space-y-6 flex flex-col font-mono text-sm leading-relaxed text-white/60">
                                <div className="border-l-2 border-white/10 pl-4 py-1">
                                    <strong className="text-white/80 block mb-1">01. Neural Alignment</strong>
                                    Calibrate your communication matrix by engaging in real-time adaptive questioning scenarios.
                                </div>
                                <div className="border-l-2 border-white/10 pl-4 py-1">
                                    <strong className="text-white/80 block mb-1">02. Stress Execution</strong>
                                    Evaluate syntax logic and algorithmic efficiency under pressurized, time-constrained conditions.
                                </div>
                                <div className="border-l-2 border-white/10 pl-4 py-1">
                                    <strong className="text-white/80 block mb-1">03. Adversarial Feedback</strong>
                                    Receive direct, non-biased intelligence reports analyzing vocal confidence, technical accuracy, and structural weaknesses.
                                </div>
                            </div>

                            <button
                                onClick={() => setIsProtocolsOpen(false)}
                                className="mt-8 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-xs uppercase tracking-widest text-white/60 hover:text-white transition-all"
                            >
                                Acknowledge & Close
                            </button>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default LandingPage;
