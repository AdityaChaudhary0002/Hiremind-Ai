import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth, UserButton } from '@clerk/clerk-react';
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Download, Share2, CheckCircle, XCircle, AlertTriangle, TrendingUp, Award } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const FeedbackScreen = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const { getToken, userId } = useAuth();
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const token = await getToken();
                const response = await axios.get(`/api/interview/${interviewId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFeedback(response.data);
            } catch (err) {
                console.error("Error fetching feedback:", err);
                setError("Failed to load feedback analysis.");
            } finally {
                setLoading(false);
            }
        };

        if (interviewId) {
            fetchFeedback();
        }
    }, [interviewId, getToken]);

    const downloadPDF = () => {
        const input = document.getElementById('feedback-report');
        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`HireMind_Report_${interviewId}.pdf`);
        });
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-destructive">
            <AlertTriangle className="w-12 h-12 mb-4" />
            <p>{error}</p>
            <Button onClick={() => navigate('/dashboard')} variant="outline" className="mt-4">Return Home</Button>
        </div>
    );

    const score = feedback?.feedback?.overallScore || 0;
    const scoreColor = score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500';
    const chartData = [
        { name: 'Technical', value: feedback?.feedback?.technicalScore || 0, fullMark: 100 },
        { name: 'Communication', value: feedback?.feedback?.communicationScore || 0, fullMark: 100 },
        { name: 'Overall', value: feedback?.feedback?.overallScore || 0, fullMark: 100 },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
            {/* Header */}
            <header className="border-b border-border bg-background/50 backdrop-blur sticky top-0 z-10 px-6 h-16 flex justify-between items-center print:hidden">
                <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
                </Button>
                <div className="font-heading font-bold text-lg">Performance Analysis</div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={downloadPDF} className="bg-background border-border hover:bg-muted">
                        <Download className="w-4 h-4 mr-2" /> PDF
                    </Button>
                    <ThemeToggle />
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-6 space-y-8" id="feedback-report">

                {/* Hero Score Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <Award className="w-6 h-6 text-primary" />
                                <h2 className="text-xl font-heading font-bold">Executive Summary</h2>
                            </div>
                            <p className="text-muted-foreground text-lg leading-relaxed font-body">
                                {feedback?.feedback?.summary || "No summary available."}
                            </p>
                        </div>

                        {/* Improvements */}
                        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <TrendingUp className="w-6 h-6 text-primary" />
                                <h2 className="text-xl font-heading font-bold">Key Improvements</h2>
                            </div>
                            <ul className="space-y-4">
                                {feedback?.feedback?.improvements?.map((imp, i) => (
                                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                        <span>{imp}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Score Circle */}
                    <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center shadow-sm text-center">
                        <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                            {/* Placeholder for Circular Progress - Replace with Recharts Pie if simpler */}
                            <div className="w-full h-full rounded-full border-8 border-muted flex items-center justify-center relative">
                                <div className={`w-full h-full rounded-full border-8 border-current absolute top-0 left-0 ${scoreColor} opacity-20`} />
                                <div className="text-5xl font-heading font-bold text-foreground">{score}</div>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Overall Rating</h3>
                        <div className="text-sm text-muted-foreground mt-2 uppercase tracking-widest font-mono">
                            {score >= 80 ? "Excellent" : score >= 60 ? "Average" : "Needs Work"}
                        </div>
                    </div>
                </div>

                {/* Detailed Breakdown */}
                <h3 className="text-2xl font-heading font-bold pt-8">Question Analysis</h3>
                <div className="space-y-6">
                    {feedback?.questions?.map((q, i) => {
                        const qRaw = typeof q === 'string' ? q : q.question; // Handle legacy format
                        const answer = feedback?.responses?.[i] || "No Answer";
                        const feedbackItem = feedback?.feedback?.questionAnalysis?.[i];

                        return (
                            <div key={i} className="bg-card border border-border p-6 rounded-lg hover:border-primary/50 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-heading font-bold text-lg text-foreground max-w-3xl">Q{i + 1}: {qRaw}</h4>
                                    <div className="px-3 py-1 bg-muted rounded font-mono text-sm font-bold text-foreground">
                                        {feedbackItem?.score || 0}/10
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-muted/30 p-4 rounded border-l-2 border-primary">
                                        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Your Response</div>
                                        <p className="text-foreground/90 font-mono text-sm">{answer}</p>
                                    </div>

                                    {feedbackItem && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="text-sm text-muted-foreground">
                                                <strong className="text-foreground block mb-1">Feedback</strong>
                                                {feedbackItem.feedback}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                <strong className="text-foreground block mb-1">Ideal Approach</strong>
                                                {feedbackItem.idealAnswer}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

            </main>
        </div>
    );
};

export default FeedbackScreen;
