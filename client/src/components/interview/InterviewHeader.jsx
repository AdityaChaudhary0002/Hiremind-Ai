import React from 'react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/logo';
import { useNavigate } from 'react-router-dom';

const InterviewHeader = ({ role, difficulty, currentQuestionIndex }) => {
    const navigate = useNavigate();

    return (
        <header className="h-14 border-b border-[var(--border-subtle)] bg-glass backdrop-blur-md flex items-center justify-between px-6 z-50 fixed top-0 w-full">
            <div className="flex items-center gap-4">
                <Logo className="scale-75 origin-left" />
                <div className="h-4 w-[1px] bg-[var(--border-medium)] mx-2" />
                <div className="flex items-center gap-2 text-[10px] font-mono text-muted-text uppercase tracking-widest">
                    <span className="px-1.5 py-0.5 rounded bg-glass-hover border border-[var(--border-subtle)]">{role}</span>
                    <span>/</span>
                    <span className="px-1.5 py-0.5 rounded bg-glass-hover border border-[var(--border-subtle)]">{difficulty}</span>
                    <span>/</span>
                    <span className="text-subtle">Q{currentQuestionIndex + 1}</span>
                </div>
            </div>

            <Button
                variant="outline"
                size="sm"
                className="h-9 border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-all font-bold tracking-wide"
                onClick={() => navigate('/dashboard')}
            >
                END INTERVIEW
            </Button>
        </header>
    );
};

export default InterviewHeader;
