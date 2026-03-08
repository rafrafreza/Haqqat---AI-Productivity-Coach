import { LayoutDashboard, CheckCircle2, Activity, BarChart3, Lightbulb, Target, ListTodo, Timer, ClipboardCheck, Battery, Scale, Search, Mail, Radar, Trophy, Sun, LogOut, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";


import { useProfile } from "@/hooks/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const sections = [
  {
    title: "Core",
    links: [
      { to: "/", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/ritual", icon: Sun, label: "Morning Ritual" },
      { to: "/tasks", icon: ListTodo, label: "Tasks" },
      { to: "/goals", icon: Target, label: "Goals" },
      { to: "/routines", icon: CheckCircle2, label: "Routines" },
      { to: "/focus", icon: Timer, label: "Focus Timer" },
    ],
  },
  {
    title: "Unique",
    links: [
      { to: "/energy", icon: Battery, label: "Energy Map" },
      { to: "/decisions", icon: Scale, label: "Decision Journal" },
      { to: "/procrastination", icon: Search, label: "Procrastination" },
      { to: "/letters", icon: Mail, label: "Future Letters" },
      { to: "/balance", icon: Radar, label: "Life Balance" },
    ],
  },
  {
    title: "Progress",
    links: [
      { to: "/xp", icon: Trophy, label: "Level Up" },
      { to: "/activities", icon: Activity, label: "Activity Log" },
      { to: "/analytics", icon: BarChart3, label: "Analytics" },
      { to: "/reviews", icon: ClipboardCheck, label: "Weekly Review" },
      { to: "/insights", icon: Lightbulb, label: "Insights" },
    ],
  },
];

export default function Sidebar() {
  const { signOut, user } = useAuth();
  
  const { profile } = useProfile();
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card min-h-screen p-6 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-display text-primary tracking-tight">DayFlow</h1>
        <p className="text-xs text-muted-foreground mt-1">Track · Focus · Achieve</p>
      </div>
      <nav className="flex flex-col gap-6 flex-1">
        {sections.map(section => (
          <div key={section.title}>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2 px-3">{section.title}</p>
            <div className="flex flex-col gap-0.5">
              {section.links.map(({ to, icon: Icon, label }) => {
                return (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary/10 text-primary shadow-glow"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )
                    }
                  >
                    <Icon size={16} />
                    <span className="flex-1">{label}</span>
                    
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}

      </nav>
      <div className="mt-auto pt-6 border-t border-border">
        <NavLink to="/settings" className="flex items-center gap-3 mb-3 p-1 rounded-lg hover:bg-secondary transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{displayName}</p>
            <p className="text-[10px] text-muted-foreground">Free Plan</p>
          </div>
          <Settings size={14} className="text-muted-foreground" />
        </NavLink>
        <button onClick={signOut} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full px-3 py-1.5">
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
