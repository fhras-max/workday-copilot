import { createFileRoute } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NAV } from "@/lib/nav";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => pageHead("About", "Project overview, features and technologies behind the AI Workplace Productivity Assistant."),
  component: AboutPage,
});

const TECH = ["React", "TypeScript", "Tailwind CSS", "ShadCN UI", "Lucide Icons", "OpenAI API", "Lovable AI"];

function AboutPage() {
  return (
    <>
      <PageHeader icon={Info} title="About" description="Project overview" />
      <div className="space-y-6">
        <Card className="p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Project Overview</h2>
          <p className="mt-2 text-muted-foreground">
            The AI Workplace Productivity Assistant is an integrated productivity platform designed to automate workplace tasks using Artificial Intelligence.
          </p>
        </Card>
        <Card className="p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Features</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {NAV.slice(1, 6).map((n) => (
              <li key={n.url} className="flex items-start gap-3 rounded-lg bg-muted p-4">
                <n.icon className="mt-0.5 h-5 w-5 text-primary" />
                <span><span className="block font-medium">{n.title}</span><span className="text-sm text-muted-foreground">{n.desc}</span></span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Technologies</h2>
          <div className="mt-4 flex flex-wrap gap-2">{TECH.map((t) => <Badge key={t} variant="secondary" className="px-3 py-1 text-sm">{t}</Badge>)}</div>
        </Card>
      </div>
    </>
  );
}
