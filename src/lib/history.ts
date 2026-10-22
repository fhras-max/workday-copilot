import { useSyncExternalStore } from "react";

export type ActivityType = "email" | "meeting" | "task" | "research" | "chat";
export type Activity = { id: string; type: ActivityType; title: string; content: string; createdAt: number };

const KEY = "awpa-history";
const listeners = new Set<() => void>();
let cache: Activity[] | null = null;
const EMPTY: Activity[] = [];

function read(): Activity[] {
  if (typeof window === "undefined") return EMPTY;
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    cache = [];
  }
  return cache!;
}

function write(next: Activity[]) {
  cache = next.slice(0, 200);
  localStorage.setItem(KEY, JSON.stringify(cache));
  listeners.forEach((l) => l());
}

export function addActivity(a: Omit<Activity, "id" | "createdAt">) {
  write([{ ...a, id: crypto.randomUUID(), createdAt: Date.now() }, ...read()]);
}
export function removeActivity(id: string) {
  write(read().filter((a) => a.id !== id));
}
export function clearHistory() {
  write([]);
}

export function useHistory(): Activity[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => EMPTY,
  );
}

export const TYPE_LABEL: Record<ActivityType, string> = {
  email: "Email",
  meeting: "Meeting summary",
  task: "Task plan",
  research: "Research",
  chat: "Chat",
};
export const TYPE_ROUTE: Record<ActivityType, string> = {
  email: "/email",
  meeting: "/meetings",
  task: "/tasks",
  research: "/research",
  chat: "/chat",
};
