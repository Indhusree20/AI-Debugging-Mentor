import React from 'react';
import { useDebugger } from '../../contexts/DebuggerContext';
import {
  Play,
  Sparkles,
  RotateCcw,
  AlignLeft,
  Upload,
  Download,
  GitCompare,
  BookOpen,
  Zap,
  Bot,
} from 'lucide-react';

export function EditorToolbar() {
  const {
    language,
    setLanguage,
    sourceCode,
    setSourceCode,
    debugMode,
    setDebugMode,
    isExecuting,
    isAnalyzing,
    runCode,
    analyzeCode,
    loadPreset,
    currentSession,
    setIsDiffModalOpen,
    setIsMentorDrawerOpen,
  } = useDebugger();

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the editor?')) {
      setSourceCode('');
    }
  };

  const handleDownload = () => {
    const extensions = { python: 'py', java: 'java', c: 'c', cpp: 'cpp' };
    const ext = extensions[language] || 'txt';
    const blob = new Blob([sourceCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solution.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setSourceCode(event.target?.result || '');
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-t-2xl">
      {/* Left controls: Language & Preset & Mode */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Language Selector */}
        <select
          value={language}
          onChange={(e) => {
            const nextLang = e.target.value;
            setLanguage(nextLang);
            loadPreset(nextLang);
          }}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="python">🐍 Python</option>
          <option value="java">☕ Java</option>
          <option value="c">⚙️ C</option>
          <option value="cpp">⚡ C++</option>
        </select>

        {/* Demo Presets Dropdown */}
        <select
          onChange={(e) => {
            if (e.target.value) {
              loadPreset(e.target.value);
              e.target.value = '';
            }
          }}
          defaultValue=""
          className="bg-slate-800/80 border border-slate-700/80 text-blue-400 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>Load Demo Bug Sample...</option>
          <option value="python">Python: Syntax Error (Missing Colon)</option>
          <option value="python_logic">Python: Logical Bug (Off-by-one Sum)</option>
          <option value="java">Java: Missing Semicolon Syntax</option>
          <option value="java_runtime">Java: NullPointerException</option>
          <option value="c">C: Semicolon Compilation Error</option>
          <option value="cpp">C++: Vector Bounds Out-of-Range</option>
        </select>

        {/* Debugging Mode Selector */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-[11px]">
          <button
            onClick={() => setDebugMode('QUICK_FIX')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
              debugMode === 'QUICK_FIX'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="h-3 w-3" />
            <span>Quick Fix</span>
          </button>
          <button
            onClick={() => setDebugMode('LEARN_MODE')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
              debugMode === 'LEARN_MODE'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-3 w-3" />
            <span>Learn Mode</span>
          </button>
          <button
            onClick={() => setDebugMode('MENTOR_MODE')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
              debugMode === 'MENTOR_MODE'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="h-3 w-3" />
            <span>Mentor Mode</span>
          </button>
        </div>
      </div>

      {/* Right controls: Execution & Tools */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Upload Button */}
        <label className="cursor-pointer rounded-xl p-2 bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" title="Upload Code File">
          <Upload className="h-4 w-4" />
          <input type="file" onChange={handleFileUpload} className="hidden" />
        </label>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          title="Download Code"
          className="rounded-xl p-2 bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <Download className="h-4 w-4" />
        </button>

        {/* Clear Button */}
        <button
          onClick={handleClear}
          title="Clear Editor"
          className="rounded-xl p-2 bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-rose-400 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* Diff View Button (when fix available) */}
        {currentSession?.aiAnalysis?.suggestedFix?.correctedCode && (
          <button
            onClick={() => setIsDiffModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-all"
          >
            <GitCompare className="h-3.5 w-3.5" />
            <span>View Diff</span>
          </button>
        )}

        {/* Run Code Button (Deterministic Sandbox) */}
        <button
          onClick={runCode}
          disabled={isExecuting || isAnalyzing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-bold hover:bg-slate-700 transition-all disabled:opacity-50"
        >
          <Play className={`h-3.5 w-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
          <span>{isExecuting ? 'Running...' : 'Run Code'}</span>
        </button>

        {/* Debug Code Button (Full AI Multi-Stage Pipeline) */}
        <button
          onClick={analyzeCode}
          disabled={isAnalyzing || isExecuting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          <Sparkles className={`h-3.5 w-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Diagnosing...' : 'Debug Code'}</span>
        </button>
      </div>
    </div>
  );
}
