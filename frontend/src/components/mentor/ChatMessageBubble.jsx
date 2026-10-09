import React from 'react';
import { Bot, User } from 'lucide-react';

export function ChatMessageBubble({ message }) {
  const isMentor = message.sender === 'mentor' || message.sender === 'assistant';

  return (
    <div className={`flex items-start gap-3 ${isMentor ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-bold ${
          isMentor
            ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
            : 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400'
        }`}
      >
        {isMentor ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed ${
          isMentor
            ? 'bg-slate-900 border border-slate-800 text-slate-200'
            : 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
        <span className={`block text-[9px] mt-1.5 ${isMentor ? 'text-slate-500' : 'text-blue-200'}`}>
          {new Date(message.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
