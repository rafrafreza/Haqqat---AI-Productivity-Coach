import { useEffect, useState } from "react";
import { Lightbulb, TrendingUp, AlertTriangle, Star } from "lucide-react";
import { getRoutines, getLogs, getActivities, getCompletionRate, getStreakForRoutine } from "@/lib/store";

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
    const generated: Insight[] = [];

    // Analyse routines
    routines.forEach(r => {
      const rate7 = getCompletionRate(r.id, logs, 7);
      const streak = getStreakForRoutine(r.id, logs);

      if (streak >= 7) {
        generated.push({ type: 'achievement', title: `${r.icon} ${r.name} — ${streak}-day streak!`, description: 'Amazing consistency! Keep this momentum going.' });
      }
      if (rate7 < 30 && rate7 > 0) {
        generated.push({ type: 'warning', title: `${r.icon} ${r.name} needs attention`, description: `Only ${rate7}% completion this week. Consider adjusting the time or making it easier to start.` });
      }
      if (rate7 === 0) {
        generated.push({ type: 'warning', title: `${r.icon} ${r.name} — not started this week`, description: 'Try pairing this with an existing habit to make it stick.' });
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
      generated.push({ type: 'tip', title: `Most time spent on: ${topCat[0]}`, description: `${Math.round(topCat[1] / 60)}h total. Consider if this aligns with your priorities.` });
    }

    // General tips
    if (routines.length < 3) {
      generated.push({ type: 'suggestion', title: 'Start with 3-5 core routines', description: 'Research shows tracking too few or too many habits reduces success. 3-5 is the sweet spot.' });
    }
    if (routines.length > 8) {
      generated.push({ type: 'suggestion', title: 'Consider reducing your routines', description: 'You have many routines. Focus on the most impactful ones to avoid burnout.' });
    }

    generated.push({ type: 'tip', title: 'Two-minute rule', description: 'If a habit takes less than two minutes, do it immediately. Small wins build momentum.' });
    generated.push({ type: 'tip', title: 'Habit stacking', description: 'Link new habits to existing ones: "After I [current habit], I will [new habit]."' });

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

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display text-foreground">Insights & Tips</h1>
        <p className="text-muted-foreground mt-1">Personalised suggestions to improve your productivity</p>
      </div>

      <div className="space-y-4">
        {insights.map((insight, i) => (
          <div key={i} className={`flex gap-4 p-5 rounded-xl border transition-all ${bgMap[insight.type]}`}>
            <div className="mt-0.5 shrink-0">{iconMap[insight.type]}</div>
            <div>
              <p className="font-medium text-foreground">{insight.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
