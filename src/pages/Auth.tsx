import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Mail, Lock, User, Chrome, Apple, Eye, EyeOff, Zap } from "lucide-react";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMessage("Check your email for a password reset link.");
      } else if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        setMessage("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) setError(error.message || "Google sign-in failed");
  };

  const handleApple = async () => {
    setError("");
    const { error } = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin,
    });
    if (error) setError(error.message || "Apple sign-in failed");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Zap size={28} className="text-primary" />
            <h1 className="text-3xl font-display text-foreground">Haqqat</h1>
          </div>
          <p className="text-sm text-muted-foreground">Track · Focus · Achieve</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <h2 className="text-xl font-bold text-foreground mb-1">
            {mode === "login" ? "Welcome back" : mode === "register" ? "Create your account" : "Reset password"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === "login" ? "Sign in to continue your journey" : mode === "register" ? "Start your productivity journey" : "We'll send you a reset link"}
          </p>

          {/* Social buttons */}
          {mode !== "forgot" && (
            <div className="space-y-2 mb-6">
              <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-secondary/20 text-foreground text-sm font-medium hover:bg-secondary/40 transition-colors">
                <Chrome size={18} />
                Continue with Google
              </button>
              <button onClick={handleApple} className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-secondary/20 text-foreground text-sm font-medium hover:bg-secondary/40 transition-colors">
                <Apple size={18} />
                Continue with Apple
              </button>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            {mode !== "forgot" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-primary">{message}</p>}

            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? "..." : mode === "login" ? "Sign In" : mode === "register" ? "Create Account" : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            {mode === "login" && (
              <>
                <button onClick={() => setMode("forgot")} className="text-primary hover:underline text-xs">Forgot password?</button>
                <p className="text-muted-foreground mt-2">
                  Don't have an account?{" "}
                  <button onClick={() => setMode("register")} className="text-primary font-medium hover:underline">Sign up</button>
                </p>
              </>
            )}
            {mode === "register" && (
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <button onClick={() => setMode("login")} className="text-primary font-medium hover:underline">Sign in</button>
              </p>
            )}
            {mode === "forgot" && (
              <button onClick={() => setMode("login")} className="text-primary hover:underline">Back to sign in</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
