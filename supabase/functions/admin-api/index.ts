import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 1. Verify the requesting user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Check admin role using service client (bypasses RLS)
    const admin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Parse action
    const { action, payload } = await req.json();

    // ── GET ALL USERS ────────────────────────────────────────
    if (action === "get_users") {
      const today = new Date().toISOString().slice(0, 10);
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
      const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

      // All profiles (service role bypasses RLS — sees everyone)
      const { data: profiles } = await admin.from("profiles").select("*").order("created_at", { ascending: false });
      const { data: roles } = await admin.from("user_roles").select("*");
      const { data: subs } = await admin.from("subscriptions").select("*");
      const { data: aiToday } = await admin.from("ai_coach_usage").select("user_id, message_count").eq("usage_date", today);
      const { data: aiWeek } = await admin.from("ai_coach_usage").select("user_id, message_count").gte("usage_date", weekAgo);
      const { data: aiMonth } = await admin.from("ai_coach_usage").select("user_id, message_count").gte("usage_date", monthAgo);

      // Fetch auth users for email (service role only)
      const { data: { users: authUsers } } = await admin.auth.admin.listUsers();

      // Fetch AI reset counts from notifications table
      const { data: resetNotifs } = await admin
        .from("notifications")
        .select("user_id")
        .eq("type", "ai_limit_reset");
      const resetCountMap: Record<string, number> = {};
      (resetNotifs || []).forEach((n: any) => {
        resetCountMap[n.user_id] = (resetCountMap[n.user_id] || 0) + 1;
      });

      const emailMap: Record<string, string> = {};
      const bannedMap: Record<string, boolean> = {};
      const avatarMap: Record<string, string> = {};
      (authUsers || []).forEach((u: any) => {
        emailMap[u.id] = u.email || "";
        bannedMap[u.id] = !!u.banned_until && new Date(u.banned_until) > new Date();
        // Get avatar from auth metadata - always fresh, directly from Google
        const pic =
          u.user_metadata?.avatar_url ||
          u.user_metadata?.picture ||
          u.raw_user_meta_data?.avatar_url ||
          u.raw_user_meta_data?.picture ||
          u.identities?.[0]?.identity_data?.avatar_url ||
          u.identities?.[0]?.identity_data?.picture ||
          null;
        if (pic) avatarMap[u.id] = pic;
      });

      const rolesMap: Record<string, string> = {};
      (roles || []).forEach((r: any) => { rolesMap[r.user_id] = r.role; });

      const subsMap: Record<string, any> = {};
      (subs || []).forEach((s: any) => { subsMap[s.user_id] = s; });

      const aiTodayMap: Record<string, number> = {};
      (aiToday || []).forEach((a: any) => { aiTodayMap[a.user_id] = a.message_count; });

      const aiWeekMap: Record<string, number> = {};
      (aiWeek || []).forEach((a: any) => {
        aiWeekMap[a.user_id] = (aiWeekMap[a.user_id] || 0) + a.message_count;
      });

      const aiMonthMap: Record<string, number> = {};
      (aiMonth || []).forEach((a: any) => {
        aiMonthMap[a.user_id] = (aiMonthMap[a.user_id] || 0) + a.message_count;
      });

      const userList = (profiles || []).map((p: any) => ({
        user_id: p.user_id,
        display_name: p.display_name,
        avatar_url: avatarMap[p.user_id] || p.avatar_url || null,
        email: emailMap[p.user_id] || "",
        created_at: p.created_at,
        updated_at: p.updated_at,
        timezone: p.timezone,
        role: rolesMap[p.user_id] || "user",
        plan: subsMap[p.user_id]?.plan || "free",
        sub_status: subsMap[p.user_id]?.status || "active",
        banned: bannedMap[p.user_id] || false,
        ai_reset_count: resetCountMap[p.user_id] || 0,
        ai_today: aiTodayMap[p.user_id] || 0,
        ai_week: aiWeekMap[p.user_id] || 0,
        ai_month: aiMonthMap[p.user_id] || 0,
      }));

      // Aggregate stats
      const newToday = userList.filter((u: any) => u.created_at.startsWith(today)).length;
      const newWeek = userList.filter((u: any) => u.created_at >= weekAgo).length;
      const newMonth = userList.filter((u: any) => u.created_at >= monthAgo).length;
      const proUsers = userList.filter((u: any) => u.plan !== "free").length;
      const totalAiToday = (aiToday || []).reduce((s: number, a: any) => s + a.message_count, 0);
      const totalAiWeek = Object.values(aiWeekMap).reduce((s: number, v: any) => s + v, 0);
      const totalAiMonth = Object.values(aiMonthMap).reduce((s: number, v: any) => s + v, 0);
      const activeAiToday = Object.keys(aiTodayMap).length;

      // Signups per day last 14 days (for chart)
      const signupChart: Record<string, number> = {};
      for (let i = 13; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        signupChart[d] = 0;
      }
      userList.forEach((u: any) => {
        const d = u.created_at.slice(0, 10);
        if (signupChart[d] !== undefined) signupChart[d]++;
      });

      return new Response(JSON.stringify({
        users: userList,
        stats: { totalUsers: userList.length, newToday, newWeek, newMonth, proUsers, totalAiToday, totalAiWeek, totalAiMonth, activeAiToday },
        signupChart: Object.entries(signupChart).map(([date, count]) => ({ date, count })),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── CHANGE ROLE ──────────────────────────────────────────
    if (action === "change_role") {
      const { target_user_id, role } = payload;
      if (target_user_id === user.id) {
        return new Response(JSON.stringify({ error: "Cannot change your own role" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Delete existing role rows for this user, then insert new one if not "user"
      await admin.from("user_roles").delete().eq("user_id", target_user_id);
      if (role !== "user") {
        await admin.from("user_roles").insert({ user_id: target_user_id, role });
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── CHANGE PLAN ──────────────────────────────────────────
    if (action === "change_plan") {
      const { target_user_id, plan } = payload;
      await admin.from("subscriptions")
        .update({ plan, updated_at: new Date().toISOString() })
        .eq("user_id", target_user_id);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── RESET AI LIMIT ────────────────────────────────────────
    if (action === "reset_ai_limit") {
      const { target_user_id, gift_message } = payload;
      const today = new Date().toISOString().slice(0, 10);
      await admin.from("ai_coach_usage")
        .delete()
        .eq("user_id", target_user_id)
        .eq("usage_date", today);

      // Send a gift notification to the user
      const notifMessage = gift_message || "You've received a special gift from the Haqqat team — your AI Coach limit has been reset for today! Keep up the great work 🎁";
      await admin.from("notifications").insert({
        user_id: target_user_id,
        type: "ai_limit_reset",
        message: notifMessage,
        read: false,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── BAN USER ─────────────────────────────────────────────
    if (action === "ban_user") {
      const { target_user_id } = payload;
      if (target_user_id === user.id) {
        return new Response(JSON.stringify({ error: "Cannot ban yourself" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Ban via Supabase Admin Auth API - sets banned_until to far future
      const { error } = await admin.auth.admin.updateUserById(target_user_id, {
        ban_duration: "876600h", // 100 years
      });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── UNBAN USER ───────────────────────────────────────────
    if (action === "unban_user") {
      const { target_user_id } = payload;
      const { error } = await admin.auth.admin.updateUserById(target_user_id, {
        ban_duration: "none",
      });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── DELETE USER ──────────────────────────────────────────
    if (action === "delete_user") {
      const { target_user_id } = payload;
      if (target_user_id === user.id) {
        return new Response(JSON.stringify({ error: "Cannot delete yourself" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Delete from auth — cascades to profiles, subscriptions, user_data via FK
      const { error } = await admin.auth.admin.deleteUser(target_user_id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── GET ANALYTICS ────────────────────────────────────────
    if (action === "get_analytics") {
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const day7 = new Date(now - 7 * 86400000).toISOString().slice(0, 10);
      const day30 = new Date(now - 30 * 86400000).toISOString().slice(0, 10);
      const day14 = new Date(now - 14 * 86400000).toISOString().slice(0, 10);

      // All events last 30 days
      const { data: events30 } = await admin
        .from("events")
        .select("user_id, event, properties, created_at")
        .gte("created_at", day30 + "T00:00:00Z");

      const events = events30 || [];

      // Feature usage counts
      const featureEvents = events.filter((e: any) => e.event === "feature_viewed");
      const featureCounts: Record<string, number> = {};
      featureEvents.forEach((e: any) => {
        const f = e.properties?.feature || "unknown";
        featureCounts[f] = (featureCounts[f] || 0) + 1;
      });

      // Action event counts
      const actionTypes = [
        "task_created","task_completed","goal_created","milestone_completed",
        "routine_completed","focus_session_completed","ai_coach_message_sent",
        "morning_ritual_completed","decision_logged","future_letter_written",
        "energy_logged","procrastination_logged","weekly_review_completed"
      ];
      const actionCounts: Record<string, number> = {};
      actionTypes.forEach(t => { actionCounts[t] = 0; });
      events.forEach((e: any) => {
        if (actionCounts[e.event] !== undefined) actionCounts[e.event]++;
      });

      // DAU last 14 days
      const dauMap: Record<string, Set<string>> = {};
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now - i * 86400000).toISOString().slice(0, 10);
        dauMap[d] = new Set();
      }
      events.forEach((e: any) => {
        const d = e.created_at.slice(0, 10);
        if (dauMap[d]) dauMap[d].add(e.user_id);
      });
      const dauChart = Object.entries(dauMap).map(([date, users]) => ({
        date, count: (users as Set<string>).size
      }));

      // Retention — need signup dates from profiles
      const { data: allProfiles } = await admin.from("profiles").select("user_id, created_at");
      const profiles = allProfiles || [];

      // Users who signed up in last 30 days
      const newUsers30 = profiles.filter((p: any) => p.created_at >= day30);
      const newUsers7 = profiles.filter((p: any) => p.created_at >= day7);

      // For each cohort, check who had any event after day 1
      const usersWithEvents = new Set(events.map((e: any) => e.user_id));

      // D1 retention: signed up >1 day ago AND had event after signup
      const d1Cohort = profiles.filter((p: any) => {
        const signupDate = new Date(p.created_at);
        const dayAfter = new Date(signupDate.getTime() + 86400000).toISOString();
        return signupDate < new Date(now - 86400000);
      });
      const d1Retained = d1Cohort.filter((p: any) => usersWithEvents.has(p.user_id)).length;
      const d1Rate = d1Cohort.length > 0 ? Math.round((d1Retained / d1Cohort.length) * 100) : 0;

      // D7 retention
      const d7Cohort = profiles.filter((p: any) => new Date(p.created_at) < new Date(now - 7 * 86400000));
      const d7Retained = d7Cohort.filter((p: any) => {
        return events.some((e: any) => e.user_id === p.user_id && e.created_at >= day7);
      }).length;
      const d7Rate = d7Cohort.length > 0 ? Math.round((d7Retained / d7Cohort.length) * 100) : 0;

      // D30 retention
      const d30Cohort = profiles.filter((p: any) => new Date(p.created_at) < new Date(now - 30 * 86400000));
      const d30Retained = d30Cohort.filter((p: any) => {
        return events.some((e: any) => e.user_id === p.user_id && e.created_at >= day30);
      }).length;
      const d30Rate = d30Cohort.length > 0 ? Math.round((d30Retained / d30Cohort.length) * 100) : 0;

      // Power users — most events in last 7 days
      const weekEvents = events.filter((e: any) => e.created_at >= day7);
      const userEventCounts: Record<string, number> = {};
      weekEvents.forEach((e: any) => {
        userEventCounts[e.user_id] = (userEventCounts[e.user_id] || 0) + 1;
      });
      const powerUsers = Object.entries(userEventCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([user_id, count]) => {
          const profile = profiles.find((p: any) => p.user_id === user_id);
          return { user_id, event_count: count };
        });

      // At risk — signed up 7+ days ago, no events in last 5 days
      const day5 = new Date(now - 5 * 86400000).toISOString().slice(0, 10);
      const recentActiveUsers = new Set(
        events.filter((e: any) => e.created_at >= day5 + "T00:00:00Z").map((e: any) => e.user_id)
      );
      const atRiskUsers = profiles
        .filter((p: any) => {
          const signedUpOld = new Date(p.created_at) < new Date(now - 7 * 86400000);
          return signedUpOld && !recentActiveUsers.has(p.user_id);
        }).length;

      // Total unique active users today
      const todayEvents = events.filter((e: any) => e.created_at.startsWith(today));
      const dauToday = new Set(todayEvents.map((e: any) => e.user_id)).size;
      const wauCount = new Set(weekEvents.map((e: any) => e.user_id)).size;

      return new Response(JSON.stringify({
        featureCounts,
        actionCounts,
        dauChart,
        retention: { d1: d1Rate, d7: d7Rate, d30: d30Rate },
        powerUsers,
        atRiskUsers,
        dauToday,
        wauCount,
        totalEvents30: events.length,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("admin-api error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
