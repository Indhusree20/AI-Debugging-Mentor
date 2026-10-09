import React from 'react';
import { ShieldCheck, CheckCircle, AlertCircle, ArrowUpRight } from 'lucide-react';

export function CodeQualityScoreCard({ session }) {
  const quality = session?.aiAnalysis?.codeQuality || { score: 100, suggestions: [] };
  const staticIssues = session?.deterministicAnalysis?.staticQuality?.issues || [];

  const score = quality.score ?? 90;

  const getScoreColor = (val) => {
    if (val >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (val >= 65) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
          <ShieldCheck className="h-5 w-5" />
          <span>Code Quality & Best Practices</span>
        </div>
        <div className={`px-3 py-1 rounded-xl border font-mono font-bold text-xs ${getScoreColor(score)}`}>
          Quality Score: {score}/100
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-2">
        {quality.suggestions?.map((sug, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300"
          >
            <CheckCircle className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>{sug}</span>
          </div>
        ))}

        {staticIssues.map((issue, idx) => (
          <div
            key={`stat-${idx}`}
            className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-amber-300"
          >
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold font-mono">[{issue.rule}] Line {issue.line}: </span>
              <span>{issue.message}</span>
            </div>
          </div>
        ))}

        {quality.suggestions?.length === 0 && staticIssues.length === 0 && (
          <div className="p-3 text-xs text-slate-400 italic">
            No quality or readability issues detected. Great work adhering to clean code standards!
          </div>
        )}
      </div>
    </div>
  );
}
