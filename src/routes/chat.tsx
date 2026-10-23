import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { BrainCircuit, MessagesSquare, Plus, SendHorizontal, Copy } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { streamAI } from "@/lib/ai-client";
import { addActivity } from "@/lib/history";
import { cn } from "@/lib/utils";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/chat")({
  head: () => pageHead("AI Workplace Chatbot", "Chat with an AI workplace assistant about communication, productivity, research and planning."),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };
const KEY = "awpa-chat";
const PROMPTS = [
  "Draft a professional email",
  "Create a weekly schedule",
  "Summarise meeting notes",
  "Improve workplace productivity",
  "Analyse a business topic",
];

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      setMessages(JSON.parse(localStorage.getItem(KEY) || "[]"));
    } catch {
      /* ignore */
    }
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  const persist = (m: Msg[]) => localStorage.setItem(KEY, JSON.stringify(m));

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    persist(next);
    setInput("");
    setBusy(true);
    try {
      const full = await streamAI({ tool: "chat", messages: next }, (t) =>
        setMessages([...next, { role: "assistant", content: t }]),
      );
      const done: Msg[] = [...next, { role: "assistant", content: full }];
      setMessages(done);
      persist(done);
      addActivity({ type: "chat", title: content.slice(0, 80), content: full });
    } catch (e) {
      setMessages(next);
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const reset = () => {
    setMessages([]);
    persist([]);
    inputRef.current?.focus();
  };
  const lastIsUser = messages[messages.length - 1]?.role === "user";

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <PageHeader icon={MessagesSquare} title="AI Workplace Chatbot" description="Your interactive assistant for everyday work." />
        <Button variant="outline" onClick={reset} disabled={busy || !messages.length}><Plus className="h-4 w-4" />New chat</Button>
      </div>
      <Card className="flex h-[calc(100vh-15rem)] min-h-[480px] flex-col gap-0 overflow-hidden p-0 shadow-soft">
        <div className="flex-1 space-y-6 overflow-y-auto p-5" aria-live="polite">
          {messages.length === 0 && (
            <div className="grid h-full place-items-center text-center">
              <div>
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground"><BrainCircuit className="h-7 w-7" /></span>
                <p className="mt-4 font-display text-lg font-semibold">How can I help you work smarter today?</p>
                <div className="mt-6 flex max-w-xl flex-wrap justify-center gap-2">
                  {PROMPTS.map((p) => (
                    <Button key={p} variant="secondary" size="sm" className="rounded-full" onClick={() => send(p)}>{p}</Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.content}</div>
              </div>
            ) : (
              <div key={i} className="group flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-primary"><BrainCircuit className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <div className="ai-prose"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                  <Button variant="ghost" size="sm" className="mt-1 h-7 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100" onClick={() => navigator.clipboard.writeText(m.content).then(() => toast.success("Copied"))}>
                    <Copy className="h-3.5 w-3.5" />Copy
                  </Button>
                </div>
              </div>
            ),
          )}
          {busy && lastIsUser && (
            <div className="flex items-center gap-3" aria-label="Assistant is typing">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-primary"><BrainCircuit className="h-4 w-4" /></span>
              <span className="flex gap-1">
                {[0, 1, 2].map((d) => <span key={d} className="typing-dot h-2 w-2 rounded-full bg-primary" style={{ animationDelay: `${d * 0.15}s` }} />)}
              </span>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex items-end gap-2 border-t bg-muted/40 p-3"
        >
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Message your assistant… (Shift+Enter for new line)"
            aria-label="Message"
            rows={1}
            className="max-h-40 min-h-11 resize-none bg-background"
          />
          <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={busy || !input.trim()} aria-label="Send message">
            <SendHorizontal className={cn("h-5 w-5", busy && "animate-pulse")} />
          </Button>
        </form>
      </Card>
    </>
  );
}
