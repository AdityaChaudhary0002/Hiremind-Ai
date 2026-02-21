import React from 'react';

// Pure CSS replacement for the 3D sphere — eliminates WebGL context crashes entirely
const AiCore3D = ({ className }) => {
    return (
        <div className={`w-full h-full flex items-center justify-center ${className}`}>
            <div className="relative w-[420px] h-[420px]">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full border border-[var(--border-subtle)] animate-[spin_20s_linear_infinite]" />

                {/* Mid ring with pulse */}
                <div
                    className="absolute inset-[10%] rounded-full border border-[var(--border-medium)]"
                    style={{ animation: 'spin 12s linear infinite reverse' }}
                />

                {/* Core sphere — CSS radial gradient */}
                <div
                    className="absolute inset-[20%] rounded-full"
                    style={{
                        background: 'radial-gradient(circle at 35% 35%, #e0e0e0 0%, #888 40%, #222 80%, #000 100%)',
                        boxShadow: '0 0 80px 20px rgba(180,180,255,0.08), inset 0 0 40px rgba(255,255,255,0.05)',
                        animation: 'pulse 4s ease-in-out infinite',
                    }}
                />

                {/* Sparkle dots */}
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-white/30"
                        style={{
                            top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 40}%`,
                            left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 40}%`,
                            animation: `pulse ${2 + i * 0.4}s ease-in-out infinite`,
                            animationDelay: `${i * 0.3}s`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default AiCore3D;
