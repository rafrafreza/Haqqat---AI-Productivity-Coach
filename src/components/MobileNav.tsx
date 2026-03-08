import { LayoutDashboard, CheckCircle2, Activity, BarChart3, Lightbulb } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Home" },
  { to: "/routines", icon: CheckCircle2, label: "Routines" },
  { to: "/activities", icon: Activity, label: "Log" },
  { to: "/analytics", icon: BarChart3, label: "Stats" },
  { to: "/insights", icon: Lightbulb, label: "Tips" },
];

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 flex justify-around py-2 px-1">
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-0.5 text-[10px] font-medium px-2 py-1 rounded-lg transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
