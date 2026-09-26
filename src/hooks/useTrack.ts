import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type TrackEvent =
  | "app_opened"
  | "feature_viewed"
  | "task_created"
  | "task_completed"
  | "goal_created"
  | "milestone_completed"
  | "routine_completed"
  | "focus_session_completed"
  | "ai_coach_opened"
  | "ai_coach_message_sent"
  | "morning_ritual_completed"
  | "onboarding_completed"
  | "decision_logged"
  | "future_letter_written"
  | "energy_logged"
  | "procrastination_logged"
  | "weekly_review_completed";

export function useTrack() {
  const { user } = useAuth();

  const track = useCallback((event: TrackEvent, properties?: Record<string, any>) => {
    if (!user) return;
    // Fire and forget — never blocks the user
    supabase
      .from("events" as any)
      .insert({
        user_id: user.id,
        event,
        properties: properties || {},
      })
      .then(() => {}); // silent — errors don't surface to user
  }, [user]);

  return { track };
}
