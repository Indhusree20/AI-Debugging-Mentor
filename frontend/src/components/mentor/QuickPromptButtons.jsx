import React from 'react';
import { HelpCircle, Lightbulb, Sparkles, BookOpen } from 'lucide-react';

export function QuickPromptButtons({ onSelectPrompt }) {
  const prompts = [
    { label: "Why is this wrong?", icon: HelpCircle },
    { label: "Explain like I'm a beginner", icon: Sparkles },
    { label: "Give me a hint", icon: Lightbulb },
    { label: "What concept should I learn?", icon: BookOpen },
  ];

  return (
    <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950/80 rounded-xl border border-slate-800">
      {prompts.map((p, idx) => {
        const Icon = p.icon;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(p.label)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-medium hover:bg-slate-800 hover:text-blue-400 hover:border-blue-500/30 transition-all"
          >
            <Icon className="h-3 w-3 text-blue-400 shrink-0" />
            <span>{p.label}</span>
          </button>
        );
      })}
    </div>
  );
}
