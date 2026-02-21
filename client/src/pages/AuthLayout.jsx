import React from 'react';
import { useLocation } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { BrainCircuit, Code2, Users, ArrowRight, ShieldCheck } from 'lucide-react';

const AuthLayout = () => {
    const location = useLocation();
    const isRegister = location.pathname.includes('register');

    return (
        <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden font-sans">

            {/* Left Panel: System Features (Hidden on Mobile) */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 bg-page-alt border-r border-[var(--border-subtle)]">

                {/* Tactical Effects */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
                    <div className="absolute top-1/2 left-1/2 w-3/4 h-3/4 bg-emerald-500/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between">
                    {/* Logo area */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-sm bg-glass-hover border border-[var(--border-medium)] flex items-center justify-center">
                            <BrainCircuit className="w-5 h-5 text-body" />
                        </div>
                        <span className="text-xl font-mono tracking-[0.2em] uppercase text-heading">
                            Hiremind
                        </span>
                    </div>

                    {/* Value Props */}
                    <div className="space-y-12 max-w-lg">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl lg:text-5xl font-heading font-bold leading-[1.1] text-heading"
                        >
                            Neural simulation <br />
                            <span className="text-muted-text">environment online.</span>
                        </motion.h1>

                        <div className="space-y-4">
                            <FeatureItem
                                icon={<BrainCircuit className="w-4 h-4 text-emerald-400" />}
                                title="System Analysis"
                                description="Real-time evaluation of cognitive responses and technical accuracy."
                                delay={0.3}
                            />
                            <FeatureItem
                                icon={<Code2 className="w-4 h-4 text-body" />}
                                title="Code Verification"
                                description="Interactive IDE matrix for logic and algorithm stress tests."
                                delay={0.4}
                            />
                            <FeatureItem
                                icon={<Users className="w-4 h-4 text-body" />}
                                title="Synthetic Agents"
                                description="Adversarial network of AI personas generating adaptive queries."
                                delay={0.5}
                            />
                        </div>
                    </div>

                    {/* Footer / Social Proof */}
                    <div className="space-y-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-xs font-medium text-subtle">
                                    U{i}
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-xs font-medium text-white">
                                +2k
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">Trusted by developers worldwide.</p>
                    </div>
                </div>
            </div>

            {/* Right Panel: Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-page relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] z-0 pointer-events-none" />

                <div className="w-full max-w-md relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {/* Centered Logo for Mobile */}
                        <div className="lg:hidden flex justify-center mb-8">
                            <div className="w-10 h-10 rounded-sm bg-glass-hover border border-[var(--border-medium)] flex items-center justify-center">
                                <BrainCircuit className="w-5 h-5 text-emerald-500" />
                            </div>
                        </div>

                        {/* Minimal Auth Card matching Dashboard UI */}
                        {isRegister ? (
                            <SignUp
                                signInUrl="/login"
                                appearance={{
                                    elements: {
                                        rootBox: "w-full",
                                        card: "bg-surface border border-[var(--border-medium)] shadow-2xl rounded-sm w-full",
                                        headerTitle: "text-heading font-mono uppercase tracking-widest text-sm",
                                        headerSubtitle: "text-muted-text font-mono text-xs mt-2",
                                        socialButtonsBlockButton: "bg-glass-hover hover:bg-[var(--glass-hover)] border-[var(--border-medium)] text-heading rounded-none",
                                        socialButtonsBlockButtonText: "text-heading font-mono text-xs uppercase tracking-wider",
                                        dividerLine: "bg-[var(--border-medium)]",
                                        dividerText: "text-muted-text font-mono text-xs",
                                        formFieldLabel: "text-subtle font-mono text-[10px] uppercase tracking-widest",
                                        formFieldInput: "bg-surface border-[var(--border-medium)] text-heading focus:border-[var(--border-medium)] rounded-none h-10 font-mono text-sm shadow-none",
                                        footerActionLink: "text-heading hover:text-body font-mono text-xs underline decoration-[var(--border-medium)] underline-offset-4",
                                        footerActionText: "text-subtle font-mono text-xs",
                                        formButtonPrimary: "bg-primary hover:opacity-90 text-primary-foreground font-mono text-xs uppercase tracking-widest rounded-none h-12 mt-4"
                                    }
                                }}
                            />
                        ) : (
                            <SignIn
                                signUpUrl="/register"
                                appearance={{
                                    elements: {
                                        rootBox: "w-full",
                                        card: "bg-surface border border-[var(--border-medium)] shadow-2xl rounded-sm w-full",
                                        headerTitle: "text-heading font-mono uppercase tracking-widest text-sm",
                                        headerSubtitle: "text-muted-text font-mono text-xs mt-2",
                                        socialButtonsBlockButton: "bg-glass-hover hover:bg-[var(--glass-hover)] border-[var(--border-medium)] text-heading rounded-none",
                                        socialButtonsBlockButtonText: "text-heading font-mono text-xs uppercase tracking-wider",
                                        dividerLine: "bg-[var(--border-medium)]",
                                        dividerText: "text-muted-text font-mono text-xs",
                                        formFieldLabel: "text-subtle font-mono text-[10px] uppercase tracking-widest",
                                        formFieldInput: "bg-surface border-[var(--border-medium)] text-heading focus:border-[var(--border-medium)] rounded-none h-10 font-mono text-sm shadow-none",
                                        footerActionLink: "text-heading hover:text-body font-mono text-xs underline decoration-[var(--border-medium)] underline-offset-4",
                                        footerActionText: "text-subtle font-mono text-xs",
                                        formButtonPrimary: "bg-primary hover:opacity-90 text-primary-foreground font-mono text-xs uppercase tracking-widest rounded-none h-12 mt-4"
                                    }
                                }}
                            />
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const FeatureItem = ({ icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className="flex items-start gap-4 p-4 rounded-sm bg-surface border border-[var(--border-subtle)] hover:border-white/20 transition-colors"
    >
        <div className="mt-1">
            {icon}
        </div>
        <div>
            <h3 className="text-sm font-mono tracking-wide text-heading mb-1">{title}</h3>
            <p className="text-xs font-mono text-muted-text leading-relaxed uppercase tracking-widest">
                {description}
            </p>
        </div>
    </motion.div>
);

export default AuthLayout;
