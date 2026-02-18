import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Trophy, Lock, Star, Zap, TrendingUp, CheckCircle2, ChevronRight, Crown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { MOTION, STYLES } from '@/lib/design-system';
import Logo from '@/components/ui/logo';
import { useNavigate } from 'react-router-dom';

const Goals = () => {
    const navigate = useNavigate();

    // Mock Goal Data (Gamified)
    const goals = [
        {
            id: 1,
            title: "Frontend Mastery",
            progress: 75,
            total: 100,
            status: "active",
            icon: Zap,
            reward: "React Elite Badge"
        },
        {
            id: 2,
            title: "System Design",
            progress: 30,
            total: 100,
            status: "active",
            icon: TrendingUp,
            reward: "Architect Title"
        },
        {
            id: 3,
            title: "Algorithm Efficiency",
            progress: 100,
            total: 100,
            status: "completed",
            icon: CheckCircle2,
            reward: "Speed Demon"
        },
        {
            id: 4,
            title: "Leadership Ops",
            progress: 0,
            total: 100,
            status: "locked",
            icon: Lock,
            reward: "Commander Access"
        }
    ];

    return (
        <div className="min-h-screen relative flex flex-col overflow-hidden selection:bg-white/20">
            {/* Top HUD */}
            <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-50 pointer-events-none">
                <div className="pointer-events-auto">
                    <Logo className="scale-75 origin-top-left opacity-50 hover:opacity-100 transition-opacity" />
                </div>
                <Button
                    variant="ghost"
                    onClick={() => navigate('/dashboard')}
                    className="pointer-events-auto text-white/40 hover:text-white"
                >
                    Return to Command
                </Button>
            </div>

            <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-32">

                <motion.div variants={MOTION.drift} initial="hidden" animate="visible" className="mb-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(234,179,8,0.2)]">
                        <Crown className="w-8 h-8 text-yellow-500" />
                    </div>
                    <h1 className={`${STYLES.h1_hero} text-5xl md:text-7xl mb-6`}>Target Acquisition</h1>
                    <p className={`${STYLES.p_body} max-w-xl mx-auto text-center`}>
                        Track your evolution. Complete modules to unlock advanced simulation tiers and elite badges.
                    </p>
                </motion.div>

                <motion.div
                    variants={MOTION.container}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {goals.map((goal) => (
                        <motion.div
                            key={goal.id}
                            variants={MOTION.drift}
                            className={`
                                relative overflow-hidden rounded-[30px] p-1 transition-all group
                                ${goal.status === 'locked' ? 'opacity-50 grayscale' : 'hover:scale-105'}
                            `}
                        >
                            {/* Border Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${goal.status === 'completed' ? 'from-green-500/50 to-emerald-900/50' : 'from-white/10 to-transparent'} pointer-events-none`} />

                            <div className="relative z-10 bg-black/60 backdrop-blur-xl h-full rounded-[28px] p-8 flex flex-col items-center text-center border border-white/5">

                                {/* Status Icon */}
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${goal.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                        goal.status === 'locked' ? 'bg-white/5 text-white/20' :
                                            'bg-primary/20 text-primary'
                                    }`}>
                                    <goal.icon className="w-7 h-7" />
                                </div>

                                <h3 className="font-heading font-bold text-xl text-white mb-2">{goal.title}</h3>
                                <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-8">{goal.reward}</p>

                                {/* Progress Ring */}
                                <div className="w-full relative h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${goal.progress}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`h-full ${goal.status === 'completed' ? 'bg-green-500' : 'bg-primary'}`}
                                    />
                                </div>

                                <div className="text-sm font-bold text-white/60">
                                    {goal.progress}% {goal.status === 'completed' ? 'COMPLETE' : 'SYNCED'}
                                </div>

                                {goal.status !== 'locked' && goal.status !== 'completed' && (
                                    <Button
                                        variant="ghost"
                                        className="mt-6 text-white/40 hover:text-white"
                                        onClick={() => navigate('/role-selection')}
                                    >
                                        Resume <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </div>
    );
};

export default Goals;
