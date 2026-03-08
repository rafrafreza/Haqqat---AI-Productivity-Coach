import { useState, useCallback, useRef, useEffect } from "react";
import { Bot, Sparkles, RefreshCw, X, Send, ShieldAlert } from "lucide-react";
import ReactMarkdown from "react-markdown";

import {
  getRoutines, getLogs, getTasks, getFocusSessions, getGoals,
  getEnergyLogs, getDecisions, getProcrastinationEntries,
  getMorningRituals, todayStr, calculateDailyProductivityScore,
  getOverdueTasks, getDueSoonTasks, getTodayFocusMinutes,
  getGamificationStats, getXPEvents
} from "@/lib/store";

const DAILY_LIMIT = 10;
const LIMIT_KEY = "haqqat_ai_coach_usage";

function getDailyUsage(): { date: string; count: number } {
  try {
    const raw = localStorage.getItem(LIMIT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === todayStr()) return parsed;
    }
  } catch {}
  return { date: todayStr(), count: 0 };
}

function incrementDailyUsage() {
  const usage = getDailyUsage();
  usage.count += 1;
  usage.date = todayStr();
  localStorage.setItem(LIMIT_KEY, JSON.stringify(usage));
}

function getRemainingMessages(): number {
  return Math.max(0, DAILY_LIMIT - getDailyUsage().count);
}

type Message = { role: "user" | "assistant"; content: string };

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

async function streamFromCoach(
  body: Record<string, unknown>,
  onDelta: (text: string) => void,
  onError: (msg: string) => void,
) {
  const resp = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!resp.ok) {
    if (resp.status === 429) { onError("Too many requests — please wait a moment."); return; }
    if (resp.status === 402) { onError("AI credits exhausted. Please upgrade."); return; }
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
      if (jsonStr === "[DONE]") return accumulated;

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          accumulated += content;
          onDelta(accumulated);
        }
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }
  return accumulated;
}



export default function AICoachWidget() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const remaining = getRemainingMessages();

  const getInitialCoaching = useCallback(async () => {
    if (getRemainingMessages() <= 0) {
      setError("You've reached your daily AI Coach limit (10 messages). Come back tomorrow! 🌅");
      return;
    }
    setLoading(true);
    setError("");
    setMessages([]);
    const userData = gatherUserData();

    try {
      let finalContent = "";
      incrementDailyUsage();
      await streamFromCoach(
        { userData, mode: "initial" },
        (accumulated) => {
          finalContent = accumulated;
          setMessages([{ role: "assistant", content: accumulated }]);
        },
        (msg) => setError(msg),
      );
      if (finalContent) {
        setMessages([{ role: "assistant", content: finalContent }]);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    if (getRemainingMessages() <= 0) {
      setError("You've reached your daily AI Coach limit (10 messages). Come back tomorrow! 🌅");
      return;
    }

    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError("");

    const userData = gatherUserData();
    incrementDailyUsage();

    try {
      let assistantContent = "";
      await streamFromCoach(
        { userData, messages: newMessages, mode: "chat" },
        (accumulated) => {
          assistantContent = accumulated;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant" && prev.length > newMessages.length) {
              return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: accumulated } : m);
            }
            return [...newMessages, { role: "assistant", content: accumulated }];
          });
        },
        (msg) => setError(msg),
      );
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, messages]);

  // Floating button
  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); if (messages.length === 0 && !loading) getInitialCoaching(); }}
        className="fixed bottom-20 md:bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all group"
      >
        <Bot size={20} />
        <span className="text-sm font-medium hidden sm:inline">AI Coach</span>
        <Sparkles size={14} className="opacity-70 group-hover:opacity-100 transition-opacity" />
      </button>
    );
  }

  

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[80vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5 shrink-0">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-primary" />
          <span className="font-semibold text-sm text-foreground">AI Coach</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{remaining} left</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setMessages([]); getInitialCoaching(); }}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-secondary/20 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            title="New session"
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

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 relative">
        {loading && messages.length === 0 && (
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

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[90%] rounded-2xl px-4 py-3 ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-secondary/10 border border-border rounded-bl-md"
            }`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90 prose-a:text-primary">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {loading && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-secondary/10 border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat input */}
      <div className="shrink-0 border-t border-border p-3">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your coach anything..."
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
