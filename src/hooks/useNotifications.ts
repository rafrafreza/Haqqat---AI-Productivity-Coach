import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AppNotification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
}

// Global state so multiple NotificationBell instances share one subscription
let globalNotifications: AppNotification[] = [];
let globalListeners: Array<(n: AppNotification[]) => void> = [];
let activeChannel: any = null;
let activeUserId: string | null = null;

function notifyListeners() {
  globalListeners.forEach(fn => fn([...globalNotifications]));
}

function setupChannel(userId: string) {
  if (activeChannel && activeUserId === userId) return;
  if (activeChannel) {
    supabase.removeChannel(activeChannel);
    activeChannel = null;
  }
  activeUserId = userId;
  const channel = supabase
    .channel(`notif_${userId}_${Date.now()}`)
    .on("postgres_changes" as any, {
      event: "INSERT",
      schema: "public",
      table: "notifications",
      filter: `user_id=eq.${userId}`,
    }, (payload: any) => {
      globalNotifications = [payload.new as AppNotification, ...globalNotifications];
      notifyListeners();
    })
    .subscribe();
  activeChannel = channel;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>(globalNotifications);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  // Register as listener
  useEffect(() => {
    mounted.current = true;
    const listener = (n: AppNotification[]) => {
      if (mounted.current) setNotifications(n);
    };
    globalListeners.push(listener);
    return () => {
      mounted.current = false;
      globalListeners = globalListeners.filter(l => l !== listener);
    };
  }, []);

  // Fetch on mount
  const fetchNotifications = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data } = await (supabase as any)
        .from("notifications")
        .select("id, type, message, read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      globalNotifications = data || [];
      notifyListeners();
    } catch (e) {
      // silent
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    setupChannel(user.id);
  }, [user, fetchNotifications]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    const unreadIds = globalNotifications.filter(n => !n.read).map(n => n.id);
    if (!unreadIds.length) return;
    try {
      await (supabase as any)
        .from("notifications")
        .update({ read: true })
        .in("id", unreadIds);
      globalNotifications = globalNotifications.map(n => ({ ...n, read: true }));
      notifyListeners();
    } catch (e) { /* silent */ }
  }, [user]);

  const markOneRead = useCallback(async (id: string) => {
    try {
      await (supabase as any)
        .from("notifications")
        .update({ read: true })
        .eq("id", id);
      globalNotifications = globalNotifications.map(n => n.id === id ? { ...n, read: true } : n);
      notifyListeners();
    } catch (e) { /* silent */ }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, loading, unreadCount, markAllRead, markOneRead, refetch: fetchNotifications };
}
