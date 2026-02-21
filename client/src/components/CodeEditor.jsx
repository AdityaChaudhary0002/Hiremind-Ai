import React from 'react';
import Editor from "@monaco-editor/react";
import { Button } from './ui/button';
import { Play, Loader2, FileCode } from 'lucide-react';
import axios from 'axios';

const CodeEditor = ({ code, setCode, language = "javascript", setLanguage, output, setOutput }) => {

    const [isRunning, setIsRunning] = React.useState(false);

    // Detect theme from document
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

    const runCode = async () => {
        setIsRunning(true);
        setOutput(null);
        try {
            // Using Piston API (public) for now, or your own backend
            const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
                language: language,
                version: "18.15.0", // Node version
                files: [
                    {
                        content: code
                    }
                ]
            });
            setOutput(response.data);
        } catch (error) {
            console.error("Code execution failed:", error);
            setOutput({ run: { stderr: "Execution failed. Please check your internet connection or try again." } });
        }
        setIsRunning(false);
    };

    return (
        <div className="flex flex-col h-full bg-surface text-heading font-mono text-sm relative group">
            <div className="flex items-center justify-between px-4 py-2 bg-surface-elevated border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs text-muted-text">
                        <FileCode className="w-4 h-4" /> Mode:
                    </div>
                    {/* Language Selector */}
                    <select
                        value={language}
                        onChange={(e) => setLanguage && setLanguage(e.target.value)}
                        className="bg-surface text-xs text-heading border border-[var(--border-medium)] rounded px-2 py-1 outline-none focus:border-primary"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                    </select>
                </div>

                <Button
                    size="sm"
                    onClick={runCode}
                    disabled={isRunning}
                    className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white border-0 gap-1.5 shadow-sm"
                >
                    {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                    Run
                </Button>
            </div>

            <div className="flex-1 relative">
                <Editor
                    height="100%"
                    defaultLanguage={language}
                    defaultValue="// Write your code here"
                    value={code}
                    onChange={(value) => setCode(value)}
                    theme={isDark ? "vs-dark" : "light"}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        fontFamily: 'JetBrains Mono, monospace',
                    }}
                />
            </div>

            {/* Output Panel */}
            {(output || isRunning) && (
                <div className="border-t border-[var(--border-medium)] bg-surface max-h-[30%] overflow-auto flex flex-col">
                    <div className="px-4 py-1 bg-surface-elevated text-xs font-semibold text-muted-text sticky top-0">
                        Console Output
                    </div>
                    <div className="p-4 font-mono text-xs whitespace-pre-wrap">
                        {isRunning && <span className="text-yellow-500 animate-pulse">Running code...</span>}
                        {output?.run?.stdout && <span className="text-green-400">{output.run.stdout}</span>}
                        {output?.run?.stderr && <span className="text-red-400">{output.run.stderr}</span>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeEditor;
