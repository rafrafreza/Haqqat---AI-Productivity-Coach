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
  // All features are currently free — no Pro gating
  return (
    <SubscriptionContext.Provider value={{ plan: "pro", loading: false, isPro: true }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
