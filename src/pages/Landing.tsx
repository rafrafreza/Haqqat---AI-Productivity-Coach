import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Zap, Target, Timer, Battery, Trophy, ArrowRight, Sun, ListTodo
} from "lucide-react";

const features = [
  { icon: Sun, title: "Morning Ritual", desc: "Start each day with intention. Build a ritual that sets the tone for peak performance." },
  { icon: ListTodo, title: "Smart Tasks", desc: "Eisenhower matrix meets modern task management. Focus on what truly matters." },
  { icon: Target, title: "Goal Tracking", desc: "Set meaningful goals with milestones. Watch your progress compound over time." },
  { icon: Timer, title: "Focus Timer", desc: "Deep work sessions with Pomodoro technique. Track your focused minutes daily." },
  { icon: Battery, title: "Energy Map", desc: "Discover your biological prime time. Schedule hard work when your energy peaks." },
  { icon: Trophy, title: "Gamification", desc: "Earn XP, unlock achievements, and level up your productivity habits." },
];

const stats = [
  { value: "12+", label: "Productivity Tools" },
  { value: "100%", label: "Free to Use" },
  { value: "∞", label: "Habits to Build" },
];

const stepsData = [
  { step: "01", title: "Create your account", desc: "Sign up for free — no credit card required." },
  { step: "02", title: "Set your goals", desc: "Tell us what you want to achieve and customize your workflow." },
  { step: "03", title: "Build momentum", desc: "Track habits, earn XP, and watch your consistency compound." },
];

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Zap size={24} className="text-primary" />
            <span className="text-xl font-display text-foreground">DayFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/auth")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/auth")}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-8"
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <Zap size={12} />
            </motion.span>
            Your personal productivity system
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl font-display leading-tight text-foreground mb-6"
          >
            Build habits that
            <br />
            <motion.span
              className="text-primary inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              actually stick
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
          >
            DayFlow combines task management, habit tracking, energy mapping, and
            gamification into one minimal workspace — so you can focus on what matters.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px -10px hsl(var(--primary) / 0.4)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/auth")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              Start for Free
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <ArrowRight size={16} />
              </motion.span>
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="#features"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-secondary/10 transition-colors text-center"
            >
              See Features
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <AnimatedSection>
        <section className="py-12 border-y border-border/50">
          <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-2xl sm:text-3xl font-display text-primary">{s.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl font-display text-foreground mb-3">
              Everything you need to stay on track
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Powerful tools designed to work together. No fluff, no complexity — just results.
            </p>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 3 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors"
                >
                  <f.icon size={20} className="text-primary" />
                </motion.div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-card/50 border-y border-border/50">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl font-display text-foreground mb-3">Simple as 1-2-3</h2>
            <p className="text-muted-foreground">Get started in under a minute</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8">
            {stepsData.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center"
              >
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.15 + 0.2, type: "spring" }}
                  className="text-4xl font-display text-primary/30 inline-block"
                >
                  {s.step}
                </motion.span>
                <h3 className="font-semibold text-foreground mt-2 mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <AnimatedSection>
        <section className="py-24 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-display text-foreground mb-4">
              Ready to transform your days?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Join DayFlow and start building the productivity system you've always wanted.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px -10px hsl(var(--primary) / 0.4)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/auth")}
              className="px-10 py-4 rounded-xl bg-primary text-primary-foreground font-semibold transition-all inline-flex items-center gap-2"
            >
              Get Started — It's Free
              <ArrowRight size={18} />
            </motion.button>
          </div>
        </section>
      </AnimatedSection>

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
