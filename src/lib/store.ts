export interface Routine {
  id: string;
  name: string;
  icon: string;
  category: 'morning' | 'work' | 'health' | 'evening' | 'other';
  time?: string;
}

export interface RoutineLog {
  date: string; // YYYY-MM-DD
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
  duration?: number; // minutes
}

const ROUTINES_KEY = 'dayflow_routines';
const LOGS_KEY = 'dayflow_logs';
const ACTIVITIES_KEY = 'dayflow_activities';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const defaultRoutines: Routine[] = [
  { id: '1', name: 'Wake up early', icon: '🌅', category: 'morning', time: '06:00' },
  { id: '2', name: 'Exercise', icon: '💪', category: 'health', time: '06:30' },
  { id: '3', name: 'Meditation', icon: '🧘', category: 'morning', time: '07:00' },
  { id: '4', name: 'Deep work block', icon: '🎯', category: 'work', time: '09:00' },
  { id: '5', name: 'Read 30 min', icon: '📖', category: 'evening', time: '21:00' },
  { id: '6', name: 'Journal', icon: '📝', category: 'evening', time: '21:30' },
];

export function getRoutines(): Routine[] {
  return load(ROUTINES_KEY, defaultRoutines);
}

export function saveRoutines(routines: Routine[]) {
  save(ROUTINES_KEY, routines);
}

export function getLogs(): RoutineLog[] {
  return load(LOGS_KEY, []);
}

export function saveLogs(logs: RoutineLog[]) {
  save(LOGS_KEY, logs);
}

export function getActivities(): Activity[] {
  return load(ACTIVITIES_KEY, []);
}

export function saveActivities(activities: Activity[]) {
  save(ACTIVITIES_KEY, activities);
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
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
