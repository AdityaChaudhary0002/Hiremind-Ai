import React, { useEffect, useState } from 'react';
import { getRandomTip } from '@/data/tips';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserButton } from '@clerk/clerk-react';
import axios from 'axios';
import { Plus, History, Trophy, TrendingUp, ArrowRight, Zap, Target, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedLogo from "@/components/ui/animated-logo";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ThemeToggle } from "@/components/theme-toggle";

const Dashboard = () => {
    const navigate = useNavigate();
    const { getToken, user } = useAuth();
    const [interviews, setInterviews] = useState([]);
    const [stats, setStats] = useState({ total: 0, avgScore: 0 });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dailyTip, setDailyTip] = useState("");

    useEffect(() => {
        setDailyTip(getRandomTip());
        const fetchData = async () => {
            try {
                const token = await getToken();
                // Fetch recent 10 for dashboard
                const response = await axios.get('/api/interview/history?limit=10', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = response.data.interviews || [];
                setInterviews(data);

                // Calculate stats
                const total = response.data.pagination.total;
                const scores = data.filter(i => i.feedback?.overallScore).map(i => i.feedback.overallScore);
                const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
                setStats({ total, avgScore: avg });

                // Prepare chart data (reversed for chronological order)
                const chart = data.slice().reverse().map((i, index) => ({
                    name: `S${index + 1}`,
                    score: i.feedback?.overallScore || 0,
                    role: i.role
                }));
                setChartData(chart);

            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [getToken]);

    return (
        <div className="min-h-screen bg-background text-foreground p-6 font-sans transition-colors duration-300">
            {/* Top Navigation */}
            <div className="max-w-7xl mx-auto flex justify-between items-center mb-12 pt-4">
                <AnimatedLogo />
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <UserButton afterSignOutUrl="/login" />
                </div>
            </div>

            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Left Column: Stats & Quick Actions */}
                <div className="lg:col-span-3 space-y-8">

                    {/* Welcome & Pulse */}
                    <div className="flex justify-between items-end border-b border-border pb-8">
                        <div>
                            <h1 className="text-3xl font-heading font-light text-muted-foreground">Welcome back,</h1>
                            <div className="text-4xl font-heading font-bold text-foreground mt-1">{user?.firstName}</div>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-muted-foreground text-sm font-mono uppercase tracking-widest">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            System Optimized
                        </div>
                    </div>

                    {/* Performance Chart Widget */}
                    <div className="border border-border rounded-xl p-8 bg-card relative overflow-hidden group shadow-sm">
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div>
                                <h3 className="text-lg font-bold text-foreground flex items-center gap-2 font-heading">
                                    <TrendingUp className="w-5 h-5 text-primary" /> Performance Trend
                                </h3>
                                <p className="text-muted-foreground text-sm mt-1">Last 10 Sessions Analysis</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-foreground font-heading">{stats.avgScore}<span className="text-lg text-muted-foreground">%</span></div>
                                <div className="text-muted-foreground text-xs uppercase tracking-widest">Avg Quality</div>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="h-[250px] w-full -ml-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)', color: 'hsl(var(--popover-foreground))' }}
                                        itemStyle={{ color: 'hsl(var(--primary))' }}
                                    />
                                    <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div
                            onClick={() => navigate('/role-selection')}
                            className="bg-primary text-primary-foreground p-8 rounded-xl cursor-pointer hover:bg-primary/90 transition-colors group relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-primary-foreground/10 rounded-full flex items-center justify-center mb-6 text-primary-foreground">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2 font-heading">New Simulation</h3>
                                <p className="text-primary-foreground/80 mb-6">Start a new AI-driven interview session.</p>
                                <span className="text-xs font-bold uppercase tracking-widest border-b border-primary-foreground pb-1 group-hover:border-transparent transition-all">Launch &rarr;</span>
                            </div>
                            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                        </div>

                        <div
                            onClick={() => navigate('/goals')}
                            className="border border-border p-8 rounded-xl hover:bg-muted/30 transition-colors group cursor-pointer bg-card"
                        >
                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-6 text-foreground border border-border">
                                <Target className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 font-heading">My Goals</h3>
                            <p className="text-muted-foreground mb-6">Track your progress and set improved targets.</p>
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">View Details &rarr;</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: History & Sidebar */}
                <div className="lg:col-span-1 space-y-8">

                    {/* Mini Stats */}
                    <div className="border border-border rounded-xl p-6 bg-card">
                        <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                            <Trophy className="w-4 h-4" /> <span className="text-xs font-mono uppercase tracking-widest">Total Sessions</span>
                        </div>
                        <div className="text-3xl font-bold font-heading">{stats.total}</div>
                    </div>

                    {/* Recent Activity List */}
                    <div className="border border-border rounded-xl overflow-hidden bg-card">
                        <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recent Logs</span>
                            <History className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="divide-y divide-border">
                            {loading ? (
                                <div className="p-8 text-center text-xs text-muted-foreground font-mono">LOADING DATA...</div>
                            ) : interviews.slice(0, 5).map((interview) => (
                                <div
                                    key={interview._id}
                                    onClick={() => navigate(`/feedback/${interview._id}`)}
                                    className="p-4 hover:bg-muted/50 cursor-pointer transition-colors group"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{interview.role}</div>
                                        <div className={`text-xs font-bold ${interview.feedback?.overallScore >= 70 ? 'text-green-500' : 'text-muted-foreground'}`}>
                                            {interview.feedback?.overallScore || 0}%
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-mono">
                                        {new Date(interview.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div
                            onClick={() => navigate('/history')}
                            className="p-3 text-center bg-muted/10 hover:bg-muted cursor-pointer border-t border-border text-xs font-mono text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
                        >
                            View All History
                        </div>
                    </div>

                    {/* Learning Resource */}
                    <div className="p-6 rounded-xl bg-gradient-to-br from-muted to-background border border-border">
                        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                            <BookOpen className="w-4 h-4" /> <span className="text-xs font-mono uppercase tracking-widest">Daily Tip</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed font-body italic">
                            "{dailyTip}"
                        </p>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Dashboard;
