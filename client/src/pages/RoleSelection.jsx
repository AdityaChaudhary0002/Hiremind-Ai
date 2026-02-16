import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Globe, Database, Smartphone, Cloud, Shield, Upload, FileText, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth, UserButton } from '@clerk/clerk-react';
import axios from 'axios';

const RoleSelection = () => {
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const [selectedRole, setSelectedRole] = useState(null);
    const [difficulty, setDifficulty] = useState('Medium');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [resumeName, setResumeName] = useState(null);

    const roles = [
        {
            id: 'frontend',
            title: 'Frontend Developer',
            icon: <Globe className="w-5 h-5" />,
            desc: 'React, Vue, CSS mastery'
        },
        {
            id: 'backend',
            title: 'Backend Developer',
            icon: <Database className="w-5 h-5" />,
            desc: 'Node, Python, Go, SQL'
        },
        {
            id: 'fullstack',
            title: 'Full Stack',
            icon: <Code2 className="w-5 h-5" />,
            desc: 'The complete package'
        },
        {
            id: 'mobile',
            title: 'Mobile Dev',
            icon: <Smartphone className="w-5 h-5" />,
            desc: 'iOS, Android, React Native'
        },
        {
            id: 'devops',
            title: 'DevOps Engineer',
            icon: <Cloud className="w-5 h-5" />,
            desc: 'CI/CD, Docker, K8s'
        },
        {
            id: 'cybersecurity',
            title: 'Cyber Security',
            icon: <Shield className="w-5 h-5" />,
            desc: 'Pen-testing, InfoSec'
        },
    ];

    const handleStartInterview = () => {
        if (selectedRole) {
            navigate('/interview', { state: { role: selectedRole.title, difficulty } });
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setUploadError("Please upload a PDF file.");
            return;
        }

        setIsUploading(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const token = await getToken();
            const response = await axios.post('/api/resume/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            console.log("Resume parsed:", response.data);
            setResumeName(file.name);
            navigate('/interview', {
                state: {
                    role: 'Resume Based',
                    difficulty,
                    resumeText: response.data.text
                }
            });

        } catch (error) {
            console.error("Upload error:", error);
            setUploadError("Failed to upload resume. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground transition-colors duration-300">

            {/* Header */}
            <div className="max-w-5xl mx-auto px-6 pt-12 mb-16 flex justify-between items-center">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/dashboard')}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md -ml-4"
                >
                    <ArrowRight className="w-4 h-4 rotate-180 mr-2" /> Back to Dashboard
                </Button>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <UserButton afterSignOutUrl="/login" />
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 pb-24">

                {/* Intro */}
                <div className="mb-16">
                    <h1 className="text-4xl font-heading font-bold tracking-tight mb-4">Select Track</h1>
                    <p className="text-muted-foreground max-w-xl text-lg font-body">
                        Choose a predefined engineering track or upload a resume for a custom-tailored technical assessment.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Role Selection List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">Available Tracks</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {roles.map((role) => (
                                <div
                                    key={role.id}
                                    onClick={() => setSelectedRole(role)}
                                    className={`p-6 border rounded-lg cursor-pointer transition-all duration-200 group relative overflow-hidden ${selectedRole?.id === role.id
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-card border-border hover:border-muted-foreground text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`${selectedRole?.id === role.id ? 'text-primary-foreground' : 'text-foreground'}`}>
                                            {role.icon}
                                        </div>
                                        {selectedRole?.id === role.id && (
                                            <div className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
                                        )}
                                    </div>
                                    <h3 className="font-heading font-bold text-lg mb-1">{role.title}</h3>
                                    <p className={`text-sm font-body ${selectedRole?.id === role.id ? 'text-primary-foreground/80' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                        {role.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar: Resume & Difficulty */}
                    <div className="space-y-8">
                        <div>
                            <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">Custom Assessment</div>
                            <div className="border border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-colors relative cursor-pointer group">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    disabled={isUploading}
                                />
                                {isUploading ? (
                                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                                ) : (
                                    <Upload className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors mx-auto mb-4" />
                                )}
                                <div className="font-heading font-semibold text-foreground mb-2">Upload Resume</div>
                                <p className="text-xs text-muted-foreground">PDF Format only. Max 5MB.</p>
                                {uploadError && <p className="text-destructive text-xs mt-2">{uploadError}</p>}
                            </div>
                        </div>

                        {/* Configuration */}
                        <div className={`transition-opacity duration-300 ${selectedRole ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                            <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">Configuration</div>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm text-muted-foreground mb-2">Selected Role</div>
                                    <div className="font-heading font-bold text-foreground text-lg">{selectedRole?.title || "None Selected"}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground mb-2">Difficulty</div>
                                    <div className="flex gap-2">
                                        {['Easy', 'Medium', 'Hard'].map(d => (
                                            <button
                                                key={d}
                                                onClick={() => setDifficulty(d)}
                                                className={`px-4 py-2 rounded-md text-sm border transition-colors font-body ${difficulty === d
                                                        ? 'bg-foreground text-background border-foreground font-medium'
                                                        : 'bg-card text-muted-foreground border-border hover:border-muted-foreground'
                                                    }`}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    onClick={handleStartInterview}
                                    className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 mt-4 rounded-md font-medium text-lg"
                                    disabled={!selectedRole}
                                >
                                    Start Session <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RoleSelection;
