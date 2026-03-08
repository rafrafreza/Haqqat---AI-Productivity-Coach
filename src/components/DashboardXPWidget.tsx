import { useEffect, useState } from "react";
import { Star, Flame, Zap, Trophy, TrendingUp } from "lucide-react";
import { getGamificationStats, ACHIEVEMENTS, getXPEvents, todayStr, type GamificationStats } from "@/lib/store";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

export default function DashboardXPWidget() {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [todayXP, setTodayXP] = useState(0);

  useEffect(() => {
    const s = getGamificationStats();
    setStats(s);
    const events = getXPEvents();
    const today = todayStr();
    setTodayXP(events.filter(e => e.date === today).reduce((sum, e) => sum + e.amount, 0));
  }, []);

  if (!stats) return null;

  const levelProgress = stats.nextLevelXP > 0 ? (stats.currentLevelXP / stats.nextLevelXP) * 100 : 100;
  const unlockedCount = stats.unlockedAchievements.length;

  return (
    <Link to="/xp" className="block bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Star size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">Level {stats.level}</p>
            <p className="text-xs text-muted-foreground">{stats.totalXP.toLocaleString()} total XP</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">+{todayXP}</p>
          <p className="text-xs text-muted-foreground">XP today</p>
        </div>
      </div>

      {/* Level progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{stats.currentLevelXP} / {stats.nextLevelXP} XP</span>
          <span>Level {stats.level + 1}</span>
        </div>
        <Progress value={levelProgress} className="h-2" />
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/20">
          <Flame size={14} className={stats.currentStreak >= 3 ? "text-orange-500" : "text-muted-foreground"} />
          <div>
            <p className="text-sm font-bold text-foreground">{stats.currentStreak}d</p>
            <p className="text-[10px] text-muted-foreground">Streak</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/20">
          <Trophy size={14} className="text-warning" />
          <div>
            <p className="text-sm font-bold text-foreground">{unlockedCount}/{ACHIEVEMENTS.length}</p>
            <p className="text-[10px] text-muted-foreground">Badges</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/20">
          <TrendingUp size={14} className="text-primary" />
          <div>
            <p className="text-sm font-bold text-foreground">{stats.daysActive}</p>
            <p className="text-[10px] text-muted-foreground">Days</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
