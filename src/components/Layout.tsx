import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import AICoachWidget from "./AICoachWidget";
import { useAuth } from "@/contexts/AuthContext";
import { loadFromCloud, syncToCloud } from "@/lib/cloudSync";

export default function Layout() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // On login: load cloud data, then sync any local-only data up
    loadFromCloud(user.id).then(() => {
      // Force re-render by dispatching storage event
      window.dispatchEvent(new Event('storage'));
    });

    // Periodically sync to cloud every 30s
    const interval = setInterval(() => {
      syncToCloud(user.id);
    }, 30000);

    // Sync on page unload
    const handleUnload = () => syncToCloud(user.id);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
      syncToCloud(user.id); // sync on unmount
    };
  }, [user]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </main>
      <MobileNav />
      <AICoachWidget />
    </div>
  );
}
