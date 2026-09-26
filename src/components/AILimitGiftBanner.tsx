import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function AILimitGiftBanner() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [notificationId, setNotificationId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Small delay to ensure auth session is fully ready
    const timer = setTimeout(async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("notifications")
          .select("id, message")
          .eq("user_id", user.id)
          .eq("type", "ai_limit_reset")
          .eq("read", false)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Notification check error:", error);
          return;
        }

        if (data) {
          setNotificationId(data.id);
          setMessage(data.message || "You've received a special gift — your AI Coach limit has been reset! 🎁");
          setShow(true);
        }
      } catch (e) {
        // Silent fail — notifications are non-critical
      }
    }, 2000); // 2s delay after login

    return () => clearTimeout(timer);
  }, [user]);

  const dismiss = async () => {
    setShow(false);
    if (!user || !notificationId) return;
    try {
      await (supabase as any)
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);
    } catch (e) {
      // Silent fail
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -80, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 w-full max-w-sm"
        >
          <div className="bg-card border border-primary/40 rounded-2xl shadow-2xl shadow-primary/20 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 animate-pulse" />
            <div className="p-4 flex items-start gap-3">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
              >
                <Gift size={20} className="text-primary" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles size={11} className="text-primary" />
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Special Gift from Haqqat</p>
                </div>
                <p className="text-sm text-foreground font-medium leading-snug">{message}</p>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Open your AI Coach to use your refreshed limit ✨
                </p>
              </div>
              <button
                onClick={dismiss}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0 mt-0.5"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
