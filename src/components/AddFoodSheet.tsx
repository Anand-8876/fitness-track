"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { IconCamera, IconClose, IconPen, IconScan, IconSpark, IconText, IconUpload } from "./icons";
import { Button, cx, ErrorText, Input, Label, ScanLine, Segmented, Sheet } from "./ui";
import { api, resizeImage } from "@/lib/client";
import { MEALS, mealForNow, sumMacros, type Meal } from "@/lib/nutrition";
import type { AiFoodAnalysis } from "@/lib/types";

type Mode = "photo" | "text" | "manual";

/** An editable line item. `scale` multiplies the AI's base estimate. */
interface Draft {
  key: number;
  name: string;
  portion: string;
  grams: number;
  base: { kcal: number; protein: number; carbs: number; fat: number; fiber: number };
  scale: number;
  confidence?: "high" | "medium" | "low";
}

let keySeq = 0;

function fromAi(a: AiFoodAnalysis): Draft[] {
  return a.items.map((i) => ({
    key: ++keySeq,
    name: i.name,
    portion: i.portion,
    grams: i.grams,
    base: { kcal: i.kcal, protein: i.protein_g, carbs: i.carbs_g, fat: i.fat_g, fiber: i.fiber_g },
    scale: 1,
    confidence: i.confidence,
  }));
}

function scaled(d: Draft) {
  const r = (n: number) => Math.round(n * d.scale * 10) / 10;
  return { kcal: Math.round(d.base.kcal * d.scale), protein: r(d.base.protein), carbs: r(d.base.carbs), fat: r(d.base.fat), fiber: r(d.base.fiber) };
}

