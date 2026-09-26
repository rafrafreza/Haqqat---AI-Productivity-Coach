import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import XPNotificationLayer from "@/components/XPNotification";
import ConfettiLayer from "@/components/Confetti";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Routines from "./pages/Routines";
import Activities from "./pages/Activities";
import Analytics from "./pages/Analytics";
import Insights from "./pages/Insights";
import Goals from "./pages/Goals";
import Tasks from "./pages/Tasks";
import Focus from "./pages/Focus";
import Reviews from "./pages/Reviews";
import EnergyMap from "./pages/EnergyMap";
import DecisionJournal from "./pages/DecisionJournal";
import ProcrastinationAutopsy from "./pages/ProcrastinationAutopsy";
import FutureLetters from "./pages/FutureLetters";
import LifeBalance from "./pages/LifeBalance";
import Gamification from "./pages/Gamification";
import MorningRitual from "./pages/MorningRitual";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/landing" replace />;
  return <>{children}</>;
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const onboarded = localStorage.getItem("dayflow_onboarded");
  if (!onboarded) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="haqqat-theme">
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <XPNotificationLayer />
          <ConfettiLayer />
          <Routes>
            <Route path="/landing" element={<PublicOnly><Landing /></PublicOnly>} />
            <Route path="/auth" element={<PublicOnly><Auth /></PublicOnly>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route element={<ProtectedRoute><OnboardingGuard><Layout /></OnboardingGuard></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ritual" element={<MorningRitual />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/routines" element={<Routines />} />
              <Route path="/focus" element={<Focus />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/energy" element={<EnergyMap />} />
              <Route path="/decisions" element={<DecisionJournal />} />
              <Route path="/procrastination" element={<ProcrastinationAutopsy />} />
              <Route path="/letters" element={<FutureLetters />} />
              <Route path="/balance" element={<LifeBalance />} />
              <Route path="/xp" element={<Gamification />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/insights" element={<Insights />} />
            </Route>
            <Route path="/ghazi" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
