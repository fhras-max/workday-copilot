import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { NotebookPen, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { ResultPanel } from "@/components/ResultPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGenerator } from "@/hooks/use-generator";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/meetings")({
  head: () => pageHead("Meeting Notes Summariser", "Convert long meeting notes into executive summaries, decisions, action items and deadlines."),
  component: MeetingPage,
});

function MeetingPage() {
  const g = useGenerator("meeting");
  const [notes, setNotes] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    g.run({ notes }, `Meeting summary: ${notes.trim().slice(0, 50)}…`);
  };
  return (
    <>
      <PageHeader icon={NotebookPen} title="Meeting Notes Summariser" description="Convert long meeting notes into actionable summaries." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="h-fit p-6 shadow-soft">
          <form onSubmit={submit} className="space-y-4">
            <Label htmlFor="notes">Meeting notes</Label>
            <Textarea id="notes" required minLength={20} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Paste meeting notes here" className="min-h-[340px]" />
            <p className="text-xs text-muted-foreground">{notes.length.toLocaleString()} characters</p>
            <Button type="submit" className="w-full" disabled={g.loading}>
              {g.loading && <Loader2 className="h-4 w-4 animate-spin" />}Summarise Meeting
            </Button>
          </form>
        </Card>
        <ResultPanel title="Meeting Summary" content={g.content} loading={g.loading} error={g.error} onChange={g.setContent} onRegenerate={g.regenerate} emptyHint="Executive summary, decisions, action items, deadlines and next steps will appear here." />
      </div>
    </>
  );
}
