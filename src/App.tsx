import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/routines" element={<Routines />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/focus" element={<Focus />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/energy" element={<EnergyMap />} />
            <Route path="/decisions" element={<DecisionJournal />} />
            <Route path="/procrastination" element={<ProcrastinationAutopsy />} />
            <Route path="/letters" element={<FutureLetters />} />
            <Route path="/balance" element={<LifeBalance />} />
            <Route path="/xp" element={<Gamification />} />
            <Route path="/ritual" element={<MorningRitual />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
