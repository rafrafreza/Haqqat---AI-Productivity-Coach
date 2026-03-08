import { Crown, Sparkles, Check, Zap } from "lucide-react";

export default function Pricing() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-display text-foreground">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2">Invest in yourself. Cancel anytime.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Free */}
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={20} className="text-muted-foreground" />
            <h3 className="text-lg font-bold text-foreground">Free</h3>
          </div>
          <p className="text-3xl font-bold text-foreground mt-2">$0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Essential productivity tools</p>
          <div className="space-y-3">
            {[
              'Dashboard & daily overview',
              'Morning Ritual planner',
              'Task management (Eisenhower)',
              'Goal tracking with milestones',
              'Routine tracking & streaks',
              'Focus Timer (Pomodoro)',
              'Weekly Reviews',
              'Activity Log',
            ].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                <Check size={14} className="text-primary shrink-0" />
                {f}
              </div>
            ))}
          </div>
          <button disabled className="w-full mt-8 py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-medium cursor-default">
            Current Plan
          </button>
        </div>

        {/* Pro */}
        <div className="bg-card border-2 border-primary rounded-2xl p-8 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
            MOST POPULAR
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Crown size={20} className="text-primary" />
            <h3 className="text-lg font-bold text-foreground">Pro</h3>
          </div>
          <p className="text-3xl font-bold text-foreground mt-2">$7.99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Everything in Free, plus:</p>
          <div className="space-y-3">
            {[
              'Energy Map & Biological Prime Time',
              'Decision Journal & accuracy tracking',
              'Procrastination Autopsy & triggers',
              'Future Letters & predictions',
              'Life Balance radar scoring',
              'Full XP, levels & achievements',
              'Daily & weekly challenges',
              'Advanced Analytics & Insights',
              'Priority support',
            ].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                <Sparkles size={14} className="text-primary shrink-0" />
                {f}
              </div>
            ))}
          </div>
          <button
            onClick={() => {/* Stripe checkout will go here */}}
            className="w-full mt-8 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            Start 7-Day Free Trial
          </button>
          <p className="text-[10px] text-center text-muted-foreground mt-2">Then $7.99/month · Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}
