import React, { useState } from 'react';
import { useDebugger } from '../../contexts/DebuggerContext';
import { Terminal, AlertOctagon, CheckCircle2, Copy, Check, FileCode2 } from 'lucide-react';

export function OutputTerminal() {
  const { rawOutput, currentSession, testCases, setTestCases } = useDebugger();
  const [activeTab, setActiveTab] = useState('stdout'); // 'stdout' | 'stderr' | 'tests' | 'ast'
  const [copied, setCopied] = useState(false);

  const stdout = rawOutput?.stdout || '';
  const stderr = rawOutput?.stderr || '';
  const exitCode = rawOutput?.exitCode;

  const handleCopy = () => {
    const textToCopy = activeTab === 'stdout' ? stdout : stderr;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0f19] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Terminal Header & Tabs */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('stdout')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'stdout'
                ? 'bg-slate-800 text-blue-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Output</span>
            {stdout && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>}
          </button>

          <button
            onClick={() => setActiveTab('stderr')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'stderr'
                ? 'bg-slate-800 text-rose-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertOctagon className="h-3.5 w-3.5" />
            <span>Errors / Stderr</span>
            {stderr && <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>}
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'tests'
                ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Test Cases</span>
          </button>

          <button
            onClick={() => setActiveTab('ast')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ast'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode2 className="h-3.5 w-3.5" />
            <span>AST Diagnostics</span>
          </button>
        </div>

        {/* Status indicator & copy */}
        <div className="flex items-center gap-3">
          {exitCode !== null && exitCode !== undefined && (
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                exitCode === 0
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              Exit Code: {exitCode}
            </span>
          )}

          <button
            onClick={handleCopy}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            title="Copy Output"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Screen Area */}
      <div className="flex-1 p-4 font-mono text-xs overflow-auto bg-[#070b14] text-slate-200 min-h-[160px] max-h-[260px]">
        {activeTab === 'stdout' && (
          stdout ? (
            <pre className="whitespace-pre-wrap leading-relaxed text-emerald-300/90">{stdout}</pre>
          ) : (
            <div className="text-slate-500 italic">No standard output. Click [Run Code] to execute.</div>
          )
        )}

        {activeTab === 'stderr' && (
          stderr ? (
            <pre className="whitespace-pre-wrap leading-relaxed text-rose-400 font-semibold">{stderr}</pre>
          ) : (
            <div className="text-slate-500 italic">No errors reported in stderr stream.</div>
          )
        )}

        {activeTab === 'tests' && (
          <div className="space-y-3 font-sans">
            <div className="text-xs text-slate-400 font-medium">
              Define input and expected output to verify runtime correctness:
            </div>
            {testCases.map((tc, idx) => (
              <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Test Case #{idx + 1}</span>
                  {currentSession?.testCases?.[idx] && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        currentSession.testCases[idx].passed
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {currentSession.testCases[idx].passed ? 'PASSED' : 'FAILED'}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Standard Input (stdin)</label>
                    <input
                      type="text"
                      value={tc.input || ''}
                      onChange={(e) => {
                        const updated = [...testCases];
                        updated[idx].input = e.target.value;
                        setTestCases(updated);
                      }}
                      placeholder="e.g. 5"
                      className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Expected Output</label>
                    <input
                      type="text"
                      value={tc.expectedOutput || ''}
                      onChange={(e) => {
                        const updated = [...testCases];
                        updated[idx].expectedOutput = e.target.value;
                        setTestCases(updated);
                      }}
                      placeholder="e.g. 15"
                      className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ast' && (
          <div className="space-y-2 font-mono text-[11px]">
            <div className="text-slate-400 font-sans font-semibold text-xs">
              Deterministic AST & Static Analyzer Output:
            </div>
            {currentSession?.deterministicAnalysis?.syntaxErrors?.length ? (
              currentSession.deterministicAnalysis.syntaxErrors.map((err, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                  <div className="font-bold">Line {err.line}, Column {err.column}:</div>
                  <div>{err.rawOutput || err.message}</div>
                </div>
              ))
            ) : (
              <div className="text-slate-500 italic">No AST syntax errors found by native parser.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
