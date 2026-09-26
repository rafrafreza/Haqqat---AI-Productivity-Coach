import { useEffect, useState } from "react";
import { useTrack } from "@/hooks/useTrack";
import { Plus, Mail, MailOpen, Lock, Unlock, ChevronDown, ChevronRight } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { getFutureLetters, saveFutureLetters, generateId, todayStr, type FutureLetter, type Prediction } from "@/lib/store";
import { useXPAward } from "@/hooks/useXP";
import { notifyXP } from "@/components/XPNotification";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

export default function FutureLetters() {
  const { track } = useTrack();
  const [letters, setLetters] = useState<FutureLetter[]>([]);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [mood, setMood] = useState("hopeful");
  const [predictionText, setPredictionText] = useState("");
  const [predictionConfidence, setPredictionConfidence] = useState(7);
  const [predictions, setPredictions] = useState<{ text: string; confidence: number }[]>([]);
  const [reflection, setReflection] = useState("");

  useEffect(() => { setLetters(getFutureLetters()); }, []);

  const { grantXP } = useXPAward();
  const update = (l: FutureLetter[]) => { setLetters(l); saveFutureLetters(l); };

  const addLetter = () => {
    if (!subject.trim() || !content.trim() || !deliveryDate) return;
    const letter: FutureLetter = {
      id: generateId(), writtenDate: todayStr(), deliveryDate, subject: subject.trim(),
      content: content.trim(), mood,
      predictions: predictions.map(p => ({ id: generateId(), text: p.text, confidence: p.confidence })),
      isRevealed: false,
    };
    update([letter, ...letters]);
    track("future_letter_written");
    const result = grantXP('letter', 'Wrote a future letter');
    notifyXP(result);
    setSubject(""); setContent(""); setDeliveryDate(""); setMood("hopeful");
    setPredictions([]); setPredictionText(""); setOpen(false);
  };

  const addPrediction = () => {
    if (!predictionText.trim()) return;
    setPredictions([...predictions, { text: predictionText.trim(), confidence: predictionConfidence }]);
    setPredictionText(""); setPredictionConfidence(7);
  };

  const revealLetter = (id: string) => {
    update(letters.map(l => l.id === id ? { ...l, isRevealed: true } : l));
  };

  const savePredictionAccuracy = (letterId: string, predictionId: string, accurate: boolean) => {
    update(letters.map(l => l.id === letterId ? {
      ...l,
      predictions: l.predictions.map(p => p.id === predictionId ? { ...p, wasAccurate: accurate } : p),
    } : l));
  };

  const saveReflection = (id: string) => {
    update(letters.map(l => l.id === id ? { ...l, reflection: reflection.trim() } : l));
    setReflection("");
  };

  const deleteLetter = (id: string) => update(letters.filter(l => l.id !== id));

  const today = todayStr();
  const readyToOpen = letters.filter(l => !l.isRevealed && l.deliveryDate <= today);
  const sealed = letters.filter(l => !l.isRevealed && l.deliveryDate > today);
  const opened = letters.filter(l => l.isRevealed);

  const moodEmojis: Record<string, string> = {
    hopeful: '🌟', anxious: '😟', excited: '🔥', calm: '🧘', determined: '💪', uncertain: '🤔', grateful: '🙏', ambitious: '🚀',
  };

  const getDaysUntil = (date: string) => {
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-foreground">Future Self Letters</h1>
          <p className="text-muted-foreground mt-1">Write to your future self. Make predictions. Learn who you become.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-warm text-primary-foreground font-semibold gap-2"><Plus size={18} /> Write Letter</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display text-foreground">💌 Dear Future Me...</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <Input placeholder="Subject line" value={subject} onChange={e => setSubject(e.target.value)} />

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Open this letter on:</label>
                <Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)} />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Current mood</label>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(moodEmojis).map(([m, emoji]) => (
                    <button key={m} onClick={() => setMood(m)} className={`text-xs px-3 py-1.5 rounded-full transition capitalize ${mood === m ? 'gradient-warm text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                      {emoji} {m}
                    </button>
                  ))}
                </div>
              </div>

              <Textarea placeholder="Write to your future self... What's happening now? What are you working on? What are you worried about? What advice do you have?" value={content} onChange={e => setContent(e.target.value)} rows={6} />

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">🔮 Predictions (optional — test your self-knowledge)</label>
                <div className="flex gap-2 mb-2">
                  <Input placeholder="I predict that..." value={predictionText} onChange={e => setPredictionText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPrediction()} />
                  <Button variant="outline" size="sm" onClick={addPrediction}>Add</Button>
                </div>
                {predictionText && (
                  <div className="mb-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="text-primary font-bold">{predictionConfidence}/10</span>
                    </div>
                    <Slider value={[predictionConfidence]} onValueChange={([v]) => setPredictionConfidence(v)} min={1} max={10} step={1} />
                  </div>
                )}
                {predictions.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm py-1">
                    <span className="text-muted-foreground">🔮</span>
                    <span className="text-foreground flex-1">{p.text}</span>
                    <span className="text-xs text-primary">{p.confidence}/10</span>
                    <button onClick={() => setPredictions(predictions.filter((_, j) => j !== i))} className="text-destructive text-xs">×</button>
                  </div>
                ))}
              </div>

              <Button onClick={addLetter} className="w-full gradient-warm text-primary-foreground font-semibold">Seal & Send to Future</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Ready to open */}
      {readyToOpen.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-display text-primary mb-4 flex items-center gap-2">📬 Ready to Open!</h2>
          <div className="space-y-3">
            {readyToOpen.map(l => (
              <div key={l.id} className="bg-primary/5 border border-primary/30 rounded-xl p-5 text-center">
                <Mail size={32} className="mx-auto text-primary mb-3" />
                <p className="font-display text-foreground text-lg">"{l.subject}"</p>
                <p className="text-sm text-muted-foreground mt-1">Written on {l.writtenDate} · {moodEmojis[l.mood]} {l.mood}</p>
                <p className="text-xs text-muted-foreground mt-1">{l.predictions.length} prediction{l.predictions.length !== 1 ? 's' : ''} inside</p>
                <Button onClick={() => revealLetter(l.id)} className="mt-4 gradient-warm text-primary-foreground font-semibold gap-2"><Unlock size={16} /> Open Letter</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sealed letters */}
      {sealed.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-display text-foreground mb-4 flex items-center gap-2"><Lock size={16} /> Sealed Letters</h2>
          <div className="space-y-2">
            {sealed.map(l => {
              const daysLeft = getDaysUntil(l.deliveryDate);
              return (
                <div key={l.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl group">
                  <Mail size={20} className="text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{l.subject}</p>
                    <p className="text-xs text-muted-foreground">Written {l.writtenDate} · Opens in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{moodEmojis[l.mood]}</span>
                  <DeleteConfirmDialog onConfirm={() => deleteLetter(l.id)} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Opened letters */}
      {opened.length > 0 && (
        <div>
          <h2 className="text-lg font-display text-foreground mb-4 flex items-center gap-2"><MailOpen size={16} /> Opened Letters</h2>
          <div className="space-y-3">
            {opened.map(l => {
              const isExpanded = expanded === l.id;
              const accuratePredictions = l.predictions.filter(p => p.wasAccurate === true).length;
              const totalPredictions = l.predictions.filter(p => p.wasAccurate !== undefined).length;

              return (
                <div key={l.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  <button className="w-full p-4 flex items-center gap-3 text-left" onClick={() => setExpanded(isExpanded ? null : l.id)}>
                    {isExpanded ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
                    <MailOpen size={18} className="text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{l.subject}</p>
                      <p className="text-xs text-muted-foreground">{l.writtenDate} → {l.deliveryDate}</p>
                    </div>
                    {totalPredictions > 0 && <span className="text-xs text-primary">{accuratePredictions}/{totalPredictions} accurate</span>}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-border pt-4">
                      <div className="bg-secondary/50 rounded-lg p-4 mb-4">
                        <p className="text-xs text-muted-foreground mb-1">{moodEmojis[l.mood]} Feeling {l.mood} on {l.writtenDate}</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{l.content}</p>
                      </div>

                      {l.predictions.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">🔮 Predictions</p>
                          {l.predictions.map(p => (
                            <div key={p.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                              <span className="text-sm text-foreground flex-1">{p.text} <span className="text-xs text-muted-foreground">(confidence: {p.confidence}/10)</span></span>
                              {p.wasAccurate === undefined ? (
                                <div className="flex gap-1">
                                  <button onClick={() => savePredictionAccuracy(l.id, p.id, true)} className="text-xs px-2 py-1 rounded bg-success/10 text-success hover:bg-success/20">✓ Accurate</button>
                                  <button onClick={() => savePredictionAccuracy(l.id, p.id, false)} className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20">✗ Wrong</button>
                                </div>
                              ) : (
                                <span className={`text-xs ${p.wasAccurate ? 'text-success' : 'text-destructive'}`}>{p.wasAccurate ? '✓ Accurate' : '✗ Wrong'}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {!l.reflection ? (
                        <div className="space-y-2">
                          <Textarea placeholder="Reflect: How does this letter make you feel? Were you right about your predictions? What's changed?" value={reflection} onChange={e => setReflection(e.target.value)} rows={3} />
                          <Button onClick={() => saveReflection(l.id)} size="sm" variant="outline">Save Reflection</Button>
                        </div>
                      ) : (
                        <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">💭 Reflection</p>
                          <p className="text-sm text-foreground">{l.reflection}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {letters.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Mail size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No letters written yet</p>
          <p className="text-sm mt-1">Write a letter to your future self — it's like creating a time capsule</p>
          <p className="text-xs mt-4 max-w-md mx-auto text-muted-foreground/70">"The best way to predict the future is to create it. But first, try to predict it — then see how well you know yourself."</p>
        </div>
      )}
    </div>
  );
}
