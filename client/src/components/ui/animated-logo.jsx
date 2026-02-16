import React from 'react';
import { motion } from 'framer-motion';

const AnimatedLogo = () => {
    return (
        <div className="flex items-center gap-4 select-none group cursor-pointer hover:scale-105 transition-transform duration-300">
            <div className="relative w-12 h-12 flex items-center justify-center">
                {/* Outer Ring - Dynamic Rotation */}
                <motion.div
                    className="absolute inset-0 rounded-xl border-[3px] border-primary/30"
                    animate={{ rotate: 360, borderRadius: ["30%", "50%", "30%"] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />

                {/* Scanning Line */}
                <motion.div
                    className="absolute w-full h-[2px] bg-primary/80 shadow-[0_0_10px_var(--primary)]"
                    animate={{ top: ["0%", "100%", "0%"], opacity: [0, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Inner Core pulse */}
                <motion.div
                    className="w-6 h-6 bg-primary rounded-md z-10 shadow-[0_0_20px_var(--primary)]"
                    animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 180, 270, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <div className="flex flex-col leading-none">
                <span className="font-heading font-black text-3xl tracking-tighter text-foreground group-hover:text-primary transition-colors duration-300">
                    HIREMIND
                </span>
                <span className="text-xs font-mono font-bold text-primary tracking-[0.4em] uppercase">
                    INTELLIGENCE
                </span>
            </div>
        </div>
    );
};

export default AnimatedLogo;
