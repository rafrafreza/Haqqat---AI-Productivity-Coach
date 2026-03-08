import { useEffect, useState } from "react";
import { getLifeBalanceScores } from "@/lib/store";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const dimensionTips: Record<string, string> = {
  'Career': 'Log work activities, complete work tasks, and run focus sessions to improve this score.',
  'Health': 'Complete health routines (exercise, diet) and log health-related activities.',
  'Learning': 'Log learning activities, set learning goals, and track study time.',
  'Relationships': 'Log social activities and make time for meaningful connections.',
  'Creativity': 'Log creative activities — writing, art, music, design, brainstorming.',
  'Finance': 'Set financial goals and track progress toward them.',
  'Mindfulness': 'Complete meditation routines, journal, and practice self-reflection.',
  'Rest': 'Balance is key — make sure you rest and recharge adequately.',
};

const dimensionEmojis: Record<string, string> = {
  'Career': '💼', 'Health': '💪', 'Learning': '📚', 'Relationships': '❤️',
  'Creativity': '🎨', 'Finance': '💰', 'Mindfulness': '🧘', 'Rest': '😴',
};

export default function LifeBalance() {
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    setScores(getLifeBalanceScores());
  }, []);

  const radarData = Object.entries(scores).map(([name, value]) => ({
    dimension: name,
    score: value,
    fullMark: 100,
  }));

  const avgScore = Object.values(scores).length > 0
    ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length)
    : 0;

  const sortedDimensions = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const strongest = sortedDimensions[0];
  const weakest = sortedDimensions[sortedDimensions.length - 1];

  const getScoreColor = (score: number) => {
    if (score >= 60) return 'text-success';
    if (score >= 30) return 'text-primary';
    if (score > 0) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getBarColor = (score: number) => {
    if (score >= 60) return 'bg-success/60';
    if (score >= 30) return 'bg-primary/60';
    if (score > 0) return 'bg-warning/60';
    return 'bg-muted';
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display text-foreground">Life Balance</h1>
        <p className="text-muted-foreground mt-1">Auto-generated from your actual activity data</p>
      </div>

      {/* Overall score */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">Overall Balance Score</p>
        <p className="text-5xl font-bold text-primary">{avgScore}</p>
        <p className="text-xs text-muted-foreground mt-2">
          {avgScore === 0 ? 'Start logging activities to see your balance' :
           avgScore < 30 ? 'Your life is tilted — some areas need attention' :
           avgScore < 60 ? 'Getting balanced — keep diversifying your activities' :
           'Great balance! You\'re investing across all life areas'}
        </p>
      </div>

      {/* Radar chart */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          Life Balance Radar
          <Tooltip>
            <TooltipTrigger><Info size={14} className="text-muted-foreground" /></TooltipTrigger>
            <TooltipContent className="max-w-64"><p className="text-xs">This radar is auto-calculated from your routines, activities, goals, and focus sessions over the last 14 days. The more balanced the shape, the more balanced your life.</p></TooltipContent>
          </Tooltip>
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="dimension" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
            <Radar name="Balance" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Dimension breakdown */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Dimension Breakdown</h3>
        <div className="space-y-4">
          {sortedDimensions.map(([dim, score]) => (
            <div key={dim}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-foreground flex items-center gap-2">
                  {dimensionEmojis[dim]} {dim}
                </span>
                <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}</span>
              </div>
              <div className="h-2.5 bg-secondary rounded-full overflow-hidden mb-1">
                <div className={`h-full rounded-full transition-all ${getBarColor(score)}`} style={{ width: `${Math.max(score, 2)}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground">{dimensionTips[dim]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      {strongest && weakest && avgScore > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-success/5 border border-success/20 rounded-xl p-5">
            <p className="text-xs font-semibold text-success mb-1">💪 Strongest Area</p>
            <p className="text-lg font-display text-foreground">{dimensionEmojis[strongest[0]]} {strongest[0]}</p>
            <p className="text-sm text-muted-foreground mt-1">Score: {strongest[1]}/100</p>
          </div>
          <div className="bg-warning/5 border border-warning/20 rounded-xl p-5">
            <p className="text-xs font-semibold text-warning mb-1">⚠️ Needs Attention</p>
            <p className="text-lg font-display text-foreground">{dimensionEmojis[weakest[0]]} {weakest[0]}</p>
            <p className="text-sm text-muted-foreground mt-1">Score: {weakest[1]}/100</p>
            <p className="text-xs text-muted-foreground mt-2">{dimensionTips[weakest[0]]}</p>
          </div>
        </div>
      )}
    </div>
  );
}
