import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarClock, Loader2 } from "lucide-react";
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

export const Route = createFileRoute("/tasks")({
  head: () => pageHead("AI Task Planner", "Prioritise tasks, estimate time and build daily and weekly schedules with AI."),
  component: TaskPage,
});

function TaskPage() {
  const g = useGenerator("task");
  const [f, setF] = useState({ tasks: "", hours: "8", startDate: new Date().toISOString().slice(0, 10), priority: "Medium" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = f.tasks.split("\n").filter((l) => l.trim()).length;
    g.run(f, `Task plan: ${n} task${n === 1 ? "" : "s"} from ${f.startDate}`);
  };
  return (
    <>
      <PageHeader icon={CalendarClock} title="AI Task Planner" description="Organise workloads and schedules with an AI planner." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card className="h-fit p-6 shadow-soft">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tasks">Task List</Label>
              <Textarea id="tasks" required value={f.tasks} onChange={(e) => setF({ ...f, tasks: e.target.value })} className="min-h-[200px]" placeholder={"One task per line, e.g.\nPrepare Q4 report (due Friday)\nReview supplier contracts\nTeam 1:1s"} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="hours">Working hours / day</Label><Input id="hours" type="number" min={1} max={16} required value={f.hours} onChange={(e) => setF({ ...f, hours: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="start">Start Date</Label><Input id="start" type="date" required value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select value={f.priority} onValueChange={(priority) => setF({ ...f, priority })}>
                <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
                <SelectContent>{["High", "Medium", "Low"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={g.loading}>
              {g.loading && <Loader2 className="h-4 w-4 animate-spin" />}Create Schedule
            </Button>
          </form>
        </Card>
        <ResultPanel title="Your Work Plan" content={g.content} loading={g.loading} error={g.error} onChange={g.setContent} onRegenerate={g.regenerate} emptyHint="Priority matrix, daily schedule, weekly planner and recommendations will appear here." />
      </div>
    </>
  );
}
