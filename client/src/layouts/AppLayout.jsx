import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const AppLayout = () => {
    const backgroundRef = React.useRef(null);
    const spotlightRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const mousePosition = React.useRef({ x: 0, y: 0 });
    const spotlightPosition = React.useRef({ x: 0, y: 0 });

    React.useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            mousePosition.current = { x: clientX, y: clientY };

            // Parallax (Direct update for instant feel)
            if (backgroundRef.current) {
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                const moveX = (clientX - centerX) * 0.015;
                const moveY = (clientY - centerY) * 0.015;
                backgroundRef.current.style.transform = `translate3d(${-moveX}px, ${-moveY}px, 0)`;
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Smooth Spotlight Loop
        let animationFrameId;
        const animateSpotlight = () => {
            // Lerp tracking (0.1 = smooth delay)
            spotlightPosition.current.x += (mousePosition.current.x - spotlightPosition.current.x) * 0.1;
            spotlightPosition.current.y += (mousePosition.current.y - spotlightPosition.current.y) * 0.1;

            if (spotlightRef.current) {
                spotlightRef.current.style.transform = `translate3d(${spotlightPosition.current.x}px, ${spotlightPosition.current.y}px, 0)`;
            }

            animationFrameId = requestAnimationFrame(animateSpotlight);
        };
        animateSpotlight();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Floating Dust Particle System
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            const particleCount = Math.min(window.innerWidth * 0.05, 100); // Responsive count

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2 + 0.5, // 0.5px to 2.5px
                    speedX: (Math.random() - 0.5) * 0.2, // Very slow drift
                    speedY: (Math.random() - 0.5) * 0.2,
                    opacity: Math.random() * 0.5 + 0.1
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;

                // Wrap around
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30 relative flex flex-col overflow-x-hidden">
            {/* AMBIENT CURSOR LIGHT */}
            <div
                ref={spotlightRef}
                className="fixed top-0 left-0 w-[800px] h-[800px] rounded-full pointer-events-none z-[1] opacity-100 transition-opacity duration-500"
                style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)',
                    filter: 'blur(80px)',
                    mixBlendMode: 'plus-lighter',
                    marginLeft: '-400px',
                    marginTop: '-400px'
                }}
            />

            {/* LUMINOUS BACKGROUND SYSTEM */}
            <div
                ref={backgroundRef}
                className="fixed inset-0 z-0 pointer-events-none overflow-hidden transition-transform duration-100 ease-out will-change-transform"
            >
                {/* 1. Deep Void Base (Already in body) */}

                {/* 2. Cinematic Vignette (Deep Dark Center) */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle at 50% 50%, #050505 0%, #000000 100%)',
                        opacity: 1
                    }}
                />

                {/* 2.5 Living Atmosphere (The Slow Drift - Globalized) */}
                <div className="absolute inset-0 overflow-hidden opacity-80">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                            opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-[50%] -left-[20%] w-[100vw] h-[100vw] rounded-full bg-gradient-to-r from-indigo-900/20 to-purple-900/20 blur-[120px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            x: [0, 100, 0],
                            opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{ duration: 45, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[20%] -right-[20%] w-[80vw] h-[80vw] rounded-full bg-gradient-to-b from-blue-900/10 to-transparent blur-[100px]"
                    />
                </div>

                {/* 3. Floating Dust Particles (Subtle) */}
                <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-20" />

                {/* 4. Top Light Source (Barely Visible) */}
                <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-white/5 via-transparent to-transparent blur-3xl opacity-5" />

                {/* 5. Noise Texture Overlay (Film Grain) */}
                <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none z-[1]"></div>
            </div>

            <Navbar />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;
