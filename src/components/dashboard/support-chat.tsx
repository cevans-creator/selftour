"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Loader2, X, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your KeySherpa setup assistant. I can help you connect your smart lock, set up properties, or answer any questions. What do you need help with?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setIsSending(true);

    try {
      const history = newMessages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? "Something went wrong. Please try again." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 sm:w-96 rounded-2xl bg-[#111111] shadow-2xl border border-white/10 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#316ee0] shadow-lg shadow-[#316ee0]/30">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">KeySherpa Assistant</p>
                <p className="text-xs text-white/35">Setup & support help</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/30 hover:text-white/70 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80 bg-[#0d0d0d]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#316ee0]/15 flex-shrink-0 mr-2 mt-0.5">
                    <Sparkles className="h-3 w-3 text-[#316ee0]" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#316ee0] text-white rounded-tr-sm"
                      : "bg-white/[0.06] text-white/80 border border-white/[0.06] rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#316ee0]/15 flex-shrink-0 mr-2 mt-0.5">
                  <Sparkles className="h-3 w-3 text-[#316ee0]" />
                </div>
                <div className="bg-white/[0.06] rounded-2xl rounded-tl-sm px-3.5 py-2.5 border border-white/[0.06]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#316ee0]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          {messages.length === 1 && (
            <div className="px-3 py-2 flex gap-2 flex-wrap border-t border-white/[0.06] bg-[#0d0d0d]">
              {["How do I connect my lock?", "Lock is offline", "Set up a property"].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => { setInput(prompt); }}
                  className="rounded-full border border-[#316ee0]/30 bg-[#316ee0]/10 px-3 py-1 text-xs text-[#316ee0] hover:bg-[#316ee0]/20 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-white/[0.06] p-3 flex gap-2 bg-[#111111]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void send(); }}
              placeholder="Ask anything..."
              className="flex-1 text-sm px-3 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#316ee0]/40 focus:border-[#316ee0]/50"
            />
            <button
              onClick={() => void send()}
              disabled={isSending || !input.trim()}
              className="p-2 rounded-xl bg-[#316ee0] disabled:opacity-40 hover:bg-[#2558c8] transition-colors shadow-sm shadow-[#316ee0]/20"
            >
              <Send className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative h-14 w-14 rounded-full bg-[#316ee0] flex items-center justify-center
          shadow-[0_0_20px_2px_rgba(49,110,224,0.5)]
          hover:shadow-[0_0_28px_4px_rgba(49,110,224,0.65)]
          hover:bg-[#2558c8] hover:scale-105
          transition-all duration-200"
      >
        {open ? (
          <X className="h-5 w-5 text-white" />
        ) : (
          <>
            <MessageCircle className="h-5 w-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#0a0a0a]">
              <span className="text-[8px] font-bold text-white">AI</span>
            </span>
          </>
        )}
      </button>
    </div>
  );
}
