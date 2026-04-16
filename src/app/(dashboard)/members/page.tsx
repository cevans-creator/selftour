"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, Mail, Loader2 } from "lucide-react";

interface Member {
  id: string;
  userId: string;
  role: string;
  email: string;
  createdAt: string;
  isCurrentUser: boolean;
}

interface Invite {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  expiresAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  agent: "Agent",
  viewer: "Viewer",
};

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  admin: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  agent: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  viewer: "bg-white/10 text-white/50 border-white/10",
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("agent");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = currentUserRole === "owner" || currentUserRole === "admin";

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/members");
      if (!res.ok) return;
      const data = await res.json();
      setMembers(data.members ?? []);
      setInvites(data.invites ?? []);
      setCurrentUserRole(data.currentUserRole ?? "");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setError("");
    try {
      const res = await fetch("/api/members/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowInvite(false);
        setInviteEmail("");
        setInviteRole("agent");
        await load();
      } else {
        setError(data.error || "Failed to send invite");
      }
    } catch {
      setError("Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  const handleChangeRole = async (memberId: string, role: string) => {
    const res = await fetch("/api/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, action: "update_role", role }),
    });
    if (res.ok) await load();
    else {
      const data = await res.json();
      alert(data.error || "Failed to update role");
    }
  };

  const handleRemove = async (memberId: string, email: string) => {
    if (!confirm(`Remove ${email} from the team?`)) return;
    const res = await fetch("/api/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, action: "remove" }),
    });
    if (res.ok) await load();
    else {
      const data = await res.json();
      alert(data.error || "Failed to remove member");
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    const res = await fetch("/api/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId }),
    });
    if (res.ok) await load();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/20" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Members</h1>
          <p className="text-sm text-white/40 mt-1">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setShowInvite(true)}
            className="bg-[#316ee0] hover:bg-[#2860c9] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-[#111] border-white/10">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Invite Team Member</h2>
              <div>
                <label className="text-xs text-white/50 font-medium">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => { setInviteEmail(e.target.value); setError(""); }}
                  placeholder="teammate@company.com"
                  className="mt-1 w-full rounded-lg bg-white/[0.06] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-[#316ee0]"
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-white/50 font-medium">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="mt-1 w-full rounded-lg bg-white/[0.06] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#316ee0]"
                >
                  <option value="admin">Admin — can manage everything</option>
                  <option value="agent">Agent — can manage tours and properties</option>
                  <option value="viewer">Viewer — read-only access</option>
                </select>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => { setShowInvite(false); setInviteEmail(""); setError(""); }}
                  className="flex-1 border-white/10 text-white/60 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                  className="flex-1 bg-[#316ee0] hover:bg-[#2860c9] text-white"
                >
                  {inviting ? "Sending..." : "Send Invite"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Members List */}
      <Card className="bg-white/[0.03] border-white/[0.06]">
        <CardContent className="p-0">
          {members.map((member, i) => (
            <div
              key={member.id}
              className={`flex items-center justify-between px-5 py-4 ${i < members.length - 1 ? "border-b border-white/[0.06]" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-xs font-semibold text-white/50 uppercase">
                  {member.email[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {member.email}
                    {member.isCurrentUser && <span className="text-white/30 ml-1">(you)</span>}
                  </p>
                  <p className="text-xs text-white/30">
                    Joined {new Date(member.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && member.role !== "owner" && !member.isCurrentUser ? (
                  <select
                    value={member.role}
                    onChange={(e) => handleChangeRole(member.id, e.target.value)}
                    className="rounded-lg bg-white/[0.06] border border-white/10 px-2 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value="admin">Admin</option>
                    <option value="agent">Agent</option>
                    <option value="viewer">Viewer</option>
                  </select>
                ) : (
                  <Badge className={ROLE_COLORS[member.role] ?? ""}>
                    {ROLE_LABELS[member.role] ?? member.role}
                  </Badge>
                )}
                {isAdmin && member.role !== "owner" && !member.isCurrentUser && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemove(member.id, member.email)}
                    className="text-red-400/50 hover:text-red-400 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wide">Pending Invites</h2>
          <Card className="bg-white/[0.03] border-white/[0.06]">
            <CardContent className="p-0">
              {invites.map((invite, i) => (
                <div
                  key={invite.id}
                  className={`flex items-center justify-between px-5 py-4 ${i < invites.length - 1 ? "border-b border-white/[0.06]" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-xs text-white/25">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">{invite.email}</p>
                      <p className="text-xs text-white/25">
                        Invited as {ROLE_LABELS[invite.role] ?? invite.role} — expires {new Date(invite.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancelInvite(invite.id)}
                      className="text-white/30 hover:text-red-400 text-xs"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty state */}
      {members.length === 0 && (
        <Card className="bg-white/[0.03] border-white/[0.06]">
          <CardContent className="py-16 text-center">
            <Users className="h-10 w-10 text-white/15 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-white/40">No team members yet</h3>
            <p className="text-xs text-white/25 mt-1">Invite team members to help manage tours and properties.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
