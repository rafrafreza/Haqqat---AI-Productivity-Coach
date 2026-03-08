import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Flame, TrendingUp, Clock } from "lucide-react";
import { getRoutines, getLogs, saveLogs, todayStr, getStreakForRoutine, getActivities, type Routine, type RoutineLog } from "@/lib/store";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [logs, setLogs] = useState<RoutineLog[]>([]);
  const today = todayStr();

  useEffect(() => {
    setRoutines(getRoutines());
    setLogs(getLogs());
  }, []);

  const todayLogs = logs.filter(l => l.date === today);
  const completedCount = todayLogs.filter(l => l.completed).length;
  const completionPct = routines.length ? Math.round((completedCount / routines.length) * 100) : 0;

  const toggleRoutine = (routineId: string) => {
    const existing = logs.find(l => l.date === today && l.routineId === routineId);
    let newLogs: RoutineLog[];
    if (existing) {
      newLogs = logs.map(l =>
        l.date === today && l.routineId === routineId
          ? { ...l, completed: !l.completed, completedAt: !l.completed ? new Date().toISOString() : undefined }
          : l
      );
    } else {
      newLogs = [...logs, { date: today, routineId, completed: true, completedAt: new Date().toISOString() }];
    }
    setLogs(newLogs);
    saveLogs(newLogs);
  };

  const isCompleted = (routineId: string) =>
    logs.some(l => l.date === today && l.routineId === routineId && l.completed);

  const totalActivities = getActivities().filter(a => a.date === today).length;

  const bestStreak = routines.reduce((max, r) => {
    const s = getStreakForRoutine(r.id, logs);
    return s > max ? s : max;
  }, 0);

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display text-foreground">{greeting}</h1>
        <p className="text-muted-foreground mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<CheckCircle2 size={20} />} label="Completed" value={`${completedCount}/${routines.length}`} accent />
        <StatCard icon={<TrendingUp size={20} />} label="Today" value={`${completionPct}%`} />
        <StatCard icon={<Flame size={20} />} label="Best Streak" value={`${bestStreak}d`} />
        <StatCard icon={<Clock size={20} />} label="Activities" value={String(totalActivities)} />
      </div>

      {/* Today's routines */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display text-foreground">Today's Routines</h2>
          <Link to="/routines" className="text-sm text-primary hover:underline">View all →</Link>
        </div>
        <div className="space-y-2">
          {routines.map(r => {
            const done = isCompleted(r.id);
            return (
              <button
                key={r.id}
                onClick={() => toggleRoutine(r.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  done
                    ? "bg-primary/5 border-primary/20"
                    : "bg-card border-border hover:border-primary/30"
                }`}
              >
                {done ? (
                  <CheckCircle2 size={22} className="text-primary shrink-0" />
                ) : (
                  <Circle size={22} className="text-muted-foreground shrink-0" />
                )}
                <span className="text-lg mr-2">{r.icon}</span>
                <div className="text-left flex-1">
                  <p className={`font-medium ${done ? "text-primary line-through opacity-70" : "text-foreground"}`}>
                    {r.name}
                  </p>
                  {r.time && <p className="text-xs text-muted-foreground">{r.time}</p>}
                </div>
                <span className="text-xs text-muted-foreground capitalize">{r.category}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Daily Progress</span>
          <span className="text-sm text-primary font-bold">{completionPct}%</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full gradient-warm rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 shadow-card ${accent ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
      <div className={`mb-2 ${accent ? "text-primary" : "text-muted-foreground"}`}>{icon}</div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