export default function AddFoodSheet({
  open,
  initialMeal,
  date,
  onClose,
  onSaved,
}: {
  open: boolean;
  initialMeal: Meal | null;
  date: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [mode, setMode] = useState<Mode>("photo");
  const [meal, setMeal] = useState<Meal>(() => initialMeal ?? mealForNow());
  const [file, setFile] = useState<File | null>(null);
  const [hint, setHint] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<{ title: string; notes: string; photoPath?: string } | null>(null);
  const [items, setItems] = useState<Draft[]>([]);

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  async function analyzePhoto() {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("image", await resizeImage(file));
      form.append("hint", hint);
      const r = await api<{ analysis: AiFoodAnalysis; photoPath: string }>("/api/ai/food-scan", { form });
      if (!r.analysis.is_food || !r.analysis.items.length) throw new Error("No food detected — try a clearer photo or describe it instead.");
      setAnalysis({ title: r.analysis.meal_name, notes: r.analysis.notes, photoPath: r.photoPath });
      setItems(fromAi(r.analysis));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function analyzeText() {
    if (text.trim().length < 2) return;
    setBusy(true);
    setError("");
    try {
      const r = await api<{ analysis: AiFoodAnalysis }>("/api/ai/food-text", { body: { text } });
      if (!r.analysis.items.length) throw new Error("Couldn't find any food in that description.");
      setAnalysis({ title: r.analysis.meal_name, notes: r.analysis.notes });
      setItems(fromAi(r.analysis));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function startManual() {
    setAnalysis({ title: "Manual entry", notes: "" });
    setItems([{ key: ++keySeq, name: "", portion: "", grams: 0, base: { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }, scale: 1 }]);
  }

  async function save() {
    const valid = items.filter((i) => i.name.trim());
    if (!valid.length) return setError("Add at least one item with a name");
    setBusy(true);
    setError("");
    try {
      await api("/api/food", {
        body: {
          date,
          meal,
          source: mode,
          photoPath: analysis?.photoPath ?? null,
          items: valid.map((i) => ({
            name: i.name.trim(),
            portion: i.scale === 1 ? i.portion : `${i.portion} ×${i.scale}`,
            grams: i.grams ? Math.round(i.grams * i.scale) : null,
            ...scaled(i),
          })),
        },
      });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  const update = (key: number, patch: Partial<Draft>) => setItems((xs) => xs.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  const total = sumMacros(items.map(scaled));

  return (
    <Sheet open={open} onClose={onClose} title={analysis ? "Review & log" : "Log food"}>
      {!analysis ? (
        <div className="space-y-4">
          <Segmented
            value={mode}
            onChange={(m) => (setMode(m), setError(""))}
            options={[
              { value: "photo" as const, label: <><IconCamera width={15} height={15} /> Photo</> },
              { value: "text" as const, label: <><IconText width={15} height={15} /> Describe</> },
              { value: "manual" as const, label: <><IconPen width={14} height={14} /> Manual</> },
            ]}
          />

          {mode === "photo" && (
            <>
              {preview ? (
                <div className="hud relative overflow-hidden p-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Your food" className="max-h-72 w-full object-cover" />
                  <button
                    onClick={() => setFile(null)}
                    className="absolute right-3 top-3 border border-accent/60 bg-black/80 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-accent"
                  >
                    Retake
                  </button>
                  {busy && (
                    <div className="absolute inset-1.5 grid place-items-center bg-black/65 text-center">
                      <ScanLine />
                      <div>
                        <IconScan width={30} height={30} className="mx-auto text-accent drop-shadow-[0_0_8px_var(--accent)]" />
                        <p className="mt-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent text-glow">
                          Identifying food<span className="animate-blink">_</span>
                        </p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted">Estimating macros</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <PickButton icon={<IconCamera width={34} height={34} />} label="Take photo" capture onPick={setFile} />
                  <PickButton icon={<IconUpload width={34} height={34} />} label="Upload" onPick={setFile} />
                </div>
              )}
              <Input label="Add a note" hint="optional" value={hint} onChange={(e) => setHint(e.target.value)} placeholder="e.g. 3 rotis, cooked in ghee" />
              <Button size="lg" className="w-full" disabled={!file} loading={busy} onClick={analyzePhoto}>
                Analyze with AI
              </Button>
            </>
          )}

          {mode === "text" && (
            <>
              <label className="block">
                <Label>What did you eat?</Label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  placeholder="2 rotis, a katori of dal makhani, cucumber raita and a glass of masala chaas"
                  className="cut cut-sm w-full border border-line bg-black/50 p-4 font-mono text-sm text-ink outline-none placeholder:text-muted/60 focus:border-accent focus:shadow-[inset_0_0_14px_rgba(255,0,60,0.25)] focus:[--cut-color:var(--accent)]"
                />
              </label>
              <Button size="lg" className="w-full" disabled={text.trim().length < 2} loading={busy} onClick={analyzeText}>
                Estimate macros
              </Button>
            </>
          )}

          {mode === "manual" && (
            <Button size="lg" className="w-full" onClick={startManual}>
              Enter nutrition manually
            </Button>
          )}
          <ErrorText>{error}</ErrorText>
        </div>
      ) : (
        <div className="space-y-4">
          {preview && mode === "photo" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="hud max-h-40 w-full object-cover p-1" />
          )}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-good text-glow-cyan">● Scan complete</div>
            <div className="mt-1 font-display text-lg font-bold uppercase tracking-wide text-ink">{analysis.title}</div>
            {analysis.notes && (
              <p className="mt-1.5 flex gap-2 text-xs text-ink-2">
                <IconSpark width={14} height={14} className="mt-px shrink-0 text-accent" /> {analysis.notes}
              </p>
            )}
          </div>

          <div className="cut grid grid-cols-5 gap-2 border border-accent/40 bg-black/50 p-3 text-center [--cut-color:rgba(255,0,60,0.4)]">
            {(
              [
                ["kcal", total.kcal, "var(--text)"],
                ["protein", total.protein, "var(--protein)"],
                ["carbs", total.carbs, "var(--carbs)"],
                ["fat", total.fat, "var(--fat)"],
                ["fiber", total.fiber, "var(--fiber)"],
              ] as const
            ).map(([l, v, c]) => (
              <div key={l}>
                <div className="font-mono text-lg font-bold tabular-nums" style={{ color: c, textShadow: `0 0 8px ${c}` }}>
                  {Math.round(v)}
                </div>
                <div className="flex items-center justify-center gap-1 font-mono text-[9px] font-semibold uppercase tracking-wide text-muted">
                  {l}
                </div>
              </div>
            ))}
          </div>

          <ul className="space-y-3">
            {items.map((it) => (
              <ItemEditor key={it.key} item={it} onChange={(p) => update(it.key, p)} onRemove={() => setItems((xs) => xs.filter((x) => x.key !== it.key))} manual={mode === "manual"} />
            ))}
          </ul>
          <button
            onClick={() => setItems((xs) => [...xs, { key: ++keySeq, name: "", portion: "", grams: 0, base: { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }, scale: 1 }])}
            className="w-full border border-dashed border-accent/30 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-ink-2 hover:border-accent hover:bg-accent/5 hover:text-accent"
          >
            + Add item
          </button>

          <div>
            <Label>Meal</Label>
            <div className="grid grid-cols-4 gap-2">
              {MEALS.map((m) => (
                <button key={m} onClick={() => setMeal(m)} className={cx("cut cut-sm border py-2 font-mono text-[10px] font-bold uppercase tracking-wider", meal === m ? "chip-on" : "chip-off")}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <ErrorText>{error}</ErrorText>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => (setAnalysis(null), setItems([]))} disabled={busy}>
              Back
            </Button>
            <Button className="flex-1" size="lg" onClick={save} loading={busy}>
              Log {Math.round(total.kcal)} kcal
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function PickButton({ icon, label, capture, onPick }: { icon: ReactNode; label: string; capture?: boolean; onPick: (f: File) => void }) {
  return (
    <label className="hud group flex aspect-square cursor-pointer flex-col items-center justify-center gap-3 bg-black/40 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink-2 transition [--hud:rgba(255,0,60,0.5)] hover:bg-accent/10 hover:text-accent hover:[--hud:var(--accent)]">
      <span className="text-accent transition group-hover:drop-shadow-[0_0_8px_var(--accent)]">{icon}</span>
      {label}
      <input
        type="file"
        accept="image/*"
        {...(capture ? { capture: "environment" as const } : {})}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = "";
        }}
      />
    </label>
  );
}

const SCALES = [0.5, 0.75, 1, 1.5, 2];

function ItemEditor({ item, onChange, onRemove, manual }: { item: Draft; onChange: (p: Partial<Draft>) => void; onRemove: () => void; manual: boolean }) {
  const [expanded, setExpanded] = useState(manual);
  const s = scaled(item);
  const setBase = (k: keyof Draft["base"]) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ base: { ...item.base, [k]: (Number(e.target.value) || 0) / item.scale } });

  return (
    <li className="cut border border-line bg-surface p-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <input
            value={item.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Food name"
            className="w-full bg-transparent text-sm font-bold text-ink outline-none placeholder:text-muted"
          />
          <input
            value={item.portion}
            onChange={(e) => onChange({ portion: e.target.value })}
            placeholder="Portion (e.g. 1 bowl)"
            className="w-full bg-transparent font-mono text-[11px] text-ink-2 outline-none placeholder:text-muted"
          />
        </div>
        <div className="text-right">
          <div className="font-mono text-sm font-bold tabular-nums text-accent">{s.kcal}</div>
          <div className="font-mono text-[9px] uppercase text-muted">kcal</div>
        </div>
        <button onClick={onRemove} aria-label="Remove item" className="grid h-7 w-7 place-items-center text-muted hover:text-danger">
          <IconClose width={15} height={15} />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        {SCALES.map((x) => (
          <button
            key={x}
            onClick={() => onChange({ scale: x })}
            className={cx("cut cut-sm border px-2 py-1 font-mono text-[11px] font-bold tabular-nums", item.scale === x ? "chip-on" : "chip-off")}
          >
            {x}×
          </button>
        ))}
        <button onClick={() => setExpanded((v) => !v)} className="ml-auto font-mono text-[10px] font-bold uppercase tracking-wider text-accent hover:underline">
          {expanded ? "Hide" : "Edit"} macros
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] tabular-nums">
        <span className="text-protein">P {s.protein}g</span>
        <span className="text-carbs">C {s.carbs}g</span>
        <span className="text-fat">F {s.fat}g</span>
        <span className="text-fiber">Fib {s.fiber}g</span>
        {item.confidence === "low" && <span className="ml-auto border border-fiber/50 px-1.5 text-[9px] font-bold uppercase text-fiber">⚠ Low confidence</span>}
      </div>

      {expanded && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          <Input label="kcal" type="number" inputMode="decimal" value={s.kcal} onChange={setBase("kcal")} className="h-10 px-1! text-center text-sm" />
          <Input label="P" type="number" inputMode="decimal" value={s.protein} onChange={setBase("protein")} className="h-10 px-1! text-center text-sm" />
          <Input label="C" type="number" inputMode="decimal" value={s.carbs} onChange={setBase("carbs")} className="h-10 px-1! text-center text-sm" />
          <Input label="F" type="number" inputMode="decimal" value={s.fat} onChange={setBase("fat")} className="h-10 px-1! text-center text-sm" />
          <Input label="Fib" type="number" inputMode="decimal" value={s.fiber} onChange={setBase("fiber")} className="h-10 px-1! text-center text-sm" />
        </div>
      )}
    </li>
  );
}
