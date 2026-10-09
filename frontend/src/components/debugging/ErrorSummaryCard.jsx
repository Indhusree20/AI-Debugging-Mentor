import React from 'react';
import { Badge } from '../common/Badge';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
} from 'lucide-react';

export function ErrorSummaryCard({ session }) {
  if (!session) return null;

  const { aiAnalysis, deterministicAnalysis, durationMs } = session;
  const isClean = aiAnalysis.primaryErrorType === 'NONE';

  const severityVariant = {
    CRITICAL: 'danger',
    HIGH: 'danger',
    MEDIUM: 'warning',
    LOW: 'primary',
  }[aiAnalysis.severity] || 'default';

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-4">
      {/* Top row: Badges & status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isClean ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="h-5 w-5" />
              <span>Clean Execution</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-rose-400 font-bold text-sm">
              <AlertOctagon className="h-5 w-5" />
              <span>{aiAnalysis.primaryErrorType.replace('_', ' ')}</span>
            </div>
          )}

          <Badge variant={severityVariant}>
            {aiAnalysis.severity} SEVERITY
          </Badge>

          <Badge variant={aiAnalysis.confidence === 'HIGH' ? 'success' : 'warning'}>
            {aiAnalysis.confidence} CONFIDENCE
          </Badge>
        </div>

        {durationMs && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <Clock className="h-3.5 w-3.5" />
            <span>{durationMs}ms</span>
          </div>
        )}
      </div>

      {/* Summary Message */}
      <h3 className="text-base font-bold text-slate-100 leading-snug">
        {aiAnalysis.summary}
      </h3>

      {/* Location Bar */}
      {aiAnalysis.location?.line && (
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
          <MapPin className="h-3.5 w-3.5 text-blue-400" />
          <span>Location: <strong>Line {aiAnalysis.location.line}</strong></span>
          {aiAnalysis.location.column && (
            <span>, Column {aiAnalysis.location.column}</span>
          )}
        </div>
      )}
    </div>
  );
}
