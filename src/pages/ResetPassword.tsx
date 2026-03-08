import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Zap, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => navigate("/"), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Zap size={28} className="text-primary" />
            <h1 className="text-3xl font-display text-foreground">Haqqat</h1>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <h2 className="text-xl font-bold text-foreground mb-4">Set New Password</h2>
          {done ? (
            <p className="text-primary text-sm">Password updated! Redirecting...</p>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" required minLength={6} className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
                {loading ? "..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
