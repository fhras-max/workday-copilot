import { useRef, useState } from "react";
import { toast } from "sonner";
import { streamAI } from "@/lib/ai-client";
import { addActivity, type ActivityType } from "@/lib/history";

export function useGenerator(tool: Exclude<ActivityType, "chat">) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const last = useRef<{ input: Record<string, string>; title: string } | null>(null);

  const run = async (input: Record<string, string>, title: string) => {
    last.current = { input, title };
    setLoading(true);
    setError(null);
    setContent("");
    try {
      const full = await streamAI({ tool, input }, setContent);
      addActivity({ type: tool, title, content: full });
      toast.success("Done! Saved to your history.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  const regenerate = () => last.current && run(last.current.input, last.current.title);
  return { content, setContent, loading, error, run, regenerate };
}
