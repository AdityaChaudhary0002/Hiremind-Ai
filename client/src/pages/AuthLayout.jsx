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

            {/* Left Panel: Marketing (Hidden on Mobile) */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 bg-black border-r border-white/10">

                {/* Background Effects */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-violet-600/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-pink-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between">
                    {/* Logo area */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <BrainCircuit className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold font-heading tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                            Hiremind AI
                        </span>
                    </div>

                    {/* Value Props */}
                    <div className="space-y-12 max-w-lg">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-5xl font-heading font-bold leading-tight"
                        >
                            Master your interview skills with <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">AI Intelligence</span>
                        </motion.h1>

                        <div className="space-y-6">
                            <FeatureItem
                                icon={<BrainCircuit className="w-5 h-5 text-violet-400" />}
                                title="Real-Time Analysis"
                                description="Get instant feedback on your confidence, tone, and answers."
                                delay={0.3}
                            />
                            <FeatureItem
                                icon={<Code2 className="w-5 h-5 text-pink-400" />}
                                title="Interactive Code Sandbox"
                                description="Solve technical challenges in a live, execute-ready environment."
                                delay={0.4}
                            />
                            <FeatureItem
                                icon={<Users className="w-5 h-5 text-blue-400" />}
                                title="3D Neural Avatar"
                                description="Practice with a realistic AI interviewer that reacts to you."
                                delay={0.5}
                            />
                        </div>
                    </div>

                    {/* Footer / Social Proof */}
                    <div className="space-y-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-xs font-medium text-white/50">
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
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background relative">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />

                <div className="w-full max-w-md relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {/* Centered Logo for Mobile */}
                        <div className="lg:hidden flex justify-center mb-8">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                                <BrainCircuit className="w-7 h-7 text-white" />
                            </div>
                        </div>

                        {isRegister ? (
                            <SignUp
                                signInUrl="/login"
                                appearance={{
                                    elements: {
                                        rootBox: "w-full",
                                        card: "bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl w-full",
                                        headerTitle: "text-white font-heading font-bold",
                                        headerSubtitle: "text-muted-foreground",
                                        socialButtonsBlockButton: "bg-white/5 hover:bg-white/10 border-white/10 text-white",
                                        socialButtonsBlockButtonText: "text-white font-medium",
                                        formFieldLabel: "text-muted-foreground",
                                        formFieldInput: "bg-white/5 border-white/10 text-white focus:border-violet-500 focus:ring-violet-500/20",
                                        footerActionLink: "text-violet-400 hover:text-violet-300",
                                        formButtonPrimary: "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-violet-500/20 border-0"
                                    }
                                }}
                            />
                        ) : (
                            <SignIn
                                signUpUrl="/register"
                                appearance={{
                                    elements: {
                                        rootBox: "w-full",
                                        card: "bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl w-full",
                                        headerTitle: "text-white font-heading font-bold",
                                        headerSubtitle: "text-muted-foreground",
                                        socialButtonsBlockButton: "bg-white/5 hover:bg-white/10 border-white/10 text-white",
                                        socialButtonsBlockButtonText: "text-white font-medium",
                                        formFieldLabel: "text-muted-foreground",
                                        formFieldInput: "bg-white/5 border-white/10 text-white focus:border-violet-500 focus:ring-violet-500/20",
                                        footerActionLink: "text-violet-400 hover:text-violet-300",
                                        formButtonPrimary: "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-violet-500/20 border-0"
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
        className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm"
    >
        <div className="mt-1 p-2 rounded-lg bg-white/5 text-white">
            {icon}
        </div>
        <div>
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
            </p>
        </div>
    </motion.div>
);

export default AuthLayout;
