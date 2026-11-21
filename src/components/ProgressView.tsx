"use client";

import { useEffect, useState } from "react";
import { BarChart, LineChart } from "./charts";
import PhysiqueReportView from "./PhysiqueReportView";
import { IconPlus, IconScan } from "./icons";
import { Button, Card, cx, ErrorText, Input, ScanLine, Segmented, Spinner } from "./ui";
import { api, resizeImage } from "@/lib/client";
import { formatDate, localDateStr } from "@/lib/dates";
import { bmi, bmiCategory } from "@/lib/nutrition";
import type { Me } from "@/lib/types";

type HistDay = { date: string; kcal: number; protein: number; carbs: number; fat: number; water: number; workoutDone: boolean };

export default function ProgressView({ me, reloadMe, notify }: { me: Me; reloadMe: () => Promise<void>; notify: (m: string) => void }) {
  const p = me.profile;
  const [hist, setHist] = useState<HistDay[] | null>(null);
  const [weights, setWeights] = useState<{ date: string; weightKg: number }[]>([]);
  const [range, setRange] = useState<14 | 30>(14);
  const [newWeight, setNewWeight] = useState("");

  const [version, setVersion] = useState(0);
  useEffect(() => {
    Promise.all([
      api<{ days: HistDay[] }>(`/api/history?days=30&end=${localDateStr()}`),
      api<{ logs: { date: string; weightKg: number }[] }>("/api/weight"),
    ])
      .then(([h, w]) => {
        setHist(h.days);
        setWeights(w.logs);
      })
      .catch((e) => notify(e.message));
  }, [version, notify]);

  async function logWeight() {
    const v = Number(newWeight);
    if (!(v >= 30 && v <= 300)) return notify("Enter a weight between 30 and 300 kg");
    await api("/api/weight", { body: { date: localDateStr(), weightKg: v } });
    setNewWeight("");
    setVersion((v) => v + 1);
    await reloadMe();
    notify("WEIGHT LOGGED ✓ TARGETS UPDATED");
  }

  const shown = hist?.slice(-range) ?? [];
  const logged = hist?.filter((d) => d.kcal > 0) ?? [];
  const last7 = hist?.slice(-7).filter((d) => d.kcal > 0) ?? [];
  const avg = (k: "kcal" | "protein") => (last7.length ? Math.round(last7.reduce((a, d) => a + d[k], 0) / last7.length) : 0);
  let streak = 0;
  if (hist) {
    // Today counts only once something is logged; yesterday-backwards must be unbroken.
    const days = [...hist].reverse();
    for (let i = 0; i < days.length; i++) {
      if (days[i].kcal > 0) streak++;
      else if (i > 0) break;
    }
  }
  const b = bmi(p.weightKg, p.heightCm);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Weight" value={`${p.weightKg}`} unit="kg" />
        <Stat label="BMI" value={b.toFixed(1)} unit={bmiCategory(b)} />
        <Stat label="Body fat" value={p.bodyFatPct ? `~${Math.round(p.bodyFatPct)}` : "—"} unit={p.bodyFatPct ? "% (AI est.)" : "add photos"} />
        <Stat label="Streak" value={`${streak}`} unit={streak === 1 ? "day" : "days"} hot={streak >= 3} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title="Calories"
          action={
            <Segmented
              value={range}
              onChange={setRange}
              options={[
                { value: 14 as const, label: "14d" },
                { value: 30 as const, label: "30d" },
              ]}
            />
          }
        >
          {!hist ? (
            <Loading />
          ) : (
            <>
              <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-muted">
                7d avg <b className="text-ink tabular-nums">{avg("kcal")}</b> kcal · {logged.length}/30 days logged
              </p>
              <BarChart
                label="Daily calories"
                color="var(--accent)"
                unit="kcal"
                target={p.targetKcal}
                data={shown.map((d) => ({ label: formatDate(d.date, { day: "numeric", month: "short" }), tip: formatDate(d.date, { weekday: "short", day: "numeric", month: "short" }), value: d.kcal }))}
              />
            </>
          )}
        </Card>
        <Card title="Protein">
          {!hist ? (
            <Loading />
          ) : (
            <>
              <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-muted">
                7d avg <b className="text-ink tabular-nums">{avg("protein")}</b> g
              </p>
              <BarChart
                label="Daily protein"
                color="var(--carbs)"
                unit="g"
                target={p.targetProtein}
                data={shown.map((d) => ({ label: formatDate(d.date, { day: "numeric", month: "short" }), tip: formatDate(d.date, { weekday: "short", day: "numeric", month: "short" }), value: d.protein }))}
              />
            </>
          )}
        </Card>
      </div>

      <Card title="Weight">
        <div className="mb-3 flex gap-2">
          <Input type="number" inputMode="decimal" step="0.1" placeholder="Today's weight (kg)" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} className="h-10" />
          <Button onClick={logWeight} disabled={!newWeight} className="h-10 shrink-0">
            Log
          </Button>
        </div>
        {weights.length ? (
          <LineChart
            label="Weight over time"
            unit="kg"
            data={weights.map((w) => ({ label: formatDate(w.date, { day: "numeric", month: "short" }), tip: formatDate(w.date, { day: "numeric", month: "short", year: "numeric" }), value: w.weightKg }))}
          />
        ) : (
          <p className="py-8 text-center font-mono text-xs uppercase tracking-wider text-muted">No data · log your weight weekly to see your trend</p>
        )}
      </Card>

      <PhysiqueCard me={me} reloadMe={reloadMe} notify={notify} />
    </div>
  );
}

