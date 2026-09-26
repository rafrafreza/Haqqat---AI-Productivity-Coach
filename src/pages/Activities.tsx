import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { getActivities, saveActivities, todayStr, generateId, type Activity } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const actCategories = ["Work", "Learning", "Health", "Personal", "Social", "Creative", "Other"];

const Activities = React.forwardRef<HTMLDivElement>(function Activities(_props, ref) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Work");
  const [duration, setDuration] = useState("");

  useEffect(() => { setActivities(getActivities()); }, []);

  const today = todayStr();
  const todayActivities = activities.filter(a => a.date === today);
  const pastActivities = activities.filter(a => a.date !== today).sort((a, b) => b.date.localeCompare(a.date));

  const addActivity = () => {
    if (!title.trim()) return;
    const newAct: Activity = {
      id: generateId(),
      date: today,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      duration: duration ? parseInt(duration) : undefined,
    };
    const updated = [newAct, ...activities];
    setActivities(updated);
    saveActivities(updated);
    setTitle(""); setDescription(""); setCategory("Work"); setDuration(""); setOpen(false);
  };

  const deleteActivity = (id: string) => {
    const updated = activities.filter(a => a.id !== id);
    setActivities(updated);
    saveActivities(updated);
  };

  const totalMins = todayActivities.reduce((sum, a) => sum + (a.duration || 0), 0);

  return (
    <div ref={ref} className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-foreground">Activity Log</h1>
          <p className="text-muted-foreground mt-1">
            Today: {todayActivities.length} activities · {Math.floor(totalMins / 60)}h {totalMins % 60}m logged
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-warm text-primary-foreground font-semibold gap-2">
              <Plus size={18} /> Log Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">Log Activity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <Input placeholder="What did you do?" value={title} onChange={e => setTitle(e.target.value)} />
              <Textarea placeholder="Details (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {actCategories.map(c => (
                      <button key={c} onClick={() => setCategory(c)} className={`text-xs px-3 py-1.5 rounded-full transition ${category === c ? "gradient-warm text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{c}</button>
                    ))}
                  </div>
                </div>
              </div>
              <Input type="number" placeholder="Duration (minutes)" value={duration} onChange={e => setDuration(e.target.value)} />
              <Button onClick={addActivity} className="w-full gradient-warm text-primary-foreground font-semibold">Log Activity</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today */}
      {todayActivities.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-display text-foreground mb-3">Today</h2>
          <div className="space-y-2">
            {todayActivities.map(a => <ActivityCard key={a.id} activity={a} onDelete={deleteActivity} />)}
          </div>
        </div>
      )}

      {/* Past */}
      {pastActivities.length > 0 && (
        <div>
          <h2 className="text-lg font-display text-foreground mb-3">Previous</h2>
          <div className="space-y-2">
            {pastActivities.map(a => <ActivityCard key={a.id} activity={a} onDelete={deleteActivity} />)}
          </div>
        </div>
      )}

      {activities.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No activities logged yet</p>
          <p className="text-sm mt-1">Start logging what you do throughout the day</p>
        </div>
      )}
    </div>
  );
});
Activities.displayName = "Activities";
export default Activities;

function ActivityCard({ activity, onDelete }: { activity: Activity; onDelete: (id: string) => void }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl group hover:border-primary/20 transition-all">
      <div className="mt-0.5 text-xs text-muted-foreground w-14 shrink-0">{activity.time}</div>
      <div className="flex-1">
        <p className="font-medium text-foreground">{activity.title}</p>
        {activity.description && <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>}
        <div className="flex gap-2 mt-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{activity.category}</span>
          {activity.duration && <span className="text-xs text-muted-foreground">{activity.duration}m</span>}
        </div>
      </div>
      <DeleteConfirmDialog onConfirm={() => onDelete(activity.id)} iconSize={15} />
    </div>
  );
}
