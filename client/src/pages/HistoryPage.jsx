import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { Calendar, Clock, Trophy, ArrowRight, Loader2, FileText, BarChart3, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { MOTION, STYLES } from '@/lib/design-system';
import Logo from '@/components/ui/logo';
import { useNavigate } from 'react-router-dom';

const History = () => {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = await getToken();
                // Mock data for now if API fails or is empty, to show UI
                const mockData = [
                    { _id: '1', role: 'Frontend Systems', date: '2025-05-12', score: 85, status: 'Completed', duration: '24m' },
                    { _id: '2', role: 'Backend Logic', date: '2025-05-10', score: 92, status: 'Completed', duration: '31m' },
                    { _id: '3', role: 'DevOps Pipeline', date: '2025-05-08', score: 78, status: 'Aborted', duration: '12m' },
                ];

                try {
                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/interview/history`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.data && res.data.length > 0) setHistory(res.data);
                    else setHistory(mockData);
                } catch (e) {
                    console.warn("API Fetch failed, using mock data", e);
                    setHistory(mockData);
                }
            } catch (error) {
                console.error("History error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [getToken]);

    return (
        <div className="min-h-screen relative flex flex-col overflow-hidden selection:bg-white/20">
            {/* Top HUD */}
            <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-50 pointer-events-none">
                <div className="pointer-events-auto">
                    <Logo className="scale-75 origin-top-left opacity-50 hover:opacity-100 transition-opacity" />
                </div>
                <Button
                    variant="ghost"
                    onClick={() => navigate('/dashboard')}
                    className="pointer-events-auto text-white/40 hover:text-white"
                >
                    Return to Command
                </Button>
            </div>

            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-32 flex flex-col">

                <motion.div variants={MOTION.drift} initial="hidden" animate="visible" className="mb-16">
                    <h1 className={`${STYLES.h1_hero} text-6xl mb-4`}>Mission Logs</h1>
                    <p className={`${STYLES.p_body} max-w-xl`}>
                        Archives of all previous simulation runs. Analyze performance metrics and review tactical outcomes.
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
                    </div>
                ) : (
                    <motion.div
                        variants={MOTION.container}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                    >
                        {history.map((item, index) => (
                            <motion.div
                                key={item._id}
                                variants={MOTION.drift}
                                className={`${STYLES.glass_card} p-1 cursor-pointer group relative overflow-hidden transition-all hover:scale-[1.01]`}
                                onClick={() => navigate(`/feedback/${item._id}`)}
                            >
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="relative z-10 bg-black/40 rounded-[20px] p-6 flex flex-col md:flex-row items-center justify-between gap-6">

                                    {/* Left: Role Info */}
                                    <div className="flex items-center gap-6 w-full md:w-auto">
                                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-colors">
                                            <Trophy className={`w-8 h-8 ${item.score >= 90 ? 'text-yellow-400' : 'text-white/40'}`} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-mono text-white/30 uppercase tracking-widest mb-1">
                                                {item.date} // {item.duration}
                                            </div>
                                            <h3 className="font-heading font-bold text-xl text-white group-hover:text-primary transition-colors">
                                                {item.role}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Right: Stats & Action */}
                                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                        <div className="text-right">
                                            <div className="text-xs font-mono text-white/30 uppercase tracking-widest mb-1">Score</div>
                                            <div className={`text-3xl font-heading font-bold ${item.score >= 80 ? 'text-green-400' : 'text-white'}`}>
                                                {item.score}%
                                            </div>
                                        </div>

                                        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white text-white group-hover:text-black transition-all">
                                            <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform" />
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default History;