function Stat({ label, value, unit, hot }: { label: string; value: string; unit: string; hot?: boolean }) {
  return (
    <div className="cut border border-line bg-surface p-4 backdrop-blur-md">
      <span aria-hidden className="absolute left-0 top-0 h-0.5 w-6 bg-accent shadow-[0_0_8px_var(--accent)]" />
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className={cx("mt-1 font-mono text-3xl font-bold tabular-nums", hot ? "text-accent text-glow" : "text-ink")}>
        {value}
        {hot && <span className="ml-1 text-xl">🔥</span>}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-ink-2">{unit}</div>
    </div>
  );
}

function Loading() {
  return (
    <div className="relative grid h-40 place-items-center overflow-hidden">
      <ScanLine />
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">Loading data…</span>
    </div>
  );
}

function PhysiqueCard({ me, reloadMe, notify }: { me: Me; reloadMe: () => Promise<void>; notify: (m: string) => void }) {
  const [pose, setPose] = useState("front");
  const [busy, setBusy] = useState<"upload" | "analyze" | null>(null);
  const [error, setError] = useState("");
  const report = me.profile.physiqueReport;

  async function upload(f: File) {
    setBusy("upload");
    setError("");
    try {
      const form = new FormData();
      form.append("photos", await resizeImage(f));
      form.append("poses", pose);
      await api("/api/physique", { form });
      await reloadMe();
      notify("PHOTO ADDED");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function analyze() {
    setBusy("analyze");
    setError("");
    try {
      await api("/api/ai/physique", { method: "POST" });
      await reloadMe();
      notify("SCAN COMPLETE ✓ TARGETS UPDATED");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card
      title="Physique check-ins"
      action={
        me.photos.length > 0 && (
          <Button size="sm" variant="outline" onClick={analyze} loading={busy === "analyze"}>
            <IconScan width={14} height={14} /> Analyze latest
          </Button>
        )
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Segmented
          value={pose}
          onChange={setPose}
          options={["front", "side", "back"].map((p) => ({ value: p, label: p }))}
        />
        <label
          className={cx(
            "cut cut-sm ml-auto inline-flex h-9 cursor-pointer items-center gap-2 border border-accent bg-accent px-3 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-black [--cut-color:var(--accent)] hover:bg-[#ff2a5c]",
            busy && "pointer-events-none opacity-50",
          )}
        >
          {busy === "upload" ? <Spinner /> : <IconPlus width={14} height={14} />} Add {pose} photo
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <ErrorText>{error}</ErrorText>
      {me.photos.length === 0 ? (
        <div className="hud grid place-items-center px-6 py-10 text-center">
          <IconScan width={28} height={28} className="text-accent" />
          <p className="mt-3 max-w-sm text-sm text-ink-2">Add front/side/back photos every few weeks to see your transformation and get an AI body-composition estimate.</p>
        </div>
      ) : (
        <div className="flex snap-x gap-3 overflow-x-auto pb-2">
          {me.photos.map((ph) => (
            <figure key={ph.id} className="w-28 shrink-0 snap-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ph.url} alt={`${ph.pose} physique photo`} className="hud aspect-[3/4] w-full object-cover p-1" />
              <figcaption className="mt-1 text-center font-mono text-[10px] uppercase tracking-wider text-muted">
                <span className="capitalize">{ph.pose}</span> · {new Date(ph.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      {report && (
        <div className="mt-4">
          {report.analyzedAt && <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted">Last analysed {new Date(report.analyzedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</p>}
          <PhysiqueReportView report={report} />
        </div>
      )}
    </Card>
  );
}
