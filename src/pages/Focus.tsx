import { useEffect, useState, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Settings, Timer, Zap, Coffee, Brain } from "lucide-react";
import { getFocusSessions, saveFocusSessions, getPomodoroSettings, savePomodoroSettings, generateId, todayStr, getTodayFocusMinutes, getWeekFocusMinutes, type FocusSession, type PomodoroSettings } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Phase = 'work' | 'short-break' | 'long-break';

export default function Focus() {
  const [settings, setSettings] = useState<PomodoroSettings>(getPomodoroSettings());
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [phase, setPhase] = useState<Phase>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [label, setLabel] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<string>("");

  useEffect(() => { setSessions(getFocusSessions()); }, []);

  const phaseDuration = useCallback((p: Phase) => {
    if (p === 'work') return settings.workMinutes * 60;
    if (p === 'short-break') return settings.shortBreakMinutes * 60;
    return settings.longBreakMinutes * 60;
  }, [settings]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, phase]);

  const handlePhaseComplete = () => {
    setIsRunning(false);
    if (phase === 'work') {
      // Save focus session
      const session: FocusSession = {
        id: generateId(), date: todayStr(), startTime: startTimeRef.current,
        endTime: new Date().toISOString(), duration: settings.workMinutes,
        type: 'pomodoro', label: label || undefined, completed: true, distractions: 0,
      };
      const updated = [session, ...sessions];
      setSessions(updated);
      saveFocusSessions(updated);

      const newCount = sessionCount + 1;
      setSessionCount(newCount);

      // Determine next break
      if (newCount % settings.sessionsBeforeLongBreak === 0) {
        setPhase('long-break');
        setTimeLeft(settings.longBreakMinutes * 60);
      } else {
        setPhase('short-break');
        setTimeLeft(settings.shortBreakMinutes * 60);
      }

      // Play notification sound
      try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdW+IjYyNi4eFdmFTT1xqeYSMkZGOi4V7bmBUTlhoe4WOk5OSj4uFe21gU05Ya3yGjpOTko+LhXttYFNO').play(); } catch {}
    } else {
      setPhase('work');
      setTimeLeft(settings.workMinutes * 60);
    }
  };

  const start = () => {
    if (!isRunning) startTimeRef.current = new Date().toISOString();
    setIsRunning(true);
  };

  const pause = () => setIsRunning(false);

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(phaseDuration(phase));
  };

  const skipToWork = () => {
    setIsRunning(false);
    setPhase('work');
    setTimeLeft(settings.workMinutes * 60);
  };

  const updateSettings = (newSettings: PomodoroSettings) => {
    setSettings(newSettings);
    savePomodoroSettings(newSettings);
    if (!isRunning) {
      setTimeLeft(newSettings.workMinutes * 60);
      setPhase('work');
    }
    setSettingsOpen(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalSeconds = phaseDuration(phase);
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const todayMins = getTodayFocusMinutes(sessions);
  const weekMins = getWeekFocusMinutes(sessions);
  const todaySessions = sessions.filter(s => s.date === todayStr());

  const phaseColors = { work: 'text-primary', 'short-break': 'text-success', 'long-break': 'text-info' };
  const phaseIcons = { work: <Brain size={20} />, 'short-break': <Coffee size={20} />, 'long-break': <Zap size={20} /> };
  const phaseLabels = { work: 'Focus Time', 'short-break': 'Short Break', 'long-break': 'Long Break' };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-foreground">Focus</h1>
          <p className="text-muted-foreground mt-1">Deep work & Pomodoro timer</p>
        </div>
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild><Button variant="outline" size="sm" className="gap-1.5"><Settings size={14} /> Settings</Button></DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="font-display text-foreground">Timer Settings</DialogTitle></DialogHeader>
            <PomodoroSettingsForm settings={settings} onSave={updateSettings} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Timer */}
      <div className="bg-card border border-border rounded-2xl p-8 md:p-12 text-center mb-8">
        <div className={`flex items-center justify-center gap-2 mb-6 ${phaseColors[phase]}`}>
          {phaseIcons[phase]}
          <span className="text-sm font-semibold uppercase tracking-wider">{phaseLabels[phase]}</span>
        </div>

        {/* Circular progress */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <svg className="w-56 h-56 md:w-72 md:h-72 -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
            <circle cx="100" cy="100" r="90" fill="none" stroke={phase === 'work' ? 'hsl(var(--primary))' : phase === 'short-break' ? 'hsl(var(--success))' : 'hsl(var(--info))'} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 90}`} strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`} className="transition-all duration-1000" />
          </svg>
          <div className="absolute">
            <p className="text-5xl md:text-6xl font-bold text-foreground font-mono tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Session {sessionCount + 1}</p>
          </div>
        </div>

        <Input placeholder="What are you working on?" value={label} onChange={e => setLabel(e.target.value)} className="bg-secondary border-border max-w-xs mx-auto mb-6 text-center" />

        <div className="flex items-center justify-center gap-3">
          {!isRunning ? (
            <Button onClick={start} className="gradient-warm text-primary-foreground font-semibold gap-2 px-8 h-12 text-base"><Play size={20} /> Start</Button>
          ) : (
            <Button onClick={pause} variant="outline" className="gap-2 px-8 h-12 text-base"><Pause size={20} /> Pause</Button>
          )}
          <Button onClick={reset} variant="outline" size="icon" className="h-12 w-12"><RotateCcw size={18} /></Button>
          {phase !== 'work' && <Button onClick={skipToWork} variant="outline" size="sm" className="h-12">Skip to Focus</Button>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{Math.floor(todayMins / 60)}h {todayMins % 60}m</p>
          <p className="text-xs text-muted-foreground mt-1">Today's Focus</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{todaySessions.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Sessions Today</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{Math.floor(weekMins / 60)}h</p>
          <p className="text-xs text-muted-foreground mt-1">This Week</p>
        </div>
      </div>

      {/* Today's sessions */}
      {todaySessions.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Today's Sessions</h3>
          <div className="space-y-2">
            {todaySessions.map(s => (
              <div key={s.id} className="flex items-center gap-3 text-sm">
                <Timer size={14} className="text-primary shrink-0" />
                <span className="text-foreground flex-1">{s.label || 'Focus session'}</span>
                <span className="text-muted-foreground">{s.duration}m</span>
                <span className="text-xs text-muted-foreground">{new Date(s.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PomodoroSettingsForm({ settings, onSave }: { settings: PomodoroSettings; onSave: (s: PomodoroSettings) => void }) {
  const [work, setWork] = useState(String(settings.workMinutes));
  const [shortBreak, setShortBreak] = useState(String(settings.shortBreakMinutes));
  const [longBreak, setLongBreak] = useState(String(settings.longBreakMinutes));
  const [sessions, setSessions] = useState(String(settings.sessionsBeforeLongBreak));

  return (
    <div className="space-y-4 mt-2">
      <div><label className="text-xs text-muted-foreground">Work duration (min)</label><Input type="number" value={work} onChange={e => setWork(e.target.value)} className="bg-secondary border-border" /></div>
      <div><label className="text-xs text-muted-foreground">Short break (min)</label><Input type="number" value={shortBreak} onChange={e => setShortBreak(e.target.value)} className="bg-secondary border-border" /></div>
      <div><label className="text-xs text-muted-foreground">Long break (min)</label><Input type="number" value={longBreak} onChange={e => setLongBreak(e.target.value)} className="bg-secondary border-border" /></div>
      <div><label className="text-xs text-muted-foreground">Sessions before long break</label><Input type="number" value={sessions} onChange={e => setSessions(e.target.value)} className="bg-secondary border-border" /></div>
      <Button onClick={() => onSave({ workMinutes: parseInt(work) || 25, shortBreakMinutes: parseInt(shortBreak) || 5, longBreakMinutes: parseInt(longBreak) || 15, sessionsBeforeLongBreak: parseInt(sessions) || 4 })} className="w-full gradient-warm text-primary-foreground font-semibold">Save Settings</Button>
    </div>
  );
}
