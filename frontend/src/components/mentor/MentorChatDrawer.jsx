import React, { useState, useRef, useEffect } from 'react';
import { useDebugger } from '../../contexts/DebuggerContext';
import { mentorService } from '../../services/mentorService';
import { ChatMessageBubble } from './ChatMessageBubble';
import { QuickPromptButtons } from './QuickPromptButtons';
import { Bot, Send, X, Sparkles, MessageSquare } from 'lucide-react';

export function MentorChatDrawer() {
  const {
    isMentorDrawerOpen,
    setIsMentorDrawerOpen,
    language,
    sourceCode,
    currentSession,
  } = useDebugger();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'mentor',
      text: "👋 Hi! I'm your AI Debugging Mentor. I'm here to help you understand your errors, give you progressive hints, or explain tricky concepts step-by-step. What would you like to explore?",
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const replyText = await mentorService.chat({
        sessionId: currentSession?._id,
        language,
        sourceCode,
        userMessage: text.trim(),
        chatHistory: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
      });

      const mentorMsg = {
        id: `mentor-${Date.now()}`,
        sender: 'mentor',
        text: replyText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, mentorMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'mentor',
          text: "I'm having trouble connecting right now. Please check the code in the editor or try asking again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMentorDrawerOpen) {
    return (
      <button
        onClick={() => setIsMentorDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-2xl shadow-blue-500/40 hover:scale-105 transition-all glow-primary"
      >
        <Bot className="h-5 w-5" />
        <span>Ask AI Mentor</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-[#0b0f19] border-l border-slate-800 shadow-2xl flex flex-col animate-slide-left">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">AI Coding Mentor</h4>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Context Active ({language.toUpperCase()})</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsMentorDrawerOpen(false)}
          className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <ChatMessageBubble key={m.id} message={m} />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <Sparkles className="h-4 w-4 text-blue-400 animate-spin" />
            <span>Mentor is analyzing your code and thinking...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 pb-2">
        <QuickPromptButtons onSelectPrompt={(prompt) => handleSend(prompt)} />
      </div>

      {/* Input Box */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask mentor a question..."
            disabled={isLoading}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 transition-all shadow-md shadow-blue-600/30"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
