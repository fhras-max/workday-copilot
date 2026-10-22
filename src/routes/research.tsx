import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Microscope, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { ResultPanel } from "@/components/ResultPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGenerator } from "@/hooks/use-generator";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/research")({
  head: () => pageHead("AI Research Assistant", "Summarise research topics or articles into findings, opportunities, risks and recommendations."),
  component: ResearchPage,
});

function ResearchPage() {
  const g = useGenerator("research");
  const [mode, setMode] = useState<"topic" | "article">("topic");
  const [text, setText] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    g.run({ mode, text }, mode === "topic" ? `Research: ${text}` : `Article analysis: ${text.slice(0, 50)}…`);
  };
  return (
    <>
      <PageHeader icon={Microscope} title="AI Research Assistant" description="Summarise research and generate business insights." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card className="h-fit p-6 shadow-soft">
          <form onSubmit={submit} className="space-y-4">
            <Tabs value={mode} onValueChange={(v) => { setMode(v as "topic" | "article"); setText(""); }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="topic">Research Topic</TabsTrigger>
                <TabsTrigger value="article">Article Text</TabsTrigger>
              </TabsList>
            </Tabs>
            {mode === "topic" ? (
              <div className="space-y-2"><Label htmlFor="topic">Topic</Label><Input id="topic" required value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Hybrid work adoption in South African banking" /></div>
            ) : (
              <div className="space-y-2"><Label htmlFor="article">Article</Label><Textarea id="article" required value={text} onChange={(e) => setText(e.target.value)} className="min-h-[260px]" placeholder="Paste the article text here" /></div>
            )}
            <Button type="submit" className="w-full" disabled={g.loading}>
              {g.loading && <Loader2 className="h-4 w-4 animate-spin" />}Analyse Research
            </Button>
          </form>
        </Card>
        <ResultPanel title="Research Insights" content={g.content} loading={g.loading} error={g.error} onChange={g.setContent} onRegenerate={g.regenerate} emptyHint="Executive summary, key findings, recommendations and conclusion will appear here." />
      </div>
    </>
  );
}
