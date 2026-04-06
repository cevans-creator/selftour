"use client";

import { useState } from "react";
import { KeyRound, Copy, Trash2, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface GenerateCodeDialogProps {
  deviceId: string;
  deviceName: string;
}

interface GeneratedCode {
  code: string;
  accessCodeId: string;
  expiresAt: string;
}

export function GenerateCodeDialog({ deviceId, deviceName }: GenerateCodeDialogProps) {
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState(60);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [generated, setGenerated] = useState<GeneratedCode | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/locks/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, durationMinutes: duration }),
      });
      if (!res.ok) throw new Error("Failed to generate code");
      const data = (await res.json()) as GeneratedCode;
      setGenerated(data);
      toast.success("Code generated and active on lock");
    } catch {
      toast.error("Failed to generate code");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevoke = async () => {
    if (!generated) return;
    const codeId = generated.accessCodeId;
    setIsRevoking(true);
    console.log("[Revoke] accessCodeId:", codeId);
    try {
      const res = await fetch(`/api/locks/generate-code?accessCodeId=${encodeURIComponent(codeId)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Failed to revoke");
      }
      setGenerated(null);
      setOpen(false);
      toast.success("Code revoked from lock");
    } catch {
      toast.error("Failed to revoke code");
    } finally {
      setIsRevoking(false);
    }
  };

  const handleCopy = () => {
    if (!generated) return;
    void navigator.clipboard.writeText(generated.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const expiresIn = generated
    ? Math.max(0, Math.round((new Date(generated.expiresAt).getTime() - Date.now()) / 60000))
    : 0;

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-1.5"
      >
        <KeyRound className="h-3.5 w-3.5" />
        Generate Code
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !generated && setOpen(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-[#111111] border border-white/10 shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white">Generate Access Code</h3>
            <p className="text-sm text-white/40 mt-1">{deviceName}</p>

            {!generated ? (
              <>
                <div className="mt-5">
                  <label className="text-sm font-medium text-white/60">Duration</label>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {[30, 60, 120, 240].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setDuration(mins)}
                        className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                          duration === mins
                            ? "border-[#316ee0] bg-[#316ee0]/10 text-[#316ee0]"
                            : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                        }`}
                      >
                        {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button variant="outline" className="flex-1 border-white/10 text-white/60 hover:bg-white/[0.04] bg-transparent" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-[#316ee0] hover:bg-[#2558c8] text-white"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="mt-5 rounded-xl bg-white/[0.04] border border-white/10 p-5 text-center">
                  <p className="text-xs text-white/40 mb-2">Active PIN Code</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-5xl font-extrabold tracking-widest text-white font-mono">
                      {generated.code}
                    </span>
                    <button onClick={handleCopy} className="text-white/30 hover:text-[#316ee0] transition-colors">
                      {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-white/30">
                    Expires in ~{expiresIn} min · {new Date(generated.expiresAt).toLocaleTimeString()}
                  </p>
                </div>

                <p className="mt-3 text-xs text-center text-white/30">
                  This code is now active on the lock keypad. Revoke it early if no longer needed.
                </p>

                <div className="mt-5 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent"
                    onClick={handleRevoke}
                    disabled={isRevoking}
                  >
                    {isRevoking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Revoke
                  </Button>
                  <Button variant="outline" className="flex-1 border-white/10 text-white/60 hover:bg-white/[0.04] bg-transparent" onClick={() => setOpen(false)}>
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
