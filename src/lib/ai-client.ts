export type AIRequest =
  | { tool: "email" | "meeting" | "task" | "research"; input: Record<string, string> }
  | { tool: "chat"; messages: { role: "user" | "assistant"; content: string }[] };

/** Streams AI text from the server, calling onDelta with the accumulated text. */
export async function streamAI(req: AIRequest, onDelta: (full: string) => void, signal?: AbortSignal) {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
    signal: signal ?? null,
  });
  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "The AI request failed. Please try again.");
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    full += decoder.decode(value, { stream: true });
    const errIdx = full.indexOf("\u0000ERROR:");
    if (errIdx >= 0) throw new Error(full.slice(errIdx + 7));
    onDelta(full);
  }
  if (!full.trim()) throw new Error("The AI returned an empty response. Please try again.");
  return full;
}
