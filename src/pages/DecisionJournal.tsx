import { useEffect, useState } from "react";
import { Plus, Scale, ChevronDown, ChevronRight, CheckCircle2, Clock, AlertCircle, Trash2 } from "lucide-react";
import { getDecisions, saveDecisions, getDecisionAccuracy, generateId, todayStr, type Decision } from "@/lib/store";
import { useXPAward } from "@/hooks/useXP";
import { notifyXP } from "@/components/XPNotification";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const categories = ['career', 'health', 'financial', 'relationship', 'personal', 'other'] as const;
const categoryEmojis: Record<string, string> = { career: '💼', health: '💪', financial: '💰', relationship: '❤️', personal: '🌟', other: '📌' };

export default function DecisionJournal() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [open, setOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // New decision form
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [optionsInput, setOptionsInput] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [chosen, setChosen] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [confidence, setConfidence] = useState(7);
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [category, setCategory] = useState<Decision['category']>("career");
  const [revisitDays, setRevisitDays] = useState("30");

  // Review form
  const [actualOutcome, setActualOutcome] = useState("");
  const [outcomeScore, setOutcomeScore] = useState(5);
  const [lessonLearned, setLessonLearned] = useState("");

  const { grantXP } = useXPAward();
  useEffect(() => { setDecisions(getDecisions()); }, []);

  const update = (d: Decision[]) => { setDecisions(d); saveDecisions(d); };

  const addDecision = () => {
    if (!title.trim() || !reasoning.trim()) return;
    const revisitDate = new Date();
    revisitDate.setDate(revisitDate.getDate() + parseInt(revisitDays || "30"));
    const decision: Decision = {
      id: generateId(), date: todayStr(), title: title.trim(),
      context: context.trim(), options, chosen: chosen.trim(),
      reasoning: reasoning.trim(), confidence, expectedOutcome: expectedOutcome.trim(),
      category, revisitDate: revisitDate.toISOString().slice(0, 10), status: 'pending',
    };
    update([decision, ...decisions]);
    const result = grantXP('decision', `Decision: ${title.trim()}`);
    notifyXP(result);
    resetForm();
    setOpen(false);
  };

  const reviewDecision = (id: string) => {
    update(decisions.map(d => d.id === id ? {
      ...d, actualOutcome: actualOutcome.trim(), outcomeScore,
      lessonLearned: lessonLearned.trim() || undefined,
      outcomeDate: todayStr(), status: 'reviewed' as const,
    } : d));
    setReviewOpen(null);
    setActualOutcome(""); setOutcomeScore(5); setLessonLearned("");
  };

  const deleteDecision = (id: string) => update(decisions.filter(d => d.id !== id));

  const resetForm = () => {
    setTitle(""); setContext(""); setOptions([]); setChosen("");
    setReasoning(""); setConfidence(7); setExpectedOutcome("");
    setCategory("career"); setRevisitDays("30");
  };

  const accuracy = getDecisionAccuracy(decisions);
  const pending = decisions.filter(d => d.status === 'pending');
  const reviewed = decisions.filter(d => d.status === 'reviewed');
  const dueForReview = pending.filter(d => d.revisitDate <= todayStr());
  const avgConfidence = decisions.length > 0 ? Math.round(decisions.reduce((s, d) => s + d.confidence, 0) / decisions.length * 10) / 10 : 0;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-foreground">Decision Journal</h1>
          <p className="text-muted-foreground mt-1">Track decisions, build better judgment</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-warm text-primary-foreground font-semibold gap-2"><Plus size={18} /> Log Decision</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display text-foreground">Record a Decision</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <Input placeholder="What decision did you make?" value={title} onChange={e => setTitle(e.target.value)} className="bg-secondary border-border" />
              <Textarea placeholder="What's the situation? (context)" value={context} onChange={e => setContext(e.target.value)} className="bg-secondary border-border" rows={2} />
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Options considered</label>
                <div className="flex gap-2 mb-2">
                  <Input placeholder="Add an option" value={optionsInput} onChange={e => setOptionsInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && optionsInput.trim()) { setOptions([...options, optionsInput.trim()]); setOptionsInput(""); }}} className="bg-secondary border-border" />
                  <Button variant="outline" size="sm" onClick={() => { if (optionsInput.trim()) { setOptions([...options, optionsInput.trim()]); setOptionsInput(""); }}}>Add</Button>
                </div>
                {options.map((o, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm py-0.5">
                    <span className="text-muted-foreground">•</span>
                    <span className={`${chosen === o ? 'text-primary font-medium' : 'text-foreground'}`}>{o}</span>
                    <button onClick={() => setChosen(o)} className="text-[10px] text-primary ml-auto">{chosen === o ? '✓ chosen' : 'choose'}</button>
                    <button onClick={() => setOptions(options.filter((_, j) => j !== i))} className="text-destructive text-xs">×</button>
                  </div>
                ))}
              </div>
              {!chosen && options.length > 0 && <Input placeholder="Or type your chosen option" value={chosen} onChange={e => setChosen(e.target.value)} className="bg-secondary border-border" />}
              <Textarea placeholder="Why did you choose this? (your reasoning)" value={reasoning} onChange={e => setReasoning(e.target.value)} className="bg-secondary border-border" rows={3} />
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-foreground">Confidence Level</span>
                  <span className="text-sm font-bold text-primary">{confidence}/10</span>
                </div>
                <Slider value={[confidence]} onValueChange={([v]) => setConfidence(v)} min={1} max={10} step={1} />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>Gut feeling</span><span>Certain</span></div>
              </div>
              <Textarea placeholder="What outcome do you expect?" value={expectedOutcome} onChange={e => setExpectedOutcome(e.target.value)} className="bg-secondary border-border" rows={2} />
              <div className="grid grid-cols-2 gap-3">
                <Select value={category} onValueChange={v => setCategory(v as Decision['category'])}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{categoryEmojis[c]} {c}</SelectItem>)}</SelectContent>
                </Select>
                <div>
                  <Input type="number" placeholder="Revisit in days" value={revisitDays} onChange={e => setRevisitDays(e.target.value)} className="bg-secondary border-border" />
                </div>
              </div>
              <Button onClick={addDecision} className="w-full gradient-warm text-primary-foreground font-semibold">Record Decision</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{decisions.length}</p>
          <p className="text-xs text-muted-foreground">Decisions Logged</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{accuracy}%</p>
          <p className="text-xs text-muted-foreground">Judgment Accuracy</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{avgConfidence}</p>
          <p className="text-xs text-muted-foreground">Avg Confidence</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{reviewed.length}</p>
          <p className="text-xs text-muted-foreground">Reviewed</p>
        </div>
      </div>

      {/* Due for review alert */}
      {dueForReview.length > 0 && (
        <div className="mb-6 p-4 rounded-xl border border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-primary" />
            <p className="text-sm font-medium text-primary">{dueForReview.length} decision{dueForReview.length > 1 ? 's' : ''} ready for review!</p>
          </div>
          <p className="text-xs text-muted-foreground">Time to check if your predictions were accurate</p>
        </div>
      )}

      {/* Decisions list */}
      <div className="space-y-3">
        {decisions.map(d => {
          const isExpanded = expanded === d.id;
          const isDue = d.status === 'pending' && d.revisitDate <= todayStr();
          const isReviewing = reviewOpen === d.id;

          return (
            <div key={d.id} className={`bg-card border rounded-xl overflow-hidden transition-all ${isDue ? 'border-primary/40' : 'border-border'}`}>
              <button className="w-full p-4 flex items-center gap-3 text-left" onClick={() => setExpanded(isExpanded ? null : d.id)}>
                {isExpanded ? <ChevronDown size={14} className="text-muted-foreground shrink-0" /> : <ChevronRight size={14} className="text-muted-foreground shrink-0" />}
                <span>{categoryEmojis[d.category]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{d.title}</p>
                  <p className="text-xs text-muted-foreground">{d.date} · Confidence: {d.confidence}/10</p>
                </div>
                {d.status === 'reviewed' ? (
                  <span className="flex items-center gap-1 text-xs text-success"><CheckCircle2 size={12} /> Reviewed</span>
                ) : isDue ? (
                  <span className="flex items-center gap-1 text-xs text-primary font-medium"><Clock size={12} /> Review now</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Review: {d.revisitDate}</span>
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                  {d.context && <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Situation</p><p className="text-sm text-foreground">{d.context}</p></div>}
                  {d.options.length > 0 && <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Options Considered</p>{d.options.map((o, i) => <p key={i} className={`text-sm ${o === d.chosen ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{o === d.chosen ? '✓ ' : '• '}{o}</p>)}</div>}
                  <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Reasoning</p><p className="text-sm text-foreground">{d.reasoning}</p></div>
                  <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Expected Outcome</p><p className="text-sm text-foreground">{d.expectedOutcome}</p></div>

                  {d.status === 'reviewed' && (
                    <div className="bg-success/5 border border-success/20 rounded-lg p-4 space-y-2">
                      <p className="text-[10px] uppercase tracking-wider text-success mb-1">Review</p>
                      <p className="text-sm text-foreground"><span className="text-muted-foreground">Actual outcome:</span> {d.actualOutcome}</p>
                      <p className="text-sm text-foreground"><span className="text-muted-foreground">Score:</span> <span className="text-primary font-bold">{d.outcomeScore}/10</span> (vs {d.confidence}/10 confidence)</p>
                      {d.lessonLearned && <p className="text-sm text-foreground"><span className="text-muted-foreground">Lesson:</span> {d.lessonLearned}</p>}
                    </div>
                  )}

                  {d.status === 'pending' && !isReviewing && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setReviewOpen(d.id)} className="gap-1.5"><Scale size={14} /> Review Outcome</Button>
                      <Button variant="outline" size="sm" onClick={() => deleteDecision(d.id)} className="text-destructive"><Trash2 size={14} /></Button>
                    </div>
                  )}

                  {isReviewing && (
                    <div className="bg-secondary/50 rounded-lg p-4 space-y-4">
                      <Textarea placeholder="What actually happened?" value={actualOutcome} onChange={e => setActualOutcome(e.target.value)} className="bg-secondary border-border" rows={2} />
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-foreground">How well did it turn out?</span>
                          <span className="text-sm font-bold text-primary">{outcomeScore}/10</span>
                        </div>
                        <Slider value={[outcomeScore]} onValueChange={([v]) => setOutcomeScore(v)} min={1} max={10} step={1} />
                      </div>
                      <Input placeholder="Key lesson learned (optional)" value={lessonLearned} onChange={e => setLessonLearned(e.target.value)} className="bg-secondary border-border" />
                      <div className="flex gap-2">
                        <Button onClick={() => reviewDecision(d.id)} className="gradient-warm text-primary-foreground font-semibold">Save Review</Button>
                        <Button variant="outline" onClick={() => setReviewOpen(null)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {decisions.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Scale size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No decisions logged yet</p>
          <p className="text-sm mt-1">Start recording important decisions to build better judgment over time</p>
          <p className="text-xs mt-4 max-w-md mx-auto text-muted-foreground/70">"The quality of your life is determined by the quality of your decisions. Track them, review them, improve them."</p>
        </div>
      )}
    </div>
  );
}
