"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Home, RefreshCw, MessageCircle, Send, Loader2 } from "lucide-react";
import { AccessCodeDisplay } from "@/components/tour/access-code-display";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
      if (!res.ok) {
        setError("Tour not found.");
        return;
      }
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

    // Refresh every 30 seconds to pick up status changes
    const interval = setInterval(() => void load(), 30000);
    return () => clearInterval(interval);
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
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply ?? "Sorry, I couldn't get a response. Please try again." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-lg px-4 py-12">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-32 mt-4 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !tour || !org) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-center px-4">
        <Home className="h-12 w-12 text-gray-300" />
        <h1 className="text-xl font-semibold">Tour not found</h1>
        <p className="text-sm text-gray-500">
          {error ?? "We couldn't find this tour. Please check the link and try again."}
        </p>
        <Button variant="outline" onClick={() => void load()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  const hasTourCode = tour.status === "access_sent" || tour.status === "in_progress" || tour.status === "completed";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="py-4" style={{ backgroundColor: org.primaryColor }}>
        <div className="mx-auto max-w-lg px-4">
          <p className="font-bold text-white">{org.name}</p>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Your Tour Access</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Hi {tour.visitorFirstName}! Here are your tour details.
          </p>
        </div>

        {tour.status === "scheduled" && !tour.accessCode ? (
          <div className="rounded-xl bg-white p-6 shadow-sm text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: org.primaryColor + "15" }}
            >
              <Home className="h-8 w-8" style={{ color: org.primaryColor }} />
            </div>
            <h2 className="text-lg font-semibold">Tour Confirmed!</h2>
            <p className="mt-2 text-sm text-gray-500">
              Your door access code will be sent via text message{" "}
              <strong>15 minutes before your tour</strong>. This page will update
              automatically when your code is ready.
            </p>
            <p className="mt-4 text-sm font-medium" style={{ color: org.primaryColor }}>
              Check back 15 min before your tour starts.
            </p>
            <button
              onClick={() => void load()}
              className="mt-4 flex items-center gap-1.5 mx-auto text-xs text-gray-400 hover:text-gray-600"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
          </div>
        ) : hasTourCode && tour.accessCode ? (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <AccessCodeDisplay
              accessCode={tour.accessCode}
              propertyAddress={`${tour.propertyAddress}, ${tour.propertyCity}`}
              startsAt={new Date(tour.scheduledAt)}
              endsAt={new Date(tour.endsAt)}
              visitorFirstName={tour.visitorFirstName}
              supportPhone={org.twilioPhoneNumber ?? undefined}
              primaryColor={org.primaryColor}
            />
          </div>
        ) : tour.status === "cancelled" ? (
          <div className="rounded-xl bg-red-50 p-6 text-center">
            <h2 className="font-semibold text-red-800">Tour Cancelled</h2>
            <p className="mt-1 text-sm text-red-600">
              This tour has been cancelled. Please contact us to reschedule.
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-gray-100 p-6 text-center">
            <h2 className="font-semibold">Tour Completed</h2>
            <p className="mt-1 text-sm text-gray-500">
              Thank you for visiting! We hope you loved the home.
            </p>
          </div>
        )}

        {/* Property info */}
        <div className="mt-6 rounded-xl bg-white p-4 shadow-sm text-sm">
          <p className="font-medium text-gray-900">{tour.propertyAddress}</p>
          <p className="text-gray-500">{tour.propertyCity}</p>
        </div>
      </main>

      {/* AI Chat */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {chatOpen && (
          <div className="w-80 rounded-2xl bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
            {/* Chat header */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ backgroundColor: org.primaryColor }}
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-white" />
                <span className="text-sm font-semibold text-white">Ask a Question</span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-white/70 hover:text-white text-lg leading-none"
              >
                ×
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-72">
              {messages.length === 0 && (
                <p className="text-xs text-gray-400 text-center pt-4">
                  Ask me anything about this property!
                </p>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                    style={msg.role === "user" ? { backgroundColor: org.primaryColor } : {}}
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

            {/* Input */}
            <div className="border-t border-gray-100 p-2 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void sendMessage(); }}
                placeholder="Type a question..."
                className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-0"
                style={{ "--tw-ring-color": org.primaryColor } as React.CSSProperties}
              />
              <button
                onClick={() => void sendMessage()}
                disabled={isSending || !chatInput.trim()}
                className="p-2 rounded-lg disabled:opacity-40"
                style={{ backgroundColor: org.primaryColor }}
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* FAB */}
        <button
          onClick={() => setChatOpen((prev) => !prev)}
          className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center"
          style={{ backgroundColor: org.primaryColor }}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </button>
      </div>
    </div>
  );
}
