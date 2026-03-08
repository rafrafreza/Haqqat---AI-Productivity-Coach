import { useEffect, useState } from "react";
import { Plus, Search, Trash2, TrendingUp, AlertTriangle, Brain, Zap } from "lucide-react";
import { getProcrastinationEntries, saveProcrastinationEntries, getProcrastinationPatterns, generateId, todayStr, type ProcrastinationEntry } from "@/lib/store";
import { useXPAward } from "@/hooks/useXP";
import { notifyXP } from "@/components/XPNotification";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const triggerTypes: { value: ProcrastinationEntry['triggerType']; label: string; emoji: string; tip: string }[] = [
  { value: 'fear-of-failure', label: 'Fear of Failure', emoji: '😰', tip: 'Reframe: What would you attempt if you knew you couldn\'t fail?' },
  { value: 'perfectionism', label: 'Perfectionism', emoji: '✨', tip: 'Done is better than perfect. Ship a v1, then iterate.' },
  { value: 'overwhelm', label: 'Overwhelm', emoji: '🌊', tip: 'Break it down. What\'s the smallest possible next step?' },
  { value: 'boring', label: 'Boring / No Interest', emoji: '😴', tip: 'Can you delegate? If not, pair it with something enjoyable.' },
  { value: 'unclear', label: 'Unclear Next Step', emoji: '🤷', tip: 'Spend 2 minutes just defining the next action. Clarity kills procrastination.' },
  { value: 'too-big', label: 'Task Too Big', emoji: '🏔️', tip: 'The 10-minute rule: commit to just 10 minutes. You\'ll usually keep going.' },
  { value: 'anxiety', label: 'Anxiety', emoji: '😟', tip: 'Write down what exactly you\'re anxious about. Named fears shrink.' },
  { value: 'low-energy', label: 'Low Energy', emoji: '🪫', tip: 'Schedule this task during your peak energy hours instead.' },
  { value: 'distraction', label: 'Got Distracted', emoji: '📱', tip: 'Remove the distraction source. Change your environment.' },
  { value: 'other', label: 'Other', emoji: '❓', tip: 'Reflect on the real reason. Self-awareness is the first step.' },
];

const feelingOptions = ['Anxious', 'Guilty', 'Restless', 'Numb', 'Frustrated', 'Relieved', 'Bored', 'Overwhelmed', 'Calm', 'Energized'];

