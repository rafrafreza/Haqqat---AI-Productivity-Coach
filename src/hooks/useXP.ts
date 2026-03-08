import { awardXP, getGamificationStats, calculateLevel, getXPEvents, ACHIEVEMENTS, type XPEvent } from "@/lib/store";

export interface XPResult {
  event: XPEvent;
  totalXP: number;
  level: number;
  previousLevel: number;
  leveledUp: boolean;
  newAchievements: { id: string; title: string; icon: string; xpReward: number }[];
}

export function useXPAward() {
  const grantXP = (source: XPEvent['source'], description: string, customAmount?: number): XPResult => {
    // Get state before
    const eventsBefore = getXPEvents();
    const totalBefore = eventsBefore.reduce((s, e) => s + e.amount, 0);
    const { level: prevLevel } = calculateLevel(totalBefore);
    const statsBefore = getGamificationStats();
    const unlockedBefore = new Set(statsBefore.unlockedAchievements);

    // Award XP
    const event = awardXP(source, description, customAmount);

    // Get state after
    const eventsAfter = getXPEvents();
    const totalAfter = eventsAfter.reduce((s, e) => s + e.amount, 0);
    const { level: newLevel } = calculateLevel(totalAfter);
    const statsAfter = getGamificationStats();

    // Detect new achievements
    const newAchievements = ACHIEVEMENTS
      .filter(a => statsAfter.unlockedAchievements.includes(a.id) && !unlockedBefore.has(a.id))
      .map(a => ({ id: a.id, title: a.title, icon: a.icon, xpReward: a.xpReward }));

    return {
      event,
      totalXP: totalAfter,
      level: newLevel,
      previousLevel: prevLevel,
      leveledUp: newLevel > prevLevel,
      newAchievements,
    };
  };

  return { grantXP };
}
