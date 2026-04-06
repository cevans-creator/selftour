"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
}

interface AddTourDialogProps {
  properties: Property[];
}

export function AddTourDialog({ properties }: AddTourDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    propertyId: properties[0]?.id ?? "",
    scheduledAt: "",
    visitorFirstName: "",
    visitorLastName: "",
    visitorEmail: "",
    visitorPhone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tours/admin-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
        }),
      });
      const data = await res.json() as { error?: string; tourId?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to book tour");
        return;
      }
      toast.success("Tour booked successfully");
      setOpen(false);
      setForm({
        propertyId: properties[0]?.id ?? "",
        scheduledAt: "",
        visitorFirstName: "",
        visitorLastName: "",
        visitorEmail: "",
        visitorPhone: "",
      });
      router.refresh();
    } catch {
      toast.error("Failed to book tour");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#316ee0]/50 focus:border-[#316ee0]/60";
  const labelClass = "block text-sm font-medium text-white/60 mb-1";

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-1.5 bg-[#316ee0] hover:bg-[#2558c8] text-white">
        <Plus className="h-4 w-4" />
        Add Tour
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isSubmitting && setOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-[#111111] border border-white/10 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Book a Tour</h3>
            <p className="text-sm text-white/40 mt-1">Manually schedule a tour for a visitor.</p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className={labelClass}>Property</label>
                <select
                  className={inputClass}
                  value={form.propertyId}
                  onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
                  required
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#111111]">
                      {p.address}, {p.city}, {p.state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Date & Time</label>
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={form.visitorFirstName}
                    onChange={(e) => setForm({ ...form, visitorFirstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={form.visitorLastName}
                    onChange={(e) => setForm({ ...form, visitorLastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  className={inputClass}
                  value={form.visitorEmail}
                  onChange={(e) => setForm({ ...form, visitorEmail: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className={inputClass}
                  value={form.visitorPhone}
                  onChange={(e) => setForm({ ...form, visitorPhone: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-white/10 text-white/60 hover:bg-white/[0.04] hover:text-white bg-transparent"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#316ee0] hover:bg-[#2558c8] text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Book Tour
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
