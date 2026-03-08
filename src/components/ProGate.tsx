import { useSubscription } from "@/contexts/SubscriptionContext";
import { Lock, Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Features gated behind Pro
export const PRO_FEATURES = new Set([
  '/energy', '/decisions', '/procrastination', '/letters', '/balance',
  '/xp', '/analytics', '/insights',
]);

export function isProFeature(path: string): boolean {
  return PRO_FEATURES.has(path);
}

interface ProGateProps {
  children: React.ReactNode;
  feature?: string;
}

export function ProGate({ children, feature }: ProGateProps) {
  const { isPro } = useSubscription();

  if (isPro) return <>{children}</>;

  return <UpgradePrompt feature={feature} />;
}

export function UpgradePrompt({ feature }: { feature?: string }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
        <Crown size={40} className="text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Unlock {feature || 'this feature'}</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        This powerful feature is available on the <span className="text-primary font-semibold">Pro plan</span>. 
        Upgrade for $7.99/month to unlock all unique features, gamification, and advanced analytics.
      </p>
      <div className="space-y-3 mb-8 text-left">
        {[
          'Energy Map & Biological Prime Time',
          'Decision Journal with accuracy tracking',
          'Procrastination Autopsy & DNA analysis',
          'Future Letters & predictions',
          'Life Balance radar & scoring',
          'Full XP system, achievements & challenges',
          'Advanced Analytics & Insights',
        ].map(f => (
          <div key={f} className="flex items-center gap-2 text-sm">
            <Sparkles size={14} className="text-primary shrink-0" />
            <span className="text-foreground">{f}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => navigate('/pricing')}
        className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
      >
        Upgrade to Pro — $7.99/mo
      </button>
      <p className="text-xs text-muted-foreground mt-3">Cancel anytime · 7-day free trial</p>
    </div>
  );
}

export function ProBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
      <Lock size={8} /> Pro
    </span>
  );
}
