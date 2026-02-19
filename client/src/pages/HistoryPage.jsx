import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { Calendar, Trophy, ArrowRight, Loader2, History, Activity, Trash2, Shield, Search, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const HistoryPage = () => {
    const { getToken, userId, isLoaded } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Technical');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // --- DATA FETCHING ---
    const fetchLogs = React.useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const token = await getToken();
            const typeParam = activeTab === 'Technical' ? 'Technical' : 'Non-Technical';
            const res = await api.getUserInterviews(token, page, 10, typeParam);
            setLogs(res.interviews || []);
            setTotalPages(res.pagination?.pages || 1);
        } catch (err) {
            console.error("History Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, [getToken, page, activeTab, userId]);

    useEffect(() => {
        if (isLoaded && userId) {
            fetchLogs();
        } else if (isLoaded && !userId) {
            setLoading(false); // Stop loading if no user
        }
    }, [fetchLogs, isLoaded, userId]);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Confirm deletion of this mission log?")) return;
        try {
            const token = await getToken();
            await api.deleteInterview(id, token);
            setLogs(logs.filter(l => l._id !== id));
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const handleClearHistory = async () => {
        if (!window.confirm("WARNING: This will purge all mission archives. Proceed?")) return;
        try {
            const token = await getToken();
            await api.clearHistory(token);
            setLogs([]);
        } catch (err) {
            console.error("Clear failed", err);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-white/50">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-white/80" />
            <span className="font-mono text-xs tracking-[0.2em] uppercase">Retrieving Archives...</span>
        </div>
    );

    return (
        <div className="min-h-screen relative flex flex-col selection:bg-white/20 pb-20 bg-black overflow-x-hidden font-sans">

            {/* AMBIENT ORBS */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <motion.div
                    animate={{ y: [0, -20, 0], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 right-[10%] w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full"
                />
                <motion.div
                    animate={{ y: [0, 20, 0], opacity: [0.05, 0.1, 0.05] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-20 left-[5%] w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full"
                />
            </div>

            {/* Minimal Header */}
            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 pt-16 flex flex-col md:flex-row justify-between items-end gap-8 mb-16 border-b border-white/[0.05] pb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-3 text-xs font-mono text-white/50 mb-4 uppercase tracking-[0.2em] font-medium">
                        <History className="w-3 h-3" />
                        <span>System Archives</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-heading font-bold text-white tracking-tighter mb-4">
                        Operation Logs.
                    </h1>
                    <p className="text-white/60 max-w-xl text-lg font-light leading-relaxed">
                        Analyze past simulations. Identify fail-states and optimize for future execution.
                    </p>
                </motion.div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Floating Pill Tabs */}
                    <div className="flex p-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
                        {['Technical', 'Non-Technical'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setPage(1); }}
                                className={`px-6 py-2 text-[10px] font-mono uppercase tracking-widest rounded-full transition-all ${activeTab === tab
                                    ? 'bg-white text-black shadow-lg scale-105 font-bold'
                                    : 'text-white/50 hover:text-white'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Purge Button */}
                    <Button
                        variant="ghost"
                        onClick={handleClearHistory}
                        className="text-[10px] font-mono text-white/30 hover:text-red-500 uppercase tracking-widest flex items-center gap-2 hover:bg-transparent"
                    >
                        <Trash2 className="w-3 h-3" /> Purge Data
                    </Button>
                </div>
            </div>

            {/* Grid */}
            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12">
                {logs.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full h-96 flex flex-col items-center justify-center border border-dashed border-white/10 text-white/30 rounded-[3rem] bg-white/[0.01]"
                    >
                        <Search className="w-8 h-8 mb-4 opacity-50" />
                        <span className="font-mono text-xs tracking-widest uppercase">
                            No Archives in Sector {activeTab}
                        </span>
                        <Button
                            onClick={() => navigate('/role-selection')}
                            className="mt-6 bg-white text-black hover:bg-white/90 font-mono text-xs uppercase tracking-widest py-3 px-8 rounded-full"
                        >
                            Initiate Simulation
                        </Button>
                    </motion.div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                            <AnimatePresence mode="popLayout">
                                {logs.map((log, index) => (
                                    <motion.div
                                        key={log._id}
                                        layout
                                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.05, type: "spring", stiffness: 50, damping: 20 }}
                                        whileHover={{ y: -10, transition: { duration: 0.2 } }}
                                        className="group relative bg-[#050505] border border-white/10 p-8 hover:bg-white/[0.05] hover:border-white/20 transition-all cursor-pointer overflow-hidden rounded-[2.5rem]"
                                        onClick={() => navigate(`/history/${log._id}`)}
                                    >
                                        <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <button
                                                onClick={(e) => handleDelete(e, log._id)}
                                                className="text-white/20 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-start mb-12">
                                            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Activity className="w-5 h-5 text-white/60" />
                                            </div>
                                            <div className="font-mono text-xl font-light text-white opacity-80">
                                                {log.feedback?.overallScore || '0'}%
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-heading font-light text-white mb-2 line-clamp-1 group-hover:text-white/90 transition-colors">
                                            {log.role}
                                        </h3>

                                        <div className="flex items-center gap-4 text-[10px] text-white/50 font-mono uppercase tracking-widest mb-8">
                                            <span className="px-3 py-1 rounded-full border border-white/10">{log.difficulty}</span>
                                            <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs font-mono text-white/50 group-hover:text-white transition-colors border-t border-white/10 pt-6 uppercase tracking-widest font-medium">
                                            View Breakdown <span className="ml-2 text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">NEW</span> <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0" />
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-8 pb-12">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white disabled:opacity-20 transition-colors"
                                >
                                    &lt; Previous
                                </button>
                                <span className="font-mono text-xs text-white/30 tracking-widest">
                                    PAGE {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white disabled:opacity-20 transition-colors"
                                >
                                    Next &gt;
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;
