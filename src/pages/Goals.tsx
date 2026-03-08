import { useEffect, useState } from "react";
import { Plus, Target, ChevronDown, ChevronRight, Trash2, CheckCircle2, Circle, Calendar, Flag } from "lucide-react";
import { getGoals, saveGoals, generateId, getGoalProgress, type Goal, type Milestone } from "@/lib/store";
import { useXPAward } from "@/hooks/useXP";
import { notifyXP } from "@/components/XPNotification";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const goalCategories = ['career', 'health', 'learning', 'personal', 'financial', 'other'] as const;
const categoryEmojis: Record<string, string> = { career: '💼', health: '💪', learning: '📚', personal: '🌟', financial: '💰', other: '🎯' };

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Goal['category']>("career");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<Goal['priority']>("medium");
  const [milestoneInput, setMilestoneInput] = useState("");
  const [newMilestones, setNewMilestones] = useState<string[]>([]);

  useEffect(() => { setGoals(getGoals()); }, []);

  const { grantXP } = useXPAward();
  const update = (g: Goal[]) => { setGoals(g); saveGoals(g); };

  const addGoal = () => {
    if (!title.trim()) return;
    const goal: Goal = {
      id: generateId(), title: title.trim(), description: description.trim() || undefined,
      category, deadline: deadline || undefined, priority,
      milestones: newMilestones.map(m => ({ id: generateId(), title: m, completed: false })),
      createdAt: new Date().toISOString(), status: 'active',
    };
    update([goal, ...goals]);
    setTitle(""); setDescription(""); setCategory("career"); setDeadline(""); setPriority("medium"); setNewMilestones([]); setOpen(false);
  };

  const addMilestone = () => {
    if (!milestoneInput.trim()) return;
    setNewMilestones([...newMilestones, milestoneInput.trim()]);
    setMilestoneInput("");
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    const goal = goals.find(g => g.id === goalId);
    const milestone = goal?.milestones.find(m => m.id === milestoneId);
    const completing = milestone && !milestone.completed;
    update(goals.map(g => g.id === goalId ? {
      ...g,
      milestones: g.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date().toISOString() : undefined } : m)
    } : g));
    if (completing) {
      const result = grantXP('goal', `Milestone: ${milestone?.title || 'completed'}`, 15);
      notifyXP(result);
    }
  };

  const addMilestoneToGoal = (goalId: string, title: string) => {
    update(goals.map(g => g.id === goalId ? {
      ...g,
      milestones: [...g.milestones, { id: generateId(), title, completed: false }]
    } : g));
  };

  const deleteGoal = (id: string) => update(goals.filter(g => g.id !== id));

  const toggleStatus = (id: string) => {
    update(goals.map(g => g.id === id ? { ...g, status: g.status === 'completed' ? 'active' : 'completed' } : g));
  };

  const priorityColor = (p: string) => {
    if (p === 'high') return 'text-destructive';
    if (p === 'medium') return 'text-primary';
    return 'text-muted-foreground';
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  const getDaysLeft = (deadline?: string) => {
    if (!deadline) return null;
    const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-foreground">Goals</h1>
          <p className="text-muted-foreground mt-1">{activeGoals.length} active · {completedGoals.length} completed</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-warm text-primary-foreground font-semibold gap-2"><Plus size={18} /> New Goal</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display text-foreground">Set a New Goal</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <Input placeholder="Goal title" value={title} onChange={e => setTitle(e.target.value)} />
              <Textarea placeholder="Why is this important? (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
              <div className="grid grid-cols-2 gap-3">
                <Select value={category} onValueChange={v => setCategory(v as Goal['category'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{goalCategories.map(c => <SelectItem key={c} value={c} className="capitalize">{categoryEmojis[c]} {c}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={priority} onValueChange={v => setPriority(v as Goal['priority'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">🔴 High</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="low">🟢 Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Milestones (break it down)</label>
                <div className="flex gap-2 mb-2">
                  <Input placeholder="Add a milestone" value={milestoneInput} onChange={e => setMilestoneInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMilestone()} />
                  <Button variant="outline" onClick={addMilestone} size="sm">Add</Button>
                </div>
                {newMilestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground py-1">
                    <Circle size={14} /> {m}
                    <button onClick={() => setNewMilestones(newMilestones.filter((_, j) => j !== i))} className="ml-auto text-destructive"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
              <Button onClick={addGoal} className="w-full gradient-warm text-primary-foreground font-semibold">Create Goal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {activeGoals.map(goal => {
          const progress = getGoalProgress(goal);
          const daysLeft = getDaysLeft(goal.deadline);
          const isExpanded = expanded === goal.id;
          return (
            <div key={goal.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/20 transition-all">
              <div className="p-4 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : goal.id)}>
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />}
                  <span className="text-xl">{categoryEmojis[goal.category]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">{goal.title}</p>
                      <Flag size={12} className={priorityColor(goal.priority)} />
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 max-w-32">
                        <Progress value={progress} className="h-1.5" />
                      </div>
                      <span className="text-xs text-muted-foreground">{progress}%</span>
                      {daysLeft !== null && (
                        <span className={`text-xs flex items-center gap-1 ${daysLeft < 0 ? 'text-destructive' : daysLeft <= 7 ? 'text-primary' : 'text-muted-foreground'}`}>
                          <Calendar size={10} /> {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); toggleStatus(goal.id); }} className="text-success hover:opacity-80"><CheckCircle2 size={18} /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id); }} className="text-destructive hover:opacity-80"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-border pt-3">
                  {goal.description && <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>}
                  <div className="space-y-1.5">
                    {goal.milestones.map(m => (
                      <button key={m.id} onClick={() => toggleMilestone(goal.id, m.id)} className="flex items-center gap-2 w-full text-left text-sm py-1 hover:bg-secondary/50 px-2 rounded-lg transition-colors">
                        {m.completed ? <CheckCircle2 size={15} className="text-success shrink-0" /> : <Circle size={15} className="text-muted-foreground shrink-0" />}
                        <span className={m.completed ? "line-through text-muted-foreground" : "text-foreground"}>{m.title}</span>
                      </button>
                    ))}
                  </div>
                  <MilestoneAdder onAdd={(t) => addMilestoneToGoal(goal.id, t)} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {completedGoals.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-display text-muted-foreground mb-3">✅ Completed Goals</h2>
          <div className="space-y-2">
            {completedGoals.map(g => (
              <div key={g.id} className="flex items-center gap-3 p-3 bg-card/50 border border-border/50 rounded-xl opacity-60">
                <span>{categoryEmojis[g.category]}</span>
                <span className="text-sm text-foreground line-through flex-1">{g.title}</span>
                <button onClick={() => toggleStatus(g.id)} className="text-xs text-muted-foreground hover:text-foreground">Reopen</button>
                <button onClick={() => deleteGoal(g.id)} className="text-destructive"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Target size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No goals set yet</p>
          <p className="text-sm mt-1">Set meaningful goals and break them into actionable milestones</p>
        </div>
      )}
    </div>
  );
}

function MilestoneAdder({ onAdd }: { onAdd: (title: string) => void }) {
  const [input, setInput] = useState("");
  const submit = () => { if (input.trim()) { onAdd(input.trim()); setInput(""); } };
  return (
    <div className="flex gap-2 mt-3">
      <Input placeholder="Add milestone..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} className="text-sm h-8" />
      <Button variant="outline" size="sm" onClick={submit} className="h-8 text-xs">Add</Button>
    </div>
  );
}
