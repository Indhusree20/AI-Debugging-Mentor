import React from 'react';
import {
  HelpCircle,
  MapPin,
  Flame,
  Wrench,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

export function PedagogicalExplanation({ session }) {
  if (!session?.aiAnalysis?.pedagogicalExplanation) return null;

  const { pedagogicalExplanation: exp, preventionTip, relatedConcepts } = session.aiAnalysis;

  const sections = [
    {
      id: 'what',
      label: 'WHAT WENT WRONG',
      icon: HelpCircle,
      color: 'text-blue-400',
      bg: 'bg-blue-500/5 border-blue-500/10',
      content: exp.whatHappened,
    },
    {
      id: 'where',
      label: 'WHERE IS THE PROBLEM',
      icon: MapPin,
      color: 'text-rose-400',
      bg: 'bg-rose-500/5 border-rose-500/10',
      content: exp.where,
    },
    {
      id: 'why',
      label: 'WHY DID IT HAPPEN',
      icon: Flame,
      color: 'text-amber-400',
      bg: 'bg-amber-500/5 border-amber-500/10',
      content: exp.whyDidItHappen,
    },
    {
      id: 'fix',
      label: 'HOW TO FIX IT',
      icon: Wrench,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/5 border-emerald-500/10',
      content: exp.howToFix,
    },
    {
      id: 'learn',
      label: 'CORE CONCEPT TO MASTER',
      icon: GraduationCap,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/5 border-indigo-500/10',
      content: exp.relatedConcept,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sections.map((sec) => {
          const Icon = sec.icon;
          if (!sec.content) return null;

          return (
            <div
              key={sec.id}
              className={`p-4 rounded-2xl border ${sec.bg} space-y-2 transition-all hover:border-slate-700`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${sec.color}`} />
                <span className={`text-[11px] font-bold tracking-wider uppercase ${sec.color}`}>
                  {sec.label}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-normal">
                {sec.content}
              </p>
            </div>
          );
        })}
      </div>

      {/* Prevention Tip Callout */}
      {preventionTip && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20 text-xs">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-emerald-300 uppercase tracking-wider text-[11px]">
              Mentor Prevention Tip:
            </span>
            <p className="text-slate-300 leading-relaxed">{preventionTip}</p>
          </div>
        </div>
      )}

      {/* Related Concepts Chips */}
      {relatedConcepts?.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Related Topics:</span>
          {relatedConcepts.map((concept, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-medium"
            >
              #{concept}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
