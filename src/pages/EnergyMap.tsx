import { useEffect, useState } from "react";
import { Battery, BatteryLow, BatteryMedium, BatteryFull, Zap, Brain, Coffee, Users, Inbox, Plus, Info } from "lucide-react";
import { getEnergyLogs, saveEnergyLogs, calculateBiologicalPrimeTime, generateId, todayStr, type EnergyLog, type BiologicalPrimeTime } from "@/lib/store";
import { useXPAward } from "@/hooks/useXP";
import { notifyXP } from "@/components/XPNotification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const workTypeColors: Record<string, string> = {
  'deep-work': 'bg-primary/80',
  'creative': 'bg-info/80',
  'admin': 'bg-warning/80',
  'social': 'bg-success/80',
  'rest': 'bg-muted',
};

const workTypeLabels: Record<string, string> = {
  'deep-work': '🧠 Deep Work',
  'creative': '🎨 Creative',
  'admin': '📋 Admin',
  'social': '👥 Social',
  'rest': '😴 Rest',
};

export default function EnergyMap() {
  const [logs, setLogs] = useState<EnergyLog[]>([]);
  const [open, setOpen] = useState(false);
  const [energy, setEnergy] = useState(7);
  const [activity, setActivity] = useState("");
  const [note, setNote] = useState("");
  const today = todayStr();

  const { grantXP } = useXPAward();
  useEffect(() => { setLogs(getEnergyLogs()); }, []);

  const update = (l: EnergyLog[]) => { setLogs(l); saveEnergyLogs(l); };

  const logEnergy = () => {
    const now = new Date();
    const log: EnergyLog = {
      id: generateId(), date: today, hour: now.getHours(),
      level: energy, activity: activity.trim() || undefined,
      note: note.trim() || undefined,
    };
    update([log, ...logs]);
    const result = grantXP('energy', 'Logged energy level');
    notifyXP(result);
    setActivity(""); setNote(""); setEnergy(7); setOpen(false);
  };

  const quickLog = (level: number) => {
    const now = new Date();
    const log: EnergyLog = {
      id: generateId(), date: today, hour: now.getHours(), level,
    };
    update([log, ...logs]);
    const result = grantXP('energy', 'Quick energy log');
    notifyXP(result);
  };

  const primeTime = calculateBiologicalPrimeTime(logs);
  const todayLogs = logs.filter(l => l.date === today).sort((a, b) => a.hour - b.hour);
  const hasEnoughData = logs.length >= 14; // at least 2 weeks of data

  // Find peak hours
  const sortedByEnergy = [...primeTime].filter(p => p.sampleCount > 0).sort((a, b) => b.avgEnergy - a.avgEnergy);
  const peakHours = sortedByEnergy.slice(0, 3);
  const lowHours = sortedByEnergy.slice(-3).reverse();

  const currentHour = new Date().getHours();
  const currentPrime = primeTime.find(p => p.hour === currentHour);

  const energyEmoji = (level: number) => {
    if (level >= 9) return '⚡';
    if (level >= 7) return '🔋';
    if (level >= 5) return '🔌';
    if (level >= 3) return '🪫';
    return '😴';
  };

  const formatHour = (h: number) => {
    if (h === 0) return '12am';
    if (h === 12) return '12pm';
    return h > 12 ? `${h - 12}pm` : `${h}am`;
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-foreground">Energy Map</h1>
          <p className="text-muted-foreground mt-1">Discover your biological prime time</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-warm text-primary-foreground font-semibold gap-2"><Plus size={18} /> Log Energy</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle className="font-display text-foreground">How's your energy right now?</DialogTitle></DialogHeader>
              <div className="space-y-6 mt-4">
                <div>
                  <div className="flex justify-between mb-3">
                    <span className="text-sm text-foreground">Energy Level</span>
                    <span className="text-2xl">{energyEmoji(energy)} <span className="text-lg font-bold text-primary">{energy}/10</span></span>
                  </div>
                  <Slider value={[energy]} onValueChange={([v]) => setEnergy(v)} min={1} max={10} step={1} />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>Exhausted</span><span>Peak</span>
                  </div>
                </div>
                <Input placeholder="What are you doing right now?" value={activity} onChange={e => setActivity(e.target.value)} className="bg-secondary border-border" />
                <Input placeholder="Any notes? (optional)" value={note} onChange={e => setNote(e.target.value)} className="bg-secondary border-border" />
                <Button onClick={logEnergy} className="w-full gradient-warm text-primary-foreground font-semibold">Log Energy</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick log */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <p className="text-sm text-muted-foreground mb-3">⚡ Quick log — How's your energy right now? ({formatHour(currentHour)})</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
            <button key={level} onClick={() => quickLog(level)} className={`flex-1 h-10 rounded-lg text-sm font-bold transition-all hover:scale-105 ${
              level >= 8 ? 'bg-success/20 text-success hover:bg-success/30' :
              level >= 5 ? 'bg-primary/20 text-primary hover:bg-primary/30' :
              level >= 3 ? 'bg-warning/20 text-warning hover:bg-warning/30' :
              'bg-destructive/20 text-destructive hover:bg-destructive/30'
            }`}>
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Current recommendation */}
      {currentPrime && currentPrime.sampleCount > 0 && (
        <div className="bg-card border border-primary/20 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${workTypeColors[currentPrime.bestFor]}`}>
              {currentPrime.bestFor === 'deep-work' ? <Brain size={20} className="text-primary-foreground" /> :
               currentPrime.bestFor === 'creative' ? <Zap size={20} className="text-primary-foreground" /> :
               currentPrime.bestFor === 'admin' ? <Inbox size={20} className="text-primary-foreground" /> :
               currentPrime.bestFor === 'social' ? <Users size={20} className="text-primary-foreground" /> :
               <Coffee size={20} className="text-muted-foreground" />}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Right now ({formatHour(currentHour)}), your typical energy is <span className="text-primary font-bold">{currentPrime.avgEnergy}/10</span>
              </p>
              <p className="text-xs text-muted-foreground">Best for: <span className="text-foreground">{workTypeLabels[currentPrime.bestFor]}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Biological Prime Time Map */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-foreground">Your Biological Prime Time</h3>
          <Tooltip>
            <TooltipTrigger><Info size={14} className="text-muted-foreground" /></TooltipTrigger>
            <TooltipContent className="max-w-64"><p className="text-xs">Log your energy at different times of day. After 2+ weeks, this map reveals when you're naturally most productive. Schedule deep work during peak hours.</p></TooltipContent>
          </Tooltip>
        </div>

        {!hasEnoughData && (
          <div className="text-center py-4 mb-4 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-sm text-primary">📊 Log your energy {14 - logs.length} more times to unlock your prime time map</p>
            <p className="text-xs text-muted-foreground mt-1">Try logging 2-3 times daily for best results</p>
          </div>
        )}

        {/* Hour-by-hour energy heatmap */}
        <div className="space-y-1">
          {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(hour => {
            const pt = primeTime.find(p => p.hour === hour);
            const avg = pt?.avgEnergy || 0;
            const samples = pt?.sampleCount || 0;
            const barWidth = samples > 0 ? Math.max(avg * 10, 5) : 0;

            return (
              <div key={hour} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-12 text-right font-mono">{formatHour(hour)}</span>
                <div className="flex-1 h-7 bg-secondary/50 rounded-md overflow-hidden relative">
                  {samples > 0 && (
                    <div
                      className={`h-full rounded-md transition-all ${
                        avg >= 8 ? 'bg-success/60' : avg >= 6 ? 'bg-primary/60' : avg >= 4 ? 'bg-warning/60' : 'bg-destructive/40'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  )}
                  {samples > 0 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-foreground/70">
                      {avg.toFixed(1)} {workTypeLabels[pt?.bestFor || 'rest']}
                    </span>
                  )}
                </div>
                {hour === currentHour && <span className="text-xs text-primary font-bold">NOW</span>}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
          {Object.entries(workTypeLabels).map(([key, label]) => (
            <span key={key} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className={`w-2.5 h-2.5 rounded-sm ${workTypeColors[key]}`} /> {label}
            </span>
          ))}
        </div>
      </div>

      {/* Peak & Low hours */}
      {hasEnoughData && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card border border-success/20 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-success mb-3">⚡ Peak Hours</h3>
            {peakHours.map(p => (
              <div key={p.hour} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-foreground font-mono">{formatHour(p.hour)}</span>
                <span className="text-xs text-success font-bold">{p.avgEnergy.toFixed(1)}/10</span>
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground mt-2">Schedule your hardest tasks here</p>
          </div>
          <div className="bg-card border border-destructive/20 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-destructive mb-3">🪫 Low Hours</h3>
            {lowHours.map(p => (
              <div key={p.hour} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-foreground font-mono">{formatHour(p.hour)}</span>
                <span className="text-xs text-destructive font-bold">{p.avgEnergy.toFixed(1)}/10</span>
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground mt-2">Use for admin tasks or breaks</p>
          </div>
        </div>
      )}

      {/* Today's log */}
      {todayLogs.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Today's Energy Log</h3>
          <div className="space-y-2">
            {todayLogs.map(l => (
              <div key={l.id} className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground font-mono w-12">{formatHour(l.hour)}</span>
                <span className="text-lg">{energyEmoji(l.level)}</span>
                <span className="font-bold text-foreground">{l.level}/10</span>
                {l.activity && <span className="text-muted-foreground">— {l.activity}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
