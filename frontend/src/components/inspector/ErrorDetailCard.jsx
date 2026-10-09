import React, { useState } from 'react';
import { useDebugger } from '../../contexts/DebuggerContext';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  HelpCircle,
  MapPin,
  Flame,
  Wrench,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Filter,
  Check,
  Zap,
} from 'lucide-react';

export function ErrorDetailCard({ session }) {
  const {
    setActiveStepLine,
    setIsDiffModalOpen,
    applyFix,
    applyIndividualFix,
    selectedIssueId,
    setSelectedIssueId,
    severityFilter,
    setSeverityFilter,
    executionComparison,
  } = useDebugger();

  if (!session?.aiAnalysis) return null;

  const { aiAnalysis } = session;
  const isClean = aiAnalysis.primaryErrorType === 'NONE' && (!aiAnalysis.issues || aiAnalysis.issues.length === 0);
  const exp = aiAnalysis.pedagogicalExplanation || {};
  const fix = aiAnalysis.suggestedFix;
  const issues = aiAnalysis.issues || [];

  if (isClean) {
    return (
      <div className="space-y-3 font-sans">
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
            <CheckCircle2 className="h-4 w-4" />
            <span>✓ Code Analysis Completed</span>
          </div>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
            No issues were detected by the available analyzers and tests.
          </p>
        </div>

        {/* Learning / Quality Suggestions */}
        {aiAnalysis.codeQuality?.suggestions?.length > 0 && (
          <div className="p-4 rounded-xl bg-white dark:bg-ide-editor border border-surface-200 dark:border-ide-border space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Best Practice Tips
            </span>
            <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
              {aiAnalysis.codeQuality.suggestions.map((sug, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Filter issues by severity
  const filteredIssues = issues.filter((iss) => {
    if (severityFilter === 'ALL') return true;
    if (severityFilter === 'HIGH_CRITICAL') return iss.severity === 'CRITICAL' || iss.severity === 'HIGH';
    if (severityFilter === 'MEDIUM') return iss.severity === 'MEDIUM';
    if (severityFilter === 'LOW_INFO') return iss.severity === 'LOW' || iss.severity === 'INFO';
    return true;
  });

  const getSeverityBadgeClass = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'LOW':
      case 'INFO':
      default:
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }
  };

  const activeIssue = issues.find((i) => i.id === selectedIssueId) || issues[0];

  return (
    <div className="space-y-3 font-sans">
      {/* Run After Fix comparison state */}
      {executionComparison && (
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
          executionComparison.after === 'PASSED'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
        }`}>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 shrink-0" />
            <span>{executionComparison.message}</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <span className="line-through opacity-70">FAILED</span>
            <span>➔</span>
            <span className="font-bold">{executionComparison.after}</span>
          </div>
        </div>
      )}

      {/* Top Header Card */}
      <div className="p-4 rounded-xl bg-white dark:bg-ide-editor border border-surface-200 dark:border-ide-border space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs text-rose-600 dark:text-rose-400">
            <AlertOctagon className="h-4 w-4" />
            <span>{issues.length > 0 ? `${issues.length} Issues Detected` : aiAnalysis.primaryErrorType.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20">
              {aiAnalysis.severity}
            </span>
          </div>
        </div>

        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
          {aiAnalysis.summary}
        </h4>

        {/* Multi-issue Severity Filter Buttons */}
        {issues.length > 1 && (
          <div className="pt-2 border-t border-surface-200 dark:border-ide-border/60 flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-zinc-500 flex items-center gap-1 mr-1">
              <Filter className="h-3 w-3" /> Filter:
            </span>
            {[
              { id: 'ALL', label: `All (${issues.length})` },
              { id: 'HIGH_CRITICAL', label: 'High & Critical' },
              { id: 'MEDIUM', label: 'Medium' },
              { id: 'LOW_INFO', label: 'Low & Quality' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSeverityFilter(f.id)}
                className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${
                  severityFilter === f.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-100 dark:bg-surface-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Multiple Issues List */}
      {issues.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1">
            Detected Issues List ({filteredIssues.length})
          </div>
          {filteredIssues.map((iss, index) => {
            const isSelected = iss.id === activeIssue?.id;
            return (
              <div
                key={iss.id || index}
                onClick={() => {
                  setSelectedIssueId(iss.id);
                  if (iss.line) setActiveStepLine(iss.line);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-500/50 shadow-sm'
                    : 'bg-white dark:bg-ide-editor border-surface-200 dark:border-ide-border hover:border-zinc-400 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Issue #{index + 1}:
                    </span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {iss.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadgeClass(iss.severity)}`}>
                      {iss.severity}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-100 dark:bg-surface-800 text-zinc-500 border border-surface-200 dark:border-surface-700">
                      {iss.source || 'AI_ANALYSIS'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {iss.message}
                </p>

                {iss.line && (
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveStepLine(iss.line);
                      }}
                      className="flex items-center gap-1 text-[11px] font-mono text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <MapPin className="h-3 w-3" />
                      <span>Line {iss.line}{iss.column ? `, Col ${iss.column}` : ''} (Click to Jump)</span>
                    </button>

                    {iss.correctedCode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          applyIndividualFix(iss.id);
                        }}
                        className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition-colors"
                      >
                        Apply Fix
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Structured Pedagogical Explanations */}
      <div className="space-y-2 pt-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1">
          Pedagogical Diagnosis
        </div>

        {[
          {
            id: 'what',
            label: 'WHAT HAPPENED',
            icon: HelpCircle,
            color: 'text-blue-600 dark:text-blue-400',
            content: activeIssue?.explanation || exp.whatHappened,
          },
          {
            id: 'why',
            label: 'WHY DID IT HAPPEN',
            icon: Flame,
            color: 'text-amber-600 dark:text-amber-400',
            content: activeIssue?.cause || exp.whyDidItHappen,
          },
          {
            id: 'fix',
            label: 'HOW TO FIX IT',
            icon: Wrench,
            color: 'text-emerald-600 dark:text-emerald-400',
            content: activeIssue?.suggestion || exp.howToFix,
          },
          {
            id: 'learn',
            label: 'CONCEPT TO MASTER',
            icon: GraduationCap,
            color: 'text-indigo-600 dark:text-indigo-400',
            content: exp.relatedConcept || 'Computer Science Fundamentals',
          },
        ].map((sec) => {
          if (!sec.content) return null;
          const Icon = sec.icon;

          return (
            <div
              key={sec.id}
              className="p-3.5 rounded-xl bg-white dark:bg-ide-editor border border-surface-200 dark:border-ide-border space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-3.5 w-3.5 ${sec.color}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${sec.color}`}>
                  {sec.label}
                </span>
              </div>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                {sec.content}
              </p>
            </div>
          );
        })}
      </div>

      {/* Fix Actions & Side-by-Side Diff */}
      {fix?.correctedCode && (
        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
              {fix.isGuaranteed ? 'Deterministic Fix Available' : 'Suggested Code Fix'}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {fix.diffDescription}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setIsDiffModalOpen(true)}
              className="flex-1 py-1.5 px-3 rounded-lg bg-zinc-200 dark:bg-surface-800 hover:bg-zinc-300 dark:hover:bg-surface-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors text-center"
            >
              View Diff
            </button>
            <button
              onClick={applyFix}
              className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors text-center shadow-subtle flex items-center justify-center gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Apply Fix</span>
            </button>
          </div>
        </div>
      )}

      {/* Prevention Tip */}
      {aiAnalysis.preventionTip && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-100 dark:bg-surface-900 border border-surface-200 dark:border-ide-border text-xs">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              Mentor Prevention Rule:
            </span>
            <p className="text-zinc-600 dark:text-zinc-300 text-xs leading-relaxed">
              {aiAnalysis.preventionTip}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

