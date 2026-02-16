import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import { ArrowRight, Terminal, Cpu, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const LandingPage = () => {
    const navigate = useNavigate();
    const { isSignedIn } = useAuth();

    const handleStart = () => {
        if (isSignedIn) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-sans transition-colors duration-300">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-foreground rounded-sm" />
                        <span className="font-heading font-bold text-lg tracking-tight">HireMind</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Button
                            variant="outline"
                            onClick={() => navigate(isSignedIn ? '/dashboard' : '/login')}
                            className="text-sm border-border bg-background hover:bg-muted rounded-md"
                        >
                            {isSignedIn ? "Dashboard" : "Login"}
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center min-h-[80vh]">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--muted))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted))_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 max-w-4xl mx-auto space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs text-muted-foreground font-mono mb-4">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        SYSTEM OPERATIONAL
                    </div>

                    <h1 className="text-5xl md:text-8xl font-heading font-bold tracking-tighter text-foreground">
                        Interview Intelligence.<br />
                        <span className="text-muted-foreground">Redefined.</span>
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed font-body">
                        The ultimate AI-powered simulation platform for engineering candidates. Real-time analysis, precise feedback, zero fluff.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                        <Button
                            onClick={handleStart}
                            className="h-12 px-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-lg flex items-center gap-2"
                        >
                            Start Assessment <ArrowRight className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-12 px-8 rounded-md border-border bg-background hover:bg-muted text-muted-foreground transition-colors"
                        >
                            View Documentation
                        </Button>
                    </div>
                </motion.div>
            </header>

            {/* Features (Grid) */}
            <section className="py-24 border-t border-border bg-background relative z-10">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Terminal className="w-6 h-6" />}
                        title="Code Analysis"
                        desc="Advanced syntax evaluation and logic verification using Groq AI LLaMA-3 models."
                    />
                    <FeatureCard
                        icon={<Cpu className="w-6 h-6" />}
                        title="Neural Processing"
                        desc="Low-latency voice recognition and natural language understanding for fluid conversations."
                    />
                    <FeatureCard
                        icon={<LineChart className="w-6 h-6" />}
                        title="Performance Metrics"
                        desc="Detailed breakdown of technical accuracy, communication clarity, and confidence."
                    />
                </div>
            </section>

            <footer className="py-12 border-t border-border text-center text-muted-foreground font-mono text-sm">
                <p>HIREMIND SYSTEM v2.0 &copy; 2026</p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="p-8 border border-border rounded-lg hover:border-primary/50 transition-colors bg-card group shadow-sm">
        <div className="mb-6 p-3 bg-muted w-fit rounded-md text-foreground group-hover:scale-110 transition-transform border border-border">
            {icon}
        </div>
        <h3 className="text-xl font-heading font-bold mb-3 text-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed font-body">{desc}</p>
    </div>
);

export default LandingPage;
