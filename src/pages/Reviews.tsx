import { useTrack } from "@/hooks/useTrack";
import { useEffect, useState } from "react";
import { Plus, Star, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronRight } from "lucide-react";
import { getWeeklyReviews, saveWeeklyReviews, generateId, getWeekStart, calculateDailyProductivityScore, type WeeklyReview } from "@/lib/store";
import { useXPAward } from "@/hooks/useXP";
import { notifyXP } from "@/components/XPNotification";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

export default function Reviews() {
  const { track } = useTrack();
  const [reviews, setReviews] = useState<WeeklyReview[]>([]);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // New review form
  const [productivityScore, setProductivityScore] = useState(7);
  const [energyScore, setEnergyScore] = useState(7);
  const [focusScore, setFocusScore] = useState(7);
  const [winsInput, setWinsInput] = useState("");
  const [wins, setWins] = useState<string[]>([]);
  const [improvementsInput, setImprovementsInput] = useState("");
  const [improvements, setImprovements] = useState<string[]>([]);
  const [prioritiesInput, setPrioritiesInput] = useState("");
  const [priorities, setPriorities] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const { grantXP } = useXPAward();
  useEffect(() => { setReviews(getWeeklyReviews()); }, []);

  const update = (r: WeeklyReview[]) => { setReviews(r); saveWeeklyReviews(r); };

  const addItem = (input: string, setInput: (s: string) => void, list: string[], setList: (s: string[]) => void) => {
    if (input.trim()) { setList([...list, input.trim()]); setInput(""); }
  };

  const submitReview = () => {
    const review: WeeklyReview = {
      id: generateId(), weekStart: getWeekStart(), completedAt: new Date().toISOString(),
      productivityScore, energyScore, focusScore, wins, improvements,
      nextWeekPriorities: priorities, notes: notes.trim() || undefined,
    };
    update([review, ...reviews]);
    const result = grantXP('review', 'Weekly review completed');
    notifyXP(result);
    setProductivityScore(7); setEnergyScore(7); setFocusScore(7);
    setWins([]); setImprovements([]); setPriorities([]); setNotes("");
    setOpen(false);
    setOpen(false);
  };

  // Calculate weekly productivity scores
  const weekScores: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    weekScores.push(calculateDailyProductivityScore(d.toISOString().slice(0, 10)));
  }
  const avgScore = Math.round(weekScores.reduce((a, b) => a + b, 0) / 7);

  const getTrend = (reviews: WeeklyReview[]) => {
    if (reviews.length < 2) return 'neutral';
    const latest = reviews[0].productivityScore;
    const prev = reviews[1].productivityScore;
    if (latest > prev) return 'up';
    if (latest < prev) return 'down';
    return 'neutral';
  };

  const trend = getTrend(reviews);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-foreground">Weekly Review</h1>
          <p className="text-muted-foreground mt-1">Reflect, learn, and plan ahead</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-warm text-primary-foreground font-semibold gap-2"><Plus size={18} /> New Review</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display text-foreground">Weekly Review — {getWeekStart()}</DialogTitle></DialogHeader>
            <div className="space-y-6 mt-2">
              {/* Scores */}
              <ScoreSlider label="Productivity" value={productivityScore} onChange={setProductivityScore} emoji="⚡" />
              <ScoreSlider label="Energy Level" value={energyScore} onChange={setEnergyScore} emoji="🔋" />
              <ScoreSlider label="Focus Quality" value={focusScore} onChange={setFocusScore} emoji="🎯" />

              {/* Wins */}
              <ListInput label="🏆 Wins this week" placeholder="What went well?" items={wins} onAdd={() => addItem(winsInput, setWinsInput, wins, setWins)} input={winsInput} setInput={setWinsInput} onRemove={(i) => setWins(wins.filter((_, j) => j !== i))} />

              {/* Improvements */}
              <ListInput label="📈 Areas to improve" placeholder="What could be better?" items={improvements} onAdd={() => addItem(improvementsInput, setImprovementsInput, improvements, setImprovements)} input={improvementsInput} setInput={setImprovementsInput} onRemove={(i) => setImprovements(improvements.filter((_, j) => j !== i))} />

              {/* Next week */}
              <ListInput label="🎯 Next week priorities" placeholder="Top priority" items={priorities} onAdd={() => addItem(prioritiesInput, setPrioritiesInput, priorities, setPriorities)} input={prioritiesInput} setInput={setPrioritiesInput} onRemove={(i) => setPriorities(priorities.filter((_, j) => j !== i))} />

              <Textarea placeholder="Additional notes..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
              <Button onClick={submitReview} className="w-full gradient-warm text-primary-foreground font-semibold">Submit Review</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current week summary */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <h3 className="text-sm font-semibold text-foreground mb-4">This Week's Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{avgScore}</p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </div>
          <div className="text-center flex flex-col items-center">
            {trend === 'up' ? <TrendingUp size={28} className="text-success" /> : trend === 'down' ? <TrendingDown size={28} className="text-destructive" /> : <Minus size={28} className="text-muted-foreground" />}
            <p className="text-xs text-muted-foreground mt-1">Trend</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">{Math.max(...weekScores)}</p>
            <p className="text-xs text-muted-foreground">Best Day</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">{reviews.length}</p>
            <p className="text-xs text-muted-foreground">Reviews Done</p>
          </div>
        </div>
        {/* Mini bar chart */}
        <div className="flex items-end gap-1 h-16 mt-4">
          {weekScores.map((score, i) => {
            const d = new Date(); d.setDate(d.getDate() - (6 - i));
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-sm gradient-warm transition-all" style={{ height: `${Math.max(score, 4)}%` }} />
                <span className="text-[9px] text-muted-foreground">{d.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Past reviews */}
      <div className="space-y-3">
        {reviews.map(r => {
          const isExpanded = expanded === r.id;
          const avg = Math.round((r.productivityScore + r.energyScore + r.focusScore) / 3);
          return (
            <div key={r.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <button className="w-full p-4 flex items-center gap-4 text-left" onClick={() => setExpanded(isExpanded ? null : r.id)}>
                {isExpanded ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />}
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">Week of {r.weekStart}</p>
                  <p className="text-xs text-muted-foreground">{new Date(r.completedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <ScoreBadge label="⚡" score={r.productivityScore} />
                  <ScoreBadge label="🔋" score={r.energyScore} />
                  <ScoreBadge label="🎯" score={r.focusScore} />
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                  {r.wins.length > 0 && <ReviewList title="🏆 Wins" items={r.wins} />}
                  {r.improvements.length > 0 && <ReviewList title="📈 Improvements" items={r.improvements} />}
                  {r.nextWeekPriorities.length > 0 && <ReviewList title="🎯 Priorities" items={r.nextWeekPriorities} />}
                  {r.notes && <p className="text-sm text-muted-foreground italic">{r.notes}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Star size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No reviews yet</p>
          <p className="text-sm mt-1">Complete your first weekly review to start tracking progress</p>
        </div>
      )}
    </div>
  );
}

function ScoreSlider({ label, value, onChange, emoji }: { label: string; value: number; onChange: (v: number) => void; emoji: string }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm text-foreground">{emoji} {label}</span>
        <span className="text-sm font-bold text-primary">{value}/10</span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={1} max={10} step={1} />
    </div>
  );
}

function ScoreBadge({ label, score }: { label: string; score: number }) {
  const color = score >= 8 ? 'text-success' : score >= 5 ? 'text-primary' : 'text-destructive';
  return <span className={`text-xs font-bold ${color}`}>{label}{score}</span>;
}

function ListInput({ label, placeholder, items, onAdd, input, setInput, onRemove }: { label: string; placeholder: string; items: string[]; onAdd: () => void; input: string; setInput: (s: string) => void; onRemove: (i: number) => void }) {
  return (
    <div>
      <label className="text-sm text-foreground mb-2 block">{label}</label>
      <div className="flex gap-2 mb-2">
        <Input placeholder={placeholder} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && onAdd()} />
        <Button variant="outline" size="sm" onClick={onAdd}>Add</Button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          <span className="flex-1">{item}</span>
          <button onClick={() => onRemove(i)} className="text-destructive text-xs">×</button>
        </div>
      ))}
    </div>
  );
}

function ReviewList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
      {items.map((item, i) => (
        <p key={i} className="text-sm text-foreground pl-4 py-0.5">• {item}</p>
      ))}
    </div>
  );
}
