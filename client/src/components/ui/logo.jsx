import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ className = "" }) => {
    return (
        <div className={`flex items-center gap-3 select-none ${className}`}>
            {/* The Icon: Neural Orb SVG */}
            <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 text-white flex-shrink-0"
            >
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    {/* Outer Orb */}
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.4" />

                    {/* Neural Nodes */}
                    <circle cx="50" cy="25" r="5" fill="currentColor" />
                    <circle cx="25" cy="65" r="5" fill="currentColor" />
                    <circle cx="75" cy="65" r="5" fill="currentColor" />

                    {/* Connections */}
                    <line x1="50" y1="25" x2="25" y2="65" stroke="currentColor" strokeWidth="3" />
                    <line x1="50" y1="25" x2="75" y2="65" stroke="currentColor" strokeWidth="3" />
                    <line x1="25" y1="65" x2="75" y2="65" stroke="currentColor" strokeWidth="3" />
                </svg>
            </motion.div>

            {/* The Wordmark: Tracked & Gradient Masked */}
            <div className="flex flex-col">
                <h1 className="text-xl font-heading font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50 leading-none">
                    HIREMIND
                </h1>
                <div className="flex justify-between items-center w-full mt-1">
                    <div className="h-[1px] w-full bg-gradient-to-r from-white/40 to-transparent" />
                    <span className="text-[8px] font-mono text-subtle ml-2 tracking-widest">AI.OS</span>
                </div>
            </div>
        </div>
    );
};

export default Logo;
