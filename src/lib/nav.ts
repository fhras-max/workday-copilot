import {
  LayoutDashboard,
  Mail,
  NotebookPen,
  CalendarClock,
  Microscope,
  MessagesSquare,
  BarChart3,
  ShieldCheck,
  Info,
} from "lucide-react";

export const NAV = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, desc: "Overview and recent activity" },
  { title: "Email Generator", url: "/email", icon: Mail, desc: "Draft professional emails in any tone" },
  { title: "Meeting Summariser", url: "/meetings", icon: NotebookPen, desc: "Turn notes into decisions and actions" },
  { title: "Task Planner", url: "/tasks", icon: CalendarClock, desc: "Prioritise and schedule your workload" },
  { title: "Research Assistant", url: "/research", icon: Microscope, desc: "Business insights from topics or articles" },
  { title: "AI Chatbot", url: "/chat", icon: MessagesSquare, desc: "Ask your workplace assistant anything" },
  { title: "Analytics", url: "/analytics", icon: BarChart3, desc: "Usage trends across tools" },
  { title: "Responsible AI", url: "/responsible-ai", icon: ShieldCheck, desc: "How to use AI output safely" },
  { title: "About", url: "/about", icon: Info, desc: "Project overview and technologies" },
] as const;
