import React, { useState } from 'react';
import { Lightbulb, Lock, Eye, Sparkles, ChevronRight } from 'lucide-react';

export function ProgressiveHintPanel({ session }) {
  const hints = session?.aiAnalysis?.progressiveHints || [];
  const [revealedTier, setRevealedTier] = useState(0); // 0 = none, 1 = tier 1, 2 = tier 1+2, 3 = tier 1+2+3

  if (hints.length === 0) return null;

  const handleNextHint = () => {
    setRevealedTier((prev) => Math.min(hints.length, prev + 1));
  };

  return (
    <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Lightbulb className="h-5 w-5" />
          <span>Progressive Hint Engine</span>
        </div>
        {revealedTier < hints.length && (
          <button
            onClick={handleNextHint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Reveal Hint {revealedTier + 1}</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {hints.map((h, idx) => {
          const tierNum = h.tier || idx + 1;
          const isUnlocked = revealedTier >= tierNum;

          const tierTitles = {
            1: 'Hint 1: General Direction',
            2: 'Hint 2: Specific Clue',
            3: 'Hint 3: Near-Solution Guidance',
          };

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                isUnlocked
                  ? 'bg-slate-900 border-amber-500/30 text-slate-200'
                  : 'bg-slate-950 border-slate-800/80 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {isUnlocked ? (
                    <Eye className="h-3.5 w-3.5 text-amber-400" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-slate-600" />
                  )}
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${isUnlocked ? 'text-amber-400' : 'text-slate-500'}`}>
                    {tierTitles[tierNum] || `Tier ${tierNum} Hint`}
                  </span>
                </div>
                {!isUnlocked && (
                  <span className="text-[10px] font-mono text-slate-600">Locked</span>
                )}
              </div>

              {isUnlocked ? (
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  {h.hint}
                </p>
              ) : (
                <p className="text-xs text-slate-600 italic">
                  Click 'Reveal Hint {tierNum}' to unlock progressive guidance without spoiling the answer.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
