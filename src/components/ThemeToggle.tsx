import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  variant?: "icon" | "full"; // icon = just the button, full = with label
}

export default function ThemeToggle({ variant = "icon" }: Props) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const toggle = () => setTheme(isDark ? "light" : "dark");

  if (variant === "full") {
    return (
      <button
        onClick={toggle}
        className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 transition-all group"
        aria-label="Toggle theme"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isDark ? "moon" : "sun"}
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                {isDark ? <Moon size={14} className="text-primary" /> : <Sun size={14} className="text-primary" />}
              </motion.div>
            </AnimatePresence>
          </div>
          <span className="text-sm font-medium text-foreground">
            {isDark ? "Dark mode" : "Light mode"}
          </span>
        </div>
        {/* Toggle switch */}
        <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${isDark ? "bg-primary" : "bg-secondary"}`}>
          <motion.div
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
            animate={{ left: isDark ? "calc(100% - 18px)" : "2px" }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? <Moon size={16} /> : <Sun size={16} />}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
