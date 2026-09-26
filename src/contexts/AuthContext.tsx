import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase as supabaseClient } from "@/integrations/supabase/client";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync Google profile picture on every sign-in
    const syncGoogleAvatar = async (user: any) => {
      if (!user) return;
      const provider = user.app_metadata?.provider;
      if (provider !== "google") return;
      // Google always provides a fresh picture URL in user metadata
      const googlePicture =
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        user.identities?.[0]?.identity_data?.avatar_url ||
        user.identities?.[0]?.identity_data?.picture;
      if (!googlePicture) return;
      // Update profile with the fresh URL (silent, no await needed)
      supabase
        .from("profiles")
        .update({ avatar_url: googlePicture })
        .eq("user_id", user.id)
        .then(() => {});
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (_event === "SIGNED_IN") {
        syncGoogleAvatar(session?.user);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      syncGoogleAvatar(session?.user);
      // Track app_opened when session is restored
      if (session?.user) {
        supabase
          .from("events" as any)
          .insert({ user_id: session.user.id, event: "app_opened", properties: {} })
          .then(() => {});
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
