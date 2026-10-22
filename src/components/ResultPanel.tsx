import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Download, FileDown, Pencil, RefreshCw, Check, Sparkle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadText, exportPdf } from "@/lib/export";

type Props = {
  title: string;
  content: string;
  loading: boolean;
  error?: string | null;
  onChange: (v: string) => void;
  onRegenerate?: () => void;
  emptyHint: string;
};

export function ResultPanel({ title, content, loading, error, onChange, onRegenerate, emptyHint }: Props) {
  const [editing, setEditing] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };
  const has = content.trim().length > 0;
  return (
    <Card className="flex min-h-[420px] flex-col gap-0 overflow-hidden p-0 shadow-soft">
      <div className="flex flex-wrap items-center gap-2 border-b px-5 py-3">
        <h2 className="mr-auto text-base font-semibold">{title}</h2>
        {has && !loading && (
          <>
            <Button size="sm" variant="ghost" onClick={copy}><Copy className="h-4 w-4" />Copy</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing((e) => !e)} aria-pressed={editing}>
              {editing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              {editing ? "Done" : "Edit"}
            </Button>
            {onRegenerate && (
              <Button size="sm" variant="ghost" onClick={onRegenerate}><RefreshCw className="h-4 w-4" />Regenerate</Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => downloadText(`${title.toLowerCase().replace(/\s+/g, "-")}.md`, content)}>
              <Download className="h-4 w-4" />Download
            </Button>
            <Button size="sm" variant="outline" onClick={() => exportPdf(title, content).then(() => toast.success("PDF exported"))}>
              <FileDown className="h-4 w-4" />PDF
            </Button>
          </>
        )}
      </div>
      <div className="flex-1 p-5" aria-live="polite">
        {error && <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {loading && !has && (
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><Sparkle className="h-4 w-4 animate-spin text-primary" />AI is working…</p>
            <Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /><Skeleton className="h-4 w-2/3" />
          </div>
        )}
        {!loading && !has && !error && (
          <div className="grid h-full place-items-center py-16 text-center text-sm text-muted-foreground">{emptyHint}</div>
        )}
        {has && (editing ? (
          <Textarea value={content} onChange={(e) => onChange(e.target.value)} className="min-h-[380px] font-mono text-sm" aria-label="Edit result" />
        ) : (
          <div className="ai-prose"><ReactMarkdown>{content}</ReactMarkdown></div>
        ))}
      </div>
    </Card>
  );
}
