import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { useHistory, type ActivityType } from "@/lib/history";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/analytics")({
  head: () => pageHead("Analytics", "Charts of emails generated, summaries created, tasks planned, research requests and chat interactions."),
  component: AnalyticsPage,
});

const SERIES: { type: ActivityType; label: string; color: string }[] = [
  { type: "email", label: "Emails generated", color: "var(--chart-1)" },
  { type: "meeting", label: "Summaries created", color: "var(--chart-2)" },
  { type: "task", label: "Tasks planned", color: "var(--chart-3)" },
  { type: "research", label: "Research requests", color: "var(--chart-4)" },
  { type: "chat", label: "Chat interactions", color: "var(--chart-5)" },
];

const tooltipStyle = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--popover-foreground)" };

function AnalyticsPage() {
  const history = useHistory();
  const totals = SERIES.map((s) => ({ ...s, value: history.filter((h) => h.type === s.type).length }));
  const daily = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    return days.map((d) => {
      const end = d.getTime() + 864e5;
      const row: Record<string, string | number> = { day: d.toLocaleDateString(undefined, { weekday: "short" }) };
      for (const s of SERIES) row[s.label] = history.filter((h) => h.type === s.type && h.createdAt >= d.getTime() && h.createdAt < end).length;
      return row;
    });
  }, [history]);
  const total = totals.reduce((a, b) => a + b.value, 0);

  return (
    <>
      <PageHeader icon={BarChart3} title="Analytics" description="Track how AI is helping your productivity." />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {totals.map((t) => (
          <Card key={t.type} className="gap-1 p-5 shadow-soft">
            <span className="h-1.5 w-8 rounded-full" style={{ background: t.color }} />
            <p className="mt-2 font-display text-3xl font-semibold">{t.value}</p>
            <p className="text-sm text-muted-foreground">{t.label}</p>
          </Card>
        ))}
      </div>
      {total === 0 && <p className="mt-6 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">No usage yet — charts will fill in as you use the tools.</p>}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5 shadow-soft">
          <h2 className="font-semibold">Usage by tool</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={totals}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>{totals.map((t) => <Cell key={t.type} fill={t.color} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5 shadow-soft">
          <h2 className="font-semibold">Share of activity</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={total ? totals : [{ label: "No data", value: 1, color: "var(--muted)" }]} dataKey="value" nameKey="label" innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {(total ? totals : [{ color: "var(--muted)" }]).map((t, i) => <Cell key={i} fill={t.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5 shadow-soft lg:col-span-2">
          <h2 className="font-semibold">Last 7 days</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fill: "var(--muted-foreground)" }} />
                <YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {SERIES.map((s) => <Line key={s.type} type="monotone" dataKey={s.label} stroke={s.color} strokeWidth={2} dot={false} />)}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  );
}
