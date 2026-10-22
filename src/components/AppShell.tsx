import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Menu, Moon, Search, Sun, BrainCircuit } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NAV } from "@/lib/nav";
import { TYPE_LABEL, TYPE_ROUTE, useHistory } from "@/lib/history";
import { cn } from "@/lib/utils";

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3 px-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
        <BrainCircuit className="h-5 w-5" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-sm font-semibold text-sidebar-accent-foreground">WorkPilot AI</span>
        <span className="block text-[11px] text-sidebar-foreground/70">Productivity Assistant</span>
      </span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = path === item.url;
        return (
          <Link
            key={item.url}
            to={item.url}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className={cn("h-4 w-4", active && "text-sidebar-primary")} />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-8 bg-sidebar p-4">
      <Brand />
      <NavList onNavigate={onNavigate} />
      <p className="mt-auto rounded-lg border border-sidebar-border p-3 text-xs text-sidebar-foreground/80">
        AI output may be inaccurate. Always apply human judgement.
      </p>
    </div>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("awpa-theme", next ? "dark" : "light");
  };
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

function GlobalSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const history = useHistory();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const term = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (!term) return { pages: [], items: [] };
    return {
      pages: NAV.filter((n) => (n.title + n.desc).toLowerCase().includes(term)),
      items: history.filter((h) => (h.title + h.content).toLowerCase().includes(term)).slice(0, 6),
    };
  }, [term, history]);
  const close = () => {
    setOpen(false);
    setQ("");
  };
  return (
    <div ref={ref} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => e.key === "Escape" && close()}
        placeholder="Search tools and history…"
        aria-label="Search tools and history"
        className="h-10 bg-muted/60 pl-9"
      />
      {open && term && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border bg-popover p-2 shadow-lift">
          {results.pages.length + results.items.length === 0 && (
            <p className="p-3 text-sm text-muted-foreground">No results for “{q}”.</p>
          )}
          {results.pages.length > 0 && <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">Tools</p>}
          {results.pages.map((p) => (
            <Link key={p.url} to={p.url} onClick={close} className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent">
              <p.icon className="h-4 w-4 text-primary" /> {p.title}
            </Link>
          ))}
          {results.items.length > 0 && <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">History</p>}
          {results.items.map((h) => (
            <Link key={h.id} to={TYPE_ROUTE[h.type]} onClick={close} className="block rounded-md px-2 py-2 text-sm hover:bg-accent">
              <span className="block truncate">{h.title}</span>
              <span className="text-xs text-muted-foreground">{TYPE_LABEL[h.type]}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <SidebarBody />
      </aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-0 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarBody onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur md:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
          <GlobalSearch />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <span className="hidden h-9 w-9 place-items-center rounded-full bg-highlight text-sm font-bold text-highlight-foreground sm:grid" aria-hidden>
              YOU
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="mb-8 flex items-start gap-4">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-primary">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
