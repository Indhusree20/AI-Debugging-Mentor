import React from 'react';
import { useDebugger } from '../../contexts/DebuggerContext';
import { AlertOctagon, AlertTriangle, Info, MapPin } from 'lucide-react';

export function ProblemsTab() {
  const { currentSession, setActiveStepLine, setActiveInspectorTab, setSelectedIssueId } = useDebugger();

  const issues = currentSession?.aiAnalysis?.issues || [];
  const aiError = currentSession?.aiAnalysis;
  const astErrors = currentSession?.deterministicAnalysis?.syntaxErrors || [];
  const staticIssues = currentSession?.deterministicAnalysis?.staticQuality?.issues || [];

  const hasIssues = issues.length > 0 || (aiError && aiError.primaryErrorType !== 'NONE') || astErrors.length > 0 || staticIssues.length > 0;

  if (!hasIssues) {
    return (
      <div className="p-6 text-center text-xs text-zinc-500 italic">
        No problems or compiler warnings detected in the active file.
      </div>
    );
  }

  const handleSelectProblem = (line, issueId) => {
    if (line) {
      setActiveStepLine(line);
    }
    if (issueId) {
      setSelectedIssueId(issueId);
    }
    setActiveInspectorTab('explain');
  };

  return (
    <div className="p-2 space-y-1 font-mono text-xs">
      {/* Detected Issues List */}
      {issues.map((iss, idx) => {
        const isCritical = iss.severity === 'CRITICAL' || iss.severity === 'HIGH';
        return (
          <div
            key={iss.id || `iss-${idx}`}
            onClick={() => handleSelectProblem(iss.line, iss.id)}
            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors group ${
              isCritical
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/20'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isCritical ? (
                <AlertOctagon className="h-4 w-4 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0" />
              )}
              <div>
                <span className="font-bold">[{iss.type}] </span>
                <span>{iss.message}</span>
              </div>
            </div>
            {iss.line && (
              <span className="text-[11px] font-bold text-zinc-400 group-hover:text-zinc-200 shrink-0 ml-2">
                Line {iss.line}{iss.column ? `:${iss.column}` : ''} →
              </span>
            )}
          </div>
        );
      })}

      {/* AST Syntax Errors (if not in issues) */}
      {issues.length === 0 && astErrors.map((err, idx) => (
        <div
          key={`ast-${idx}`}
          onClick={() => handleSelectProblem(err.line)}
          className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <div>
              <span className="font-bold">Line {err.line}, Col {err.column}: </span>
              <span>{err.message}</span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-zinc-400 group-hover:text-amber-400">
            Line {err.line} →
          </span>
        </div>
      ))}

      {/* Static Linter Issues */}
      {issues.length === 0 && staticIssues.map((issue, idx) => (
        <div
          key={`stat-${idx}`}
          onClick={() => handleSelectProblem(issue.line)}
          className="flex items-center justify-between p-2 rounded-lg bg-blue-500/5 hover:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <Info className="h-4 w-4 shrink-0" />
            <div>
              <span className="font-bold">[{issue.rule}] Line {issue.line}: </span>
              <span>{issue.message}</span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-zinc-400 group-hover:text-blue-400">
            Line {issue.line} →
          </span>
        </div>
      ))}
    </div>
  );
}

