"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Home, RefreshCw, MessageCircle, Send, Loader2, MapPin, Clock } from "lucide-react";
import { AccessCodeDisplay } from "@/components/tour/access-code-display";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

interface TourPublic {
  id: string;
  status: string;
  scheduledAt: string;
  endsAt: string;
  accessCode: string | null;
  propertyAddress: string;
  propertyCity: string;
  visitorFirstName: string;
}

interface OrgInfo {
  name: string;
  primaryColor: string;
  twilioPhoneNumber: string | null;
  logoUrl: string | null;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    + " at "
    + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function AccessPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  const tourId = params.tourId as string;

  const [tour, setTour] = useState<TourPublic | null>(null);
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const res = await fetch(`/api/tour/access/${tourId}`);
      if (!res.ok) { setError("Tour not found."); return; }
      const data = await res.json() as { tour: TourPublic; org: OrgInfo };
      setTour(data.tour);
      setOrg(data.org);
    } catch {
      setError("Failed to load tour details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatOpen]);

  const sendMessage = async () => {
    const text = chatInput.trim();
    if (!text || isSending) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setChatInput("");
    setIsSending(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourId, message: text }),
      });
      const data = await res.json() as { reply?: string; error?: string };
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply ?? "Sorry, try again." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Something went wrong. Please try again." }]);
    } finally {
      setIsSending(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-gray-500" />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !tour || !org) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-center px-4">
        <Home className="h-12 w-12 text-gray-300" />
        <h1 className="text-xl font-semibold text-gray-900">Tour not found</h1>
        <p className="text-sm text-gray-500">{error ?? "We couldn't find this tour."}</p>
        <button
          onClick={() => void load()}
          className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    );
  }

  const hasTourCode = ["access_sent", "in_progress", "completed"].includes(tour.status);
  const primary = org.primaryColor;

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-gray-900">

      {/* ── Header ── */}
      <div style={{ backgroundColor: primary }} className="pt-10 pb-20">
        <div className="mx-auto max-w-lg px-5">
          {/* Org name — small, top-left, like a nav wordmark */}
          <p className="text-white/60 text-[11px] font-semibold uppercase tracking-[0.14em] mb-7">{org.name}</p>
          {/* Greeting */}
          <h1 className="text-white text-[2rem] font-bold leading-tight tracking-tight">
            Hi {tour.visitorFirstName},
          </h1>
          <p className="text-white/70 text-sm mt-1.5 font-medium">your self-guided tour details are below.</p>
        </div>
      </div>

      {/* ── Cards ── */}
      <main className="mx-auto max-w-lg px-5 -mt-10 pb-28 space-y-3">

        {/* Tour status card */}
        {tour.status === "scheduled" && !tour.accessCode ? (
          <div className="rounded-2xl bg-white shadow-sm border border-black/[0.04] p-5">
            <div className="flex items-start gap-4">
              <div
                className="flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center mt-0.5"
                style={{ backgroundColor: primary + "18" }}
              >
                <Home className="h-5 w-5" style={{ color: primary }} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[15px] font-semibold text-gray-900">Tour Confirmed</h2>
                <p className="mt-1 text-[13px] text-gray-500 leading-relaxed">
                  Your door code will be texted{" "}
                  <span className="font-medium text-gray-700">15 minutes before your tour</span>.
                  This page refreshes automatically.
                </p>
                <button
                  onClick={() => void load()}
                  className="mt-3 flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" /> Refresh now
                </button>
              </div>
            </div>
          </div>
        ) : tour.status === "scheduled" && tour.accessCode ? (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center mt-0.5">
                <Home className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[15px] font-semibold text-amber-900">We&apos;re having trouble with the smart lock</h2>
                <p className="mt-1 text-[13px] text-amber-700 leading-relaxed">
                  We couldn&apos;t program your door code automatically. The property manager has been notified and will contact you shortly with access instructions.
                </p>
                {org.twilioPhoneNumber && (
                  <p className="mt-2 text-[13px] text-amber-700">
                    Need help now? Text or call{" "}
                    <a href={`tel:${org.twilioPhoneNumber}`} className="font-semibold underline">{org.twilioPhoneNumber}</a>
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : hasTourCode && tour.accessCode ? (
          <div className="rounded-2xl bg-white shadow-sm border border-black/[0.04] p-5">
            <AccessCodeDisplay
              accessCode={tour.accessCode}
              propertyAddress={`${tour.propertyAddress}, ${tour.propertyCity}`}
              startsAt={new Date(tour.scheduledAt)}
              endsAt={new Date(tour.endsAt)}
              visitorFirstName={tour.visitorFirstName}
              supportPhone={org.twilioPhoneNumber ?? undefined}
              primaryColor={primary}
            />
          </div>
        ) : tour.status === "cancelled" ? (
          <div className="rounded-2xl bg-red-50 border border-red-100 p-5">
            <h2 className="text-[15px] font-semibold text-red-800">Tour Cancelled</h2>
            <p className="mt-1 text-[13px] text-red-600">This tour has been cancelled. Please contact us to reschedule.</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white shadow-sm border border-black/[0.04] p-5">
            <h2 className="text-[15px] font-semibold text-gray-900">Tour Completed</h2>
            <p className="mt-1 text-[13px] text-gray-500">Thank you for visiting! We hope you loved the home.</p>
          </div>
        )}

        {/* Property + time card */}
        <div className="rounded-2xl bg-white shadow-sm border border-black/[0.04] divide-y divide-gray-100">
          <div className="flex items-center gap-3.5 px-5 py-4">
            <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Property</p>
              <p className="text-[14px] font-semibold text-gray-900 truncate">{tour.propertyAddress}</p>
              <p className="text-[13px] text-gray-500">{tour.propertyCity}</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 px-5 py-4">
            <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Scheduled</p>
              <p className="text-[14px] font-semibold text-gray-900">{formatDateTime(tour.scheduledAt)}</p>
            </div>
          </div>
        </div>

      </main>

      {/* ── AI Chat FAB ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {chatOpen && (
          <div className="w-[min(320px,calc(100vw-3rem))] rounded-2xl bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: primary }}>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-white" />
                <span className="text-sm font-semibold text-white">Ask a Question</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/70 hover:text-white text-lg leading-none">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-72">
              {messages.length === 0 && (
                <p className="text-xs text-gray-400 text-center pt-4">Ask me anything about this property!</p>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${msg.role === "user" ? "text-white" : "bg-gray-100 text-gray-800"}`}
                    style={msg.role === "user" ? { backgroundColor: primary } : {}}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-xl px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t border-gray-100 p-2 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void sendMessage(); }}
                placeholder="Type a question..."
                className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
              <button
                onClick={() => void sendMessage()}
                disabled={isSending || !chatInput.trim()}
                className="p-2 rounded-lg disabled:opacity-40"
                style={{ backgroundColor: primary }}
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => setChatOpen((prev) => !prev)}
          className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center"
          style={{ backgroundColor: primary }}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </button>
      </div>
    </div>
  );
}
