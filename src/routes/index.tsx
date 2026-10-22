import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Mail, NotebookPen, CalendarClock, Microscope, Clock, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NAV } from "@/lib/nav";
import { clearHistory, TYPE_LABEL, TYPE_ROUTE, useHistory } from "@/lib/history";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => pageHead("Dashboard", "Your AI workplace dashboard: stats, quick access to every AI tool, and recent activity."),
  component: Dashboard,
});

function Dashboard() {
  const history = useHistory();
  const count = (t: string) => history.filter((h) => h.type === t).length;
  const stats = [
    { label: "Emails Generated", value: count("email"), icon: Mail },
    { label: "Meetings Summarised", value: count("meeting"), icon: NotebookPen },
    { label: "Tasks Planned", value: count("task"), icon: CalendarClock },
    { label: "Research Requests", value: count("research"), icon: Microscope },
  ];
  const quick = NAV.slice(1, 6);
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl bg-hero p-8 text-primary-foreground shadow-lift md:p-12">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-highlight/25 blur-3xl" aria-hidden />
        <p className="text-sm font-semibold uppercase tracking-widest text-highlight">Good to see you</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold md:text-4xl">Welcome to AI Workplace Productivity Assistant</h1>
        <p className="mt-3 max-w-xl text-primary-foreground/85">Automate workplace tasks and increase productivity using AI.</p>
        <Button asChild className="mt-6 bg-highlight text-highlight-foreground hover:bg-highlight/90">
          <Link to="/chat">Ask the assistant <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </section>

      <section aria-label="Statistics" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="gap-3 p-5 shadow-soft">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary"><s.icon className="h-5 w-5" /></span>
            <p className="font-display text-3xl font-semibold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Quick access</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {quick.map((q) => (
              <Link key={q.url} to={q.url} className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Card className="h-full gap-2 p-5 shadow-soft transition-all group-hover:-translate-y-0.5 group-hover:shadow-lift">
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground"><q.icon className="h-5 w-5" /></span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="mt-2 font-semibold">{q.title}</p>
                  <p className="text-sm text-muted-foreground">{q.desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent activity</h2>
            {history.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearHistory}><Trash2 className="h-4 w-4" />Clear</Button>
            )}
          </div>
          <Card className="gap-0 p-2 shadow-soft">
            {history.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No activity yet. Try one of the tools to get started.</p>}
            {history.slice(0, 8).map((h) => (
              <Link key={h.id} to={TYPE_ROUTE[h.type]} className="flex items-start gap-3 rounded-lg p-3 hover:bg-muted">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{h.title}</span>
                  <span className="text-xs text-muted-foreground">{TYPE_LABEL[h.type]} · {new Date(h.createdAt).toLocaleString()}</span>
                </span>
              </Link>
            ))}
          </Card>
        </section>
      </div>
    </div>
  );
}
