import React from 'react';
import { CircleAlert, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("CRITICAL SYSTEM FAILURE:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-white font-sans text-center">
                    <div className="w-full max-w-md bg-[#0a0a0c] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />

                        <CircleAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />

                        <h1 className="text-2xl font-bold mb-2">System Malfunction</h1>
                        <p className="text-white/50 mb-6 text-sm leading-relaxed">
                            The application encountered a critical error. Diagnostics have been logged.
                            Please attempt a system restart.
                        </p>

                        <div className="bg-black/50 rounded-lg p-4 mb-6 text-left overflow-auto max-h-32">
                            <code className="text-[10px] sm:text-xs font-mono text-red-400 break-all">
                                {this.state.error?.toString()}
                            </code>
                        </div>

                        <Button
                            onClick={() => window.location.href = '/'}
                            className="w-full bg-white text-black hover:bg-gray-200 font-bold"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            RESTART SYSTEM
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
