import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

export type ToolName = "email" | "meeting" | "task" | "research" | "chat";

const SYSTEM: Record<ToolName, string> = {
  email:
    "You are a professional workplace communication assistant. Write clear, well-structured workplace emails. Output in Markdown.",
  meeting:
    "You are an AI meeting assistant. Analyse meeting notes and produce structured, actionable summaries in Markdown.",
  task: "You are an expert workplace productivity planner. Produce realistic, well-organised plans in Markdown, using tables where helpful.",
  research:
    "You are a professional business research analyst. Responses must be business-focused, balanced and structured in Markdown.",
  chat: `You are an AI Workplace Productivity Assistant.
Your role is to assist professionals with:
- Workplace communication
- Productivity
- Task management
- Research
- Professional writing
- Workplace problem solving
Respond professionally and concisely. Use Markdown formatting.`,
};

const s = (v: unknown) => String(v ?? "").slice(0, 20000).trim() || "(not provided)";

type Input = Partial<Record<"recipient"|"subject"|"purpose"|"keyInfo"|"outcome"|"tone"|"notes"|"tasks"|"hours"|"startDate"|"priority"|"mode"|"text", unknown>>;
function buildPrompt(tool: ToolName, i: Input): string {
  switch (tool) {
    case "email":
      return `Generate a professional email using the following information:

Recipient: ${s(i.recipient)}
Subject: ${s(i.subject)}
Purpose: ${s(i.purpose)}
Key Information: ${s(i.keyInfo)}
Desired Outcome: ${s(i.outcome)}
Tone: ${s(i.tone)}

Structure:
- Subject Line (start with "**Subject:** ...")
- Greeting
- Introduction
- Main Message
- Call To Action
- Professional Closing

Ensure the tone matches the selected style. Output only the email.`;
    case "meeting":
      return `Analyse the meeting notes and provide, as Markdown "##" sections:
1. Executive Summary
2. Key Decisions
3. Action Items (table with Action, Responsible Person, Deadline)
4. Responsible Persons
5. Deadlines
6. Risks
7. Next Steps

Meeting notes:
"""
${s(i.notes)}
"""`;
    case "task":
      return `Using the tasks provided:
1. Prioritise work (output a "## Priority Matrix" using the Eisenhower quadrants)
2. Estimate time requirements
3. Build a daily schedule ("## Daily Schedule" table)
4. Build a weekly schedule ("## Weekly Planner" table)
5. Recommend productivity improvements ("## Productivity Recommendations")
6. Identify potential bottlenecks ("## Potential Bottlenecks")

Tasks:
${s(i.tasks)}

Available working hours per day: ${s(i.hours)}
Start date: ${s(i.startDate)}
Overall priority level: ${s(i.priority)}`;
    case "research":
      return `Generate, as Markdown "##" sections:
1. Executive Summary
2. Key Findings
3. Opportunities
4. Risks
5. Recommendations
6. Conclusion

Ensure the response is business-focused.

${i.mode === "article" ? `Article text to analyse:\n"""\n${s(i.text)}\n"""` : `Research topic: ${s(i.text)}`}`;
    default:
      return "";
  }
}

function errorMessage(err: unknown): string {
  const e = err as { statusCode?: number; message?: string };
  if (e?.statusCode === 429) return "The AI service is busy right now. Please wait a moment and try again.";
  if (e?.statusCode === 402) return "AI credits have run out for this workspace. Please add credits to continue.";
  if (e?.statusCode === 403) return "AI access is currently blocked for this workspace.";
  return "The AI request failed. Please try again.";
}

export async function handleAI(request: Request): Promise<Response> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return Response.json({ error: "AI is not configured." }, { status: 500 });

  let body: { tool?: ToolName; input?: Input; messages?: { role: string; content: string }[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const tool = body.tool;
  if (!tool || !(tool in SYSTEM)) return Response.json({ error: "Unknown tool." }, { status: 400 });

  let messages: ModelMessage[];
  if (tool === "chat") {
    messages = (body.messages ?? [])
      .filter((m) => (m.role === "user" || m.role === "assistant") && m.content)
      .slice(-30)
      .map((m) => ({ role: m.role as "user" | "assistant", content: String(m.content).slice(0, 20000) }));
    if (!messages.length) return Response.json({ error: "Message is empty." }, { status: 400 });
  } else {
    messages = [{ role: "user", content: buildPrompt(tool, body.input ?? {}) }];
  }

  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });

  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    instructions: SYSTEM[tool],
    messages,
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const part of result.fullStream) {
          if (part.type === "text-delta") controller.enqueue(encoder.encode(part.text));
          else if (part.type === "error") {
            controller.enqueue(encoder.encode(`\u0000ERROR:${errorMessage(part.error)}`));
            break;
          }
        }
      } catch (err) {
        if (!request.signal.aborted) controller.enqueue(encoder.encode(`\u0000ERROR:${errorMessage(err)}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" } });
}
