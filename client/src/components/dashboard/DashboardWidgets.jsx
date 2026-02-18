import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';
import { Target, TrendingUp, Zap } from 'lucide-react';

const Card = ({ title, icon: Icon, children, className }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-[#0a0a0c]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col ${className}`}
    >
        <div className="flex items-center gap-2 mb-4 text-white/40 text-xs font-mono uppercase tracking-widest">
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {title}
        </div>
        <div className="flex-1 min-h-0">
            {children}
        </div>
    </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/90 border border-white/10 p-2 rounded text-xs text-white shadow-xl">
                <p className="font-bold">{label}</p>
                <p className="text-white/70">{payload[0].value}</p>
            </div>
        );
    }
    return null;
};

export const SkillRadar = ({ data }) => {
    // Fallback data if no interviews yet
    const chartData = data?.length > 0 ? data : [
        { subject: 'Technical', A: 65, fullMark: 100 },
        { subject: 'System Design', A: 40, fullMark: 100 },
        { subject: 'Communication', A: 85, fullMark: 100 },
        { subject: 'Algorithm', A: 55, fullMark: 100 },
        { subject: 'Behavioral', A: 70, fullMark: 100 },
    ];

    return (
        <Card title="Neural Competency Map" icon={Zap} className="h-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Skills"
                        dataKey="A"
                        stroke="#8884d8"
                        strokeWidth={2}
                        fill="#8884d8"
                        fillOpacity={0.3}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </Card>
    );
};

export const ActivityGraph = ({ data }) => {
    const chartData = data || [
        { name: 'M', uv: 2 },
        { name: 'T', uv: 5 },
        { name: 'W', uv: 3 },
        { name: 'T', uv: 8 },
        { name: 'F', uv: 4 },
        { name: 'S', uv: 6 },
        { name: 'S', uv: 1 },
    ];

    return (
        <Card title="Training Frequency" icon={TrendingUp} className="h-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="uv" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#ffffff' : 'rgba(255,255,255,0.2)'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};

export const GoalTracker = ({ goals }) => {
    return (
        <Card title="Active Protocols" icon={Target} className="h-full overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
                {goals && goals.length > 0 ? goals.map((goal, i) => (
                    <div key={i} className="group">
                        <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-white/80 font-medium group-hover:text-white transition-colors">{goal.title}</span>
                            <span className="text-white/40 font-mono">{Math.round((goal.current / goal.target) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                                transition={{ duration: 1, delay: 0.2 * i }}
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            />
                        </div>
                    </div>
                )) : (
                    <div className="text-center text-white/20 text-xs py-4 italic">
                        No active protocols initiated.
                    </div>
                )}

                {(!goals || goals.length === 0) && (
                    <div className="mt-2 p-3 rounded bg-white/5 border border-white/5 text-[10px] text-white/50">
                        <span className="text-indigo-400 font-bold block mb-1">TIP:</span>
                        Define your target role to enable progress tracking.
                    </div>
                )}
            </div>
        </Card>
    );
};

const DashboardWidgets = ({ interviews, goals }) => {
    // Transform interviews into radar data (Mock logic for now)
    const skillsData = React.useMemo(() => {
        if (!interviews || interviews.length === 0) return null;
        // In a real app, we'd average scores per category
        return [
            { subject: 'Technical', A: 75, fullMark: 100 },
            { subject: 'System Design', A: 50, fullMark: 100 },
            { subject: 'Communication', A: 90, fullMark: 100 },
            { subject: 'Algorithm', A: 60, fullMark: 100 },
            { subject: 'Behavioral', A: 80, fullMark: 100 },
        ];
    }, [interviews]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full text-white">
            <div className="lg:col-span-1 min-h-[300px]">
                <SkillRadar data={skillsData} />
            </div>
            <div className="lg:col-span-1 min-h-[300px]">
                <ActivityGraph />
            </div>
            <div className="lg:col-span-1 min-h-[300px]">
                <GoalTracker goals={goals} />
            </div>
        </div>
    );
};

export default DashboardWidgets;
