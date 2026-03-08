import { LayoutDashboard, Sun, ListTodo, Timer, Trophy, Menu, X, CheckCircle2, Activity, BarChart3, Lightbulb, Target, ClipboardCheck, Battery, Scale, Search, Mail, Radar } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback } from "react";

const bottomLinks = [
  { to: "/", icon: LayoutDashboard, label: "Home" },
  { to: "/ritual", icon: Sun, label: "Ritual" },
  { to: "/tasks", icon: ListTodo, label: "Tasks" },
  { to: "/focus", icon: Timer, label: "Focus" },
];

const allSections = [
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

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [swipeY, setSwipeY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    currentY.current = startY.current;
    setDragging(true);
    setSwipeY(0);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging) return;
    currentY.current = e.touches[0].clientY;
    const delta = currentY.current - startY.current;
    // Only allow downward swipe
    if (delta > 0) {
      setSwipeY(delta);
    }
  }, [dragging]);

  const onTouchEnd = useCallback(() => {
    setDragging(false);
    if (swipeY > 120) {
      setOpen(false);
    }
    setSwipeY(0);
  }, [swipeY]);

  return (
    <>
      {/* Full menu overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm animate-fade-in"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            transform: swipeY > 0 ? `translateY(${swipeY}px)` : undefined,
            opacity: swipeY > 0 ? Math.max(0, 1 - swipeY / 300) : 1,
            transition: dragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
          }}
        >
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h2 className="text-lg font-display text-primary">DayFlow</h2>
            <button onClick={() => setOpen(false)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground">
              <X size={22} />
            </button>
          </div>
          <nav className="px-4 py-2 overflow-y-auto max-h-[calc(100vh-120px)]">
            {allSections.map(section => (
              <div key={section.title} className="mb-4">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2 px-3">{section.title}</p>
                <div className="flex flex-col gap-0.5">
                  {section.links.map(({ to, icon: Icon, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        )
                      }
                    >
                      <Icon size={16} />
                      {label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}

      {/* Bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 flex justify-around py-2 px-1">
        {bottomLinks.map(({ to, icon: Icon, label }) => (
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
        <button
          onClick={() => setOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-medium px-2 py-1 rounded-lg text-muted-foreground"
        >
          <Menu size={18} />
          More
        </button>
      </nav>
    </>
  );
}
