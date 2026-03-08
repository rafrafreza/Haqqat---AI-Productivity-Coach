import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface SubscriptionContextType {
  plan: "free" | "pro";
  loading: boolean;
  isPro: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  plan: "free",
  loading: true,
  isPro: false,
});

export const useSubscription = () => useContext(SubscriptionContext);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPlan("free");
      setLoading(false);
      return;
    }

    const fetchPlan = async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", user.id)
        .single();

      if (data && data.status === "active" && data.plan === "pro") {
        setPlan("pro");
      } else {
        setPlan("free");
      }
      setLoading(false);
    };

    fetchPlan();
  }, [user]);

  return (
    <SubscriptionContext.Provider value={{ plan, loading, isPro: plan === "pro" }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
