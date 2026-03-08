import { LayoutDashboard, CheckCircle2, Activity, BarChart3, Lightbulb } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/routines", icon: CheckCircle2, label: "Routines" },
  { to: "/activities", icon: Activity, label: "Activity Log" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/insights", icon: Lightbulb, label: "Insights" },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card min-h-screen p-6">
      <div className="mb-10">
        <h1 className="text-2xl font-display text-primary tracking-tight">DayFlow</h1>
        <p className="text-xs text-muted-foreground mt-1">Track · Analyse · Improve</p>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary shadow-glow"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground">Built for productivity</p>
      </div>
    </aside>
  );
}
