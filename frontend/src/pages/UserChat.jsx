import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { sendChatMessage } from "../api/client";
import { 
  Send, 
  Bot, 
  User, 
  LogOut, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  Clock, 
  Calendar,
  AlertCircle
} from "lucide-react";

export default function UserChat() {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am Campus AI, your college assistant. Ask me anything about exams, library hours, fee schedules, hostel rules, scholarships, or college notices.",
      sources: []
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (textToSend) => {
    const question = (textToSend || inputValue).trim();
    if (!question || isLoading) return;

    // Add user message
    const userMsg = { sender: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await sendChatMessage(question);
      const aiMsg = {
        sender: "ai",
        text: response.answer,
        found: response.found,
        sources: response.sources || []
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I couldn't find this information in the available college data.",
          error: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const sampleQuestions = [
    { text: "When is the internal exam?", icon: Calendar },
    { text: "What are the central library hours?", icon: BookOpen },
    { text: "What is the semester fee payment deadline?", icon: Clock },
    { text: "What are the hostel curfew timings?", icon: AlertCircle }
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900/80 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Campus AI
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Assistant
              </span>
            </h1>
            <p className="text-xs text-slate-400">Official College Knowledge Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 text-right hidden sm:flex">
            <div>
              <p className="text-sm font-medium text-slate-200">{user?.name || "Student"}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <User className="h-4 w-4" />
            </div>
          </div>

          {user?.role === "admin" && (
            <a
              href="/admin"
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              Admin Dashboard →
            </a>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition"
            title="Log out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Chat Messages Conversation Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Welcome Banner */}
          {messages.length <= 1 && (
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex p-4 rounded-2xl bg-indigo-950/60 border border-indigo-800/40 text-indigo-400 shadow-xl mb-2">
                <Sparkles className="h-8 w-8 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Ask anything about your college
              </h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Instant answers verified from official college texts, notices, circulars, exam schedules, and administration documents.
              </p>

              {/* Quick sample inquiry chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 text-left max-w-xl mx-auto">
                {sampleQuestions.map((q, idx) => {
                  const Icon = q.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q.text)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800/80 hover:border-indigo-500/40 transition text-xs text-slate-300 group"
                    >
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-slate-200">{q.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Render Messages */}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3.5 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "ai" && (
                <div className="h-8 w-8 rounded-xl bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 mt-1">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Sources pill if provided */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                    <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Source:</span>
                    {msg.sources.map((s, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/60 text-slate-300 text-[11px]"
                      >
                        <ShieldCheck className="h-3 w-3 text-emerald-400" />
                        {s.title} ({s.source_type.toUpperCase()})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === "user" && (
                <div className="h-8 w-8 rounded-xl bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center text-slate-300 mt-1">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3.5 justify-start">
              <div className="h-8 w-8 rounded-xl bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 mt-1">
                <Bot className="h-4 w-4 animate-pulse" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3.5 flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce"></div>
                <span className="text-xs text-slate-400 ml-2">Searching college knowledge...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Form at Bottom */}
      <footer className="border-t border-slate-800 bg-slate-900/90 backdrop-blur px-4 py-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-slate-950 border border-slate-800 focus-within:border-indigo-500 rounded-2xl px-4 py-2.5 shadow-lg transition"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-100 placeholder-slate-500"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-medium text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Send</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[11px] text-slate-500">
              Campus AI searches verified college texts, PDFs, and official notices before answering.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
