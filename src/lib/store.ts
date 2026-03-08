// ===== TYPES =====

export interface Routine {
  id: string;
  name: string;
  icon: string;
  category: 'morning' | 'work' | 'health' | 'evening' | 'other';
  time?: string;
}

export interface RoutineLog {
  date: string;
  routineId: string;
  completed: boolean;
  completedAt?: string;
}

export interface Activity {
  id: string;
  date: string;
  time: string;
  title: string;
  description?: string;
  category: string;
  duration?: number;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: 'career' | 'health' | 'learning' | 'personal' | 'financial' | 'other';
  deadline?: string;
  milestones: Milestone[];
  createdAt: string;
  status: 'active' | 'completed' | 'paused';
  priority: 'high' | 'medium' | 'low';
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  priority: 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'not-urgent-not-important';
  status: 'todo' | 'in-progress' | 'done' | 'cancelled';
  category?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  createdAt: string;
  completedAt?: string;
  goalId?: string;
}

export interface FocusSession {
  id: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration: number; // minutes
  type: 'pomodoro' | 'deep-work' | 'custom';
  taskId?: string;
  label?: string;
  completed: boolean;
  distractions: number;
}

export interface WeeklyReview {
  id: string;
  weekStart: string;
  completedAt: string;
  productivityScore: number; // 1-10
  energyScore: number;
  focusScore: number;
  wins: string[];
  improvements: string[];
  nextWeekPriorities: string[];
  notes?: string;
}

export interface DailyPlan {
  date: string;
  topPriorities: string[]; // max 3
  timeBlocks: TimeBlock[];
  reflection?: string;
  moodScore?: number; // 1-5
}

export interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
  category: string;
  taskId?: string;
}

// ===== GAMIFICATION TYPES =====

export interface XPEvent {
  id: string;
  date: string;
  source: 'routine' | 'task' | 'focus' | 'goal' | 'review' | 'energy' | 'decision' | 'letter' | 'morning-ritual' | 'streak-bonus';
  amount: number;
  description: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'consistency' | 'mastery' | 'explorer' | 'milestone';
  condition: (stats: GamificationStats) => boolean;
  xpReward: number;
}

export interface GamificationStats {
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  totalRoutinesCompleted: number;
  totalTasksCompleted: number;
  totalFocusMinutes: number;
  totalGoalsCompleted: number;
  totalReviews: number;
  totalDecisions: number;
  totalLetters: number;
  totalEnergyLogs: number;
  totalMorningRituals: number;
  longestStreak: number;
  currentStreak: number;
  daysActive: number;
  unlockedAchievements: string[];
}

export interface MorningRitual {
  id: string;
  date: string;
  topPriorities: string[]; // max 3
  timeBlocks: RitualTimeBlock[];
  yesterdayReflection?: string;
  yesterdayPredictionAccuracy?: number; // 1-5
  intentionWord: string; // one word for the day
  energyForecast: 'low' | 'medium' | 'high' | 'peak';
  gratitude: string[];
  completedAt: string;
}

export interface RitualTimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
  energyMatch: 'aligned' | 'misaligned' | 'neutral';
  taskId?: string;
}

// ===== UNIQUE FEATURE TYPES =====

export interface EnergyLog {
  id: string;
  date: string;
  hour: number; // 0-23
  level: number; // 1-10
  activity?: string;
  category?: string; // what type of work was being done
  note?: string;
}

export interface BiologicalPrimeTime {
  hour: number;
  avgEnergy: number;
  sampleCount: number;
  bestFor: 'deep-work' | 'creative' | 'admin' | 'social' | 'rest';
}

export interface Decision {
  id: string;
  date: string;
  title: string;
  context: string; // situation
  options: string[]; // what options were considered
  chosen: string; // what was decided
  reasoning: string; // why
  confidence: number; // 1-10 how confident
  expectedOutcome: string;
  actualOutcome?: string;
  outcomeDate?: string;
  outcomeScore?: number; // 1-10 how well it turned out
  lessonLearned?: string;
  category: 'career' | 'health' | 'financial' | 'relationship' | 'personal' | 'other';
  revisitDate: string; // when to check back
  status: 'pending' | 'reviewed';
}

