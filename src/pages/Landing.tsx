import { useNavigate } from "react-router-dom";
import {
  Zap, CheckCircle2, Target, Timer, Battery, Scale, Search,
  Mail, Radar, Trophy, BarChart3, Lightbulb, ArrowRight, Sun, ListTodo
} from "lucide-react";

const features = [
  {
    icon: Sun,
    title: "Morning Ritual",
    desc: "Start each day with intention. Build a ritual that sets the tone for peak performance.",
  },
  {
    icon: ListTodo,
    title: "Smart Tasks",
    desc: "Eisenhower matrix meets modern task management. Focus on what truly matters.",
  },
  {
    icon: Target,
    title: "Goal Tracking",
    desc: "Set meaningful goals with milestones. Watch your progress compound over time.",
  },
  {
    icon: Timer,
    title: "Focus Timer",
    desc: "Deep work sessions with Pomodoro technique. Track your focused minutes daily.",
  },
  {
    icon: Battery,
    title: "Energy Map",
    desc: "Discover your biological prime time. Schedule hard work when your energy peaks.",
  },
  {
    icon: Trophy,
    title: "Gamification",
    desc: "Earn XP, unlock achievements, and level up your productivity habits.",
  },
];

const stats = [
  { value: "12+", label: "Productivity Tools" },
  { value: "100%", label: "Free to Use" },
  { value: "∞", label: "Habits to Build" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Zap size={24} className="text-primary" />
            <span className="text-xl font-display text-foreground">DayFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/auth")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-8">
            <Zap size={12} />
            Your personal productivity system
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display leading-tight text-foreground mb-6">
            Build habits that
            <br />
            <span className="text-primary">actually stick</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            DayFlow combines task management, habit tracking, energy mapping, and 
            gamification into one minimal workspace — so you can focus on what matters.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/auth")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
            >
              Start for Free
              <ArrowRight size={16} />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-secondary/10 transition-colors text-center"
            >
              See Features
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border/50">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-display text-primary">{s.value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display text-foreground mb-3">
              Everything you need to stay on track
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Powerful tools designed to work together. No fluff, no complexity — just results.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <f.icon size={20} className="text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-card/50 border-y border-border/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display text-foreground mb-3">Simple as 1-2-3</h2>
            <p className="text-muted-foreground">Get started in under a minute</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create your account", desc: "Sign up for free — no credit card required." },
              { step: "02", title: "Set your goals", desc: "Tell us what you want to achieve and customize your workflow." },
              { step: "03", title: "Build momentum", desc: "Track habits, earn XP, and watch your consistency compound." },
            ].map(s => (
              <div key={s.step} className="text-center">
                <span className="text-4xl font-display text-primary/30">{s.step}</span>
                <h3 className="font-semibold text-foreground mt-2 mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-display text-foreground mb-4">
            Ready to transform your days?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join DayFlow and start building the productivity system you've always wanted.
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="px-10 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 inline-flex items-center gap-2"
          >
            Get Started — It's Free
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Zap size={16} className="text-primary" />
            <span className="text-sm">DayFlow</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DayFlow. Built for focus.
          </p>
        </div>
      </footer>
    </div>
  );
}
