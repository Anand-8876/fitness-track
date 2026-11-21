"use client";

import { useState } from "react";
import { IconCamera, IconDrop, IconPen, IconPlus, IconSpark, IconText } from "./icons";
import { Button, Card, cx, ErrorText, Input, MacroBar, Ring, Sheet, Spinner } from "./ui";
import { api } from "@/lib/client";
import { dayIndex } from "@/lib/dates";
import { MEAL_LABELS, MEALS, mealForNow, sumMacros, type Meal } from "@/lib/nutrition";
import type { DayData, FoodEntry, Me } from "@/lib/types";
import { DAYS, describeDay } from "@/lib/workouts";

type Props = {
  me: Me;
  day: DayData | null;
  date: string;
  onAdd: (m: Meal) => void;
  reload: () => Promise<void>;
  notify: (m: string) => void;
};

export default function TodayView({ me, day, date, onAdd, reload, notify }: Props) {
  const p = me.profile;
  const [editing, setEditing] = useState<FoodEntry | null>(null);

  if (!day || day.date !== date) {
    return (
      <div className="grid h-60 place-items-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  const t = sumMacros(day.entries);
  const remaining = p.targetKcal - t.kcal;
  const plan = me.plan?.[DAYS[dayIndex(date)]];

  async function setWater(glasses: number) {
    await api("/api/water", { method: "PUT", body: { date, glasses: Math.max(0, glasses) } });
    reload();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-4">
        <Card>
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            <Ring value={t.kcal} target={p.targetKcal} size={180}>
              <div>
                <div className={cx("font-mono text-4xl font-bold tabular-nums", remaining >= 0 ? "text-ink text-glow" : "text-carbs")}>{Math.round(Math.abs(remaining)).toLocaleString()}</div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted">{remaining >= 0 ? "kcal left" : "kcal over"}</div>
              </div>
            </Ring>
            <div className="w-full flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["Eaten", Math.round(t.kcal)],
                    ["Target", p.targetKcal],
                  ] as const
                ).map(([l, v]) => (
                  <div key={l} className="cut cut-sm border border-line bg-black/40 px-3 py-2">
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">{l}</div>
                    <div className="font-mono text-lg font-bold tabular-nums text-ink">{v.toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <MacroBar label="Protein" value={t.protein} target={p.targetProtein} color="var(--protein)" />
              <MacroBar label="Carbs" value={t.carbs} target={p.targetCarbs} color="var(--carbs)" />
              <MacroBar label="Fat" value={t.fat} target={p.targetFat} color="var(--fat)" />
              <MacroBar label="Fiber" value={t.fiber} target={p.targetFiber} color="var(--fiber)" />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card title="Water">
            <div className="flex items-center gap-2 font-mono text-2xl font-bold tabular-nums">
              <IconDrop width={18} height={18} className="text-fat drop-shadow-[0_0_6px_var(--fat)]" />
              {day.water}
              <span className="text-base text-muted">/{p.waterGoal}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1" aria-hidden>
              {Array.from({ length: p.waterGoal }, (_, i) => (
                <span key={i} className={cx("h-5 w-2.5 transition", i < day.water ? "bg-fat shadow-[0_0_6px_var(--fat)]" : "border border-line bg-black/40")} />
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setWater(day.water - 1)} aria-label="Remove a glass">
                <span className="font-mono text-base leading-none">−</span>
              </Button>
              <Button size="sm" className="flex-1" onClick={() => setWater(day.water + 1)} aria-label="Add a glass">
                <span className="font-mono text-sm leading-none">+1</span>
              </Button>
            </div>
          </Card>
          <Card title="Workout">
            {plan ? (
              <>
                <div className="font-display text-sm font-bold uppercase leading-tight tracking-wide">{describeDay(plan).title}</div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">{describeDay(plan).subtitle}</div>
              </>
            ) : (
              <div className="font-mono text-xs uppercase text-muted">No plan</div>
            )}
            {plan && plan.type !== "rest" && (
              <Button
                size="sm"
                variant={day.workoutDone ? "done" : "outline"}
                className="mt-3 w-full"
                onClick={async () => {
                  await api("/api/workout", { method: "PUT", body: { date, done: !day.workoutDone } });
                  reload();
                  if (!day.workoutDone) notify("WORKOUT COMPLETE 💪");
                }}
              >
                {day.workoutDone ? "✓ Done" : "Mark done"}
              </Button>
            )}
          </Card>
        </div>

        <SuggestCard date={date} />
      </div>

      <div className="space-y-4">
        {MEALS.map((meal) => {
          const items = day.entries.filter((e) => e.meal === meal);
          const m = sumMacros(items);
          return (
            <Card
              key={meal}
              title={MEAL_LABELS[meal]}
              action={
                <div className="flex items-center gap-3">
                  {items.length > 0 && <span className="font-mono text-xs font-bold tabular-nums text-ink-2">{Math.round(m.kcal)} kcal</span>}
                  <button onClick={() => onAdd(meal)} className="cut cut-sm chip-off grid h-8 w-8 place-items-center border hover:chip-on" aria-label={`Add to ${meal}`}>
                    <IconPlus width={16} height={16} />
                  </button>
                </div>
              }
            >
              {items.length === 0 ? (
                <button
                  onClick={() => onAdd(meal)}
                  className="flex w-full items-center justify-center gap-2 border border-dashed border-accent/30 py-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted transition hover:border-accent hover:bg-accent/5 hover:text-accent"
                >
                  <IconCamera width={16} height={16} /> Snap or describe your {meal}
                </button>
              ) : (
                <ul className="divide-y divide-line">
                  {items.map((e) => (
                    <li key={e.id}>
                      <button onClick={() => setEditing(e)} className="flex w-full items-center gap-3 py-2.5 text-left transition hover:bg-accent/5">
                        {e.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={e.photoUrl} alt="" className="h-11 w-11 shrink-0 border border-accent/40 object-cover" />
                        ) : (
                          <div className="grid h-11 w-11 shrink-0 place-items-center border border-line bg-black/40 text-muted">{e.source === "text" ? <IconText width={18} height={18} /> : <IconPen width={16} height={16} />}</div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold">{e.name}</div>
                          <div className="truncate font-mono text-[11px] text-muted">
                            {e.portion ? `${e.portion} · ` : ""}
                            <span className="text-protein">P{Math.round(e.protein)}</span> <span className="text-carbs">C{Math.round(e.carbs)}</span>{" "}
                            <span className="text-fat">F{Math.round(e.fat)}</span>
                          </div>
                        </div>
                        <div className="font-mono text-sm font-bold tabular-nums text-ink">{Math.round(e.kcal)}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>

      <EditEntrySheet
        entry={editing}
        onClose={() => setEditing(null)}
        onDone={(msg) => {
          setEditing(null);
          reload();
          notify(msg);
        }}
      />
    </div>
  );
}

function SuggestCard({ date }: { date: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<{ name: string; description: string; kcal: number; protein_g: number; carbs_g: number; fat_g: number; why: string }[] | null>(null);

  async function run() {
    setLoading(true);
    setError("");
    try {
      const r = await api<{ suggestions: NonNullable<typeof items> }>("/api/ai/suggest", { body: { date, meal: mealForNow() } });
      setItems(r.suggestions);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card
      title="AI meal ideas"
      action={
        <Button size="sm" variant="outline" onClick={run} loading={loading}>
          {items ? "Refresh" : "Suggest"}
        </Button>
      }
    >
      {!items && !error && (
        <p className="flex items-center gap-2 text-sm text-ink-2">
          <IconSpark width={16} height={16} className="shrink-0 text-accent" /> Get {mealForNow()} ideas that fit your remaining macros.
        </p>
      )}
      <ErrorText>{error}</ErrorText>
      {items && (
        <ul className="space-y-3">
          {items.map((s) => (
            <li key={s.name} className="cut cut-sm border border-line bg-black/40 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-bold">{s.name}</span>
                <span className="shrink-0 font-mono text-xs font-bold tabular-nums text-accent">{Math.round(s.kcal)} kcal</span>
              </div>
              <p className="mt-0.5 text-xs text-ink-2">{s.description}</p>
              <p className="mt-1.5 text-xs text-muted">
                <span className="font-mono">
                  <span className="text-protein">P{Math.round(s.protein_g)}</span> <span className="text-carbs">C{Math.round(s.carbs_g)}</span>{" "}
                  <span className="text-fat">F{Math.round(s.fat_g)}</span>
                </span>{" "}
                — {s.why}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function EditEntrySheet({ entry, onClose, onDone }: { entry: FoodEntry | null; onClose: () => void; onDone: (msg: string) => void }) {
  const [draft, setDraft] = useState<FoodEntry | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (entry && draft?.id !== entry.id) {
    setDraft(entry);
    setError("");
  }
  if (!entry || !draft) return null;

  const num = (k: keyof FoodEntry) => (e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, [k]: Number(e.target.value) || 0 });

  async function save() {
    setBusy(true);
    try {
      await api(`/api/food/${draft!.id}`, {
        method: "PATCH",
        body: { name: draft!.name, portion: draft!.portion, meal: draft!.meal, kcal: draft!.kcal, protein: draft!.protein, carbs: draft!.carbs, fat: draft!.fat, fiber: draft!.fiber },
      });
      onDone("Updated ✓");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await api(`/api/food/${draft!.id}`, { method: "DELETE" });
      onDone("Removed");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Sheet open onClose={onClose} title="Edit food">
      <div className="space-y-3">
        {entry.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={entry.photoUrl} alt="" className="hud max-h-48 w-full object-cover p-1" />
        )}
        <Input label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <Input label="Portion" value={draft.portion ?? ""} onChange={(e) => setDraft({ ...draft, portion: e.target.value })} />
        <div className="grid grid-cols-5 gap-2">
          {(["kcal", "protein", "carbs", "fat", "fiber"] as const).map((k) => (
            <Input key={k} label={k === "kcal" ? "kcal" : k === "fiber" ? "Fib" : k[0].toUpperCase()} type="number" inputMode="decimal" value={draft[k]} onChange={num(k)} className="h-10 px-1! text-center text-sm" />
          ))}
        </div>
        <div className="flex gap-2">
          {MEALS.map((m) => (
            <button
              key={m}
              onClick={() => setDraft({ ...draft, meal: m })}
              className={cx("cut cut-sm flex-1 border py-2 font-mono text-[10px] font-bold uppercase tracking-wider", draft.meal === m ? "chip-on" : "chip-off")}
            >
              {m}
            </button>
          ))}
        </div>
        <ErrorText>{error}</ErrorText>
        <div className="flex gap-2 pt-2">
          <Button variant="danger" onClick={remove} disabled={busy}>
            Delete
          </Button>
          <Button className="flex-1" onClick={save} loading={busy}>
            Save
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
