import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";

const typeConfig: Record<string, { icon: string; bg: string }> = {
  ai_limit_reset: { icon: "🎁", bg: "bg-primary/10" },
  default:        { icon: "🔔", bg: "bg-secondary" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface Props {
  compact?: boolean;
}

export default function NotificationBell({ compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAllRead, markOneRead, loading } = useNotifications();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const W = 320;
      const H = 420;
      const margin = 8;

      // Horizontal — right-align with button, clamp to viewport
      let left = rect.right - W;
      if (left < margin) left = margin;
      if (left + W > window.innerWidth - margin) left = window.innerWidth - W - margin;

      // Vertical — open upward if not enough space below
      let top: number;
      if (rect.bottom + H + margin > window.innerHeight) {
        top = rect.top - H - margin;
      } else {
        top = rect.bottom + margin;
      }
      if (top < margin) top = margin;

      // ✅ ONE style object — merges position + maxHeight
      setPanelStyle({ position: "fixed", left, top, maxHeight: H, zIndex: 300 });
    }
    setOpen(v => !v);
  };

  return (
    // ✅ inline-flex so this wrapper doesn't add height in flex-col nav items
    <span className="relative inline-flex items-center justify-center">
      <button
        ref={buttonRef}
        onClick={handleOpen}
        aria-label="Notifications"
        className={`relative flex items-center justify-center rounded-lg transition-colors
          ${compact
            ? "text-muted-foreground hover:text-foreground"
            : "w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-secondary"
          }
          ${open ? "text-foreground" : ""}
        `}
      >
        {/* ✅ compact uses same size as other nav icons */}
        <Bell size={compact ? 18 : 16} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Panel — portalled via fixed position, single style object */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            // ✅ style is ONE object containing all positioning
            style={panelStyle}
            className="w-[320px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 px-2 py-1 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    <CheckCheck size={11} />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto" style={{ maxHeight: 360 }}>
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
                    <Bell size={18} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">All caught up!</p>
                  <p className="text-xs text-muted-foreground mt-1">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {notifications.map(n => {
                    const cfg = typeConfig[n.type] || typeConfig.default;
                    return (
                      <div
                        key={n.id}
                        onClick={() => !n.read && markOneRead(n.id)}
                        className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors
                          ${!n.read ? "bg-primary/[0.03] hover:bg-primary/[0.06]" : "hover:bg-secondary/30"}
                        `}
                      >
                        <div className={`w-8 h-8 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5 text-base`}>
                          {cfg.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${!n.read ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                            {n.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.created_at)}</p>
                        </div>
                        {!n.read && (
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
