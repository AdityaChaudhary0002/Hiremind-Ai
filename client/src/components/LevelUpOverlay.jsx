import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight, Zap, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

const LevelUpOverlay = ({ newLevel, onClose }) => {
    useEffect(() => {
        // Trigger cinematic confetti
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#3b82f6', '#8b5cf6', '#ffffff']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#3b82f6', '#8b5cf6', '#ffffff']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
            onClick={onClose}
        >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 blur-[150px] rounded-full animate-pulse" />
            </div>

            <motion.div
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                className="relative z-10 text-center max-w-2xl px-6"
            >
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center mb-6"
                >
                    <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-[0_0_50px_rgba(59,130,246,0.5)]">
                        <Shield className="w-16 h-16 text-white" />
                    </div>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-purple-400 mb-4 tracking-tighter"
                    style={{ textShadow: "0 0 40px rgba(59,130,246,0.5)" }}
                >
                    LEVEL UP
                </motion.h2>

                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="h-px bg-gradient-to-r from-transparent via-white/50 to-transparent mb-8"
                />

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-xl md:text-2xl text-blue-200 font-mono tracking-widest uppercase mb-2"
                >
                    Clearence Granted
                </motion.p>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="inline-block bg-white/10 border border-white/20 rounded-xl px-8 py-3 backdrop-blur-md"
                >
                    <span className="text-3xl font-bold text-white">{newLevel}</span>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="mt-12 text-muted-text text-sm animate-pulse cursor-pointer"
                >
                    Click anywhere to continue_
                </motion.p>
            </motion.div>
        </motion.div>
    );
};

export default LevelUpOverlay;
