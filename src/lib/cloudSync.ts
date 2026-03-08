import { supabase } from "@/integrations/supabase/client";

// Sync localStorage data to cloud for authenticated user
export async function syncToCloud(userId: string): Promise<void> {
  const KEYS_TO_SYNC = [
    'dayflow_routines', 'dayflow_logs', 'dayflow_activities', 'dayflow_goals',
    'dayflow_tasks', 'dayflow_focus_sessions', 'dayflow_weekly_reviews',
    'dayflow_daily_plans', 'dayflow_pomodoro_settings', 'dayflow_energy_logs',
    'dayflow_decisions', 'dayflow_procrastination', 'dayflow_future_letters',
    'dayflow_xp_events', 'dayflow_morning_rituals',
  ];

  for (const key of KEYS_TO_SYNC) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const value = JSON.parse(raw);
      await supabase.from('user_data').upsert(
        { user_id: userId, data_key: key, data_value: value },
        { onConflict: 'user_id,data_key' }
      );
    } catch { /* skip invalid */ }
  }
}

// Load cloud data into localStorage
export async function loadFromCloud(userId: string): Promise<void> {
  const { data } = await supabase
    .from('user_data')
    .select('data_key, data_value')
    .eq('user_id', userId);

  if (!data) return;

  for (const row of data) {
    localStorage.setItem(row.data_key, JSON.stringify(row.data_value));
  }
}

// Save a single key to cloud (call after localStorage updates)
export async function saveKeyToCloud(userId: string, key: string): Promise<void> {
  const raw = localStorage.getItem(key);
  if (!raw) return;

  try {
    const value = JSON.parse(raw);
    await supabase.from('user_data').upsert(
      { user_id: userId, data_key: key, data_value: value },
      { onConflict: 'user_id,data_key' }
    );
  } catch { /* skip */ }
}
