import { useEffect, useState, useCallback } from "react";
import { Zap, Star, Trophy } from "lucide-react";
import type { XPResult } from "@/hooks/useXP";
import { triggerConfetti } from "@/components/Confetti";

interface XPToast {
  id: string;
  type: 'xp' | 'level-up' | 'achievement';
  amount?: number;
  description?: string;
  level?: number;
  achievementTitle?: string;
  achievementIcon?: string;
}

// Global event system for XP notifications
type XPListener = (result: XPResult) => void;
const listeners: XPListener[] = [];

export function notifyXP(result: XPResult) {
  listeners.forEach(l => l(result));
}

// Sound effects using Web Audio API
function playSound(type: 'xp' | 'level-up' | 'achievement') {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'xp') {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'level-up') {
      // Ascending arpeggio
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
        o.start(ctx.currentTime + i * 0.12);
        o.stop(ctx.currentTime + i * 0.12 + 0.3);
      });
    } else {
      // Achievement fanfare
      const notes = [659, 784, 1047, 1319];
      notes.forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        g.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.4);
        o.start(ctx.currentTime + i * 0.1);
        o.stop(ctx.currentTime + i * 0.1 + 0.4);
      });
    }
  } catch {
    // Audio not supported
  }
}

let toastId = 0;

export default function XPNotificationLayer() {
  const [toasts, setToasts] = useState<XPToast[]>([]);

  const addToast = useCallback((toast: Omit<XPToast, 'id'>) => {
    const id = String(++toastId);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.type === 'xp' ? 2500 : 4000);
  }, []);

  useEffect(() => {
    const handler: XPListener = (result) => {
      // XP toast
      playSound('xp');
      addToast({
        type: 'xp',
        amount: result.event.amount,
        description: result.event.description,
      });

      // Level up toast
      if (result.leveledUp) {
        setTimeout(() => {
          playSound('level-up');
          triggerConfetti();
          addToast({ type: 'level-up', level: result.level });
        }, 600);
      }

      // Achievement toasts
      result.newAchievements.forEach((a, i) => {
        setTimeout(() => {
          playSound('achievement');
          addToast({
            type: 'achievement',
            achievementTitle: a.title,
            achievementIcon: a.icon,
            amount: a.xpReward,
          });
        }, (result.leveledUp ? 1200 : 600) + i * 800);
      });
    };

    listeners.push(handler);
    return () => {
      const idx = listeners.indexOf(handler);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, [addToast]);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto animate-xp-toast"
        >
          {toast.type === 'xp' && (
            <div className="flex items-center gap-3 bg-card border border-primary/30 rounded-xl px-4 py-3 shadow-lg min-w-[200px]">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Zap size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-primary">+{toast.amount} XP</p>
                <p className="text-xs text-muted-foreground truncate">{toast.description}</p>
              </div>
            </div>
          )}

          {toast.type === 'level-up' && (
            <div className="flex items-center gap-3 bg-card border-2 border-primary rounded-xl px-5 py-4 shadow-xl min-w-[240px] animate-level-up-glow">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 animate-spin-slow">
                <Star size={22} className="text-primary" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground">Level Up!</p>
                <p className="text-sm text-primary font-medium">You reached Level {toast.level}</p>
              </div>
            </div>
          )}

          {toast.type === 'achievement' && (
            <div className="flex items-center gap-3 bg-card border-2 border-warning rounded-xl px-5 py-4 shadow-xl min-w-[260px]">
              <span className="text-2xl animate-bounce-gentle">{toast.achievementIcon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Trophy size={14} className="text-warning" />
                  <p className="text-xs font-medium text-warning">Achievement Unlocked!</p>
                </div>
                <p className="text-sm font-bold text-foreground">{toast.achievementTitle}</p>
              </div>
              <span className="text-xs font-bold text-primary">+{toast.amount} XP</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
