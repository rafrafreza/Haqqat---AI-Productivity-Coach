import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import {
  Zap, User, Target, Sparkles, ArrowRight, ArrowLeft, Check,
} from "lucide-react";

const GOAL_OPTIONS = [
  "Build better habits",
  "Manage tasks effectively",
  "Improve focus & deep work",
  "Track energy & productivity",
  "Achieve long-term goals",
  "Reduce procrastination",
];

const stepsLabels = ["Welcome", "Profile", "Goals", "Ready"];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateProfile } = useProfile();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.full_name || ""
  );
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const goNext = () => { setDirection(1); setStep(s => s + 1); };
  const goBack = () => { setDirection(-1); setStep(s => s - 1); };

  const handleFinish = async () => {
    setSaving(true);
    if (displayName.trim()) {
      await updateProfile({ display_name: displayName.trim() });
    }
    localStorage.setItem("dayflow_onboarded", "true");
    if (selectedGoals.length > 0) {
      localStorage.setItem("dayflow_goals", JSON.stringify(selectedGoals));
    }
    setSaving(false);
    navigate("/", { replace: true });
  };

  const canNext = () => {
    if (step === 1) return displayName.trim().length > 0;
    if (step === 2) return selectedGoals.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg"
      >
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {stepsLabels.map((_, i) => (
            <motion.div
              key={i}
              className="h-1 flex-1 rounded-full bg-border overflow-hidden"
            >
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
              />
            </motion.div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Step 0: Welcome */}
              {step === 0 && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 0.15, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6"
                  >
                    <Zap size={32} className="text-primary" />
                  </motion.div>
                  <h1 className="text-2xl font-display text-foreground mb-3">
                    Welcome to Haqqat
                  </h1>
                  <p className="text-muted-foreground mb-2">
                    Let's set up your productivity workspace in just a few steps.
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    It only takes about 30 seconds.
                  </p>
                </div>
              )}

              {/* Step 1: Profile */}
              {step === 1 && (
                <div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1, type: "spring" }}
                    className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5"
                  >
                    <User size={24} className="text-primary" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    What should we call you?
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    This will appear on your dashboard and in your reports.
                  </p>
                  <motion.input
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              )}

              {/* Step 2: Goals */}
              {step === 2 && (
                <div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1, type: "spring" }}
                    className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5"
                  >
                    <Target size={24} className="text-primary" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    What do you want to achieve?
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Pick one or more goals. This helps us personalize your experience.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {GOAL_OPTIONS.map((goal, i) => {
                      const selected = selectedGoals.includes(goal);
                      return (
                        <motion.button
                          key={goal}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleGoal(goal)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all ${
                            selected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-foreground hover:border-primary/30 hover:bg-primary/5"
                          }`}
                        >
                          <motion.div
                            animate={selected ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                            transition={{ duration: 0.25 }}
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                              selected ? "border-primary bg-primary" : "border-border"
                            }`}
                          >
                            <AnimatePresence>
                              {selected && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <Check size={12} className="text-primary-foreground" />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.div>
                          {goal}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Ready */}
              {step === 3 && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6"
                  >
                    <Sparkles size={32} className="text-primary" />
                  </motion.div>
                  <h2 className="text-2xl font-display text-foreground mb-3">
                    You're all set, {displayName || "friend"}!
                  </h2>
                  <p className="text-muted-foreground mb-2">
                    Your workspace is ready. Here's what you can do first:
                  </p>
                  <div className="text-left mt-6 space-y-3 max-w-xs mx-auto">
                    {[
                      "Set up your Morning Ritual",
                      "Add your first task or goal",
                      "Start a focus session",
                    ].map((tip, i) => (
                      <motion.div
                        key={tip}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.12 }}
                        className="flex items-center gap-3 text-sm"
                      >
                        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Check size={12} className="text-primary" />
                        </div>
                        <span className="text-foreground">{tip}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={goBack}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={14} />
                Back
              </motion.button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={goNext}
                disabled={!canNext()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                Continue
                <ArrowRight size={14} />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleFinish}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Setting up..." : "Go to Dashboard"}
                <ArrowRight size={14} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Skip */}
        <AnimatePresence>
          {step < 3 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleFinish}
              className="block mx-auto mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
