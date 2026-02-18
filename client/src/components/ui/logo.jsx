import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ className = "" }) => {
    // Neural Grid Animation
    const dotVariants = {
        initial: { opacity: 0.2, scale: 0.8 },
        animate: (i) => ({
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.2, 0.8],
            transition: {
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2, // Staggered ripple
                ease: "easeInOut"
            }
        })
    };

    return (
        <div className={`flex items-center gap-3 select-none ${className}`}>
            {/* The Icon: 3x3 Neural Grid */}
            <div className="grid grid-cols-2 gap-1 w-6 h-6 rotate-45">
                {[0, 1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        custom={i}
                        variants={dotVariants}
                        initial="initial"
                        animate="animate"
                        className="w-full h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                    />
                ))}
            </div>

            {/* The Wordmark: Tracked & Gradient Masked */}
            <div className="flex flex-col">
                <h1 className="text-xl font-heading font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50 leading-none">
                    HIREMIND
                </h1>
                <div className="flex justify-between items-center w-full mt-1">
                    <div className="h-[1px] w-full bg-gradient-to-r from-white/40 to-transparent" />
                    <span className="text-[8px] font-mono text-white/50 ml-2 tracking-widest">AI.OS</span>
                </div>
            </div>
        </div>
    );
};

export default Logo;
