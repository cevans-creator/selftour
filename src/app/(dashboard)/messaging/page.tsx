"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MessageSquare, Mail, Edit, Save, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { interpolateTemplate } from "@/lib/utils";

const TEMPLATE_VARIABLES = [
  "{{visitor_first_name}}",
  "{{property_address}}",
  "{{tour_date}}",
  "{{tour_time}}",
  "{{access_code}}",
  "{{access_url}}",
  "{{org_name}}",
];

const PREVIEW_VARS: Record<string, string> = {
  visitor_first_name: "Sarah",
  property_address: "123 Oak Street, Austin, TX",
  tour_date: "Monday, Jan 6",
  tour_time: "2:00 PM",
  access_code: "7842",
  access_url: "https://app.keysherpa.io/tour/acme/access/abc123",
  org_name: "Sunrise Homes",
};

const DEFAULT_TEMPLATES = [
  {
    trigger: "tour_booked",
    channel: "sms",
    label: "Tour Booked (SMS)",
    body: "Hi {{visitor_first_name}}! Your tour of {{property_address}} is confirmed for {{tour_date}} at {{tour_time}}. Reply with questions anytime. — {{org_name}}",
  },
  {
    trigger: "reminder_24h",
    channel: "sms",
    label: "24h Reminder (SMS)",
    body: "Reminder: Your tour of {{property_address}} is tomorrow at {{tour_time}}. Your door code arrives 15 min before. — {{org_name}}",
  },
  {
    trigger: "access_code_sent",
    channel: "sms",
    label: "Access Code (SMS)",
    body: "Your tour starts in 15 min! Door code: {{access_code}}\n{{property_address}}\nView instructions: {{access_url}}\nText questions here.",
  },
  {
    trigger: "tour_completed",
    channel: "sms",
    label: "Thank You (SMS)",
    body: "Thanks for touring {{property_address}}, {{visitor_first_name}}! Questions? Just reply to this number.",
  },
  {
    trigger: "follow_up_24h",
    channel: "sms",
    label: "Follow-Up (SMS)",
    body: "Hi {{visitor_first_name}}! How was your tour of {{property_address}}? We'd love to answer any questions. — {{org_name}}",
  },
];

interface Template {
  id: string;
  trigger: string;
  channel: string;
  label: string;
  body: string;
  subject?: string;
  isActive: boolean;
}

export default function MessagingPage() {
  const [templates, setTemplates] = useState<Template[]>(
    DEFAULT_TEMPLATES.map((t, i) => ({
      ...t,
      id: `default-${i}`,
      isActive: true,
    }))
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const handleEdit = (template: Template) => {
    setEditingId(template.id);
    setEditBody(template.body);
    setEditSubject(template.subject ?? "");
    setShowPreview(false);
  };

  const handleSave = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, body: editBody, subject: editSubject } : t
      )
    );
    setEditingId(null);
    toast.success("Template saved");
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowPreview(false);
  };

  const insertVariable = (variable: string) => {
    setEditBody((prev) => prev + variable);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Message Templates</h1>
          <p className="text-muted-foreground">
            Customize the SMS and email messages sent throughout the tour lifecycle.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Template
        </Button>
      </div>

      {/* Variables reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Available Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_VARIABLES.map((v) => (
              <code
                key={v}
                className="rounded bg-muted px-2 py-0.5 text-xs font-mono cursor-pointer hover:bg-muted/80"
                onClick={() => editingId && insertVariable(v)}
                title={editingId ? "Click to insert" : ""}
              >
                {v}
              </code>
            ))}
          </div>
          {editingId && (
            <p className="mt-2 text-xs text-muted-foreground">
              Click a variable above to insert it into the template body.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Templates */}
      <div className="space-y-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {template.channel === "sms" ? (
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Mail className="h-4 w-4 text-purple-600" />
                  )}
                  <CardTitle className="text-sm font-semibold">{template.label}</CardTitle>
                  <Badge variant={template.channel === "sms" ? "info" : "purple"}>
                    {template.channel.toUpperCase()}
                  </Badge>
                </div>
                {editingId !== template.id ? (
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSave(template.id)}>
                      <Save className="mr-1.5 h-3.5 w-3.5" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingId === template.id ? (
                <div className="space-y-3">
                  {template.channel === "email" && (
                    <div className="space-y-1">
                      <Label>Subject</Label>
                      <Input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} placeholder="Email subject" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label>Body</Label>
                      <button
                        className="text-xs text-primary hover:underline"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        {showPreview ? "Edit" : "Preview"}
                      </button>
                    </div>
                    {showPreview ? (
                      <div className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
                        {interpolateTemplate(editBody, PREVIEW_VARS)}
                      </div>
                    ) : (
                      <Textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        rows={4}
                        className="font-mono text-sm"
                      />
                    )}
                    {template.channel === "sms" && (
                      <p className="text-xs text-muted-foreground">
                        {interpolateTemplate(editBody, PREVIEW_VARS).length} characters
                        {interpolateTemplate(editBody, PREVIEW_VARS).length > 160 && (
                          <span className="ml-1 text-orange-500">
                            (will send as {Math.ceil(interpolateTemplate(editBody, PREVIEW_VARS).length / 153)} messages)
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground font-mono whitespace-pre-wrap">
                  {template.body}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
