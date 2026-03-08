import { useEffect, useState } from "react";
import { getRoutines, getLogs, getActivities, getCompletionRate, getStreakForRoutine, type Routine, type RoutineLog, type Activity } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(38, 92%, 55%)", "hsl(142, 60%, 45%)", "hsl(210, 70%, 55%)", "hsl(0, 72%, 55%)", "hsl(280, 60%, 55%)", "hsl(180, 60%, 45%)"];

export default function Analytics() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [logs, setLogs] = useState<RoutineLog[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    setRoutines(getRoutines());
    setLogs(getLogs());
    setActivities(getActivities());
  }, []);

  // Weekly completion data
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const ds = d.toISOString().slice(0, 10);
    const completed = logs.filter(l => l.date === ds && l.completed).length;
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      completed,
      total: routines.length,
    };
  });

  // Category distribution from activities
  const catMap = activities.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + (a.duration || 30);
    return acc;
  }, {});
  const pieData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  // Top routines
  const routineStats = routines.map(r => ({
    name: r.name,
    icon: r.icon,
    streak: getStreakForRoutine(r.id, logs),
    rate7: getCompletionRate(r.id, logs, 7),
    rate30: getCompletionRate(r.id, logs, 30),
  })).sort((a, b) => b.rate7 - a.rate7);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Understand your patterns</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Weekly chart */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Weekly Completions</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekData}>
              <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} />
              <Bar dataKey="completed" fill="hsl(38, 92%, 55%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Time by Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">Log activities to see breakdown</div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {pieData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Routine stats table */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Routine Performance</h3>
        {routineStats.length > 0 ? (
          <div className="space-y-3">
            {routineStats.map(r => (
              <div key={r.name} className="flex items-center gap-3">
                <span className="text-lg">{r.icon}</span>
                <span className="flex-1 text-sm text-foreground">{r.name}</span>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-muted-foreground">7d: <span className="text-foreground font-medium">{r.rate7}%</span></span>
                  <span className="text-muted-foreground">30d: <span className="text-foreground font-medium">{r.rate30}%</span></span>
                  {r.streak > 0 && <span className="text-primary">🔥 {r.streak}d</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Add routines and start tracking</p>
        )}
      </div>
    </div>
  );
}
