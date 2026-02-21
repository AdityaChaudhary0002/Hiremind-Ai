import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Globe, Database, Smartphone, Cloud, Shield, Upload, ArrowRight, Check, Sparkles, Briefcase, Megaphone, Handshake, Users, Settings, Headphones, ChevronLeft, Cpu, UserCircle } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { MOTION, STYLES } from '@/lib/design-system';
import Logo from '@/components/ui/logo';

const RoleSelection = () => {
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const [category, setCategory] = useState(null); // 'tech' | 'non-tech'
    const [selectedRole, setSelectedRole] = useState(null);
    const [difficulty, setDifficulty] = useState('Medium');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const techRoles = [
        { id: 'frontend', title: 'Frontend Systems', icon: Globe, desc: 'React, Architecture, Perf' },
        { id: 'backend', title: 'Backend Logic', icon: Database, desc: 'API, DB, Scalability' },
        { id: 'fullstack', title: 'Full Stack Core', icon: Code2, desc: 'End-to-End Systems' },
        { id: 'mobile', title: 'Mobile Nexus', icon: Smartphone, desc: 'iOS, Android, React Native' },
        { id: 'devops', title: 'DevOps Pipeline', icon: Cloud, desc: 'CI/CD, Infrastructure' },
        { id: 'cybersecurity', title: 'Security Ops', icon: Shield, desc: 'Pen-testing, InfoSec' },
    ];

    const nonTechRoles = [
        { id: 'pm', title: 'Product Manager', icon: Briefcase, desc: 'Strategy, Roadmap, Execution' },
        { id: 'marketing', title: 'Marketing Lead', icon: Megaphone, desc: 'Growth, Brand, Analytics' },
        { id: 'sales', title: 'Sales Executive', icon: Handshake, desc: 'Negotiation, CRM, Closing' },
        { id: 'hr', title: 'Human Resources', icon: Users, desc: 'Recruiting, Culture, Compliance' },
        { id: 'operations', title: 'Operations Manager', icon: Settings, desc: 'Logistics, Process, Efficiency' },
        { id: 'customer_success', title: 'Customer Success', icon: Headphones, desc: 'Support, Retention, Upsell' },
    ];

    const currentRoles = category === 'tech' ? techRoles : nonTechRoles;

    const handleStartInterview = () => {
        if (selectedRole) {
            navigate('/interview', { state: { role: selectedRole.title, difficulty } });
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            setUploadError("Protocol Mismatch: PDF Required.");
            return;
        }

        setIsUploading(true);
        setUploadError(null);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const token = await getToken();
            const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
            const response = await axios.post(`${apiUrl}/api/resume/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
            });
            navigate('/interview', {
                state: { role: 'Resume Protocol', difficulty, resumeText: response.data.text }
            });
        } catch (error) {
            console.error("Upload error:", error);
            setUploadError("Upload Failed. Retrying recommended.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex flex-col overflow-hidden selection:bg-white/20">

            {/* Top HUD */}
            <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-50 pointer-events-none">
                <div className="pointer-events-auto">
                    <Logo className="scale-75 origin-top-left opacity-50 hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] font-mono text-muted-text tracking-[0.2em] uppercase hidden md:block">
                    Module Selection // Phase 1
                </div>
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 flex flex-col md:flex-row gap-16">

                {/* LEFT: The Narrative & Config */}
                <div className="md:w-1/3 flex flex-col justify-center sticky top-24 h-fit">
                    <motion.div variants={MOTION.drift} initial="hidden" animate="visible">
                        {category && (
                            <button
                                onClick={() => { setCategory(null); setSelectedRole(null); }}
                                className="flex items-center gap-2 text-subtle hover:text-heading mb-6 transition-colors text-xs font-mono uppercase tracking-widest"
                            >
                                <ChevronLeft className="w-4 h-4" /> Back to Categories
                            </button>
                        )}

                        <h1 className={`${STYLES.h1_hero} text-5xl md:text-6xl mb-6 leading-tight`}>
                            {category ? (category === 'tech' ? 'Technical' : 'Business') : 'Choose'}
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--subtle)] to-transparent">
                                {category ? 'Protocol.' : 'Your Path.'}
                            </span>
                        </h1>
                        <p className={`${STYLES.p_body} mb-12 max-w-sm`}>
                            {category
                                ? "Select your specialization or upload a dossier for a custom simulation."
                                : "Define the scope of your simulation. Technical architectures or Business operations."}
                        </p>

                        {/* Difficulty Selector (Visible only if category selected) */}
                        {category && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
                                <div className="text-xs font-mono text-muted-text uppercase tracking-widest mb-4">Simulation Intensity</div>
                                <div className="flex gap-2 bg-glass-hover p-1 rounded-full border border-[var(--glass-border)] w-fit">
                                    {['Easy', 'Medium', 'Hard'].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setDifficulty(d)}
                                            className={`px-6 py-2 rounded-full text-xs font-bold tracking-wide transition-all ${difficulty === d
                                                ? 'bg-primary text-primary-foreground shadow-lg'
                                                : 'text-subtle hover:text-heading hover:bg-glass-hover'
                                                }`}
                                        >
                                            {d.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Action Button */}
                        {category && (
                            <Button
                                onClick={handleStartInterview}
                                disabled={!selectedRole}
                                className={`w-full h-14 rounded-full font-heading font-bold text-lg tracking-wide transition-all ${selectedRole
                                    ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-lg hover:scale-105'
                                    : 'bg-glass-hover text-muted-text border border-[var(--glass-border)] cursor-not-allowed'
                                    }`}
                            >
                                {selectedRole ? (
                                    <span className="flex items-center gap-2">INITIATE SIMULATION <ArrowRight className="w-5 h-5" /></span>
                                ) : (
                                    "SELECT A PROTOCOL"
                                )}
                            </Button>
                        )}
                    </motion.div>
                </div>

                {/* RIGHT: The Holographic Deck */}
                <div className="md:w-2/3">
                    <AnimatePresence mode="wait">
                        {!category ? (
                            // CATEGORY SELECTION
                            <motion.div
                                key="categories"
                                variants={MOTION.container}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[400px]"
                            >
                                <motion.div
                                    variants={MOTION.drift}
                                    onClick={() => setCategory('tech')}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setCategory('tech')}
                                    className="group cursor-pointer bg-glass-hover border border-[var(--glass-border)] hover:border-[var(--border-medium)] rounded-[30px] p-10 flex flex-col justify-between hover:bg-[var(--glass-hover)] transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                        <Cpu className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-heading font-bold text-heading mb-2">Technical</h3>
                                        <p className="text-subtle text-sm">Engineering, DevOps, Systems Architecture, and Coding Infrastructure.</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    variants={MOTION.drift}
                                    onClick={() => setCategory('non-tech')}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setCategory('non-tech')}
                                    className="group cursor-pointer bg-glass-hover border border-[var(--glass-border)] hover:border-[var(--border-medium)] rounded-[30px] p-10 flex flex-col justify-between hover:bg-[var(--glass-hover)] transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                        <UserCircle className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-heading font-bold text-heading mb-2">Non-Technical</h3>
                                        <p className="text-subtle text-sm">Management, Operations, HR, Sales, and Leadership Roles.</p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ) : (
                            // ROLE SELECTION GRID
                            <motion.div
                                key="roles"
                                variants={MOTION.container}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                {/* Custom Upload Card */}
                                <motion.div variants={MOTION.drift} className={`${STYLES.glass_card} p-1 border-dashed border-white/20 hover:border-white/50 group cursor-pointer relative overflow-hidden bg-glass-hover focus-within:ring-2 focus-within:ring-white/50`}>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                        disabled={isUploading}
                                    />
                                    <div className="h-full bg-black/40 rounded-[20px] p-6 flex flex-col items-center justify-center text-center gap-4 group-hover:bg-black/30 transition-colors">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${isUploading ? 'border-primary text-primary animate-pulse' : 'border-[var(--border-medium)] bg-glass-hover text-muted-text group-hover:scale-110 group-hover:text-white'}`}>
                                            {isUploading ? <Sparkles className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h3 className="font-heading font-bold text-white text-lg">Upload Dossier</h3>
                                            <p className="text-sm text-muted-text mt-1">AI-Tailored from Resume (PDF)</p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Role Cards */}
                                {currentRoles.map((role) => (
                                    <motion.div
                                        key={role.id}
                                        variants={MOTION.drift}
                                        onClick={() => setSelectedRole(role)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedRole(role)}
                                        aria-pressed={selectedRole?.id === role.id}
                                        className={`${STYLES.glass_card} p-1 cursor-pointer group relative overflow-hidden transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-primary/50`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                        <div className={`h-full rounded-[20px] p-6 flex flex-col justify-between relative z-10 transition-all ${selectedRole?.id === role.id ? 'bg-white/10 border-white/20' : 'bg-transparent'
                                            }`}>
                                            <div className="flex justify-between items-start">
                                                <role.icon className={`w-8 h-8 transition-colors ${selectedRole?.id === role.id ? 'text-heading' : 'text-subtle group-hover:text-heading'}`} />
                                                {selectedRole?.id === role.id && <Check className="w-5 h-5 text-heading" />}
                                            </div>

                                            <div className="mt-8">
                                                <h3 className={`font-heading font-bold text-xl mb-1 transition-colors ${selectedRole?.id === role.id ? 'text-heading' : 'text-body group-hover:text-heading'}`}>
                                                    {role.title}
                                                </h3>
                                                <p className="text-xs font-mono text-muted-text uppercase tracking-widest">{role.desc}</p>
                                            </div>
                                        </div>

                                        {/* Active Glow */}
                                        {selectedRole?.id === role.id && (
                                            <motion.div
                                                layoutId="activeGlow"
                                                className="absolute inset-0 border-2 border-primary/50 rounded-3xl shadow-lg pointer-events-none"
                                            />
                                        )}
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
};

export default RoleSelection;
