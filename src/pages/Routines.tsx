import { useEffect, useState } from "react";
import { Plus, Trash2, Flame } from "lucide-react";
import { getRoutines, saveRoutines, getLogs, getStreakForRoutine, getCompletionRate, generateId, type Routine } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categories = ['morning', 'work', 'health', 'evening', 'other'] as const;
const emojis = ['🌅', '💪', '🧘', '🎯', '📖', '📝', '🏃', '💻', '🎨', '🍎', '💧', '🛌'];

export default function Routines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [logs] = useState(getLogs());
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [category, setCategory] = useState<Routine['category']>("other");
  const [time, setTime] = useState("");

  useEffect(() => { setRoutines(getRoutines()); }, []);

  const addRoutine = () => {
    if (!name.trim()) return;
    const newRoutine: Routine = { id: generateId(), name: name.trim(), icon, category, time: time || undefined };
    const updated = [...routines, newRoutine];
    setRoutines(updated);
    saveRoutines(updated);
    setName(""); setIcon("🎯"); setCategory("other"); setTime(""); setOpen(false);
  };

  const deleteRoutine = (id: string) => {
    const updated = routines.filter(r => r.id !== id);
    setRoutines(updated);
    saveRoutines(updated);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-foreground">Routines</h1>
          <p className="text-muted-foreground mt-1">Manage your daily habits</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-warm text-primary-foreground font-semibold gap-2">
              <Plus size={18} /> Add Routine
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">New Routine</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <Input placeholder="Routine name" value={name} onChange={e => setName(e.target.value)} />
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {emojis.map(e => (
                    <button key={e} onClick={() => setIcon(e)} className={`text-xl p-1.5 rounded-lg transition ${icon === e ? "bg-primary/20 ring-1 ring-primary" : "hover:bg-secondary"}`}>{e}</button>
                  ))}
                </div>
              </div>
              <Select value={category} onValueChange={v => setCategory(v as Routine['category'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
              <Button onClick={addRoutine} className="w-full gradient-warm text-primary-foreground font-semibold">Create Routine</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {routines.map(r => {
          const streak = getStreakForRoutine(r.id, logs);
          const rate = getCompletionRate(r.id, logs, 7);
          return (
            <div key={r.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/20 transition-all group">
              <span className="text-2xl">{r.icon}</span>
              <div className="flex-1">
                <p className="font-medium text-foreground">{r.name}</p>
                <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="capitalize">{r.category}</span>
                  {r.time && <span>{r.time}</span>}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {streak > 0 && (
                  <div className="flex items-center gap-1 text-primary text-sm">
                    <Flame size={14} /> {streak}d
                  </div>
                )}
                <div className="text-xs text-muted-foreground w-12 text-right">{rate}% / 7d</div>
                <button onClick={() => deleteRoutine(r.id)} className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80 transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
        {routines.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No routines yet</p>
            <p className="text-sm mt-1">Add your first routine to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
