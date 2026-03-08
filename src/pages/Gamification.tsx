import { useEffect, useState } from "react";
import { Trophy, Star, Flame, Zap, Lock, Unlock, TrendingUp, Award, Gift, CheckCircle } from "lucide-react";
import { getGamificationStats, getWeeklyXPData, getDailyChallenges, claimDailyChallenge, ACHIEVEMENTS, type GamificationStats, type Achievement } from "@/lib/store";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useXPAward } from "@/hooks/useXP";
import { notifyXP } from "@/components/XPNotification";

const LEVEL_TITLES: Record<number, string> = {
  1: 'Beginner', 2: 'Apprentice', 3: 'Novice', 4: 'Practitioner', 5: 'Adept',
  6: 'Specialist', 7: 'Expert', 8: 'Master', 9: 'Grandmaster', 10: 'Legend',
  11: 'Mythic', 12: 'Transcendent', 13: 'Ascended', 14: 'Enlightened', 15: 'Immortal',
};

function getLevelTitle(level: number): string {
  if (level >= 15) return LEVEL_TITLES[15];
  return LEVEL_TITLES[level] || `Level ${level}`;
}

const categoryColors: Record<string, string> = {
  consistency: 'text-orange-500',
  mastery: 'text-primary',
  explorer: 'text-emerald-500',
  milestone: 'text-amber-500',
};

