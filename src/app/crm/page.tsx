"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Download, Loader2, Trash2, ChevronRight,
  Phone, Mail, Building2, MessageSquare, X,
} from "lucide-react";

interface Contact {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  propertyCount: string | null;
  stage: string;
  source: string | null;
  value: number | null;
  nextFollowUp: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Note {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

const STAGES = [
  { id: "new_lead", label: "New Lead", color: "bg-blue-500" },
  { id: "demo_scheduled", label: "Demo Scheduled", color: "bg-violet-500" },
  { id: "demo_completed", label: "Demo Done", color: "bg-amber-500" },
  { id: "proposal_sent", label: "Proposal Sent", color: "bg-orange-500" },
  { id: "negotiating", label: "Negotiating", color: "bg-pink-500" },
  { id: "closed_won", label: "Closed Won", color: "bg-emerald-500" },
  { id: "closed_lost", label: "Lost", color: "bg-white/20" },
];

export default function CrmPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [form, setForm] = useState({ companyName: "", contactName: "", email: "", phone: "", propertyCount: "" });
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"pipeline" | "list">("pipeline");

  const load = useCallback(async () => {
    const res = await fetch("/api/crm");
    if (res.ok) {
      const data = await res.json();
      setContacts(data.contacts ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const loadNotes = async (contactId: string) => {
    const res = await fetch(`/api/crm/notes?contactId=${contactId}`);
    if (res.ok) {
      const data = await res.json();
      setNotes(data.notes ?? []);
    }
  };

  const handleAdd = async () => {
    if (!form.companyName || !form.contactName || !form.email) return;
    setSaving(true);
    await fetch("/api/crm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, source: "manual" }),
    });
    setShowAdd(false);
    setForm({ companyName: "", contactName: "", email: "", phone: "", propertyCount: "" });
    setSaving(false);
    await load();
  };

  const handleStageChange = async (id: string, stage: string) => {
    await fetch("/api/crm", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, stage }),
    });
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, stage } : c));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, stage } : null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contact?")) return;
    await fetch("/api/crm", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setSelected(null);
    await load();
  };

  const handleAddNote = async () => {
    if (!selected || !newNote.trim()) return;
    setAddingNote(true);
    await fetch("/api/crm/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: selected.id, content: newNote }),
    });
    setNewNote("");
    setAddingNote(false);
    await loadNotes(selected.id);
  };

  const openContact = (contact: Contact) => {
    setSelected(contact);
    void loadNotes(contact.id);
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-white/20" /></div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Pipeline</h1>
          <p className="text-sm text-white/40 mt-1">{contacts.length} contacts</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="border-white/10 text-white/60" onClick={() => setView(view === "pipeline" ? "list" : "pipeline")}>
            {view === "pipeline" ? "List" : "Pipeline"}
          </Button>
          <a href="/api/crm/export" className="inline-flex items-center gap-1 rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:text-white">
            <Download className="h-3.5 w-3.5" /> CSV
          </a>
          <Button size="sm" onClick={() => setShowAdd(true)} className="bg-[#316ee0] hover:bg-[#2860c9] text-white">
            <Plus className="h-4 w-4 mr-1" /> Add Contact
          </Button>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-[#111] border-white/10">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Add Contact</h2>
              {[
                { key: "companyName", label: "Company", placeholder: "Sunrise Homes" },
                { key: "contactName", label: "Contact Name", placeholder: "Jane Smith" },
                { key: "email", label: "Email", placeholder: "jane@sunrisehomes.com" },
                { key: "phone", label: "Phone", placeholder: "+1 555-0100" },
                { key: "propertyCount", label: "Properties", placeholder: "1-5, 6-20, etc." },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs text-white/50">{f.label}</label>
                  <input
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="mt-1 w-full rounded-lg bg-white/[0.06] border border-white/10 px-3 py-2 text-base sm:text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-[#316ee0]"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowAdd(false)} className="flex-1 border-white/10 text-white/60">Cancel</Button>
                <Button onClick={handleAdd} disabled={saving || !form.companyName || !form.email} className="flex-1 bg-[#316ee0] text-white">
                  {saving ? "Saving..." : "Add"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contact Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md bg-[#111] border-l border-white/10 overflow-y-auto">
            <div className="sticky top-0 bg-[#111] border-b border-white/[0.06] px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{selected.companyName}</h2>
              <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-6">
              {/* Contact info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Building2 className="h-3.5 w-3.5" /> {selected.contactName}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Mail className="h-3.5 w-3.5" /> <a href={`mailto:${selected.email}`} className="hover:text-white">{selected.email}</a>
                </div>
                {selected.phone && (
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Phone className="h-3.5 w-3.5" /> <a href={`tel:${selected.phone}`} className="hover:text-white">{selected.phone}</a>
                  </div>
                )}
                {selected.propertyCount && (
                  <p className="text-xs text-white/40">Properties: {selected.propertyCount}</p>
                )}
                <p className="text-xs text-white/30">Source: {selected.source ?? "unknown"} · Added {formatDate(selected.createdAt)}</p>
              </div>

              {/* Stage selector */}
              <div>
                <label className="text-xs text-white/50 mb-2 block">Pipeline Stage</label>
                <div className="flex flex-wrap gap-1.5">
                  {STAGES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleStageChange(selected.id, s.id)}
                      className={`text-xs px-2.5 py-1 rounded-full transition-all ${
                        selected.stage === s.id
                          ? `${s.color} text-white`
                          : "bg-white/[0.04] text-white/40 hover:text-white/60 hover:bg-white/[0.08]"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs text-white/50 mb-2 block">Notes</label>
                <div className="flex gap-2 mb-3">
                  <input
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="flex-1 rounded-lg bg-white/[0.06] border border-white/10 px-3 py-2 text-base sm:text-sm text-white placeholder:text-white/25 focus:outline-none"
                    onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                  />
                  <Button size="sm" onClick={handleAddNote} disabled={addingNote || !newNote.trim()} className="bg-[#316ee0] text-white">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {notes.map((n) => (
                    <div key={n.id} className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-3">
                      <p className="text-sm text-white/70">{n.content}</p>
                      <p className="text-[10px] text-white/25 mt-1">{n.createdBy} · {formatDate(n.createdAt)}</p>
                    </div>
                  ))}
                  {notes.length === 0 && <p className="text-xs text-white/25">No notes yet.</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-white/[0.06]">
                <Button size="sm" variant="ghost" onClick={() => handleDelete(selected.id)} className="text-red-400/60 hover:text-red-400 text-xs">
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Contact
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline View */}
      {view === "pipeline" ? (
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {STAGES.filter((s) => s.id !== "closed_lost").map((stage) => {
            const stageContacts = contacts.filter((c) => c.stage === stage.id);
            return (
              <div key={stage.id} className="flex-shrink-0 w-64 sm:w-auto sm:flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`h-2 w-2 rounded-full ${stage.color}`} />
                  <span className="text-xs font-medium text-white/50 uppercase tracking-wide">{stage.label}</span>
                  <span className="text-xs text-white/25">{stageContacts.length}</span>
                </div>
                <div className="space-y-2 min-h-[100px]">
                  {stageContacts.map((contact) => (
                    <Card
                      key={contact.id}
                      className="bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12] cursor-pointer transition-colors"
                      onClick={() => openContact(contact)}
                    >
                      <CardContent className="p-3">
                        <p className="text-sm font-medium text-white truncate">{contact.companyName}</p>
                        <p className="text-xs text-white/40 truncate">{contact.contactName}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-white/25">{contact.propertyCount ?? "—"} props</span>
                          <span className="text-[10px] text-white/25">{formatDate(contact.createdAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardContent className="p-0">
            {contacts.length === 0 ? (
              <div className="py-16 text-center">
                <Building2 className="h-10 w-10 text-white/15 mx-auto mb-4" />
                <p className="text-sm text-white/40">No contacts yet</p>
                <p className="text-xs text-white/25">Add one manually or they'll appear when someone submits the pricing form.</p>
              </div>
            ) : (
              contacts.map((contact, i) => {
                const stage = STAGES.find((s) => s.id === contact.stage);
                return (
                  <div
                    key={contact.id}
                    className={`flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-white/[0.02] ${i < contacts.length - 1 ? "border-b border-white/[0.06]" : ""}`}
                    onClick={() => openContact(contact)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{contact.companyName}</p>
                      <p className="text-xs text-white/40">{contact.contactName} · {contact.email}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge className={`${stage?.color ?? "bg-white/10"} text-white text-[10px]`}>
                        {stage?.label ?? contact.stage}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-white/20" />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
