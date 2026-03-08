import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
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

import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <Toaster />
          <Sonner />
          <XPNotificationLayer />
          <ConfettiLayer />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SubscriptionProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