export default function ProcrastinationAutopsy() {
  const [entries, setEntries] = useState<ProcrastinationEntry[]>([]);
  const [open, setOpen] = useState(false);

  const [avoidedTask, setAvoidedTask] = useState("");
  const [whatDidInstead, setWhatDidInstead] = useState("");
  const [feelingBefore, setFeelingBefore] = useState("");
  const [feelingDuring, setFeelingDuring] = useState("");
  const [triggerType, setTriggerType] = useState<ProcrastinationEntry['triggerType']>('unclear');
  const [duration, setDuration] = useState("");
  const [didEventuallyDo, setDidEventuallyDo] = useState(false);
  const [whatHelped, setWhatHelped] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => { setEntries(getProcrastinationEntries()); }, []);

  const update = (e: ProcrastinationEntry[]) => { setEntries(e); saveProcrastinationEntries(e); };

  const addEntry = () => {
    if (!avoidedTask.trim()) return;
    const entry: ProcrastinationEntry = {
      id: generateId(), date: todayStr(), avoidedTask: avoidedTask.trim(),
      whatDidInstead: whatDidInstead.trim(), feelingBefore, feelingDuring,
      triggerType, duration: parseInt(duration) || 30,
      didEventuallyDo, whatHelped: whatHelped.trim() || undefined,
      note: note.trim() || undefined,
    };
    update([entry, ...entries]);
    setAvoidedTask(""); setWhatDidInstead(""); setFeelingBefore(""); setFeelingDuring("");
    setTriggerType('unclear'); setDuration(""); setDidEventuallyDo(false); setWhatHelped(""); setNote("");
    setOpen(false);
  };

  const deleteEntry = (id: string) => update(entries.filter(e => e.id !== id));

  const patterns = getProcrastinationPatterns(entries);
  const sortedPatterns = Object.entries(patterns).sort((a, b) => b[1] - a[1]);
  const topTrigger = sortedPatterns[0];
  const totalTimeWasted = entries.reduce((s, e) => s + e.duration, 0);
  const recoveryRate = entries.length > 0 ? Math.round(entries.filter(e => e.didEventuallyDo).length / entries.length * 100) : 0;

  const getTriggerInfo = (type: string) => triggerTypes.find(t => t.value === type);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-foreground">Procrastination Autopsy</h1>
          <p className="text-muted-foreground mt-1">Understand why you avoid, then break the pattern</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-warm text-primary-foreground font-semibold gap-2"><Plus size={18} /> Log Avoidance</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display text-foreground">🔍 Autopsy Report</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <Input placeholder="What task did you avoid?" value={avoidedTask} onChange={e => setAvoidedTask(e.target.value)} className="bg-secondary border-border" />
              <Input placeholder="What did you do instead?" value={whatDidInstead} onChange={e => setWhatDidInstead(e.target.value)} className="bg-secondary border-border" />

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">How did you feel BEFORE avoiding?</label>
                <div className="flex flex-wrap gap-1.5">
                  {feelingOptions.map(f => (
                    <button key={f} onClick={() => setFeelingBefore(f)} className={`text-xs px-3 py-1.5 rounded-full transition ${feelingBefore === f ? 'gradient-warm text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>{f}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">How did you feel DURING procrastinating?</label>
                <div className="flex flex-wrap gap-1.5">
                  {feelingOptions.map(f => (
                    <button key={f} onClick={() => setFeelingDuring(f)} className={`text-xs px-3 py-1.5 rounded-full transition ${feelingDuring === f ? 'gradient-warm text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>{f}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Root cause — Why did you avoid it?</label>
                <div className="space-y-1.5">
                  {triggerTypes.map(t => (
                    <button key={t.value} onClick={() => setTriggerType(t.value)} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm transition ${triggerType === t.value ? 'bg-primary/10 border border-primary/30' : 'bg-secondary hover:bg-secondary/80 border border-transparent'}`}>
                      <span>{t.emoji}</span>
                      <span className={triggerType === t.value ? 'text-primary font-medium' : 'text-foreground'}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Input type="number" placeholder="How long did you procrastinate? (minutes)" value={duration} onChange={e => setDuration(e.target.value)} className="bg-secondary border-border" />

              <div className="flex items-center gap-3">
                <button onClick={() => setDidEventuallyDo(!didEventuallyDo)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${didEventuallyDo ? 'bg-success/10 text-success border border-success/30' : 'bg-secondary text-muted-foreground border border-transparent'}`}>
                  {didEventuallyDo ? '✅ Yes, I did it eventually' : '❌ No, I didn\'t do it'}
                </button>
              </div>

              {didEventuallyDo && <Input placeholder="What helped you start?" value={whatHelped} onChange={e => setWhatHelped(e.target.value)} className="bg-secondary border-border" />}

              <Textarea placeholder="Any other reflections?" value={note} onChange={e => setNote(e.target.value)} className="bg-secondary border-border" rows={2} />
              <Button onClick={addEntry} className="w-full gradient-warm text-primary-foreground font-semibold">Save Autopsy</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pattern Analysis */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{entries.length}</p>
            <p className="text-xs text-muted-foreground">Episodes Logged</p>
          </div>
          <div className="bg-card border border-destructive/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{Math.floor(totalTimeWasted / 60)}h {totalTimeWasted % 60}m</p>
            <p className="text-xs text-muted-foreground">Time Lost</p>
          </div>
          <div className="bg-card border border-success/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-success">{recoveryRate}%</p>
            <p className="text-xs text-muted-foreground">Recovery Rate</p>
          </div>
          <div className="bg-card border border-primary/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{topTrigger ? getTriggerInfo(topTrigger[0])?.emoji : '—'}</p>
            <p className="text-xs text-muted-foreground">#1 Trigger</p>
          </div>
        </div>
      )}

      {/* Trigger breakdown */}
      {sortedPatterns.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><Brain size={16} /> Your Procrastination DNA</h3>
          <div className="space-y-3">
            {sortedPatterns.map(([trigger, count]) => {
              const info = getTriggerInfo(trigger);
              const pct = Math.round((count / entries.length) * 100);
              return (
                <div key={trigger}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground">{info?.emoji} {info?.label}</span>
                    <span className="text-xs text-muted-foreground">{count}x ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden mb-1">
                    <div className="h-full gradient-warm rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">💡 {info?.tip}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Entries */}
      <div className="space-y-3">
        {entries.map(e => {
          const info = getTriggerInfo(e.triggerType);
          return (
            <div key={e.id} className="bg-card border border-border rounded-xl p-4 group">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{info?.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Avoided: {e.avoidedTask}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Did instead: {e.whatDidInstead}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{info?.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{e.duration}m wasted</span>
                    {e.feelingBefore && <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">Before: {e.feelingBefore}</span>}
                    {e.didEventuallyDo && <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success">✓ Recovered</span>}
                  </div>
                  {e.whatHelped && <p className="text-xs text-success mt-2">💡 What helped: {e.whatHelped}</p>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-muted-foreground">{e.date}</span>
                  <button onClick={() => deleteEntry(e.id)} className="opacity-0 group-hover:opacity-100 text-destructive"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Search size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No procrastination logged yet</p>
          <p className="text-sm mt-1">Next time you catch yourself avoiding something, log it here</p>
          <p className="text-xs mt-4 max-w-md mx-auto text-muted-foreground/70">"You can't fix what you can't see. Track your avoidance patterns to break the cycle."</p>
        </div>
      )}
    </div>
  );
}
