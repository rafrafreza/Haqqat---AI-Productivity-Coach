import { useEffect, useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle, AlertTriangle, Clock, Zap, Inbox, ArrowUp, Filter } from "lucide-react";
import { getTasks, saveTasks, generateId, getOverdueTasks, getDueSoonTasks, getTasksByEisenhower, type Task } from "@/lib/store";
import { useXPAward } from "@/hooks/useXP";
import { notifyXP } from "@/components/XPNotification";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const priorityLabels: Record<Task['priority'], string> = {
  'urgent-important': '🔴 Do First',
  'not-urgent-important': '🟡 Schedule',
  'urgent-not-important': '🟠 Delegate',
  'not-urgent-not-important': '⚪ Eliminate',
};

const priorityDescriptions: Record<Task['priority'], string> = {
  'urgent-important': 'Critical tasks that need immediate action',
  'not-urgent-important': 'Important tasks to plan and schedule',
  'urgent-not-important': 'Urgent but can be delegated',
  'not-urgent-not-important': 'Consider eliminating these',
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<Task['priority']>("not-urgent-important");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [view, setView] = useState<'matrix' | 'list'>('matrix');

  const { grantXP } = useXPAward();
  useEffect(() => { setTasks(getTasks()); }, []);

  const update = (t: Task[]) => { setTasks(t); saveTasks(t); };

  const addTask = () => {
    if (!title.trim()) return;
    const task: Task = {
      id: generateId(), title: title.trim(), description: description.trim() || undefined,
      deadline: deadline || undefined, priority, status: 'todo',
      estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
      createdAt: new Date().toISOString(),
    };
    update([task, ...tasks]);
    setTitle(""); setDescription(""); setDeadline(""); setPriority("not-urgent-important"); setEstimatedMinutes(""); setOpen(false);
  };

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    const completing = task && task.status !== 'done';
    update(tasks.map(t => t.id === id ? {
      ...t,
      status: t.status === 'done' ? 'todo' : 'done',
      completedAt: t.status !== 'done' ? new Date().toISOString() : undefined,
    } : t));
    if (completing) {
      const result = grantXP('task', `Completed: ${task?.title || 'task'}`);
      notifyXP(result);
    }
  };

  const deleteTask = (id: string) => update(tasks.filter(t => t.id !== id));

  const overdue = getOverdueTasks(tasks);
  const dueSoon = getDueSoonTasks(tasks);
  const matrix = getTasksByEisenhower(tasks);
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            {overdue.length > 0 && <span className="text-destructive font-medium">{overdue.length} overdue · </span>}
            {dueSoon.length > 0 && <span className="text-primary">{dueSoon.length} due soon · </span>}
            {tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').length} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setView(view === 'matrix' ? 'list' : 'matrix')} className="gap-1.5 text-xs">
            {view === 'matrix' ? <><Inbox size={14} /> List</> : <><Filter size={14} /> Matrix</>}
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-warm text-primary-foreground font-semibold gap-2"><Plus size={18} /> Add Task</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle className="font-display text-foreground">New Task</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <Input placeholder="What needs to be done?" value={title} onChange={e => setTitle(e.target.value)} className="bg-secondary border-border" />
                <Textarea placeholder="Details (optional)" value={description} onChange={e => setDescription(e.target.value)} className="bg-secondary border-border" rows={2} />
                <Select value={priority} onValueChange={v => setPriority(v as Task['priority'])}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-3">
                  <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="bg-secondary border-border" />
                  <Input type="number" placeholder="Est. minutes" value={estimatedMinutes} onChange={e => setEstimatedMinutes(e.target.value)} className="bg-secondary border-border" />
                </div>
                <Button onClick={addTask} className="w-full gradient-warm text-primary-foreground font-semibold">Create Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div className="mb-6 p-4 rounded-xl border border-destructive/30 bg-destructive/5 flex items-start gap-3">
          <AlertTriangle size={18} className="text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-destructive">Overdue Tasks</p>
            <div className="mt-1 space-y-1">
              {overdue.slice(0, 3).map(t => (
                <p key={t.id} className="text-xs text-muted-foreground">{t.title} — due {t.deadline}</p>
              ))}
              {overdue.length > 3 && <p className="text-xs text-muted-foreground">+{overdue.length - 3} more</p>}
            </div>
          </div>
        </div>
      )}

      {view === 'matrix' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.entries(matrix) as [Task['priority'], Task[]][]).map(([key, items]) => (
            <div key={key} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <MatrixIcon type={key} />
                <div>
                  <p className="text-sm font-semibold text-foreground">{priorityLabels[key]}</p>
                  <p className="text-[10px] text-muted-foreground">{priorityDescriptions[key]}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {items.map(t => <TaskItem key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} />)}
                {items.length === 0 && <p className="text-xs text-muted-foreground/50 py-2 text-center">No tasks</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').map(t => (
            <TaskItem key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} showPriority />
          ))}
        </div>
      )}

      {doneTasks.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">✅ Completed ({doneTasks.length})</h2>
          <div className="space-y-1.5 opacity-60">
            {doneTasks.slice(0, 10).map(t => <TaskItem key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function TaskItem({ task, onToggle, onDelete, showPriority }: { task: Task; onToggle: (id: string) => void; onDelete: (id: string) => void; showPriority?: boolean }) {
  const done = task.status === 'done';
  const isOverdue = !done && task.deadline && task.deadline < new Date().toISOString().slice(0, 10);
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all group ${done ? 'border-border/50 bg-secondary/30' : isOverdue ? 'border-destructive/30 bg-destructive/5' : 'border-border hover:border-primary/20 bg-card'}`}>
      <button onClick={() => onToggle(task.id)} className="shrink-0">
        {done ? <CheckCircle2 size={16} className="text-success" /> : <Circle size={16} className="text-muted-foreground" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {task.deadline && <span className={`text-[10px] ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>{task.deadline}</span>}
          {task.estimatedMinutes && <span className="text-[10px] text-muted-foreground">{task.estimatedMinutes}m</span>}
          {showPriority && <span className="text-[10px] text-muted-foreground">{priorityLabels[task.priority]}</span>}
        </div>
      </div>
      <button onClick={() => onDelete(task.id)} className="opacity-0 group-hover:opacity-100 text-destructive shrink-0"><Trash2 size={14} /></button>
    </div>
  );
}

function MatrixIcon({ type }: { type: Task['priority'] }) {
  const map = {
    'urgent-important': <Zap size={16} className="text-destructive" />,
    'not-urgent-important': <ArrowUp size={16} className="text-primary" />,
    'urgent-not-important': <Clock size={16} className="text-warning" />,
    'not-urgent-not-important': <Inbox size={16} className="text-muted-foreground" />,
  };
  return map[type];
}
