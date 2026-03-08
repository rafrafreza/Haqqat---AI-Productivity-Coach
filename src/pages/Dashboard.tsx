import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Flame, TrendingUp, Clock, AlertTriangle, Target, Timer, ListTodo, Zap } from "lucide-react";
import { getRoutines, getLogs, saveLogs, todayStr, getStreakForRoutine, getActivities, getTasks, getGoals, getFocusSessions, getOverdueTasks, getDueSoonTasks, getTodayFocusMinutes, calculateDailyProductivityScore, getGoalProgress, awardXP, type Routine, type RoutineLog } from "@/lib/store";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import DashboardXPWidget from "@/components/DashboardXPWidget";
import { useXPAward } from "@/hooks/useXP";
import { notifyXP } from "@/components/XPNotification";

export default function Dashboard() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [logs, setLogs] = useState<RoutineLog[]>([]);
  const today = todayStr();
  const { grantXP } = useXPAward();

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
    // Award XP for completing a routine
    const wasCompleted = existing?.completed;
    const isNowCompleted = newLogs.find(l => l.date === today && l.routineId === routineId)?.completed;
    if (isNowCompleted && !wasCompleted) {
      const result = grantXP('routine', 'Completed routine');
      notifyXP(result);
    }

  const isCompleted = (routineId: string) =>
    logs.some(l => l.date === today && l.routineId === routineId && l.completed);

  // Advanced stats
  const tasks = getTasks();
  const goals = getGoals();
  const sessions = getFocusSessions();
  const overdue = getOverdueTasks(tasks);
  const dueSoon = getDueSoonTasks(tasks);
  const focusMins = getTodayFocusMinutes(sessions);
  const productivityScore = calculateDailyProductivityScore(today);
  const activeGoals = goals.filter(g => g.status === 'active');
  const todayTasksDone = tasks.filter(t => t.completedAt?.startsWith(today)).length;
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

      {/* Productivity Score */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Zap size={22} className="text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Today's Productivity Score</p>
              <p className="text-xs text-muted-foreground">Based on routines, tasks, and focus time</p>
            </div>
          </div>
          <span className="text-3xl font-bold text-primary">{productivityScore}</span>
        </div>
        <Progress value={productivityScore} className="h-2" />
      </div>

      {/* Alerts */}
      {overdue.length > 0 && (
        <Link to="/tasks" className="block mb-4 p-4 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-destructive shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">{overdue.length} overdue task{overdue.length > 1 ? 's' : ''}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{overdue.slice(0, 2).map(t => t.title).join(', ')}{overdue.length > 2 ? ` +${overdue.length - 2} more` : ''}</p>
            </div>
          </div>
        </Link>
      )}

      {dueSoon.length > 0 && (
        <Link to="/tasks" className="block mb-4 p-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium text-primary">{dueSoon.length} task{dueSoon.length > 1 ? 's' : ''} due soon</p>
              <p className="text-xs text-muted-foreground mt-0.5">{dueSoon.slice(0, 2).map(t => `${t.title} (${t.deadline})`).join(', ')}</p>
            </div>
          </div>
        </Link>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<CheckCircle2 size={20} />} label="Routines" value={`${completedCount}/${routines.length}`} accent />
        <StatCard icon={<ListTodo size={20} />} label="Tasks Done" value={String(todayTasksDone)} />
        <StatCard icon={<Timer size={20} />} label="Focus Time" value={`${Math.floor(focusMins / 60)}h ${focusMins % 60}m`} />
        <StatCard icon={<Flame size={20} />} label="Best Streak" value={`${bestStreak}d`} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <Link to="/focus" className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/30 transition-all group">
          <Timer size={24} className="mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
          <p className="text-xs text-muted-foreground mt-2 group-hover:text-foreground">Start Focus</p>
        </Link>
        <Link to="/tasks" className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/30 transition-all group">
          <ListTodo size={24} className="mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
          <p className="text-xs text-muted-foreground mt-2 group-hover:text-foreground">Add Task</p>
        </Link>
        <Link to="/reviews" className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/30 transition-all group">
          <TrendingUp size={24} className="mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
          <p className="text-xs text-muted-foreground mt-2 group-hover:text-foreground">Weekly Review</p>
        </Link>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display text-foreground">Active Goals</h2>
            <Link to="/goals" className="text-sm text-primary hover:underline">View all →</Link>
          </div>
          <div className="space-y-2">
            {activeGoals.slice(0, 3).map(g => {
              const progress = getGoalProgress(g);
              return (
                <Link key={g.id} to="/goals" className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/20 transition-all">
                  <Target size={18} className="text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{g.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={progress} className="h-1.5 flex-1 max-w-24" />
                      <span className="text-xs text-muted-foreground">{progress}%</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Today's routines */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display text-foreground">Today's Routines</h2>
          <Link to="/routines" className="text-sm text-primary hover:underline">Manage →</Link>
        </div>
        <div className="space-y-2">
          {routines.map(r => {
            const done = isCompleted(r.id);
            return (
              <button
                key={r.id}
                onClick={() => toggleRoutine(r.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  done ? "bg-primary/5 border-primary/20" : "bg-card border-border hover:border-primary/30"
                }`}
              >
                {done ? <CheckCircle2 size={22} className="text-primary shrink-0" /> : <Circle size={22} className="text-muted-foreground shrink-0" />}
                <span className="text-lg mr-2">{r.icon}</span>
                <div className="text-left flex-1">
                  <p className={`font-medium ${done ? "text-primary line-through opacity-70" : "text-foreground"}`}>{r.name}</p>
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
          <span className="text-sm font-medium text-foreground">Daily Routine Progress</span>
          <span className="text-sm text-primary font-bold">{completionPct}%</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div className="h-full gradient-warm rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
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
