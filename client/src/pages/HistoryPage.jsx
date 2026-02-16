import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserButton } from '@clerk/clerk-react';
import axios from 'axios';
import { ArrowLeft, Calendar, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const HistoryPage = () => {
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    const fetchHistory = async (pageNum, isLoadMore = false) => {
        try {
            if (isLoadMore) setLoadingMore(true);
            else {
                setLoading(true);
                setError(null);
            }

            const token = await getToken();
            // Ensure token exists before call
            if (!token) {
                throw new Error("Authentication token missing");
            }

            const response = await axios.get(`/api/interview/history?page=${pageNum}&limit=10`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const newInterviews = response.data.interviews || [];

            if (isLoadMore) {
                setInterviews(prev => [...prev, ...newInterviews]);
            } else {
                setInterviews(newInterviews);
            }

            // Update pagination state
            setHasMore(response.data.pagination && response.data.pagination.hasMore);

        } catch (err) {
            console.error("Error fetching history:", err);
            setError(err.response?.data?.message || err.message || "Failed to load history.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchHistory(1);
    }, [getToken]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchHistory(nextPage, true);
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-6 font-sans transition-colors duration-300">
            {/* Header */}
            <div className="max-w-4xl mx-auto flex justify-between items-center mb-12 pt-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/dashboard')}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted -ml-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <div className="text-2xl font-heading font-bold tracking-tight">Archives</div>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <UserButton afterSignOutUrl="/login" />
                </div>
            </div>

            <main className="max-w-4xl mx-auto">
                {error ? (
                    <div className="text-center py-20 flex flex-col items-center">
                        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                        <h3 className="text-lg font-bold">Error Loading History</h3>
                        <p className="text-muted-foreground mb-6">{error}</p>
                        <Button onClick={() => fetchHistory(1)}>Retry Connection</Button>
                    </div>
                ) : loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {interviews.map((interview) => (
                            <div
                                key={interview._id}
                                onClick={() => navigate(`/feedback/${interview._id}`)}
                                className="group p-6 border border-border rounded-lg bg-card hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer flex flex-col md:flex-row md:justify-between md:items-center gap-4 shadow-sm"
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                                            {interview.role}
                                        </h3>
                                        <span className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest border rounded-full ${interview.difficulty === 'Hard' ? 'border-red-500/20 text-red-500 bg-red-500/10' :
                                                interview.difficulty === 'Medium' ? 'border-yellow-500/20 text-yellow-500 bg-yellow-500/10' :
                                                    'border-green-500/20 text-green-500 bg-green-500/10'
                                            }`}>
                                            {interview.difficulty}
                                        </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2 font-mono">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(interview.createdAt).toLocaleDateString(undefined, {
                                            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                                        })}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:block md:text-right w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                                    <div className="md:hidden text-sm font-medium text-muted-foreground">Overall Score</div>
                                    <div>
                                        <div className="text-4xl font-heading font-bold text-foreground">{interview.feedback?.overallScore || 0}<span className="text-xl text-muted-foreground">%</span></div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {interviews.length === 0 && (
                            <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-lg bg-muted/20">
                                No interviews found in the archives.
                            </div>
                        )}

                        {hasMore && (
                            <div className="pt-8 text-center">
                                <Button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    variant="outline"
                                    className="border-border text-muted-foreground hover:text-foreground hover:bg-muted min-w-[200px]"
                                >
                                    {loadingMore ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        "Load More Archives"
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default HistoryPage;