export interface ProcrastinationEntry {
  id: string;
  date: string;
  avoidedTask: string;
  whatDidInstead: string;
  feelingBefore: string; // emotion tag
  feelingDuring: string;
  triggerType: 'fear-of-failure' | 'perfectionism' | 'overwhelm' | 'boring' | 'unclear' | 'too-big' | 'anxiety' | 'low-energy' | 'distraction' | 'other';
  duration: number; // how long procrastinated in minutes
  didEventuallyDo: boolean;
  whatHelped?: string;
  note?: string;
}

export interface FutureLetter {
  id: string;
  writtenDate: string;
  deliveryDate: string; // when to reveal
  subject: string;
  content: string; // the letter
  predictions: Prediction[];
  mood: string;
  isRevealed: boolean;
  reflection?: string; // written after reveal
}

export interface Prediction {
  id: string;
  text: string;
  confidence: number; // 1-10
  wasAccurate?: boolean; // set after reveal
}

// ===== STORAGE =====

const KEYS = {
  routines: 'dayflow_routines',
  logs: 'dayflow_logs',
  activities: 'dayflow_activities',
  goals: 'dayflow_goals',
  tasks: 'dayflow_tasks',
  focusSessions: 'dayflow_focus_sessions',
  weeklyReviews: 'dayflow_weekly_reviews',
  dailyPlans: 'dayflow_daily_plans',
  pomodoroSettings: 'dayflow_pomodoro_settings',
  energyLogs: 'dayflow_energy_logs',
  decisions: 'dayflow_decisions',
  procrastination: 'dayflow_procrastination',
  futureLetters: 'dayflow_future_letters',
  xpEvents: 'dayflow_xp_events',
  gamificationStats: 'dayflow_gamification_stats',
  morningRituals: 'dayflow_morning_rituals',
} as const;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ===== DEFAULTS =====

export const defaultRoutines: Routine[] = [
  { id: '1', name: 'Wake up early', icon: '🌅', category: 'morning', time: '06:00' },
  { id: '2', name: 'Exercise', icon: '💪', category: 'health', time: '06:30' },
  { id: '3', name: 'Meditation', icon: '🧘', category: 'morning', time: '07:00' },
  { id: '4', name: 'Deep work block', icon: '🎯', category: 'work', time: '09:00' },
  { id: '5', name: 'Read 30 min', icon: '📖', category: 'evening', time: '21:00' },
  { id: '6', name: 'Journal', icon: '📝', category: 'evening', time: '21:30' },
];

export interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
}

export const defaultPomodoroSettings: PomodoroSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
};

// ===== CRUD =====

export const getRoutines = () => load(KEYS.routines, defaultRoutines);
export const saveRoutines = (data: Routine[]) => save(KEYS.routines, data);

export const getLogs = () => load<RoutineLog[]>(KEYS.logs, []);
export const saveLogs = (data: RoutineLog[]) => save(KEYS.logs, data);

export const getActivities = () => load<Activity[]>(KEYS.activities, []);
export const saveActivities = (data: Activity[]) => save(KEYS.activities, data);

export const getGoals = () => load<Goal[]>(KEYS.goals, []);
export const saveGoals = (data: Goal[]) => save(KEYS.goals, data);

export const getTasks = () => load<Task[]>(KEYS.tasks, []);
export const saveTasks = (data: Task[]) => save(KEYS.tasks, data);

export const getFocusSessions = () => load<FocusSession[]>(KEYS.focusSessions, []);
export const saveFocusSessions = (data: FocusSession[]) => save(KEYS.focusSessions, data);

export const getWeeklyReviews = () => load<WeeklyReview[]>(KEYS.weeklyReviews, []);
export const saveWeeklyReviews = (data: WeeklyReview[]) => save(KEYS.weeklyReviews, data);

export const getDailyPlans = () => load<DailyPlan[]>(KEYS.dailyPlans, []);
export const saveDailyPlans = (data: DailyPlan[]) => save(KEYS.dailyPlans, data);

export const getPomodoroSettings = () => load(KEYS.pomodoroSettings, defaultPomodoroSettings);
export const savePomodoroSettings = (data: PomodoroSettings) => save(KEYS.pomodoroSettings, data);

