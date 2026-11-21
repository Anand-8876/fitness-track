"use client";

import { useState } from "react";
import { IconPen } from "./icons";
import { Button, Card, cx, ErrorText } from "./ui";
import { api } from "@/lib/client";
import { dayIndex, formatDate } from "@/lib/dates";
import type { DayData, Me } from "@/lib/types";
import { CARDIO, DAYS, defaultPlan, describeDay, GYM_SPLITS, type DayPlan, type WeekPlan } from "@/lib/workouts";

type Props = {
  me: Me;
  day: DayData | null;
  date: string;
  reloadMe: () => Promise<void>;
  reloadDay: () => Promise<void>;
  notify: (m: string) => void;
};

export default function WorkoutView({ me, day, date, reloadMe, reloadDay, notify }: Props) {
  const plan = me.plan ?? defaultPlan("gym");
  const [editing, setEditing] = useState<WeekPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const todayName = DAYS[dayIndex(date)];
  const today = describeDay(plan[todayName]);

  async function save() {
    setSaving(true);
    setError("");
    try {
      await api("/api/workout", { method: "PUT", body: { plan: editing } });
      await reloadMe();
      setEditing(null);
      notify("SPLIT SAVED 💪");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card title={`${formatDate(date, { weekday: "long" })}'s session`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="font-display text-2xl font-black uppercase tracking-wide text-ink text-glow sm:text-3xl">{today.title}</div>
            <div className="mt-1 font-mono text-xs uppercase tracking-[0.16em] text-muted">{today.subtitle}</div>
          </div>
          {plan[todayName].type !== "rest" && day && (
            <Button
              variant={day.workoutDone ? "done" : "primary"}
              onClick={async () => {
                await api("/api/workout", { method: "PUT", body: { date, done: !day.workoutDone } });
                reloadDay();
              }}
            >
              {day.workoutDone ? "✓ Completed" : "Mark complete"}
            </Button>
          )}
        </div>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {today.items.map((ex, i) => (
            <li key={ex} className="cut cut-sm flex items-center gap-3 border border-line bg-black/40 px-3 py-2.5 text-sm">
              <span className="font-mono text-xs font-bold text-accent">{String(i + 1).padStart(2, "0")}</span>
              {ex}
            </li>
          ))}
        </ol>
      </Card>

      <Card
        title="Weekly split"
        action={
          editing ? (
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={save} loading={saving}>
                Save
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditing(structuredClone(plan))}>
              <IconPen width={13} height={13} /> Customize
            </Button>
          )
        }
      >
        <ErrorText>{error}</ErrorText>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {DAYS.map((d) =>
            editing ? (
              <DayEditor key={d} day={d} value={editing[d]} onChange={(v) => setEditing({ ...editing, [d]: v })} />
            ) : (
              <div
                key={d}
                className={cx(
                  "cut cut-sm border p-3",
                  d === todayName ? "chip-on text-shadow-none" : "border-line bg-black/40",
                  plan[d].type === "rest" && d !== todayName && "opacity-50",
                )}
              >
                <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                  {d.slice(0, 3)}
                  {d === todayName && <span className="text-accent">● Today</span>}
                </div>
                <div className="mt-1 text-sm font-bold text-ink">{describeDay(plan[d]).title}</div>
                <div className="font-mono text-[10px] uppercase tracking-wide text-muted">{describeDay(plan[d]).subtitle}</div>
              </div>
            ),
          )}
        </div>
      </Card>
    </div>
  );
}

const sel = "h-9 w-full border border-line bg-black/60 px-2 font-mono text-xs text-ink outline-none focus:border-accent";

function DayEditor({ day, value, onChange }: { day: string; value: DayPlan; onChange: (v: DayPlan) => void }) {
  return (
    <div className="cut cut-sm space-y-2 border border-accent/30 bg-black/40 p-3">
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-accent">{day}</div>
      <div className="grid grid-cols-3 gap-1">
        {(["gym", "cardio", "rest"] as const).map((t) => (
          <button
            key={t}
            onClick={() =>
              onChange(t === "gym" ? { type: "gym", split: "Push Day" } : t === "cardio" ? { type: "cardio", cardioType: "Steps Goal", cardioGoal: 10000 } : { type: "rest" })
            }
            className={cx("cut cut-sm border py-1.5 font-mono text-[10px] font-bold uppercase", value.type === t ? "chip-on" : "chip-off")}
          >
            {t}
          </button>
        ))}
      </div>
      {value.type === "gym" && (
        <select className={sel} value={value.split} onChange={(e) => onChange({ type: "gym", split: e.target.value })}>
          {Object.keys(GYM_SPLITS).map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      )}
      {value.type === "cardio" && (
        <div className="flex gap-2">
          <select
            className={sel}
            value={value.cardioType}
            onChange={(e) => onChange({ type: "cardio", cardioType: e.target.value, cardioGoal: CARDIO[e.target.value].def })}
          >
            {Object.keys(CARDIO).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input
            type="number"
            aria-label={`Goal in ${CARDIO[value.cardioType].unit}`}
            className={cx(sel, "w-24")}
            value={value.cardioGoal}
            onChange={(e) => onChange({ ...value, cardioGoal: Math.max(1, Number(e.target.value) || 1) })}
          />
        </div>
      )}
    </div>
  );
}
