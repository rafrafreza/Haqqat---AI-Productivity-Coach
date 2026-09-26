import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef, useMemo, useState, useEffect } from "react";
import { ArrowRight, Bot, Zap, Target, Timer, Battery, CheckCircle2, TrendingUp, Brain, Flame, Star, ChevronRight } from "lucide-react";
import HaqqatLogo from "@/components/HaqqatLogo";
import ThemeToggle from "@/components/ThemeToggle";

// ── Helpers ────────────────────────────────────────────────
function AnimatedSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

// ── Animated counter ───────────────────────────────────────
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / 40;
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setVal(Math.floor(start));
      if (start >= end) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [inView, end]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ── Floating particles ─────────────────────────────────────
function Particles() {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 3 + 1.5, duration: Math.random() * 10 + 12,
      delay: Math.random() * 6, driftX: (Math.random() - 0.5) * 80, driftY: (Math.random() - 0.5) * 80,
    })), []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {particles.map(p => (
        <motion.div key={p.id} className="absolute rounded-full bg-primary"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ x: [0, p.driftX, 0], y: [0, p.driftY, 0], opacity: [0, 0.3, 0], scale: [0.5, 1, 0.5] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ── App mockup ─────────────────────────────────────────────
function AppMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto max-w-sm"
    >
      {/* Glow */}
      <div className="absolute -inset-4 rounded-3xl opacity-20 blur-2xl bg-primary pointer-events-none" />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Top bar */}
        <div className="bg-primary/5 border-b border-border px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-[10px] text-muted-foreground font-medium">haqqat.netlify.app</span>
          </div>
        </div>
        {/* XP bar */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-[9px] font-bold text-primary">L7</span>
              </div>
              <span className="text-xs font-semibold text-foreground">Rafraf Reza</span>
            </div>
            <span className="text-[10px] text-primary font-semibold">+30 XP today</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full"
              initial={{ width: 0 }} animate={{ width: "68%" }}
              transition={{ duration: 1.2, delay: 1.2, ease: "easeOut" }} />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[9px] text-muted-foreground">1240 XP</span>
            <span className="text-[9px] text-muted-foreground">1800 XP to Level 8</span>
          </div>
        </div>
        {/* AI Coach bubble */}
        <div className="px-4 py-2">
          <motion.div className="bg-primary/5 border border-primary/20 rounded-xl p-3"
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={10} className="text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-primary mb-0.5">AI Coach</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  You complete <span className="text-foreground font-medium">87% of tasks</span> before 2pm but almost none after. 
                  Schedule your hardest work in the morning. 🎯
                </p>
              </div>
            </div>
          </motion.div>
        </div>
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 px-4 py-2">
          {[
            { label: "Focus", value: "2h 40m", icon: "⏱", color: "text-blue-500" },
            { label: "Tasks", value: "8/11", icon: "✅", color: "text-green-500" },
            { label: "Streak", value: "6 days", icon: "🔥", color: "text-orange-500" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + i * 0.1 }}
              className="bg-secondary/30 rounded-lg p-2 text-center">
              <p className="text-sm">{s.icon}</p>
              <p className={`text-[10px] font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[9px] text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
        {/* Task list mini */}
        <div className="px-4 pb-4 pt-1 space-y-1.5">
          {[
            { done: true, text: "Complete project proposal", xp: "+10 XP" },
            { done: true, text: "30 min morning workout", xp: "+15 XP" },
            { done: false, text: "Review meeting notes", xp: "" },
          ].map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6 + i * 0.08 }}
              className={`flex items-center gap-2 p-1.5 rounded-lg ${t.done ? "opacity-60" : ""}`}>
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${t.done ? "bg-green-500 border-green-500" : "border-border"}`}>
                {t.done && <CheckCircle2 size={9} className="text-white" />}
              </div>
              <span className={`text-[10px] flex-1 ${t.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.text}</span>
              {t.xp && <span className="text-[9px] text-primary font-semibold">{t.xp}</span>}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main ───────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();

  const painPoints = [
    "You start the week motivated but lose steam by Wednesday",
    "You have goals written down somewhere - but haven't checked them in weeks",
    "You've downloaded 3 productivity apps this year. Used each one for 4 days.",
    "You're always \"about to get serious\" - but something always comes up",
    "You work hard all day but can't point to what you actually accomplished",
  ];

  const outcomes = [
    { icon: Brain, title: "Know exactly why you're stuck", desc: "Your AI Coach analyses your tasks, energy, and habits - then tells you exactly what patterns are holding you back. No guessing.", color: "text-purple-500", bg: "bg-purple-500/10" },
    { icon: Battery, title: "Work with your energy, not against it", desc: "Log your energy levels daily. Haqqat learns your biological prime time and tells you the perfect time for deep work vs light tasks.", color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { icon: Flame, title: "Build streaks that actually last", desc: "Gamified habits with XP, levels, and streaks. The system is designed to make consistency feel rewarding - not like a chore.", color: "text-orange-500", bg: "bg-orange-500/10" },
    { icon: Target, title: "Turn big goals into daily action", desc: "Break goals into milestones. See your progress every day. Earn XP for every step. Your future self is watching.", color: "text-green-500", bg: "bg-green-500/10" },
    { icon: Timer, title: "Protect your deep work time", desc: "Pomodoro-based focus sessions that track your daily focus minutes. See your weekly focus trend. Watch it grow.", color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: TrendingUp, title: "See your growth in numbers", desc: "Analytics, weekly reviews, and activity logs that show you the truth about your week - the good and the areas to improve.", color: "text-primary", bg: "bg-primary/10" },
  ];

  const testimonials = [
    { quote: "I kept starting habits and dropping them after 3 days. After using Haqqat for a week, I finally saw the pattern - I was scheduling deep work when my energy was lowest. Changed that one thing and everything clicked.", name: "Nishit Raj", role: "Engineering student", initial: "N" },
    { quote: "The AI Coach told me something I hadn't noticed myself — I complete almost all my tasks before lunch and barely anything after. It sounds obvious but I never tracked it. Now I protect my mornings for the deep work.", name: "Shreya", role: "Marketing professional", initial: "S" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── NAV ── */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <HaqqatLogo size={22} />
            <span className="text-lg font-display text-foreground">Haqqat</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={() => navigate("/auth")} className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Sign in
            </button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/auth")}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
              Get Started Free
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* ── HERO ── */}
      <section className="pt-28 pb-16 px-6 relative overflow-hidden min-h-screen flex items-center">
        <Particles />
        <motion.div className="absolute top-20 -left-40 w-[600px] h-[600px] rounded-full opacity-15 blur-[120px] pointer-events-none bg-primary"
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute -bottom-20 -right-40 w-[500px] h-[500px] rounded-full opacity-10 blur-[120px] pointer-events-none bg-primary"
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }} />

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
              <Zap size={12} /> AI-Powered Productivity Coach · 100% Free
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl font-display leading-tight text-foreground mb-6">
              You already know{" "}
              <span className="text-primary">what to do.</span>
              <br />
              So why aren't
              <br />
              you doing it?
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              Haqqat is the AI productivity coach that finds out <strong className="text-foreground">exactly why you keep falling behind</strong> - using your own data - then helps you fix it.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-3 mb-8">
              <motion.button whileHover={{ scale: 1.04, boxShadow: "0 15px 35px -10px hsl(var(--primary) / 0.5)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/auth")}
                className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 text-sm">
                Find Out What's Holding You Back
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}>
                  <ArrowRight size={16} />
                </motion.span>
              </motion.button>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
              className="text-xs text-muted-foreground">
              ✓ No credit card &nbsp; ✓ No download &nbsp; ✓ 2 minutes to start
            </motion.p>
          </div>

          {/* Right — App Mockup */}
          <div className="hidden lg:block">
            <AppMockup />
          </div>
        </div>
      </section>

      {/* ── PAIN AGITATION ── */}
      <section className="py-20 px-6 bg-card/30 border-y border-border/50">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 block">Sound familiar?</span>
            <h2 className="text-3xl sm:text-4xl font-display text-foreground">
              If you've tried other apps and it still didn't work -
              <span className="text-primary"> this is why.</span>
            </h2>
          </AnimatedSection>
          <div className="space-y-3">
            {painPoints.map((pain, i) => (
              <AnimatedSection key={i} delay={i * 0.08}>
                <motion.div whileHover={{ x: 4 }}
                  className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-card hover:border-destructive/30 transition-all">
                  <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-destructive text-xs font-bold">✗</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pain}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection delay={0.5} className="mt-10 p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center">
            <p className="text-base font-semibold text-foreground">
              The problem isn't your willpower.
            </p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              You don't have a system that tells you <em>what's actually wrong</em>. Every other app just gives you more things to track. Haqqat tells you what the data means.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── AI COACH REVEAL ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 block">The Difference</span>
            <h2 className="text-3xl sm:text-4xl font-display text-foreground mb-4">
              Meet your AI Productivity Coach
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Not a generic chatbot. An AI that reads <em>your</em> actual data - your tasks, energy, habits, and focus sessions - then gives you coaching that's specific to you.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { emoji: "🔍", title: "Finds your patterns", desc: "\"You complete 87% of tasks before 2pm. Schedule hard work in the morning.\"" },
              { emoji: "⚡", title: "Spots energy leaks", desc: "\"Your energy crashes after lunch. 15-min walk could recover 40% of your afternoon.\"" },
              { emoji: "🎯", title: "Gives today's challenge", desc: "\"Your biggest bottleneck this week is unfinished tasks. Complete just 3 today.\"" },
            ].map((c, i) => (
              <AnimatedSection key={i} delay={i * 0.12}>
                <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all h-full">
                  <div className="text-3xl mb-3">{c.emoji}</div>
                  <h3 className="font-semibold text-foreground mb-2">{c.title}</h3>
                  <p className="text-sm text-muted-foreground italic leading-relaxed">"{c.desc}"</p>
                  <div className="mt-3 flex items-center gap-1.5">
                    <Bot size={12} className="text-primary" />
                    <span className="text-[10px] text-primary font-medium">AI Coach</span>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.4} className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">No setup required · Powered by your data · Free to use</p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── OUTCOMES (Features reframed) ── */}
      <section className="py-20 px-6 bg-card/30 border-y border-border/50">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 block">What You Actually Get</span>
            <h2 className="text-3xl sm:text-4xl font-display text-foreground">
              Not features. <span className="text-primary">Outcomes.</span>
            </h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {outcomes.map((o, i) => (
              <AnimatedSection key={i} delay={i * 0.08}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}
                  className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all h-full">
                  <div className={`w-10 h-10 rounded-xl ${o.bg} flex items-center justify-center mb-4`}>
                    <o.icon size={20} className={o.color} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{o.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{o.desc}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── GAMIFICATION ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 block">Why You'll Actually Stick to It</span>
              <h2 className="text-3xl font-display text-foreground mb-4">
                Productivity that feels like a game
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Earn XP for every habit, task, and focus session. Level up. Build streaks. Unlock achievements. Haqqat makes discipline feel rewarding - not like punishment.
              </p>
              <div className="space-y-3">
                {[
                  "Earn XP for every completed task, habit, and goal milestone",
                  "Build streaks that visualise your consistency",
                  "Level up your profile as you grow",
                  "See your productivity score every morning",
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-primary shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                {/* Level display */}
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">7</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Level 7 — Focused</p>
                    <p className="text-xs text-muted-foreground">1,240 / 1,800 XP to next level</p>
                  </div>
                  <div className="ml-auto flex">
                    {[...Array(3)].map((_, i) => <Star key={i} size={14} className="text-yellow-500 fill-yellow-500" />)}
                  </div>
                </div>
                {/* XP events */}
                <div className="space-y-2">
                  {[
                    { label: "Morning ritual completed", xp: "+15 XP", icon: "🌅" },
                    { label: "Focus session: 25 min", xp: "+10 XP", icon: "⏱" },
                    { label: "Goal milestone hit", xp: "+20 XP", icon: "🎯" },
                    { label: "7-day streak bonus", xp: "+25 XP", icon: "🔥" },
                  ].map((ev, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/20 transition-colors">
                      <span className="text-base">{ev.icon}</span>
                      <span className="text-xs text-muted-foreground flex-1">{ev.label}</span>
                      <span className="text-xs font-semibold text-primary">{ev.xp}</span>
                    </motion.div>
                  ))}
                </div>
                {/* Streak */}
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Current streak</span>
                    <div className="flex items-center gap-1">
                      <Flame size={14} className="text-orange-500" />
                      <span className="text-sm font-bold text-foreground">6 days</span>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {["M","T","W","T","F","S","S"].map((d, i) => (
                      <div key={i} className={`flex-1 h-5 rounded text-[8px] flex items-center justify-center font-medium ${i < 6 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{d}</div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>


      {/* ── UNIQUE FEATURES ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 block">Only in Haqqat</span>
            <h2 className="text-3xl sm:text-4xl font-display text-foreground mb-3">
              Features no other app has
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Beyond tasks and habits - tools that change how you understand yourself.
            </p>
          </AnimatedSection>

          <div className="space-y-6">
            {/* Future Letters */}
            <AnimatedSection>
              <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/20 transition-all">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="p-8 flex flex-col justify-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                      <span className="text-xl">✉️</span>
                    </div>
                    <h3 className="text-xl font-display text-foreground mb-3">Future Letters</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Write a letter to your future self - set a date to receive it. Your past self will remind your future self of your dreams, fears, and promises. Nothing creates accountability like reading what you wrote 6 months ago.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["Set unlock date", "Lock until opened", "Reflect on past self"].map(tag => (
                        <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 font-medium">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/5 to-primary/5 p-6 flex items-center justify-center border-l border-border">
                    <div className="w-full max-w-xs bg-card border border-border rounded-xl p-5 shadow-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🔒</span>
                        <div>
                          <p className="text-xs font-semibold text-foreground">Letter to Future Me</p>
                          <p className="text-[10px] text-muted-foreground">Unlocks: Sep 1, 2026</p>
                        </div>
                      </div>
                      <div className="h-16 bg-secondary/30 rounded-lg flex items-center justify-center">
                        <p className="text-xs text-muted-foreground italic">"Dear future me, by now I hope you have..."</p>
                      </div>
                      <p className="text-[10px] text-primary mt-3 text-center">📬 Opens in 152 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Energy Map */}
            <AnimatedSection delay={0.1}>
              <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/20 transition-all">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 p-6 flex items-center justify-center border-r border-border order-2 md:order-1">
                    <div className="w-full max-w-xs">
                      <div className="bg-card border border-border rounded-xl p-4 shadow-lg">
                        <p className="text-xs font-semibold text-foreground mb-3">Your Energy Today</p>
                        <div className="space-y-2">
                          {[
                            { time: "8am", level: 95, label: "Peak" },
                            { time: "11am", level: 80, label: "High" },
                            { time: "2pm", level: 35, label: "Low" },
                            { time: "5pm", level: 65, label: "Rising" },
                          ].map(e => (
                            <div key={e.time} className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground w-8 shrink-0">{e.time}</span>
                              <div className="flex-1 h-4 bg-secondary rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${e.level > 70 ? "bg-green-500" : e.level > 50 ? "bg-yellow-500" : "bg-red-400"}`}
                                  style={{ width: `${e.level}%` }} />
                              </div>
                              <span className={`text-[9px] font-medium w-8 ${e.level > 70 ? "text-green-500" : e.level > 50 ? "text-yellow-500" : "text-red-400"}`}>{e.label}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-primary mt-3">💡 Schedule deep work 8-11am</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col justify-center order-1 md:order-2">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4">
                      <span className="text-xl">⚡</span>
                    </div>
                    <h3 className="text-xl font-display text-foreground mb-3">Energy Map</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Track your energy levels throughout the day. Over time, Haqqat learns your biological prime time - the exact hours when your brain is sharpest — and tells you when to do your hardest work.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["Biological prime time", "Daily energy log", "Peak hour insights"].map(tag => (
                        <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-600 font-medium">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Decision Journal + Procrastination Autopsy side by side */}
            <div className="grid md:grid-cols-2 gap-5">
              <AnimatedSection delay={0.1}>
                <div className="bg-card border border-border rounded-2xl p-7 hover:border-primary/20 transition-all h-full">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                    <span className="text-xl">⚖️</span>
                  </div>
                  <h3 className="text-lg font-display text-foreground mb-2">Decision Journal</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Log big decisions with your reasoning at the time. Revisit them later to see if your logic held up. Builds better decision-making over time.
                  </p>
                  <div className="bg-secondary/20 rounded-lg p-3">
                    <p className="text-[10px] text-muted-foreground italic">"Decided to take the freelance project over the full-time offer. Reasoning: flexibility + 40% more income..."</p>
                    <p className="text-[10px] text-primary mt-1.5">↩ Review in 90 days</p>
                  </div>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <div className="bg-card border border-border rounded-2xl p-7 hover:border-primary/20 transition-all h-full">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                    <span className="text-xl">🔍</span>
                  </div>
                  <h3 className="text-lg font-display text-foreground mb-2">Procrastination Autopsy</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    When you procrastinate, don't just feel bad. Dissect it. What triggered it? What were you avoiding? Haqqat shows you your patterns so you can break them.
                  </p>
                  <div className="bg-secondary/20 rounded-lg p-3">
                    <div className="flex gap-2 flex-wrap">
                      {["Fear of failure", "Task too vague", "Low energy", "Distractions"].map(t => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">{t}</span>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">Your top trigger: <span className="text-foreground font-medium">Task too vague (68%)</span></p>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 px-6 bg-primary/5 border-y border-primary/10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { end: 12, suffix: "+", label: "Productivity Tools" },
            { end: 100, suffix: "%", label: "Free to Use" },
            { end: 7, suffix: "+", label: "Unique Features" },
            { end: 0, suffix: " ads", label: "Zero Ads, Ever" },
          ].map((s, i) => (
            <AnimatedSection key={i} delay={i * 0.1} className="text-center">
              <p className="text-3xl font-display text-primary font-bold">
                <Counter end={s.end} suffix={s.suffix} />
              </p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      {/* <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-2xl font-display text-foreground">What people are saying</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-5">
            {testimonials.map((t, i) => (
              <AnimatedSection key={i} delay={i * 0.15}>
                <div className="bg-card border border-border rounded-2xl p-6 h-full">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} size={14} className="text-yellow-500 fill-yellow-500" />)}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {t.initial}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section> */}

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-6 bg-card/30 border-y border-border/50">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <h2 className="text-3xl font-display text-foreground mb-2">Start in 2 minutes</h2>
            <p className="text-muted-foreground">No setup. No complexity. Just start.</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Sign up free", desc: "Email or Google. No credit card. No spam. Your data is yours.", icon: "🔐" },
              { step: "02", title: "Build your system", desc: "Add your goals, routines, and tasks. Takes 5 minutes. AI Coach activates immediately.", icon: "⚙️" },
              { step: "03", title: "Get your first insight", desc: "After your first few actions, your AI Coach tells you what it's already noticed about you.", icon: "💡" },
            ].map((s, i) => (
              <AnimatedSection key={i} delay={i * 0.15}>
                <div className="text-center">
                  <div className="text-3xl mb-3">{s.icon}</div>
                  <div className="text-4xl font-display text-primary/20 mb-2">{s.step}</div>
                  <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-28 px-6 relative overflow-hidden">
        <motion.div className="absolute inset-0 opacity-5 bg-primary pointer-events-none"
          animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <AnimatedSection className="max-w-2xl mx-auto text-center relative">
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display text-foreground mb-4 leading-tight">
            Stop guessing.
            <br />
            <span className="text-primary">Start knowing.</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            Join Haqqat for free. Find out exactly what's holding you back. Build the system that finally works for you.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px hsl(var(--primary) / 0.5)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/auth")}
            className="px-10 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base inline-flex items-center gap-2 transition-all">
            Start Free — No Credit Card
            <ChevronRight size={18} />
          </motion.button>
          <p className="text-xs text-muted-foreground mt-4">Takes 2 minutes · Works on all devices · 100% free</p>
        </AnimatedSection>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <HaqqatLogo size={18} />
              <span className="font-display text-foreground">Haqqat</span>
              <span className="text-xs text-muted-foreground ml-2">Align · Build · Evolve</span>
            </div>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Haqqat. Built for people who want more from themselves.</p>
            <div className="flex items-center gap-5 text-xs text-muted-foreground">
              <a href="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
