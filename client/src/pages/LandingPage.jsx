import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import { ArrowRight, Play, Terminal, Cpu, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { MOTION, STYLES } from '@/lib/design-system';
import Logo from '@/components/ui/logo';
import Navbar from '@/components/Navbar';

const LandingPage = () => {
    const navigate = useNavigate();
    const { isSignedIn } = useAuth();

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden selection:bg-white/20">

            {/* Global Background (Inherited from Layout via Transparent Wrapper) */}
            <div className="absolute inset-0 bg-background/0 z-0">
                {/* We rely on AppLayout's background, or we can add a specific Hero video here */}
                {/* For now, let's add a massive radial gradient to center focus */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />
            </div>

            {/* Navbar */}
            <Navbar />

            {/* Hero Content */}
            <div className="relative z-10 text-center max-w-5xl mx-auto px-6">

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/60 mb-8 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        SYSTEM ONLINE v3.0
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    className={`${STYLES.h1_hero} text-6xl md:text-8xl lg:text-9xl mb-8 leading-[0.9] tracking-tighter`}
                >
                    Master The<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white/80 to-white/20">Simulation.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1.5 }}
                    className={`${STYLES.p_body} max-w-2xl mx-auto mb-12 text-lg md:text-xl text-white/50`}
                >
                    The world's most advanced AI interview training protocol.
                    Upload your neural profile, select your track, and prepare for the future.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 1 }}
                    className="flex flex-col md:flex-row items-center justify-center gap-6"
                >
                    <Button
                        onClick={() => navigate(isSignedIn ? '/dashboard' : '/register')}
                        className="h-16 px-10 rounded-full font-heading font-bold text-lg bg-white text-black hover:bg-white/90 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-all group"
                    >
                        {isSignedIn ? 'ENTER DASHBOARD' : 'INITIALIZE SEQUENCE'}
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <Button
                        variant="ghost"
                        className="h-16 px-8 rounded-full text-white/40 hover:text-white border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all"
                    >
                        View Protocols
                    </Button>
                </motion.div>

                {/* Footer / Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="mt-32 grid grid-cols-3 gap-8 border-t border-white/5 pt-12"
                >
                    {[
                        { label: 'Active Nodes', value: '10K+' },
                        { label: 'Success Rate', value: '48%' },
                        { label: 'Processing Power', value: '120TF' }
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-2xl md:text-4xl font-heading font-bold text-white mb-2">{stat.value}</div>
                            <div className="text-xs font-mono text-white/30 uppercase tracking-widest">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

            </div>
        </div>
    );
};

export default LandingPage;