export default function Gamification() {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [weeklyData, setWeeklyData] = useState<{ day: string; xp: number; date: string }[]>([]);
  const [challenges, setChallenges] = useState<ReturnType<typeof getDailyChallenges>>([]);
  const { grantXP } = useXPAward();

  const refresh = () => {
    setStats(getGamificationStats());
    setWeeklyData(getWeeklyXPData());
    setChallenges(getDailyChallenges());
  };

  useEffect(() => { refresh(); }, []);

  const handleClaim = (challengeId: string) => {
    const event = claimDailyChallenge(challengeId);
    if (event) {
      // Use the XP notification system
      const result = {
        event,
        totalXP: 0,
        level: 0,
        previousLevel: 0,
        leveledUp: false,
        newAchievements: [],
      };
      notifyXP(result);
      refresh();
    }
  };

  if (!stats) return null;

  const levelProgress = stats.nextLevelXP > 0 ? (stats.currentLevelXP / stats.nextLevelXP) * 100 : 100;
  const unlocked = ACHIEVEMENTS.filter(a => stats.unlockedAchievements.includes(a.id));
  const locked = ACHIEVEMENTS.filter(a => !stats.unlockedAchievements.includes(a.id));
  const maxXP = Math.max(...weeklyData.map(d => d.xp), 1);
  const todayDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display text-foreground">Level Up</h1>
        <p className="text-muted-foreground mt-1">Your productivity journey, gamified</p>
      </div>

      {/* Level Card */}
      <div className="bg-card border border-primary/30 rounded-xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-8 -mb-8" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Star size={32} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Level</p>
              <h2 className="text-3xl font-bold text-foreground">Level {stats.level}</h2>
              <p className="text-sm text-primary font-medium">{getLevelTitle(stats.level)}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-4xl font-bold text-primary">{stats.totalXP.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{stats.currentLevelXP} XP</span>
              <span>{stats.nextLevelXP} XP to next level</span>
            </div>
            <Progress value={levelProgress} className="h-3" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatBox icon={<Flame size={18} />} label="Current Streak" value={`${stats.currentStreak}d`} highlight={stats.currentStreak >= 7} />
        <StatBox icon={<TrendingUp size={18} />} label="Longest Streak" value={`${stats.longestStreak}d`} />
        <StatBox icon={<Zap size={18} />} label="Days Active" value={String(stats.daysActive)} />
        <StatBox icon={<Trophy size={18} />} label="Achievements" value={`${unlocked.length}/${ACHIEVEMENTS.length}`} />
      </div>

      {/* Weekly XP Chart */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <h3 className="text-lg font-display text-foreground mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-primary" /> Weekly XP
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barCategoryGap="20%">
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={35} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${value} XP`, 'Earned']}
              />
              <Bar dataKey="xp" radius={[6, 6, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.date === todayDate ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.3)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Challenges */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <h3 className="text-lg font-display text-foreground mb-4 flex items-center gap-2">
          <Gift size={18} className="text-primary" /> Today's Challenges
        </h3>
        <div className="space-y-3">
          {challenges.map(({ challenge, progress, completed, claimed }) => (
            <div
              key={challenge.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                claimed ? 'border-primary/20 bg-primary/5 opacity-70' :
                completed ? 'border-primary/40 bg-primary/10' :
                'border-border bg-secondary/20'
              }`}
            >
              <span className="text-2xl">{challenge.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">{challenge.title}</p>
                <p className="text-xs text-muted-foreground">{challenge.description}</p>
                <div className="flex gap-2 mt-2">
                  {progress.map((p, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className={`h-1.5 w-8 rounded-full ${p.current >= p.required ? 'bg-primary' : 'bg-muted'}`} />
                      <span className="text-[10px] text-muted-foreground">
                        {Math.min(p.current, p.required)}/{p.required} {p.source}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                {claimed ? (
                  <div className="flex items-center gap-1 text-primary">
                    <CheckCircle size={14} />
                    <span className="text-xs font-bold">Claimed</span>
                  </div>
                ) : completed ? (
                  <button
                    onClick={() => handleClaim(challenge.id)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors animate-bounce-gentle"
                  >
                    +{challenge.xpReward} XP
                  </button>
                ) : (
                  <span className="text-xs font-bold text-muted-foreground">+{challenge.xpReward} XP</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Breakdown */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <h3 className="text-lg font-display text-foreground mb-4">XP Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <XPSource label="Routines" count={stats.totalRoutinesCompleted} unit="completed" />
          <XPSource label="Tasks" count={stats.totalTasksCompleted} unit="done" />
          <XPSource label="Focus" count={Math.floor(stats.totalFocusMinutes / 60)} unit="hours" />
          <XPSource label="Goals" count={stats.totalGoalsCompleted} unit="achieved" />
          <XPSource label="Reviews" count={stats.totalReviews} unit="written" />
          <XPSource label="Decisions" count={stats.totalDecisions} unit="logged" />
          <XPSource label="Letters" count={stats.totalLetters} unit="written" />
          <XPSource label="Energy Logs" count={stats.totalEnergyLogs} unit="recorded" />
          <XPSource label="Rituals" count={stats.totalMorningRituals} unit="completed" />
        </div>
      </div>

      {/* Unlocked Achievements */}
      {unlocked.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-display text-foreground mb-4 flex items-center gap-2">
            <Unlock size={18} className="text-primary" /> Unlocked ({unlocked.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unlocked.map(a => (
              <AchievementCard key={a.id} achievement={a} unlocked />
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {locked.length > 0 && (
        <div>
          <h3 className="text-lg font-display text-foreground mb-4 flex items-center gap-2">
            <Lock size={18} className="text-muted-foreground" /> Locked ({locked.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {locked.map(a => (
              <AchievementCard key={a.id} achievement={a} unlocked={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'}`}>
      <div className={`mb-2 ${highlight ? 'text-primary' : 'text-muted-foreground'}`}>{icon}</div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function XPSource({ label, count, unit }: { label: string; count: number; unit: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{count} {unit}</p>
      </div>
    </div>
  );
}

function AchievementCard({ achievement, unlocked }: { achievement: Achievement; unlocked: boolean }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
      unlocked ? 'border-primary/20 bg-primary/5' : 'border-border bg-card opacity-60'
    }`}>
      <span className="text-2xl">{achievement.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>{achievement.title}</p>
        <p className="text-xs text-muted-foreground">{achievement.description}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-xs font-bold ${unlocked ? 'text-primary' : 'text-muted-foreground'}`}>+{achievement.xpReward} XP</p>
        <p className={`text-[10px] ${categoryColors[achievement.category] || 'text-muted-foreground'}`}>{achievement.category}</p>
      </div>
    </div>
  );
}
