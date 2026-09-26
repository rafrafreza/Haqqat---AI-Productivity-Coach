import { useEffect, useState } from "react";
import { Plus, Flame, CheckCircle2, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useTrack } from "@/hooks/useTrack";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { getRoutines, saveRoutines, getLogs, getStreakForRoutine, getCompletionRate, generateId, type Routine } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categories: { value: Routine['category']; label: string; emoji: string }[] = [
  { value: 'morning', label: 'Morning', emoji: '🌅' },
  { value: 'exercise', label: 'Exercise', emoji: '💪' },
  { value: 'meditation', label: 'Meditation', emoji: '🧘' },
  { value: 'study', label: 'Study', emoji: '📖' },
  { value: 'class', label: 'Class', emoji: '🎓' },
  { value: 'meeting', label: 'Meeting', emoji: '🤝' },
  { value: 'work', label: 'Work', emoji: '💻' },
  { value: 'health', label: 'Health', emoji: '🍎' },
  { value: 'evening', label: 'Evening', emoji: '🌙' },
  { value: 'other', label: 'Other', emoji: '🎯' },
];

const emojis = ['🌅', '💪', '🧘', '🎯', '📖', '📝', '🏃', '💻', '🎨', '🍎', '💧', '🛌', '🎓', '🤝', '🌙', '☕', '🏋️', '📚', '✍️', '🎵'];

function getCategoryInfo(cat: string) {
  return categories.find(c => c.value === cat) || categories[categories.length - 1];
}

function formatTimeRange(start?: string, end?: string) {
  if (!start) return null;
  if (end) return `${start} – ${end}`;
  return start;
}

function getDuration(start?: string, end?: string): string | null {
  if (!start || !end) return null;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) return null;
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function Routines() {
  const { track } = useTrack();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [logs] = useState(getLogs());
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [category, setCategory] = useState<Routine['category']>("other");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setRoutines(getRoutines());
    track('feature_viewed', { feature: 'routines' });
  }, []);

  const resetForm = () => {
    setName(""); setIcon("🎯"); setCategory("other");
    setStartTime(""); setEndTime(""); setDescription("");
  };

  const addRoutine = () => {
    if (!name.trim()) return;
    const newRoutine: Routine = {
      id: generateId(),
      name: name.trim(),
      icon,
      category,
      time: startTime || undefined,
      endTime: endTime || undefined,
      description: description.trim() || undefined,
    };
    const updated = [...routines, newRoutine];
    setRoutines(updated);
    saveRoutines(updated);
    resetForm();
    setOpen(false);
  };

  const deleteRoutine = (id: string) => {
    const updated = routines.filter(r => r.id !== id);
    setRoutines(updated);
    saveRoutines(updated);
  };

  // Group routines by category
  const grouped = categories
    .map(cat => ({
      ...cat,
      items: routines.filter(r => r.category === cat.value),
    }))
    .filter(g => g.items.length > 0);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-foreground">Routines</h1>
          <p className="text-muted-foreground mt-1">{routines.length} routine{routines.length !== 1 ? 's' : ''} · Build your daily system</p>
        </div>
        <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-warm text-primary-foreground font-semibold gap-2">
              <Plus size={18} /> Add Routine
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">New Routine</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {/* Name */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Routine Name *</label>
                <Input
                  placeholder="e.g. Morning workout, Deep work block..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addRoutine()}
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
                <Select value={category} onValueChange={v => setCategory(v as Routine['category'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.value} value={c.value}>
                        <span className="flex items-center gap-2">{c.emoji} {c.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time range */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Time (optional)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">Start time</label>
                    <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">End time</label>
                    <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                  </div>
                </div>
                {startTime && endTime && getDuration(startTime, endTime) && (
                  <p className="text-[10px] text-primary mt-1.5">⏱ Duration: {getDuration(startTime, endTime)}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Notes (optional)</label>
                <Textarea
                  placeholder="What does this routine involve? Any specific details..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Icon picker */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {emojis.map(e => (
                    <button
                      key={e}
                      onClick={() => setIcon(e)}
                      className={`text-xl p-1.5 rounded-lg transition ${icon === e ? "bg-primary/20 ring-2 ring-primary scale-110" : "hover:bg-secondary"}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={addRoutine} disabled={!name.trim()} className="w-full gradient-warm text-primary-foreground font-semibold">
                Create Routine
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grouped routines */}
      {grouped.length > 0 ? (
        <div className="space-y-6">
          {grouped.map(group => (
            <div key={group.value}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{group.emoji}</span>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{group.label}</h2>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{group.items.length}</span>
              </div>
              <div className="space-y-2">
                {group.items.map(r => {
                  const streak = getStreakForRoutine(r.id, logs);
                  const rate = getCompletionRate(r.id, logs, 7);
                  const timeRange = formatTimeRange(r.time, r.endTime);
                  const duration = getDuration(r.time, r.endTime);
                  const isExpanded = expandedId === r.id;

                  return (
                    <div key={r.id} className="bg-card border border-border rounded-xl hover:border-primary/20 transition-all group overflow-hidden">
                      {/* Main row */}
                      <div className="flex items-center gap-4 p-4">
                        <span className="text-2xl shrink-0">{r.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{r.name}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                            {timeRange && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock size={11} />
                                {timeRange}
                                {duration && <span className="text-primary/70">({duration})</span>}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">{rate}% this week</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {streak > 0 && (
                            <div className="flex items-center gap-1 text-orange-500 text-xs font-semibold">
                              <Flame size={13} /> {streak}d
                            </div>
                          )}
                          {/* Expand toggle if has description */}
                          {r.description && (
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : r.id)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            </button>
                          )}
                          <DeleteConfirmDialog onConfirm={() => deleteRoutine(r.id)} iconSize={15} />
                        </div>
                      </div>

                      {/* Expanded description */}
                      {isExpanded && r.description && (
                        <div className="px-4 pb-4 pt-0 border-t border-border/50">
                          <p className="text-sm text-muted-foreground leading-relaxed mt-3">{r.description}</p>
                        </div>
                      )}

                      {/* Progress bar */}
                      {rate > 0 && (
                        <div className="h-0.5 bg-secondary">
                          <div
                            className="h-full bg-primary/50 transition-all"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-primary/40" />
          </div>
          <p className="text-lg font-medium text-foreground">No routines yet</p>
          <p className="text-sm mt-2 max-w-xs leading-relaxed text-center">
            Build your perfect daily system. Add routines like morning workouts, deep work blocks, or evening journaling.
          </p>
          <Button className="mt-6 gradient-warm text-primary-foreground font-semibold gap-2" onClick={() => setOpen(true)}>
            <Plus size={16} /> Add your first routine
          </Button>
        </div>
      )}
    </div>
  );
}
