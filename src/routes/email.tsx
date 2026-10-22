import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { ResultPanel } from "@/components/ResultPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGenerator } from "@/hooks/use-generator";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/email")({
  head: () => pageHead("Smart Email Generator", "Generate professional workplace emails in formal, friendly, persuasive or apologetic tones."),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Persuasive", "Professional", "Apologetic"];

function EmailPage() {
  const g = useGenerator("email");
  const [f, setF] = useState({ recipient: "", subject: "", purpose: "", keyInfo: "", outcome: "", tone: "Professional" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    g.run(f, `Email to ${f.recipient}: ${f.subject}`);
  };
  return (
    <>
      <PageHeader icon={Mail} title="Smart Email Generator" description="Generate professional workplace emails in seconds." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card className="h-fit p-6 shadow-soft">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="recipient">Recipient Name</Label><Input id="recipient" required value={f.recipient} onChange={set("recipient")} placeholder="e.g. Thandi Mokoena" /></div>
            <div className="space-y-2"><Label htmlFor="subject">Subject</Label><Input id="subject" required value={f.subject} onChange={set("subject")} placeholder="e.g. Q4 budget review" /></div>
            <div className="space-y-2"><Label htmlFor="purpose">Purpose</Label><Input id="purpose" required value={f.purpose} onChange={set("purpose")} placeholder="e.g. Request a meeting" /></div>
            <div className="space-y-2"><Label htmlFor="keyInfo">Key Information</Label><Textarea id="keyInfo" value={f.keyInfo} onChange={set("keyInfo")} placeholder="Facts, dates, figures to include" /></div>
            <div className="space-y-2"><Label htmlFor="outcome">Desired Outcome</Label><Input id="outcome" value={f.outcome} onChange={set("outcome")} placeholder="e.g. Confirm a time by Friday" /></div>
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={f.tone} onValueChange={(tone) => setF({ ...f, tone })}>
                <SelectTrigger id="tone"><SelectValue /></SelectTrigger>
                <SelectContent>{TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={g.loading}>
              {g.loading && <Loader2 className="h-4 w-4 animate-spin" />}Generate Email
            </Button>
          </form>
        </Card>
        <ResultPanel title="Generated Email" content={g.content} loading={g.loading} error={g.error} onChange={g.setContent} onRegenerate={g.regenerate} emptyHint="Fill in the form and your email will appear here." />
      </div>
    </>
  );
}
