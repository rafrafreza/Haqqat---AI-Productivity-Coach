import { useEffect, useState } from "react";
import { Lightbulb, TrendingUp, AlertTriangle, Star, Target, Timer, Brain } from "lucide-react";
import { getRoutines, getLogs, getActivities, getTasks, getGoals, getFocusSessions, getCompletionRate, getStreakForRoutine, getOverdueTasks, getTodayFocusMinutes, getWeekFocusMinutes, getGoalProgress } from "@/lib/store";

interface Insight {
  type: 'tip' | 'warning' | 'achievement' | 'suggestion';
  title: string;
  description: string;
}

export default function Insights() {
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    const routines = getRoutines();
    const logs = getLogs();
    const activities = getActivities();
    const tasks = getTasks();
    const goals = getGoals();
    const sessions = getFocusSessions();
    const generated: Insight[] = [];

    // Overdue tasks
    const overdue = getOverdueTasks(tasks);
    if (overdue.length > 0) {
      generated.push({ type: 'warning', title: `⚠️ ${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}`, description: 'Overdue tasks create mental load. Either complete them, reschedule, or remove them to reduce stress.' });
    }

    // Too many "urgent-important" tasks
    const urgentImportant = tasks.filter(t => t.priority === 'urgent-important' && t.status !== 'done');
    if (urgentImportant.length > 5) {
      generated.push({ type: 'warning', title: '🔴 Too many urgent tasks', description: `You have ${urgentImportant.length} urgent-important tasks. If everything is urgent, nothing is. Reassess priorities using the Eisenhower matrix.` });
    }

    // Focus time analysis
    const weekFocus = getWeekFocusMinutes(sessions);
    if (weekFocus > 0 && weekFocus < 300) {
      generated.push({ type: 'suggestion', title: '🎯 Increase deep focus time', description: `Only ${Math.round(weekFocus / 60)}h of focus this week. Research shows 3-4 hours of deep work daily is optimal. Try blocking 2-hour focus sessions.` });
    }
    if (weekFocus >= 1200) {
      generated.push({ type: 'achievement', title: '🧠 Focus champion!', description: `${Math.round(weekFocus / 60)}h of focused work this week. That's elite-level deep work capacity!` });
    }

    // Goal progress
    const stalledGoals = goals.filter(g => g.status === 'active' && getGoalProgress(g) < 20 && new Date(g.createdAt).getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (stalledGoals.length > 0) {
      generated.push({ type: 'warning', title: `📊 ${stalledGoals.length} stalled goal${stalledGoals.length > 1 ? 's' : ''}`, description: 'Some goals have less than 20% progress after a week. Break them into smaller milestones or reconsider if they are truly priorities.' });
    }

    // Routine analysis
    routines.forEach(r => {
      const rate7 = getCompletionRate(r.id, logs, 7);
      const streak = getStreakForRoutine(r.id, logs);

      if (streak >= 7) {
        generated.push({ type: 'achievement', title: `${r.icon} ${r.name} — ${streak}-day streak!`, description: 'Amazing consistency! Keep this momentum going.' });
      }
      if (rate7 < 30 && rate7 > 0) {
        generated.push({ type: 'warning', title: `${r.icon} ${r.name} needs attention`, description: `Only ${rate7}% completion this week. Consider adjusting the time or making it easier to start.` });
      }
      if (rate7 >= 80) {
        generated.push({ type: 'achievement', title: `${r.icon} ${r.name} — crushing it!`, description: `${rate7}% completion rate this week. You've built a strong habit.` });
      }
    });

    // Activity insights
    const catTimes: Record<string, number> = {};
    activities.forEach(a => { catTimes[a.category] = (catTimes[a.category] || 0) + (a.duration || 0); });
    const topCat = Object.entries(catTimes).sort((a, b) => b[1] - a[1])[0];
    if (topCat) {
      generated.push({ type: 'tip', title: `Most time spent on: ${topCat[0]}`, description: `${Math.round(topCat[1] / 60)}h total. Consider if this aligns with your priorities and goals.` });
    }

    // Procrastination detection
    const notUrgentNotImportant = tasks.filter(t => t.priority === 'not-urgent-not-important' && t.status !== 'done' && t.status !== 'cancelled');
    if (notUrgentNotImportant.length > 3) {
      generated.push({ type: 'suggestion', title: '🗑️ Eliminate low-value tasks', description: `You have ${notUrgentNotImportant.length} tasks that are neither urgent nor important. Consider deleting them — saying no is a superpower.` });
    }

    // Task completion velocity
    const recentDone = tasks.filter(t => t.completedAt && new Date(t.completedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (recentDone.length > 0) {
      generated.push({ type: 'tip', title: `📊 Completed ${recentDone.length} tasks this week`, description: `That's about ${Math.round(recentDone.length / 7 * 10) / 10} tasks/day. Track this trend to understand your capacity.` });
    }

    // General tips
    generated.push({ type: 'tip', title: '⏰ Two-minute rule', description: 'If a task takes less than two minutes, do it immediately. Small wins build momentum and reduce mental clutter.' });
    generated.push({ type: 'tip', title: '🔗 Habit stacking', description: 'Link new habits to existing ones: "After I [current habit], I will [new habit]." This leverages existing neural pathways.' });
    generated.push({ type: 'suggestion', title: '📋 Weekly review ritual', description: 'Spend 30 minutes every Sunday reviewing your week. Celebrate wins, identify patterns, and plan the next 7 days.' });
    generated.push({ type: 'tip', title: '🐸 Eat the frog', description: 'Do your most dreaded task first thing in the morning. Your willpower is highest early in the day.' });

    setInsights(generated);
  }, []);

  const iconMap = {
    tip: <Lightbulb size={18} className="text-primary" />,
    warning: <AlertTriangle size={18} className="text-warning" />,
    achievement: <Star size={18} className="text-primary" />,
    suggestion: <TrendingUp size={18} className="text-info" />,
  };

  const bgMap = {
    tip: "border-primary/20 bg-primary/5",
    warning: "border-warning/20 bg-warning/5",
    achievement: "border-primary/30 bg-primary/10",
    suggestion: "border-info/20 bg-info/5",
  };

  const warningInsights = insights.filter(i => i.type === 'warning');
  const achievementInsights = insights.filter(i => i.type === 'achievement');
  const actionInsights = insights.filter(i => i.type === 'tip' || i.type === 'suggestion');

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display text-foreground">Insights & Tips</h1>
        <p className="text-muted-foreground mt-1">Personalised analysis to boost your productivity</p>
      </div>

      {warningInsights.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-destructive mb-3 flex items-center gap-2"><AlertTriangle size={14} /> Needs Attention</h2>
          <div className="space-y-3">
            {warningInsights.map((insight, i) => <InsightCard key={`w-${i}`} insight={insight} iconMap={iconMap} bgMap={bgMap} />)}
          </div>
        </div>
      )}

      {achievementInsights.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2"><Star size={14} /> Achievements</h2>
          <div className="space-y-3">
            {achievementInsights.map((insight, i) => <InsightCard key={`a-${i}`} insight={insight} iconMap={iconMap} bgMap={bgMap} />)}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Brain size={14} /> Tips & Strategies</h2>
        <div className="space-y-3">
          {actionInsights.map((insight, i) => <InsightCard key={`t-${i}`} insight={insight} iconMap={iconMap} bgMap={bgMap} />)}
        </div>
      </div>
    </div>
  );
}

function InsightCard({ insight, iconMap, bgMap }: { insight: { type: string; title: string; description: string }; iconMap: Record<string, React.ReactNode>; bgMap: Record<string, string> }) {
  return (
    <div className={`flex gap-4 p-5 rounded-xl border transition-all ${bgMap[insight.type as keyof typeof bgMap]}`}>
      <div className="mt-0.5 shrink-0">{iconMap[insight.type as keyof typeof iconMap]}</div>
      <div>
        <p className="font-medium text-foreground">{insight.title}</p>
        <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
      </div>
    </div>
  );
}
