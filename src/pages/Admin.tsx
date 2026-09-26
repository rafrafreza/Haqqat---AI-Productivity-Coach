import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Users, Bot, Shield, TrendingUp, Activity, Search,
  RefreshCw, Crown, AlertTriangle, Ban, CheckCircle2,
  ChevronUp, ChevronDown, RotateCcw, LogOut, BarChart3,
  UserCheck, Zap, Calendar, Mail, Trash2, UserX, UserCheck2
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

// ── Types ─────────────────────────────────────────────────
interface AdminUser {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string;
  created_at: string;
  timezone: string | null;
  role: string;
  plan: string;
  sub_status: string;
  ai_today: number;
  ai_week: number;
  ai_month: number;
  banned: boolean;
  ai_reset_count: number;
}

interface Stats {
  totalUsers: number;
  newToday: number;
  newWeek: number;
  newMonth: number;
  proUsers: number;
  totalAiToday: number;
  totalAiWeek: number;
  totalAiMonth: number;
  activeAiToday: number;
}

interface ChartPoint { date: string; count: number; }

// ── API helper ────────────────────────────────────────────
async function callAdminApi(action: string, payload?: Record<string, any>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
        "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ action, payload }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ── Stat card ─────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, trend, color = "text-primary" }: {
  icon: any; label: string; value: string | number; sub?: string; trend?: string; color?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center`}>
          <Icon size={17} className={color} />
        </div>
        {trend && <span className="text-[10px] text-green-500 font-semibold bg-green-500/10 px-2 py-0.5 rounded-full">{trend}</span>}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Sparkline bar chart ───────────────────────────────────
function SparkChart({ data }: { data: ChartPoint[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-0.5 h-12">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
          <div
            className="w-full rounded-sm bg-primary/60 hover:bg-primary transition-all cursor-default"
            style={{ height: `${Math.max(4, (d.count / max) * 44)}px` }}
          />
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">
            {d.date.slice(5)}: {d.count}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────
function UserAvatar({ user }: { user: AdminUser }) {
  const initials = (user.display_name || user.email || "?").charAt(0).toUpperCase();
  // Render both — show image if available, fallback div always ready
  // onError swaps visibility so no useState re-render issues
  return (
    <div className="w-8 h-8 rounded-full shrink-0 relative">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs absolute inset-0">
        {initials}
      </div>
      {user.avatar_url && (
        <img
          src={user.avatar_url}
          className="w-8 h-8 rounded-full object-cover absolute inset-0"
          alt=""
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────
export default function Admin() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [chart, setChart] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof AdminUser>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterRole, setFilterRole] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");
  const [tab, setTab] = useState<"overview" | "users" | "ai" | "analytics">("overview");
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── Check admin ──
  useEffect(() => {
    if (!user) { navigate("/"); return; }
    supabase.rpc("has_role", { _role: "admin", _user_id: user.id })
      .then(({ data, error }) => {
        if (error || !data) { setIsAdmin(false); navigate("/"); return; }
        setIsAdmin(true);
      });
  }, [user, navigate]);

  // ── Load all data via secure edge function ──
  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await callAdminApi("get_users");
      setUsers(data.users);
      setStats(data.stats);
      setChart(data.signupChart);
    } catch (e: any) {
      toast({ title: "Failed to load data", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { if (isAdmin) loadData(); }, [isAdmin, loadData]);

  const loadAnalytics = useCallback(async () => {
    if (analytics) return; // already loaded
    setAnalyticsLoading(true);
    try {
      const data = await callAdminApi("get_analytics");
      setAnalytics(data);
    } catch (e: any) {
      toast({ title: "Failed to load analytics", description: e.message, variant: "destructive" });
    } finally {
      setAnalyticsLoading(false);
    }
  }, [analytics]);

  useEffect(() => {
    if (tab === "analytics" && isAdmin && !analytics) loadAnalytics();
  }, [tab, isAdmin, analytics, loadAnalytics]);

  // ── Actions ──
  const changePlan = async (userId: string, plan: string) => {
    setActionLoading(`plan-${userId}`);
    try {
      await callAdminApi("change_plan", { target_user_id: userId, plan });
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, plan } : u));
      toast({ title: "Plan updated" });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const banUser = async (userId: string, name: string) => {
    setActionLoading(`ban-${userId}`);
    try {
      await callAdminApi("ban_user", { target_user_id: userId });
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, banned: true } : u));
      toast({ title: `${name} has been banned` });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const unbanUser = async (userId: string, name: string) => {
    setActionLoading(`ban-${userId}`);
    try {
      await callAdminApi("unban_user", { target_user_id: userId });
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, banned: false } : u));
      toast({ title: `${name} has been unbanned` });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId: string, name: string) => {
    setActionLoading(`delete-${userId}`);
    try {
      await callAdminApi("delete_user", { target_user_id: userId });
      setUsers(prev => prev.filter(u => u.user_id !== userId));
      toast({ title: `${name} has been permanently deleted` });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const resetAiLimit = async (userId: string, name: string) => {
    setActionLoading(`ai-${userId}`);
    try {
      await callAdminApi("reset_ai_limit", { target_user_id: userId });
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, ai_today: 0, ai_reset_count: u.ai_reset_count + 1 } : u));
      toast({ title: `AI limit reset for ${name}` });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  // ── Sort / filter ──
  const toggleSort = (col: keyof AdminUser) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const SortBtn = ({ col, label }: { col: keyof AdminUser; label: string }) => (
    <button onClick={() => toggleSort(col)} className="flex items-center gap-1 hover:text-foreground transition-colors">
      {label}
      {sortBy === col ? (sortDir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />) : <ChevronDown size={11} className="opacity-30" />}
    </button>
  );

  const filtered = users
    .filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !q || (u.display_name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.user_id.includes(q));
      const matchRole = filterRole === "all" || u.role === filterRole;
      const matchPlan = filterPlan === "all" || u.plan === filterPlan;
      return matchSearch && matchRole && matchPlan;
    })
    .sort((a, b) => {
      let av: any = a[sortBy] ?? "", bv: any = b[sortBy] ?? "";
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const roleColor = (r: string) =>
    r === "admin" ? "text-destructive bg-destructive/10" :
    r === "moderator" ? "text-primary bg-primary/10" :
    "text-muted-foreground bg-secondary";

  const planColor = (p: string) =>
    p === "pro" ? "text-yellow-600 bg-yellow-500/10" : "text-muted-foreground bg-secondary";

  const topAiUsers = [...users].sort((a, b) => b.ai_today - a.ai_today).filter(u => u.ai_today > 0).slice(0, 15);
  const atLimit = users.filter(u => u.ai_today >= 10);

  if (isAdmin === null || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) return null;

  return (
    <div className="min-h-screen bg-background">

      {/* ── Header ── */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Shield size={15} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground leading-none">Haqqat Admin</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">Signed in as {user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-destructive/10 text-destructive hidden sm:block">
              ⬡ Admin
            </span>
            <Button variant="outline" size="sm" onClick={loadData} disabled={refreshing} className="gap-1.5 text-xs h-8">
              <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
              <span className="hidden sm:block">Refresh</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-xs h-8 text-muted-foreground">
              ← App
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-xs h-8 text-muted-foreground gap-1">
              <LogOut size={11} /> Sign out
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex gap-0 border-t border-border">
          {(["overview", "users", "ai", "analytics"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "ai" ? "AI Usage" : t === "overview" ? "Overview" : t === "analytics" ? "Analytics" : "Users"}
              {t === "users" && <span className="ml-1.5 text-[10px] bg-secondary px-1.5 py-0.5 rounded-full">{users.length}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* ── OVERVIEW ── */}
        {tab === "overview" && stats && (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Total Users" value={stats.totalUsers} sub="All time" />
              <StatCard icon={TrendingUp} label="New This Week" value={stats.newWeek} sub={`${stats.newToday} today`} trend={`+${stats.newToday} today`} color="text-green-500" />
              <StatCard icon={Crown} label="Pro Users" value={stats.proUsers} sub={`${((stats.proUsers / Math.max(stats.totalUsers, 1)) * 100).toFixed(1)}% of users`} color="text-yellow-500" />
              <StatCard icon={Bot} label="AI Messages Today" value={stats.totalAiToday} sub={`${stats.activeAiToday} active users`} color="text-purple-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard icon={Activity} label="AI This Week" value={stats.totalAiWeek} color="text-blue-500" />
              <StatCard icon={BarChart3} label="AI This Month" value={stats.totalAiMonth} color="text-pink-500" />
              <StatCard icon={UserCheck} label="New This Month" value={stats.newMonth} color="text-cyan-500" />
            </div>

            {/* Signup chart */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-foreground text-sm">Signups — Last 14 Days</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Daily new user registrations</p>
                </div>
                <span className="text-2xl font-bold text-primary">{stats.newWeek}</span>
              </div>
              <SparkChart data={chart} />
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-muted-foreground">{chart[0]?.date}</span>
                <span className="text-[10px] text-muted-foreground">Today</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recent signups */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                  <Calendar size={14} className="text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-foreground">Recent Signups</h2>
                </div>
                <div className="divide-y divide-border">
                  {users.slice(0, 8).map(u => (
                    <div key={u.user_id} className="flex items-center gap-3 px-5 py-2.5">
                      <UserAvatar user={u} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{u.display_name || "Unnamed"}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${roleColor(u.role)}`}>{u.role}</span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(u.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* At-limit warning */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                  <AlertTriangle size={14} className="text-yellow-500" />
                  <h2 className="text-sm font-semibold text-foreground">AI Limit Alerts</h2>
                  {atLimit.length > 0 && (
                    <span className="ml-auto text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-medium">
                      {atLimit.length} at limit
                    </span>
                  )}
                </div>
                {atLimit.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <CheckCircle2 size={24} className="text-green-500 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No users at their AI limit today</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {atLimit.map(u => (
                      <div key={u.user_id} className="flex items-center gap-3 px-5 py-2.5">
                        <UserAvatar user={u} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{u.display_name || u.email}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex-1 h-1 bg-secondary rounded-full">
                              <div className="h-full bg-destructive rounded-full w-full" />
                            </div>
                            <span className="text-[10px] text-destructive font-semibold shrink-0">{u.ai_today}/10</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={actionLoading === `ai-${u.user_id}`}
                          onClick={() => resetAiLimit(u.user_id, u.display_name || u.email)}
                          className="text-[10px] h-6 px-2 text-primary hover:text-primary"
                        >
                          <RotateCcw size={10} className="mr-1" /> Reset
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-52">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search name, email, or ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-32 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPlan} onValueChange={setFilterPlan}>
                <SelectTrigger className="w-32 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">{filtered.length} of {users.length} users</span>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/20 text-xs text-muted-foreground">
                      <th className="text-left px-4 py-3 font-semibold"><SortBtn col="display_name" label="User" /></th>
                      <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Email</th>
                      <th className="text-left px-4 py-3 font-semibold"><SortBtn col="created_at" label="Joined" /></th>
                      <th className="text-left px-4 py-3 font-semibold">Role</th>
                      <th className="text-left px-4 py-3 font-semibold">Plan</th>
                      <th className="text-left px-4 py-3 font-semibold"><SortBtn col="ai_today" label="AI Today" /></th>
                      <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell"><SortBtn col="ai_week" label="AI Week" /></th>
                      <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Resets</th>
                      <th className="px-4 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map(u => (
                      <tr key={u.user_id} className={`hover:bg-secondary/10 transition-colors ${u.user_id === user?.id ? "bg-primary/5" : ""}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar user={u} />
                            <div>
                              <p className="text-xs font-medium text-foreground">{u.display_name || "Unnamed"}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{u.user_id.slice(0, 8)}…</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail size={11} />
                            <span className="truncate max-w-36">{u.email || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${roleColor(u.role)}`}>
                            {u.role}
                          </span>
                          {u.banned && (
                            <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-destructive/10 text-destructive">
                              banned
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Select value={u.plan} onValueChange={v => changePlan(u.user_id, v)} disabled={actionLoading === `plan-${u.user_id}`}>
                            <SelectTrigger className={`h-6 text-[10px] px-2 w-20 border-0 rounded-full font-medium ${planColor(u.plan)}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${u.ai_today >= 10 ? "bg-destructive" : u.ai_today >= 7 ? "bg-yellow-500" : "bg-primary"}`}
                                style={{ width: `${Math.min(100, (u.ai_today / 10) * 100)}%` }} />
                            </div>
                            <span className={`text-xs font-medium ${u.ai_today >= 10 ? "text-destructive" : "text-foreground"}`}>{u.ai_today}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{u.ai_week}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {u.ai_reset_count > 0 ? (
                            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              🎁 {u.ai_reset_count}x
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {u.ai_today >= 10 && u.user_id !== user?.id && (
                              <Button variant="ghost" size="sm" onClick={() => resetAiLimit(u.user_id, u.display_name || u.email)}
                                disabled={actionLoading === `ai-${u.user_id}`}
                                className="h-6 text-[10px] px-2 text-primary hover:text-primary">
                                <RotateCcw size={10} className="mr-1" /> Reset
                              </Button>
                            )}
                            {u.user_id !== user?.id && (
                              <>
                                {u.banned ? (
                                  <Button variant="ghost" size="sm"
                                    onClick={() => unbanUser(u.user_id, u.display_name || u.email)}
                                    disabled={actionLoading === `ban-${u.user_id}`}
                                    className="h-6 text-[10px] px-2 text-green-600 hover:text-green-600">
                                    <UserCheck2 size={10} className="mr-1" /> Unban
                                  </Button>
                                ) : (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm"
                                        disabled={actionLoading === `ban-${u.user_id}`}
                                        className="h-6 text-[10px] px-2 text-yellow-600 hover:text-yellow-600">
                                        <UserX size={10} className="mr-1" /> Ban
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-card border-border">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Ban {u.display_name || u.email}?</AlertDialogTitle>
                                        <AlertDialogDescription>They will be immediately signed out and unable to log in. You can unban them later.</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => banUser(u.user_id, u.display_name || u.email)} className="bg-yellow-600 hover:bg-yellow-700">Ban User</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm"
                                      disabled={actionLoading === `delete-${u.user_id}`}
                                      className="h-6 text-[10px] px-2 text-destructive hover:text-destructive">
                                      <Trash2 size={10} className="mr-1" /> Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-card border-border">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Permanently delete {u.display_name || u.email}?</AlertDialogTitle>
                                      <AlertDialogDescription>This cannot be undone. All their data, tasks, goals, and history will be permanently erased.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteUser(u.user_id, u.display_name || u.email)} className="bg-destructive hover:bg-destructive/90">Delete Permanently</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                            {u.user_id === user?.id && <span className="text-[10px] text-muted-foreground">You</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground text-sm">
                    <Search size={28} className="mx-auto mb-3 opacity-30" />
                    No users match your filters
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── AI USAGE ── */}
        {tab === "ai" && stats && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Bot} label="AI Messages Today" value={stats.totalAiToday} color="text-purple-500" />
              <StatCard icon={Zap} label="Active AI Users Today" value={stats.activeAiToday} color="text-blue-500" />
              <StatCard icon={Activity} label="AI Messages This Week" value={stats.totalAiWeek} color="text-pink-500" />
              <StatCard icon={BarChart3} label="AI Messages This Month" value={stats.totalAiMonth} color="text-cyan-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top users today */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border">
                  <h2 className="text-sm font-semibold text-foreground">Top AI Users Today</h2>
                  <p className="text-[10px] text-muted-foreground mt-0.5">By messages sent to AI Coach</p>
                </div>
                {topAiUsers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">No AI usage today</div>
                ) : (
                  <div className="divide-y divide-border">
                    {topAiUsers.map((u, i) => (
                      <div key={u.user_id} className="flex items-center gap-3 px-5 py-2.5">
                        <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">#{i + 1}</span>
                        <UserAvatar user={u} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{u.display_name || u.email || "Unnamed"}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${u.ai_today >= 10 ? "bg-destructive" : u.ai_today >= 7 ? "bg-yellow-500" : "bg-primary"}`}
                                style={{ width: `${Math.min(100, (u.ai_today / 10) * 100)}%` }} />
                            </div>
                            <span className={`text-[10px] font-semibold ${u.ai_today >= 10 ? "text-destructive" : "text-foreground"}`}>
                              {u.ai_today}/10
                            </span>
                            {u.ai_today >= 10 && <Ban size={11} className="text-destructive" />}
                          </div>
                        </div>
                        {u.ai_today >= 10 && (
                          <Button variant="ghost" size="sm" onClick={() => resetAiLimit(u.user_id, u.display_name || u.email)}
                            disabled={actionLoading === `ai-${u.user_id}`}
                            className="h-6 text-[10px] px-2 text-primary shrink-0">
                            <RotateCcw size={10} className="mr-1" /> Reset
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Usage distribution */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border">
                  <h2 className="text-sm font-semibold text-foreground">Usage Distribution</h2>
                  <p className="text-[10px] text-muted-foreground mt-0.5">All-time AI usage per user</p>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { label: "Heavy users (50+ messages)", count: users.filter(u => u.ai_month >= 50).length, color: "bg-destructive" },
                    { label: "Active users (10–49)", count: users.filter(u => u.ai_month >= 10 && u.ai_month < 50).length, color: "bg-primary" },
                    { label: "Light users (1–9)", count: users.filter(u => u.ai_month >= 1 && u.ai_month < 10).length, color: "bg-blue-400" },
                    { label: "Not used AI yet", count: users.filter(u => u.ai_month === 0).length, color: "bg-secondary" },
                  ].map(row => (
                    <div key={row.label} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${row.color}`} />
                      <span className="text-xs text-muted-foreground flex-1">{row.label}</span>
                      <span className="text-xs font-semibold text-foreground">{row.count}</span>
                      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full ${row.color} rounded-full`}
                          style={{ width: `${users.length ? (row.count / users.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}


        {/* ── ANALYTICS TAB ── */}
        {tab === "analytics" && (
          <>
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !analytics ? (
              <div className="text-center py-20 text-muted-foreground text-sm">No data yet</div>
            ) : (
              <div className="space-y-6">

                {/* Retention */}
                <div>
                  <h2 className="text-sm font-semibold text-foreground mb-3">User Retention</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Day 1 Retention", value: analytics.retention.d1, desc: "Came back after day 1" },
                      { label: "Day 7 Retention", value: analytics.retention.d7, desc: "Active in last 7 days" },
                      { label: "Day 30 Retention", value: analytics.retention.d30, desc: "Active in last 30 days" },
                    ].map(r => (
                      <div key={r.label} className="bg-card border border-border rounded-xl p-5">
                        <div className={`text-3xl font-bold mb-1 ${r.value >= 40 ? "text-green-500" : r.value >= 20 ? "text-yellow-500" : "text-destructive"}`}>
                          {r.value}%
                        </div>
                        <p className="text-xs font-medium text-foreground">{r.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{r.desc}</p>
                        <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${r.value >= 40 ? "bg-green-500" : r.value >= 20 ? "bg-yellow-500" : "bg-destructive"}`}
                            style={{ width: `${Math.min(100, r.value)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DAU chart + summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-sm font-semibold text-foreground">Daily Active Users — Last 14 Days</h2>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Unique users with at least one event</p>
                      </div>
                      <span className="text-2xl font-bold text-primary">{analytics.dauToday}</span>
                    </div>
                    <SparkChart data={analytics.dauChart} />
                    <div className="flex justify-between mt-2">
                      <span className="text-[10px] text-muted-foreground">{analytics.dauChart[0]?.date}</span>
                      <span className="text-[10px] text-muted-foreground">Today</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <StatCard icon={Activity} label="DAU Today" value={analytics.dauToday} color="text-blue-500" />
                    <StatCard icon={Users} label="WAU (7 days)" value={analytics.wauCount} color="text-purple-500" />
                    <StatCard icon={AlertTriangle} label="At Risk Users" value={analytics.atRiskUsers} sub="No activity in 5+ days" color="text-yellow-500" />
                  </div>
                </div>

                {/* Feature usage */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-border">
                    <h2 className="text-sm font-semibold text-foreground">Feature Usage (Last 30 Days)</h2>
                    <p className="text-[10px] text-muted-foreground mt-0.5">How many times each section was opened</p>
                  </div>
                  <div className="p-5 space-y-3">
                    {Object.entries(analytics.featureCounts as Record<string, number>)
                      .sort(([,a], [,b]) => b - a)
                      .map(([feature, count]) => {
                        const max = Math.max(...Object.values(analytics.featureCounts as Record<string, number>));
                        const pct = max > 0 ? (count / max) * 100 : 0;
                        const labels: Record<string, string> = {
                          tasks: "📋 Tasks", goals: "🎯 Goals", routines: "✅ Routines",
                          focus: "⏱ Focus Timer", decisions: "⚖️ Decision Journal",
                          future_letters: "✉️ Future Letters", energy: "⚡ Energy Map",
                          procrastination: "🔍 Procrastination", balance: "🎡 Life Balance",
                          analytics: "📊 Analytics", insights: "💡 Insights",
                          activities: "📈 Activities", reviews: "📝 Weekly Review",
                        };
                        return (
                          <div key={feature} className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground w-36 shrink-0">{labels[feature] || feature}</span>
                            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-foreground w-8 text-right shrink-0">{count}</span>
                          </div>
                        );
                      })}
                    {Object.keys(analytics.featureCounts).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No feature views recorded yet</p>
                    )}
                  </div>
                </div>

                {/* Action events */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-border">
                    <h2 className="text-sm font-semibold text-foreground">User Actions (Last 30 Days)</h2>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Total actions taken across all users</p>
                  </div>
                  <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(analytics.actionCounts as Record<string, number>)
                      .sort(([,a], [,b]) => b - a)
                      .map(([action, count]) => {
                        const labels: Record<string, string> = {
                          task_created: "Tasks Created", task_completed: "Tasks Completed",
                          goal_created: "Goals Created", milestone_completed: "Milestones Done",
                          routine_completed: "Routines Completed", focus_session_completed: "Focus Sessions",
                          ai_coach_message_sent: "AI Messages", morning_ritual_completed: "Morning Rituals",
                          decision_logged: "Decisions Logged", future_letter_written: "Letters Written",
                          energy_logged: "Energy Logs", procrastination_logged: "Procrastination Logs",
                          weekly_review_completed: "Weekly Reviews",
                        };
                        return (
                          <div key={action} className="bg-secondary/20 rounded-lg p-3">
                            <p className="text-lg font-bold text-foreground">{count}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{labels[action] || action}</p>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Power users */}
                {analytics.powerUsers.length > 0 && (
                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-border">
                      <h2 className="text-sm font-semibold text-foreground">Power Users This Week</h2>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Most active users by event count</p>
                    </div>
                    <div className="divide-y divide-border">
                      {analytics.powerUsers.map((u: any, i: number) => {
                        const userData = users.find(usr => usr.user_id === u.user_id);
                        return (
                          <div key={u.user_id} className="flex items-center gap-3 px-5 py-2.5">
                            <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                            {userData && <UserAvatar user={userData} />}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground">
                                {userData?.display_name || userData?.email || u.user_id.slice(0, 8) + "…"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full"
                                  style={{ width: `${Math.min(100, (u.event_count / (analytics.powerUsers[0]?.event_count || 1)) * 100)}%` }} />
                              </div>
                              <span className="text-xs font-bold text-foreground w-8 text-right">{u.event_count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
