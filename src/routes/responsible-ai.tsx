import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, AlertTriangle, CheckCircle2, UserCheck, Scale, Lock, LifeBuoy } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/responsible-ai")({
  head: () => pageHead("Responsible AI Notice", "How to use AI-generated workplace content responsibly: verification, human judgement and privacy."),
  component: ResponsiblePage,
});

const POINTS = [
  { icon: AlertTriangle, text: "AI-generated content may contain inaccuracies." },
  { icon: CheckCircle2, text: "Users must verify important information." },
  { icon: UserCheck, text: "Human judgement should always be applied." },
  { icon: Scale, text: "The system should not be used for legal, medical, or financial decisions." },
  { icon: Lock, text: "Sensitive information should not be shared with AI systems." },
  { icon: LifeBuoy, text: "This application is intended to support decision-making, not replace professional expertise." },
];

function ResponsiblePage() {
  return (
    <>
      <PageHeader icon={ShieldCheck} title="Responsible AI Notice" description="This application uses Artificial Intelligence to assist with workplace productivity tasks." />
      <Card className="border-highlight/50 bg-highlight/10 p-6">
        <h2 className="text-lg font-semibold">Important</h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {POINTS.map((p) => (
            <li key={p.text} className="flex gap-3 rounded-xl bg-card p-4 shadow-soft">
              <p.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span>{p.text}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
