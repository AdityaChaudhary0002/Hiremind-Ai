import React from 'react';

const AiCore = () => {
    return (
        <div className="relative flex items-center justify-center w-[500px] h-[500px] select-none pointer-events-none">

            {/* 1. The Halo (Outer Atmosphere) */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/5 via-transparent to-transparent blur-[80px] animate-pulse-slow" />

            {/* 2. Rotating Conic Beams (Radar effect) */}
            <div className="absolute inset-20 rounded-full opacity-20 animate-[spin_10s_linear_infinite]">
                <div className="w-full h-full rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,white_180deg,transparent_360deg)] blur-xl" />
            </div>

            {/* 3. The Gyroscope Rings (Sharp lines) */}
            <div className="absolute inset-32 border border-[var(--border-medium)] rounded-full animate-[spin_8s_linear_infinite]"
                style={{ borderRadius: '45% 55% 40% 60% / 55% 40% 60% 40%' }} />
            <div className="absolute inset-36 border border-[var(--border-subtle)] rounded-full animate-[spin_12s_linear_infinite_reverse]"
                style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }} />

            {/* 4. The Core Sphere (Fake 3D) */}
            <div className="relative w-40 h-40 rounded-full flex items-center justify-center">

                {/* Inner Glow */}
                <div className="absolute inset-0 rounded-full bg-white/10 shadow-[inner_0_0_40px_rgba(255,255,255,0.2)] backdrop-blur-sm border border-white/20" />

                {/* The "Pupil" - Living Blob */}
                <div className="absolute inset-4 bg-gradient-to-br from-white to-gray-400 rounded-full blur-md opacity-80 animate-blob mix-blend-overlay" />

                {/* The Singularity (Center Dot) */}
                <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_20px_white] animate-ping-slow" />
            </div>

            {/* CSS styles for custom animations */}
            <style>{`
                @keyframes blob {
                    0% { transform: scale(0.9) translate(0,0); border-radius: 50%; opacity: 0.7; }
                    33% { transform: scale(1.1) translate(2px, -5px); border-radius: 40% 60% 70% 30%; opacity: 0.9; }
                    66% { transform: scale(0.95) translate(-2px, 5px); border-radius: 60% 40% 30% 70%; opacity: 0.8; }
                    100% { transform: scale(0.9) translate(0,0); border-radius: 50%; opacity: 0.7; }
                }
                .animate-blob { animation: blob 8s infinite alternate cubic-bezier(0.4, 0, 0.2, 1); }
                .animate-ping-slow { animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
                .animate-pulse-slow { animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            `}</style>
        </div>
    );
};

export default AiCore;
