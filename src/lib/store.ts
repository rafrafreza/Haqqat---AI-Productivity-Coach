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