export const getEnergyLogs = () => load<EnergyLog[]>(KEYS.energyLogs, []);
export const saveEnergyLogs = (data: EnergyLog[]) => save(KEYS.energyLogs, data);

export const getDecisions = () => load<Decision[]>(KEYS.decisions, []);
export const saveDecisions = (data: Decision[]) => save(KEYS.decisions, data);

export const getProcrastinationEntries = () => load<ProcrastinationEntry[]>(KEYS.procrastination, []);
export const saveProcrastinationEntries = (data: ProcrastinationEntry[]) => save(KEYS.procrastination, data);

export const getFutureLetters = () => load<FutureLetter[]>(KEYS.futureLetters, []);
export const saveFutureLetters = (data: FutureLetter[]) => save(KEYS.futureLetters, data);

export const getXPEvents = () => load<XPEvent[]>(KEYS.xpEvents, []);
export const saveXPEvents = (data: XPEvent[]) => save(KEYS.xpEvents, data);

export const getMorningRituals = () => load<MorningRitual[]>(KEYS.morningRituals, []);
export const saveMorningRituals = (data: MorningRitual[]) => save(KEYS.morningRituals, data);

// ===== UTILITIES =====

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function getStreakForRoutine(routineId: string, logs: RoutineLog[]): number {
  const completedDates = logs
    .filter(l => l.routineId === routineId && l.completed)
    .map(l => l.date)
    .sort()
    .reverse();

  if (completedDates.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    if (completedDates.includes(ds)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export function getCompletionRate(routineId: string, logs: RoutineLog[], days: number): number {
  const today = new Date();
  let completed = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    if (logs.some(l => l.routineId === routineId && l.date === ds && l.completed)) {
      completed++;
    }
  }
  return Math.round((completed / days) * 100);
}

// ===== TASK HELPERS =====

export function getOverdueTasks(tasks: Task[]): Task[] {
  const today = todayStr();
  return tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled' && t.deadline && t.deadline < today);
}

export function getDueSoonTasks(tasks: Task[], days: number = 3): Task[] {
  const today = new Date();
  const future = new Date(today);
  future.setDate(future.getDate() + days);
  const todayS = todayStr();
  const futureS = future.toISOString().slice(0, 10);
  return tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled' && t.deadline && t.deadline >= todayS && t.deadline <= futureS);
}

export function getTasksByEisenhower(tasks: Task[]) {
  const active = tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled');
  return {
    'urgent-important': active.filter(t => t.priority === 'urgent-important'),
    'not-urgent-important': active.filter(t => t.priority === 'not-urgent-important'),
    'urgent-not-important': active.filter(t => t.priority === 'urgent-not-important'),
    'not-urgent-not-important': active.filter(t => t.priority === 'not-urgent-not-important'),
  };
}

// ===== GOAL HELPERS =====

export function getGoalProgress(goal: Goal): number {
  if (goal.milestones.length === 0) return goal.status === 'completed' ? 100 : 0;
  const done = goal.milestones.filter(m => m.completed).length;
  return Math.round((done / goal.milestones.length) * 100);
}

// ===== FOCUS HELPERS =====

export function getTodayFocusMinutes(sessions: FocusSession[]): number {
  const today = todayStr();
  return sessions
    .filter(s => s.date === today && s.completed)
    .reduce((sum, s) => sum + s.duration, 0);
}

export function getWeekFocusMinutes(sessions: FocusSession[]): number {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoS = weekAgo.toISOString().slice(0, 10);
  return sessions
    .filter(s => s.date >= weekAgoS && s.completed)
    .reduce((sum, s) => sum + s.duration, 0);
}

// ===== PRODUCTIVITY SCORE =====

export function calculateDailyProductivityScore(date: string): number {
  const logs = getLogs();
  const routines = getRoutines();
  const tasks = getTasks();
  const sessions = getFocusSessions();

  const routinesDone = logs.filter(l => l.date === date && l.completed).length;
  const routinesTotal = routines.length || 1;
  const routineScore = (routinesDone / routinesTotal) * 30; // 30% weight

  const tasksDone = tasks.filter(t => t.completedAt?.startsWith(date)).length;
  const taskScore = Math.min(tasksDone * 10, 30); // 30% weight, max 30

  const focusMins = sessions.filter(s => s.date === date && s.completed).reduce((sum, s) => sum + s.duration, 0);
  const focusScore = Math.min((focusMins / 120) * 25, 25); // 25% weight, 2h = max

  const overdue = getOverdueTasks(tasks).length;
  const penaltyScore = Math.max(15 - overdue * 3, 0); // 15% weight

  return Math.round(routineScore + taskScore + focusScore + penaltyScore);
}

export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

// ===== ENERGY MAPPING HELPERS =====

export function calculateBiologicalPrimeTime(logs: EnergyLog[]): BiologicalPrimeTime[] {
  const hourMap: Record<number, { total: number; count: number; categories: Record<string, number> }> = {};

  for (let h = 0; h < 24; h++) {
    hourMap[h] = { total: 0, count: 0, categories: {} };
  }

  logs.forEach(l => {
    hourMap[l.hour].total += l.level;
    hourMap[l.hour].count++;
    if (l.category) {
      hourMap[l.hour].categories[l.category] = (hourMap[l.hour].categories[l.category] || 0) + l.level;
    }
  });

  return Object.entries(hourMap).map(([hour, data]) => {
    const h = parseInt(hour);
    const avg = data.count > 0 ? Math.round((data.total / data.count) * 10) / 10 : 0;
    
    // Determine best work type based on energy level
    let bestFor: BiologicalPrimeTime['bestFor'] = 'rest';
    if (avg >= 8) bestFor = 'deep-work';
    else if (avg >= 6) bestFor = 'creative';
    else if (avg >= 4) bestFor = 'admin';
    else if (avg >= 2) bestFor = 'social';

    return { hour: h, avgEnergy: avg, sampleCount: data.count, bestFor };
  });
}

export function getDecisionAccuracy(decisions: Decision[]): number {
  const reviewed = decisions.filter(d => d.status === 'reviewed' && d.outcomeScore !== undefined);
  if (reviewed.length === 0) return 0;
  
  // Compare confidence vs outcome
  const accurateDecisions = reviewed.filter(d => {
    const confidenceNorm = d.confidence / 10;
    const outcomeNorm = (d.outcomeScore || 5) / 10;
    return Math.abs(confidenceNorm - outcomeNorm) < 0.3; // within 30%
  });
  
  return Math.round((accurateDecisions.length / reviewed.length) * 100);
}

export function getProcrastinationPatterns(entries: ProcrastinationEntry[]): Record<string, number> {
  const patterns: Record<string, number> = {};
  entries.forEach(e => {
    patterns[e.triggerType] = (patterns[e.triggerType] || 0) + 1;
  });
  return patterns;
}

// ===== GAMIFICATION HELPERS =====

const XP_TABLE: Record<string, number> = {
  'routine': 10,
  'task': 15,
  'focus': 5, // per 25 min
  'goal': 50,
  'review': 30,
  'energy': 5,
  'decision': 20,
  'letter': 25,
  'morning-ritual': 20,
  'streak-bonus': 0, // calculated dynamically
};

export function calculateLevel(totalXP: number): { level: number; currentLevelXP: number; nextLevelXP: number } {
  // Each level requires progressively more XP: level N needs N*100 XP
  let level = 1;
  let xpNeeded = 100;
  let remaining = totalXP;
  while (remaining >= xpNeeded) {
    remaining -= xpNeeded;
    level++;
    xpNeeded = level * 100;
  }
  return { level, currentLevelXP: remaining, nextLevelXP: xpNeeded };
}

export function awardXP(source: XPEvent['source'], description: string, customAmount?: number): XPEvent {
  const events = getXPEvents();
  const amount = customAmount ?? XP_TABLE[source] ?? 10;
  const event: XPEvent = {
    id: generateId(),
    date: todayStr(),
    source,
    amount,
    description,
  };
  events.push(event);
  saveXPEvents(events);
  return event;
}

export function getGamificationStats(): GamificationStats {
  const events = getXPEvents();
  const logs = getLogs();
  const tasks = getTasks();
  const sessions = getFocusSessions();
  const goals = getGoals();
  const reviews = getWeeklyReviews();
  const decisions = getDecisions();
  const letters = getFutureLetters();
  const energyLogs = getEnergyLogs();
  const rituals = getMorningRituals();
  const routines = getRoutines();

  const totalXP = events.reduce((s, e) => s + e.amount, 0);
  const { level, currentLevelXP, nextLevelXP } = calculateLevel(totalXP);

  // Calculate days active
  const activeDays = new Set(events.map(e => e.date)).size;

  // Calculate current streak (consecutive days with XP)
  let currentStreak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    if (events.some(e => e.date === ds)) {
      currentStreak++;
    } else if (i > 0) break;
  }

  // Longest streak
  const sortedDates = [...new Set(events.map(e => e.date))].sort();
  let longestStreak = 0;
  let tempStreak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  const stats: GamificationStats = {
    totalXP,
    level,
    currentLevelXP,
    nextLevelXP,
    totalRoutinesCompleted: logs.filter(l => l.completed).length,
    totalTasksCompleted: tasks.filter(t => t.status === 'done').length,
    totalFocusMinutes: sessions.filter(s => s.completed).reduce((s, f) => s + f.duration, 0),
    totalGoalsCompleted: goals.filter(g => g.status === 'completed').length,
    totalReviews: reviews.length,
    totalDecisions: decisions.length,
    totalLetters: letters.length,
    totalEnergyLogs: energyLogs.length,
    totalMorningRituals: rituals.length,
    longestStreak,
    currentStreak,
    daysActive: activeDays,
    unlockedAchievements: [],
  };

  // Check achievements
  stats.unlockedAchievements = ACHIEVEMENTS.filter(a => a.condition(stats)).map(a => a.id);
  return stats;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-step', title: 'First Step', description: 'Earn your first XP', icon: '👣', category: 'milestone', condition: s => s.totalXP > 0, xpReward: 10 },
  { id: 'century', title: 'Century', description: 'Reach 100 XP', icon: '💯', category: 'milestone', condition: s => s.totalXP >= 100, xpReward: 20 },
  { id: 'thousand', title: 'XP Thousandaire', description: 'Reach 1,000 XP', icon: '🏆', category: 'milestone', condition: s => s.totalXP >= 1000, xpReward: 50 },
  { id: 'level5', title: 'Rising Star', description: 'Reach level 5', icon: '⭐', category: 'milestone', condition: s => s.level >= 5, xpReward: 30 },
  { id: 'level10', title: 'Veteran', description: 'Reach level 10', icon: '🌟', category: 'milestone', condition: s => s.level >= 10, xpReward: 100 },
  { id: 'streak3', title: 'Hat Trick', description: '3-day streak', icon: '🔥', category: 'consistency', condition: s => s.currentStreak >= 3, xpReward: 15 },
  { id: 'streak7', title: 'Week Warrior', description: '7-day streak', icon: '⚡', category: 'consistency', condition: s => s.currentStreak >= 7, xpReward: 30 },
  { id: 'streak30', title: 'Iron Will', description: '30-day streak', icon: '💎', category: 'consistency', condition: s => s.currentStreak >= 30, xpReward: 100 },
  { id: 'streak100', title: 'Unstoppable', description: '100-day streak', icon: '👑', category: 'consistency', condition: s => s.longestStreak >= 100, xpReward: 500 },
  { id: 'tasks10', title: 'Task Slayer', description: 'Complete 10 tasks', icon: '⚔️', category: 'mastery', condition: s => s.totalTasksCompleted >= 10, xpReward: 20 },
  { id: 'tasks50', title: 'Productivity Machine', description: 'Complete 50 tasks', icon: '🤖', category: 'mastery', condition: s => s.totalTasksCompleted >= 50, xpReward: 50 },
  { id: 'focus120', title: 'Deep Diver', description: '120 minutes of focus', icon: '🤿', category: 'mastery', condition: s => s.totalFocusMinutes >= 120, xpReward: 25 },
  { id: 'focus600', title: 'Flow State Master', description: '10 hours of focus', icon: '🧠', category: 'mastery', condition: s => s.totalFocusMinutes >= 600, xpReward: 75 },
  { id: 'goal1', title: 'Goal Getter', description: 'Complete your first goal', icon: '🎯', category: 'mastery', condition: s => s.totalGoalsCompleted >= 1, xpReward: 50 },
  { id: 'explorer-energy', title: 'Body Scientist', description: 'Log 10 energy readings', icon: '🔬', category: 'explorer', condition: s => s.totalEnergyLogs >= 10, xpReward: 20 },
  { id: 'explorer-decision', title: 'Wise Judge', description: 'Record 5 decisions', icon: '⚖️', category: 'explorer', condition: s => s.totalDecisions >= 5, xpReward: 25 },
  { id: 'explorer-letter', title: 'Time Traveler', description: 'Write 3 future letters', icon: '✉️', category: 'explorer', condition: s => s.totalLetters >= 3, xpReward: 30 },
  { id: 'ritual5', title: 'Morning Person', description: 'Complete 5 morning rituals', icon: '🌅', category: 'consistency', condition: s => s.totalMorningRituals >= 5, xpReward: 25 },
  { id: 'ritual30', title: 'Ritual Master', description: 'Complete 30 morning rituals', icon: '🏛️', category: 'consistency', condition: s => s.totalMorningRituals >= 30, xpReward: 100 },
  { id: 'routines100', title: 'Habit Architect', description: 'Complete 100 routines', icon: '🏗️', category: 'mastery', condition: s => s.totalRoutinesCompleted >= 100, xpReward: 50 },
  { id: 'days30', title: 'Monthly Devotee', description: 'Active for 30 days', icon: '📅', category: 'consistency', condition: s => s.daysActive >= 30, xpReward: 75 },
  { id: 'allfeatures', title: 'Renaissance Soul', description: 'Use every feature at least once', icon: '🎨', category: 'explorer', condition: s => s.totalRoutinesCompleted > 0 && s.totalTasksCompleted > 0 && s.totalFocusMinutes > 0 && s.totalDecisions > 0 && s.totalLetters > 0 && s.totalEnergyLogs > 0 && s.totalMorningRituals > 0, xpReward: 100 },
];

export function getLifeBalanceScores(): Record<string, number> {
  const activities = getActivities();
  const tasks = getTasks();
  const routines = getRoutines();
  const logs = getLogs();
  const sessions = getFocusSessions();
  const goals = getGoals();

  // Calculate scores for each life dimension (0-100)
  const dimensions: Record<string, number> = {
    'Career': 0,
    'Health': 0,
    'Learning': 0,
    'Relationships': 0,
    'Creativity': 0,
    'Finance': 0,
    'Mindfulness': 0,
    'Rest': 0,
  };

  // From activities (last 14 days)
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const recentActivities = activities.filter(a => a.date >= twoWeeksAgo.toISOString().slice(0, 10));
  
  const catMapping: Record<string, string> = {
    'Work': 'Career', 'Learning': 'Learning', 'Health': 'Health',
    'Personal': 'Mindfulness', 'Social': 'Relationships', 'Creative': 'Creativity', 'Other': 'Rest',
  };

  const totalMins = recentActivities.reduce((s, a) => s + (a.duration || 30), 0) || 1;
  recentActivities.forEach(a => {
    const dim = catMapping[a.category] || 'Rest';
    dimensions[dim] += ((a.duration || 30) / totalMins) * 60;
  });

  // From routines completion (last 7 days)
  const healthRoutines = routines.filter(r => r.category === 'health');
  if (healthRoutines.length > 0) {
    const healthRate = healthRoutines.reduce((s, r) => s + getCompletionRate(r.id, logs, 7), 0) / healthRoutines.length;
    dimensions['Health'] += healthRate * 0.4;
  }

  // From goals
  const activeGoals = goals.filter(g => g.status === 'active');
  const goalCatMap: Record<string, string> = { career: 'Career', health: 'Health', learning: 'Learning', personal: 'Mindfulness', financial: 'Finance' };
  activeGoals.forEach(g => {
    const dim = goalCatMap[g.category] || 'Mindfulness';
    const progress = getGoalProgress(g);
    dimensions[dim] += progress * 0.2;
  });

  // From focus sessions
  const weekFocus = getWeekFocusMinutes(sessions);
  dimensions['Career'] += Math.min(weekFocus / 600 * 30, 30);

  // Cap all at 100
  Object.keys(dimensions).forEach(k => {
    dimensions[k] = Math.min(Math.round(dimensions[k]), 100);
  });

  return dimensions;
}
