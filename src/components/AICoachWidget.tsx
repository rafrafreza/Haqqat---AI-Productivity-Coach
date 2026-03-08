import { useState, useCallback } from "react";
import { Bot, Sparkles, RefreshCw, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  getRoutines, getLogs, getTasks, getFocusSessions, getGoals,
  getEnergyLogs, getDecisions, getProcrastinationEntries,
  getMorningRituals, todayStr, calculateDailyProductivityScore,
  getOverdueTasks, getDueSoonTasks, getTodayFocusMinutes,
  getGamificationStats, getXPEvents
} from "@/lib/store";
import { useSubscription } from "@/contexts/SubscriptionContext";

function gatherUserData() {
  const today = todayStr();
  const routines = getRoutines();
  const logs = getLogs();
  const tasks = getTasks();
  const sessions = getFocusSessions();
  const goals = getGoals();
  const energyLogs = getEnergyLogs();
  const decisions = getDecisions();
  const procrastination = getProcrastinationEntries();
  const rituals = getMorningRituals();
  const xpEvents = getXPEvents();
  const stats = getGamificationStats();

  const todayLogs = logs.filter(l => l.date === today);
  const completedRoutines = todayLogs.filter(l => l.completed).length;
  const todayTasks = tasks.filter(t => t.completedAt?.startsWith(today)).length;
  const focusMins = getTodayFocusMinutes(sessions);
  const overdue = getOverdueTasks(tasks);
  const dueSoon = getDueSoonTasks(tasks);
  const score = calculateDailyProductivityScore(today);
  const todayXP = xpEvents.filter(e => e.date === today).reduce((s, e) => s + e.amount, 0);

  const recentProcrastination = procrastination.slice(-5);
  const topTriggers = recentProcrastination.reduce((acc: Record<string, number>, e) => {
    acc[e.triggerType] = (acc[e.triggerType] || 0) + 1;
    return acc;
  }, {});

  const recentEnergy = energyLogs.filter(e => e.date === today);
  const avgEnergy = recentEnergy.length
    ? Math.round(recentEnergy.reduce((s, e) => s + e.level, 0) / recentEnergy.length * 10) / 10
    : null;

  const activeGoals = goals.filter(g => g.status === 'active').map(g => ({
    title: g.title,
    milestonesTotal: g.milestones.length,
    milestonesDone: g.milestones.filter(m => m.completed).length,
    priority: g.priority,
  }));

  const todayRitual = rituals.find(r => r.date === today);

  return {
    today,
    productivityScore: score,
    routines: { total: routines.length, completed: completedRoutines },
    tasks: { completedToday: todayTasks, overdue: overdue.length, dueSoon: dueSoon.length, overdueNames: overdue.slice(0, 3).map(t => t.title) },
    focus: { minutesToday: focusMins, sessionsToday: sessions.filter(s => s.date === today).length },
    xp: { todayXP, totalXP: stats.totalXP, level: stats.level, streak: stats.currentStreak },
    energy: { averageToday: avgEnergy, logsToday: recentEnergy.length },
    goals: activeGoals.slice(0, 5),
    procrastinationTriggers: topTriggers,
    morningRitualDone: !!todayRitual,
    decisionsThisWeek: decisions.filter(d => d.date >= new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)).length,
  };
}

export default function AICoachWidget() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const { isPro } = useSubscription();

  const getCoaching = useCallback(async () => {
    setLoading(true);
    setResponse("");
    setError("");

    const userData = gatherUserData();

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ userData }),
        }
      );

      if (!resp.ok) {
        if (resp.status === 429) { setError("Too many requests — please wait a moment."); setLoading(false); return; }
        if (resp.status === 402) { setError("AI credits exhausted. Please upgrade."); setLoading(false); return; }
        throw new Error("Failed to get coaching tips");
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              setResponse(accumulated);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); if (!response && !loading) getCoaching(); }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all group"
      >
        <Bot size={20} />
        <span className="text-sm font-medium hidden sm:inline">AI Coach</span>
        <Sparkles size={14} className="opacity-70 group-hover:opacity-100 transition-opacity" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] max-h-[70vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-primary" />
          <span className="font-semibold text-sm text-foreground">AI Productivity Coach</span>
          {!isPro && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">FREE</span>}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={getCoaching}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-secondary/20 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            title="Refresh tips"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-secondary/20 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && !response && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot size={20} className="text-primary animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground">Analyzing your productivity data...</p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {error}
          </div>
        )}

        {response && (
          <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90 prose-a:text-primary">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Footer */}
      {response && !loading && (
        <div className="px-4 py-2 border-t border-border">
          <button
            onClick={getCoaching}
            className="w-full py-2 rounded-xl text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
          >
            🔄 Get fresh tips
          </button>
        </div>
      )}
    </div>
  );
}
