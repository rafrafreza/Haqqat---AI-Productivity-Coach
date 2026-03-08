import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const steps = ["Welcome", "Profile", "Goals", "Ready"];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateProfile } = useProfile();
  const [step, setStep] = useState(0);
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

  const handleFinish = async () => {
    setSaving(true);
    if (displayName.trim()) {
      await updateProfile({ display_name: displayName.trim() });
    }
    // Store that onboarding is complete
    localStorage.setItem("dayflow_onboarded", "true");
    // Store selected goals for later use
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
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Zap size={32} className="text-primary" />
              </div>
              <h1 className="text-2xl font-display text-foreground mb-3">
                Welcome to DayFlow
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
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <User size={24} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">
                What should we call you?
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                This will appear on your dashboard and in your reports.
              </p>
              <input
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
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <Target size={24} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">
                What do you want to achieve?
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Pick one or more goals. This helps us personalize your experience.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GOAL_OPTIONS.map((goal) => {
                  const selected = selectedGoals.includes(goal);
                  return (
                    <button
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all ${
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-foreground hover:border-primary/30 hover:bg-primary/5"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                          selected
                            ? "border-primary bg-primary"
                            : "border-border"
                        }`}
                      >
                        {selected && <Check size={12} className="text-primary-foreground" />}
                      </div>
                      {goal}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Ready */}
          {step === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles size={32} className="text-primary" />
              </div>
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
                ].map((tip) => (
                  <div key={tip} className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-primary" />
                    </div>
                    <span className="text-foreground">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canNext()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                Continue
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Setting up..." : "Go to Dashboard"}
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Skip */}
        {step < 3 && (
          <button
            onClick={handleFinish}
            className="block mx-auto mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
