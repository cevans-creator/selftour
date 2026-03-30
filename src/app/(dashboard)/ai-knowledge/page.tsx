"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Save, X, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface KnowledgeEntry {
  id: string;
  question: string;
  answer: string;
  scope: "org" | "community" | "property";
  communityId?: string;
  propertyId?: string;
}

const SAMPLE_ENTRIES: KnowledgeEntry[] = [
  {
    id: "1",
    question: "What is included in the HOA fee?",
    answer: "The HOA fee covers landscaping, exterior maintenance, community pool, gym access, and trash removal. The monthly fee is $250.",
    scope: "org",
  },
  {
    id: "2",
    question: "Are pets allowed?",
    answer: "Yes! We welcome pets. There is a $500 pet deposit (refundable) and a $50/month pet rent. Limit 2 pets per unit, max 50 lbs each.",
    scope: "org",
  },
  {
    id: "3",
    question: "What appliances are included?",
    answer: "All homes come with a refrigerator, dishwasher, microwave, and washer/dryer hookups. Most units have in-unit washer/dryers.",
    scope: "org",
  },
];

export default function AiKnowledgePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>(SAMPLE_ENTRIES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const handleEdit = (entry: KnowledgeEntry) => {
    setEditingId(entry.id);
    setEditQuestion(entry.question);
    setEditAnswer(entry.answer);
  };

  const handleSave = (id: string) => {
    if (!editQuestion.trim() || !editAnswer.trim()) {
      toast.error("Question and answer are required");
      return;
    }
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, question: editQuestion, answer: editAnswer } : e
      )
    );
    setEditingId(null);
    toast.success("Knowledge entry updated");
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast.success("Entry deleted");
  };

  const handleAdd = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast.error("Question and answer are required");
      return;
    }
    const entry: KnowledgeEntry = {
      id: Date.now().toString(),
      question: newQuestion,
      answer: newAnswer,
      scope: "org",
    };
    setEntries((prev) => [entry, ...prev]);
    setNewQuestion("");
    setNewAnswer("");
    setIsAdding(false);
    toast.success("Knowledge entry added");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Knowledge Base</h1>
          <p className="text-muted-foreground">
            These Q&A pairs power the AI assistant that answers visitor questions during tours.
          </p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="mr-2 h-4 w-4" />
          Add Entry
        </Button>
      </div>

      {/* How it works */}
      <Card className="border-blue-100 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Brain className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">How the AI assistant works</p>
              <p className="mt-1 text-blue-700">
                When a visitor texts a question during their tour, the AI reads your knowledge base
                to craft an accurate, concise answer (under 300 characters for SMS). Add Q&A pairs
                for pricing, amenities, policies, neighborhood info, and anything visitors commonly ask.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add new entry form */}
      {isAdding && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">New Knowledge Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>Question</Label>
              <Input
                placeholder="e.g., What is the monthly rent?"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Answer</Label>
              <Textarea
                placeholder="e.g., 2-bedroom units start at $1,850/month. 3-bedroom units start at $2,400/month..."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd}>
                <Save className="mr-1.5 h-3.5 w-3.5" />
                Save Entry
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNewQuestion("");
                  setNewAnswer("");
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entries */}
      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <Brain className="mb-3 h-12 w-12 text-muted-foreground/30" />
            <h3 className="font-semibold">No knowledge entries yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add Q&A pairs to help the AI answer visitor questions.
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-4">
                {editingId === entry.id ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label>Question</Label>
                      <Input value={editQuestion} onChange={(e) => setEditQuestion(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>Answer</Label>
                      <Textarea value={editAnswer} onChange={(e) => setEditAnswer(e.target.value)} rows={3} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSave(entry.id)}>
                        <Save className="mr-1.5 h-3.5 w-3.5" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{entry.question}</p>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {entry.scope}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{entry.answer}</p>
                    </div>
                    <div className="flex flex-shrink-0 gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)} className="h-8 w-8">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(entry.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
