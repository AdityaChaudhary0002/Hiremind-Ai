import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserButton } from '@clerk/clerk-react';
import axios from 'axios';
import { CheckCircle, Circle, Flame, Target, Trophy, ArrowLeft, Star, Zap, Plus, Loader2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

const GoalsPage = () => {
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newGoal, setNewGoal] = useState({ title: '', target: 5, category: 'technical' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Mock skills data (can be moved to backend later)
    const skills = [
        { name: "Frontend (React)", level: 75, color: "bg-blue-500" },
        { name: "Backend (Node.js)", level: 60, color: "bg-green-500" },
        { name: "Data Structures", level: 45, color: "bg-purple-500" },
        { name: "System Design", level: 30, color: "bg-orange-500" },
    ];

    // Mock streak data
    const streak = 12;

    const fetchGoals = async () => {
        try {
            const token = await getToken();
            const res = await axios.get('/api/goals', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGoals(res.data);
        } catch (error) {
            console.error("Failed to fetch goals:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, [getToken]);

    const handleCreateGoal = async () => {
        try {
            const token = await getToken();
            await axios.post('/api/goals', newGoal, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsDialogOpen(false);
            setNewGoal({ title: '', target: 5, category: 'technical' });
            fetchGoals();
        } catch (error) {
            console.error("Failed to create goal:", error);
        }
    };

    const handleProgressUpdate = async (id, current, target) => {
        if (current > target) return;
        try {
            const token = await getToken();
            await axios.put(`/api/goals/${id}/progress`, { current }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Optimistic update
            setGoals(goals.map(g => g._id === id ? { ...g, current } : g));
        } catch (error) {
            console.error("Failed to update progress:", error);
            fetchGoals(); // Revert on error
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-6 font-sans transition-colors duration-300 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-96 bg-primary/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 blur-[100px] pointer-events-none" />

            {/* Custom Modal Overlay */}
            <AnimatePresence>
                {isDialogOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative z-50 grid w-full max-w-lg gap-4 border border-border bg-card p-6 shadow-2xl rounded-xl"
                        >
                            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                                <h2 className="text-xl font-heading font-bold leading-none tracking-tight flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary" /> Set New Goal
                                </h2>
                                <p className="text-sm text-muted-foreground">Define your target and track your progress.</p>
                            </div>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Goal Title</label>
                                    <input
                                        className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        placeholder="e.g., Master React Hooks"
                                        value={newGoal.title}
                                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Target Number</label>
                                        <input
                                            type="number"
                                            className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            value={newGoal.target}
                                            onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Category</label>
                                        <select
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                                            value={newGoal.category}
                                            onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                                        >
                                            <option value="technical">Technical Skill</option>
                                            <option value="interview">Mock Interviews</option>
                                            <option value="soft-skill">Soft Skills</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                                    <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleCreateGoal} className="bg-primary text-primary-foreground hover:bg-primary/90">Create Goal</Button>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsDialogOpen(false)}
                                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="max-w-6xl mx-auto flex justify-between items-center mb-12 pt-4 relative z-10">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/dashboard')}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted/50 -ml-4 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <div className="text-3xl font-heading font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        My Goals
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <UserButton afterSignOutUrl="/login" />
                </div>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">

                {/* Left Col: Streak & Identity (4 Cols) */}
                <div className="md:col-span-4 space-y-6">
                    {/* Streak Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card/50 backdrop-blur-xl border border-border p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="relative mb-4">
                                <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 animate-pulse" />
                                <Flame className="w-16 h-16 text-orange-500 relative z-10" />
                            </div>
                            <div className="text-6xl font-heading font-black text-foreground tracking-tighter">{streak}</div>
                            <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest mt-2 font-bold">Day Streak</div>
                        </div>
                    </motion.div>

                    {/* Level Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card/50 backdrop-blur-xl border border-border p-6 rounded-2xl shadow-lg relative"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-20">
                            <Star className="w-24 h-24 text-accent rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-4">
                                <div className="font-heading font-bold text-lg">Level 5 Engineer</div>
                                <div className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-xs font-bold border border-yellow-500/20">ELITE</div>
                            </div>
                            <Progress value={70} className="h-3 mb-2 bg-muted" />
                            <div className="text-xs text-muted-foreground text-right font-mono">350 / 500 XP to Level 6</div>
                        </div>
                    </motion.div>

                    {/* Skill Tree */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-lg"
                    >
                        <h2 className="text-lg font-heading font-bold mb-6 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-primary" /> Skill Mastery
                        </h2>
                        <div className="space-y-4">
                            {skills.map((skill, index) => (
                                <div key={index} className="group cursor-pointer">
                                    <div className="flex justify-between mb-2 text-sm font-medium group-hover:text-primary transition-colors">
                                        <span>{skill.name}</span>
                                        <span className="font-mono opacity-70">{skill.level}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${skill.color} transition-all duration-1000 ease-out`}
                                            style={{ width: `${skill.level}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right Col: Active Targets (8 Cols) */}
                <div className="md:col-span-8 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-lg min-h-[600px]"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-heading font-bold flex items-center gap-3">
                                    <Target className="w-8 h-8 text-primary" /> Active Targets
                                </h2>
                                <p className="text-muted-foreground mt-1">Focus on what matters most.</p>
                            </div>
                            <Button onClick={() => setIsDialogOpen(true)} className="gap-2 shadow-lg shadow-primary/20 transition-transform hover:scale-105">
                                <Plus className="w-4 h-4" /> Add Goal
                            </Button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            </div>
                        ) : goals.length === 0 ? (
                            <div className="text-center py-20 border-2 border-dashed border-border rounded-xl bg-muted/10">
                                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-bold">No active goals</h3>
                                <p className="text-muted-foreground mb-6 max-w-xs mx-auto">Start your journey by setting a clear, achievable technical or interview goal.</p>
                                <Button variant="outline" onClick={() => setIsDialogOpen(true)}>Create First Goal</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {goals.map((goal, index) => (
                                    <motion.div
                                        key={goal._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-background border border-border p-6 rounded-xl hover:border-primary/50 transition-colors group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            {goal.category === 'technical' ? <Zap className="w-32 h-32" /> : <Trophy className="w-32 h-32" />}
                                        </div>

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${goal.category === 'technical' ? 'bg-blue-500/10 text-blue-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                        {goal.category === 'technical' ? <Zap className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold font-heading">{goal.title}</h3>
                                                        <span className="text-xs text-muted-foreground uppercase tracking-wider">{goal.category}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold font-mono">{Math.round((goal.current / goal.target) * 100)}%</div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <Progress value={(goal.current / goal.target) * 100} className="h-4" />

                                                <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                                        disabled={goal.current <= 0}
                                                        onClick={() => handleProgressUpdate(goal._id, goal.current - 1, goal.target)}
                                                    >
                                                        -
                                                    </Button>
                                                    <span className="font-mono font-medium text-lg">
                                                        {goal.current} <span className="text-muted-foreground text-sm">/ {goal.target} sessions</span>
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-green-500/10 hover:text-green-500"
                                                        disabled={goal.current >= goal.target}
                                                        onClick={() => handleProgressUpdate(goal._id, goal.current + 1, goal.target)}
                                                    >
                                                        +
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

            </main>
        </div>
    );
};

export default GoalsPage;
