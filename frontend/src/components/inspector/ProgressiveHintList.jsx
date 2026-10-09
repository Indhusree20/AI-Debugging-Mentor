import React, { useState } from 'react';
import { Lightbulb, Lock, Eye, Sparkles } from 'lucide-react';

export function ProgressiveHintList({ session }) {
  const hints = session?.aiAnalysis?.progressiveHints || [];
  const [unlockedTier, setUnlockedTier] = useState(1);

  if (hints.length === 0) return null;

  const handleRevealNext = () => {
    setUnlockedTier((prev) => Math.min(hints.length, prev + 1));
  };

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <span>Progressive Guidance Engine</span>
        </span>
        {unlockedTier < hints.length && (
          <button
            onClick={handleRevealNext}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold text-[11px] transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            <span>Unlock Hint {unlockedTier + 1}</span>
          </button>
        )}
      </div>

      <div className="space-y-2">
        {hints.map((h, idx) => {
          const tierNum = h.tier || idx + 1;
          const isUnlocked = unlockedTier >= tierNum;

          const tierLabels = {
            1: 'Tier 1: General Direction',
            2: 'Tier 2: Specific Clue',
            3: 'Tier 3: Near-Solution Clue',
          };

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all ${
                isUnlocked
                  ? 'bg-white dark:bg-ide-editor border-surface-200 dark:border-ide-border shadow-subtle'
                  : 'bg-zinc-100/40 dark:bg-surface-900/30 border-dashed border-surface-200 dark:border-surface-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {isUnlocked ? (
                    <Eye className="h-3.5 w-3.5 text-amber-500" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-zinc-400" />
                  )}
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isUnlocked ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-500'}`}>
                    {tierLabels[tierNum] || `Hint ${tierNum}`}
                  </span>
                </div>
                {!isUnlocked && (
                  <span className="text-[10px] font-mono text-zinc-400">Locked</span>
                )}
              </div>

              {isUnlocked ? (
                <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                  {h.hint}
                </p>
              ) : (
                <p className="text-xs text-zinc-400 italic">
                  Unlock this clue progressively to solve the bug on your own.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
