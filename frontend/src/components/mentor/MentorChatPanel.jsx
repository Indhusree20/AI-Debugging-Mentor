import React, { useState, useRef, useEffect } from 'react';
import { useDebugger } from '../../contexts/DebuggerContext';
import { mentorService } from '../../services/mentorService';
import {
  Bot,
  Send,
  User,
  Sparkles,
  HelpCircle,
  Lightbulb,
  BookOpen,
  RotateCcw,
} from 'lucide-react';

export function MentorChatPanel() {
  const {
    language,
    sourceCode,
    currentSession,
  } = useDebugger();

  const [messages, setMessages] = useState([
    {
      id: 'init',
      sender: 'mentor',
      text: "👋 Hi! I'm your AI Debugging Mentor. I analyze your active editor code and compiler tracebacks in real-time. Ask me to clarify root causes, give you subtle hints, or explain tricky language concepts.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await mentorService.chat({
        sessionId: currentSession?._id,
        language,
        sourceCode,
        userMessage: text.trim(),
        chatHistory: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          sender: 'mentor',
          text: response,
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'mentor',
          text: "I'm experiencing a brief network interruption. Please verify your code and ask again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { label: 'Why is this error happening?', icon: HelpCircle },
    { label: "Explain like I'm a beginner", icon: Sparkles },
    { label: 'Give me a hint', icon: Lightbulb },
    { label: 'How can I avoid this in future?', icon: BookOpen },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-ide-editor rounded-xl border border-surface-200 dark:border-ide-border overflow-hidden">
      {/* Messages Viewport */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs">
        {messages.map((m) => {
          const isMentor = m.sender === 'mentor';
          return (
            <div key={m.id} className={`flex items-start gap-2.5 ${isMentor ? '' : 'flex-row-reverse'}`}>
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-bold text-[10px] ${
                  isMentor
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                    : 'bg-zinc-200 dark:bg-surface-700 text-zinc-700 dark:text-zinc-200'
                }`}
              >
                {isMentor ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
              </div>

              <div
                className={`max-w-[85%] p-3 rounded-xl leading-relaxed whitespace-pre-wrap ${
                  isMentor
                    ? 'bg-zinc-50 dark:bg-surface-900 border border-surface-200 dark:border-ide-border text-zinc-800 dark:text-zinc-200'
                    : 'bg-blue-600 text-white font-medium'
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 italic">
            <Sparkles className="h-3.5 w-3.5 text-blue-500 animate-spin" />
            <span>Mentor is thinking...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="p-2 bg-zinc-50 dark:bg-surface-900/50 border-t border-surface-200 dark:border-surface-850 flex flex-wrap gap-1">
        {quickPrompts.map((p, idx) => {
          const Icon = p.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(p.label)}
              className="flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-surface-800 hover:bg-blue-50 dark:hover:bg-surface-700 border border-surface-200 dark:border-surface-700 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 text-[10px] font-medium transition-colors"
            >
              <Icon className="h-3 w-3 text-blue-500 shrink-0" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Box */}
      <div className="p-2 bg-white dark:bg-ide-panel border-t border-surface-200 dark:border-ide-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-1.5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your mentor anything about this code..."
            disabled={loading}
            className="flex-1 bg-zinc-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-colors shadow-subtle"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
