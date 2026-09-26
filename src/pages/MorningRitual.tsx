import { useEffect, useState } from "react";
import { Sun, Plus, X, Clock, Zap, Heart, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { getMorningRituals, saveMorningRituals, getEnergyLogs, calculateBiologicalPrimeTime, getTasks, todayStr, generateId, type MorningRitual, type RitualTimeBlock, type Task, type BiologicalPrimeTime } from "@/lib/store";
import { useXPAward } from "@/hooks/useXP";
import { useTrack } from "@/hooks/useTrack";
import { notifyXP } from "@/components/XPNotification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ENERGY_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  low: { label: 'Low Energy', color: 'text-muted-foreground', icon: '🔋' },
  medium: { label: 'Medium Energy', color: 'text-amber-500', icon: '⚡' },
  high: { label: 'High Energy', color: 'text-emerald-500', icon: '🔥' },
  peak: { label: 'Peak Energy', color: 'text-primary', icon: '🚀' },
};

export default function MorningRitualPage() {
  const { grantXP } = useXPAward();
  const { track } = useTrack();
  const [rituals, setRituals] = useState<MorningRitual[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [primeTime, setPrimeTime] = useState<BiologicalPrimeTime[]>([]);
  const [step, setStep] = useState(0); // 0=review, 1=intention, 2=priorities, 3=timeblocks, 4=done
  const today = todayStr();
  const [selectedRitual, setSelectedRitual] = useState<MorningRitual | null>(null);

  // Form state
  const [yesterdayReflection, setYesterdayReflection] = useState('');
  const [predictionAccuracy, setPredictionAccuracy] = useState(3);
  const [intentionWord, setIntentionWord] = useState('');
  const [energyForecast, setEnergyForecast] = useState<MorningRitual['energyForecast']>('medium');
  const [gratitude, setGratitude] = useState<string[]>(['', '', '']);
  const [priorities, setPriorities] = useState<string[]>(['', '', '']);
  const [timeBlocks, setTimeBlocks] = useState<RitualTimeBlock[]>([]);
  const [newBlock, setNewBlock] = useState({ startTime: '09:00', endTime: '10:00', label: '' });

  useEffect(() => {
    const r = getMorningRituals();
    setRituals(r);
    setTasks(getTasks().filter(t => t.status !== 'done' && t.status !== 'cancelled'));
    const logs = getEnergyLogs();
    setPrimeTime(calculateBiologicalPrimeTime(logs));
  }, []);

  const todayRitual = rituals.find(r => r.date === today);
  const yesterdayRitual = rituals.find(r => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return r.date === y.toISOString().slice(0, 10);
  });

  const getEnergyForHour = (hour: number): BiologicalPrimeTime | undefined => {
    return primeTime.find(p => p.hour === hour);
  };

  const getBlockEnergyMatch = (startTime: string): RitualTimeBlock['energyMatch'] => {
    const hour = parseInt(startTime.split(':')[0]);
    const energy = getEnergyForHour(hour);
    if (!energy || energy.sampleCount === 0) return 'neutral';
    if (energy.avgEnergy >= 7) return 'aligned';
    if (energy.avgEnergy <= 3) return 'misaligned';
    return 'neutral';
  };

  const addTimeBlock = () => {
    if (!newBlock.label) return;
    const block: RitualTimeBlock = {
      id: generateId(),
      startTime: newBlock.startTime,
      endTime: newBlock.endTime,
      label: newBlock.label,
      energyMatch: getBlockEnergyMatch(newBlock.startTime),
    };
    setTimeBlocks([...timeBlocks, block]);
    setNewBlock({ startTime: newBlock.endTime, endTime: '', label: '' });
  };

  const removeTimeBlock = (id: string) => {
    setTimeBlocks(timeBlocks.filter(b => b.id !== id));
  };

  const completeRitual = () => {
    track("morning_ritual_completed");
    const ritual: MorningRitual = {
      id: generateId(),
      date: today,
      topPriorities: priorities.filter(p => p.trim()),
      timeBlocks,
      yesterdayReflection: yesterdayReflection || undefined,
      yesterdayPredictionAccuracy: predictionAccuracy,
      intentionWord,
      energyForecast,
      gratitude: gratitude.filter(g => g.trim()),
      completedAt: new Date().toISOString(),
    };
    const updated = [...rituals.filter(r => r.date !== today), ritual];
    saveMorningRituals(updated);
    setRituals(updated);
    const result = grantXP('morning-ritual', 'Completed morning ritual');
    notifyXP(result);
    setStep(4);
  };

  // If already completed today
  if (todayRitual && step !== 4) {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display text-foreground">Morning Ritual</h1>
          <p className="text-muted-foreground mt-1">Today's ritual is complete ✅</p>
        </div>
        <CompletedRitualView ritual={todayRitual} primeTime={primeTime} />
      </div>
    );
  }

  // Step 4: Completion
  if (step === 4) {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto text-center">
        <div className="py-16">
          <Sparkles size={48} className="mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-display text-foreground mb-2">Ritual Complete</h1>
          <p className="text-muted-foreground mb-2">+20 XP earned</p>
          <p className="text-lg text-foreground mt-4">
            Your word today: <span className="text-primary font-bold text-2xl">{intentionWord}</span>
          </p>
          <p className="text-muted-foreground mt-6">Go crush it. 🚀</p>
        </div>
      </div>
    );
  }

  const steps = [
    { label: 'Reflect', icon: '🔄' },
    { label: 'Intention', icon: '✨' },
    { label: 'Priorities', icon: '🎯' },
    { label: 'Time Blocks', icon: '📅' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display text-foreground">Morning Ritual</h1>
        <p className="text-muted-foreground mt-1">Design your day with intention</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              i === step ? 'bg-primary text-primary-foreground' : i < step ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
            }`}>
              {i < step ? '✓' : s.icon}
            </div>
            {i < steps.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-primary' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      {/* Step 0: Yesterday Review */}
      {step === 0 && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-display text-foreground mb-4 flex items-center gap-2">
              🔄 Yesterday's Review
            </h3>
            {yesterdayRitual ? (
              <div className="mb-4 p-4 rounded-lg bg-secondary/30">
                <p className="text-sm text-muted-foreground mb-2">Yesterday's priorities were:</p>
                <ul className="space-y-1">
                  {yesterdayRitual.topPriorities.map((p, i) => (
                    <li key={i} className="text-sm text-foreground">• {p}</li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground mt-3">Intention was: <span className="text-primary font-medium">{yesterdayRitual.intentionWord}</span></p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">No ritual recorded yesterday.</p>
            )}
            <Textarea
              placeholder="How did yesterday go? What worked, what didn't?"
              value={yesterdayReflection}
              onChange={e => setYesterdayReflection(e.target.value)}
              rows={3}
            />
            {yesterdayRitual && (
              <div className="mt-4">
                <p className="text-sm text-foreground mb-2">How accurate were yesterday's predictions? (1-5)</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setPredictionAccuracy(n)}
                      className={`w-10 h-10 rounded-lg border text-sm font-bold transition-all ${
                        predictionAccuracy === n ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button onClick={() => setStep(1)} className="w-full">
            Continue <ArrowRight size={16} />
          </Button>
        </div>
      )}

      {/* Step 1: Intention & Gratitude */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-display text-foreground mb-4">✨ Set Your Intention</h3>
            <p className="text-sm text-muted-foreground mb-3">Choose one word that will guide your day</p>
            <Input
              placeholder="e.g. Focus, Courage, Flow, Kindness..."
              value={intentionWord}
              onChange={e => setIntentionWord(e.target.value)}
              className="text-lg font-medium text-center"
            />
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-display text-foreground mb-4">🙏 Gratitude</h3>
            <p className="text-sm text-muted-foreground mb-3">Three things you're grateful for</p>
            {gratitude.map((g, i) => (
              <Input
                key={i}
                placeholder={`Grateful for...`}
                value={g}
                onChange={e => {
                  const updated = [...gratitude];
                  updated[i] = e.target.value;
                  setGratitude(updated);
                }}
                className="mb-2"
              />
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-display text-foreground mb-4">🔋 Energy Forecast</h3>
            <p className="text-sm text-muted-foreground mb-3">How do you expect your energy today?</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(Object.keys(ENERGY_LABELS) as MorningRitual['energyForecast'][]).map(level => {
                const info = ENERGY_LABELS[level];
                return (
                  <button
                    key={level}
                    onClick={() => setEnergyForecast(level)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      energyForecast === level ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/30'
                    }`}
                  >
                    <span className="text-xl">{info.icon}</span>
                    <p className={`text-xs mt-1 font-medium ${energyForecast === level ? 'text-primary' : 'text-muted-foreground'}`}>{info.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(0)} className="flex-1">Back</Button>
            <Button onClick={() => setStep(2)} disabled={!intentionWord.trim()} className="flex-1">
              Continue <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Top 3 Priorities */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-display text-foreground mb-2">🎯 Top 3 Priorities</h3>
            <p className="text-sm text-muted-foreground mb-4">If you could only do 3 things today, what would they be?</p>
            {priorities.map((p, i) => (
              <div key={i} className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{i + 1}</span>
                <Input
                  placeholder={`Priority ${i + 1}`}
                  value={p}
                  onChange={e => {
                    const updated = [...priorities];
                    updated[i] = e.target.value;
                    setPriorities(updated);
                  }}
                  className="flex-1"
                />
              </div>
            ))}
          </div>

          {/* Suggested from tasks */}
          {tasks.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h4 className="text-sm font-medium text-foreground mb-3">📋 From your task list</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {tasks.slice(0, 8).map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      const emptyIdx = priorities.findIndex(p => !p.trim());
                      if (emptyIdx >= 0) {
                        const updated = [...priorities];
                        updated[emptyIdx] = t.title;
                        setPriorities(updated);
                      }
                    }}
                    className="w-full text-left p-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <Plus size={14} /> {t.title}
                    {t.deadline && <span className="text-[10px] ml-auto text-destructive">{t.deadline}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
            <Button onClick={() => setStep(3)} disabled={!priorities.some(p => p.trim())} className="flex-1">
              Continue <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Time Blocks */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-display text-foreground mb-2">📅 Time Blocks</h3>
            <p className="text-sm text-muted-foreground mb-4">Schedule your day based on your energy patterns</p>

            {/* Energy hint */}
            {primeTime.some(p => p.sampleCount > 0) && (
              <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-primary font-medium mb-1">🧠 Your Biological Prime Time</p>
                <p className="text-xs text-muted-foreground">
                  Peak hours: {primeTime.filter(p => p.avgEnergy >= 7 && p.sampleCount > 0).map(p => `${p.hour}:00`).join(', ') || 'Not enough data yet'}
                </p>
              </div>
            )}

            {/* Existing blocks */}
            {timeBlocks.length > 0 && (
              <div className="space-y-2 mb-4">
                {timeBlocks.map(b => (
                  <div key={b.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                    b.energyMatch === 'aligned' ? 'border-emerald-500/30 bg-emerald-500/5' :
                    b.energyMatch === 'misaligned' ? 'border-destructive/30 bg-destructive/5' :
                    'border-border bg-secondary/30'
                  }`}>
                    <Clock size={14} className="text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">{b.startTime}–{b.endTime}</span>
                    <span className="text-sm font-medium text-foreground flex-1">{b.label}</span>
                    {b.energyMatch === 'aligned' && <span className="text-[10px] text-emerald-500">⚡ Energy aligned</span>}
                    {b.energyMatch === 'misaligned' && <span className="text-[10px] text-destructive">⚠️ Low energy hour</span>}
                    <button onClick={() => removeTimeBlock(b.id)} className="text-muted-foreground hover:text-destructive">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add block */}
            <div className="flex flex-wrap gap-2">
              <Input type="time" value={newBlock.startTime} onChange={e => setNewBlock({ ...newBlock, startTime: e.target.value })} className="w-28" />
              <Input type="time" value={newBlock.endTime} onChange={e => setNewBlock({ ...newBlock, endTime: e.target.value })} className="w-28" />
              <Input placeholder="What will you do?" value={newBlock.label} onChange={e => setNewBlock({ ...newBlock, label: e.target.value })} className="flex-1 min-w-[150px]" />
              <Button variant="outline" size="icon" onClick={addTimeBlock} disabled={!newBlock.label}>
                <Plus size={16} />
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
            <Button onClick={completeRitual} className="flex-1">
              Complete Ritual <CheckCircle2 size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Past rituals */}
      {rituals.length > 0 && step === 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-display text-foreground mb-4">Past Rituals</h3>
          <div className="space-y-2">
            {rituals.filter(r => r.date !== today).slice(-14).reverse().map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRitual(r)}
                className="w-full p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sun size={14} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{new Date(r.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {r.topPriorities.filter(Boolean).length} priorities · {r.gratitude.filter(Boolean).length} gratitudes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.intentionWord && <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{r.intentionWord}</span>}
                    <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Past ritual detail modal */}
      {selectedRitual && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedRitual(null)}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mt-8 mb-8"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h3 className="font-display text-foreground text-lg">Morning Ritual</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(selectedRitual.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setSelectedRitual(null)}
                className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {selectedRitual.intentionWord && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                  <Sparkles size={18} className="mx-auto text-primary mb-1" />
                  <p className="text-xl font-bold text-primary">{selectedRitual.intentionWord}</p>
                  <p className="text-xs text-muted-foreground">Intention word</p>
                </div>
              )}
              {selectedRitual.topPriorities.filter(Boolean).length > 0 && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">🎯 Top Priorities</h4>
                  {selectedRitual.topPriorities.filter(Boolean).map((p, i) => (
                    <div key={i} className="flex items-center gap-3 py-1.5">
                      <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">{i + 1}</span>
                      <span className="text-sm text-foreground">{p}</span>
                    </div>
                  ))}
                </div>
              )}
              {selectedRitual.timeBlocks.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">📅 Time Blocks</h4>
                  {selectedRitual.timeBlocks.map(b => (
                    <div key={b.id} className="flex items-center gap-3 py-1.5">
                      <Clock size={13} className="text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground w-24 shrink-0">{b.startTime}–{b.endTime}</span>
                      <span className="text-sm text-foreground">{b.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {selectedRitual.gratitude.filter(Boolean).length > 0 && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">🙏 Gratitude</h4>
                  {selectedRitual.gratitude.filter(Boolean).map((g, i) => (
                    <p key={i} className="text-sm text-muted-foreground py-1">• {g}</p>
                  ))}
                </div>
              )}
              {selectedRitual.yesterdayReflection && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">💭 Yesterday's Reflection</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedRitual.yesterdayReflection}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompletedRitualView({ ritual, primeTime }: { ritual: MorningRitual; primeTime: BiologicalPrimeTime[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-card border border-primary/20 rounded-xl p-6 text-center">
        <Sparkles size={24} className="mx-auto text-primary mb-2" />
        <p className="text-2xl font-bold text-primary">{ritual.intentionWord}</p>
        <p className="text-xs text-muted-foreground">Today's intention</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-medium text-foreground mb-3">🎯 Today's Priorities</h3>
        {ritual.topPriorities.map((p, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span>
            <span className="text-sm text-foreground">{p}</span>
          </div>
        ))}
      </div>

      {ritual.timeBlocks.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-medium text-foreground mb-3">📅 Time Blocks</h3>
          {ritual.timeBlocks.map(b => (
            <div key={b.id} className={`flex items-center gap-3 py-2 px-3 rounded-lg mb-1 ${
              b.energyMatch === 'aligned' ? 'bg-emerald-500/5' : ''
            }`}>
              <Clock size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground w-24">{b.startTime}–{b.endTime}</span>
              <span className="text-sm text-foreground">{b.label}</span>
            </div>
          ))}
        </div>
      )}

      {ritual.gratitude.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-medium text-foreground mb-3">🙏 Gratitude</h3>
          {ritual.gratitude.map((g, i) => (
            <p key={i} className="text-sm text-muted-foreground py-1">• {g}</p>
          ))}
        </div>
      )}
    </div>
  );
}


















