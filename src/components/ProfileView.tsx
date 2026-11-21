"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, ErrorText, Input, Label, Pills } from "./ui";
import { api } from "@/lib/client";
import { ACTIVITY_LABELS, DIET_LABELS, GOAL_LABELS, type Activity, type Diet, type Goal, type Sex } from "@/lib/nutrition";
import type { Me } from "@/lib/types";

export default function ProfileView({ me, setMe, notify }: { me: Me; setMe: (m: Me) => void; notify: (m: string) => void }) {
  const router = useRouter();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <Card title="Account">
          <div className="flex items-center gap-4">
            <div className="cut cut-sm grid h-14 w-14 shrink-0 place-items-center border border-accent bg-accent/15 font-display text-xl font-black text-accent text-glow [--cut-color:var(--accent)]">
              {me.user.name.trim().charAt(0).toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <div className="truncate font-display text-lg font-bold uppercase tracking-wide text-ink">{me.user.name}</div>
              <div className="truncate font-mono text-xs text-muted">{me.user.email}</div>
            </div>
          </div>
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={async () => {
              await api("/api/auth/logout", { method: "POST" });
              router.replace("/login");
            }}
          >
            Sign out
          </Button>
        </Card>
        <TargetsCard me={me} setMe={setMe} notify={notify} />
        <SessionsCard notify={notify} />
      </div>
      <ProfileForm me={me} setMe={setMe} notify={notify} />
    </div>
  );
}

function ProfileForm({ me, setMe, notify }: { me: Me; setMe: (m: Me) => void; notify: (m: string) => void }) {
  const p = me.profile;
  const [f, setF] = useState({
    name: me.user.name,
    sex: p.sex as Sex,
    age: String(p.age),
    heightCm: String(p.heightCm),
    weightKg: String(p.weightKg),
    goal: p.goal as Goal,
    activity: p.activity as Activity,
    diet: p.diet as Diet,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setBusy(true);
    setError("");
    try {
      const next = await api<Me>("/api/me", {
        method: "PATCH",
        body: { ...f, age: +f.age, heightCm: +f.heightCm, weightKg: +f.weightKg },
      });
      setMe(next);
      notify("PROFILE SAVED ✓ TARGETS RECALCULATED");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Profile">
      <div className="space-y-4">
        <Input label="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <div>
          <Label>Sex</Label>
          <Pills columns={3} value={f.sex} onChange={(sex) => setF({ ...f, sex })} options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Input label="Age" type="number" value={f.age} onChange={(e) => setF({ ...f, age: e.target.value })} />
          <Input label="Height" hint="cm" type="number" value={f.heightCm} onChange={(e) => setF({ ...f, heightCm: e.target.value })} />
          <Input label="Weight" hint="kg" type="number" step="0.1" value={f.weightKg} onChange={(e) => setF({ ...f, weightKg: e.target.value })} />
        </div>
        <div>
          <Label>Goal</Label>
          <Pills columns={3} value={f.goal} onChange={(goal) => setF({ ...f, goal })} options={(Object.keys(GOAL_LABELS) as Goal[]).map((g) => ({ value: g, label: GOAL_LABELS[g] }))} />
        </div>
        <div>
          <Label>Activity</Label>
          <Pills
            columns={2}
            value={f.activity}
            onChange={(activity) => setF({ ...f, activity })}
            options={(Object.keys(ACTIVITY_LABELS) as Activity[]).map((a) => ({ value: a, label: ACTIVITY_LABELS[a].label, hint: ACTIVITY_LABELS[a].hint }))}
          />
        </div>
        <div>
          <Label>Diet</Label>
          <Pills columns={2} value={f.diet} onChange={(diet) => setF({ ...f, diet })} options={(Object.keys(DIET_LABELS) as Diet[]).map((d) => ({ value: d, label: DIET_LABELS[d] }))} />
        </div>
        <ErrorText>{error}</ErrorText>
        <Button className="w-full" onClick={save} loading={busy}>
          Save & recalculate targets
        </Button>
      </div>
    </Card>
  );
}

function TargetsCard({ me, setMe, notify }: { me: Me; setMe: (m: Me) => void; notify: (m: string) => void }) {
  const p = me.profile;
  const [editing, setEditing] = useState(false);
  const [t, setT] = useState({ targetKcal: p.targetKcal, targetProtein: p.targetProtein, targetCarbs: p.targetCarbs, targetFat: p.targetFat, targetFiber: p.targetFiber });
  const [error, setError] = useState("");

  async function save() {
    setError("");
    try {
      setMe(await api<Me>("/api/me", { method: "PATCH", body: { targets: t } }));
      setEditing(false);
      notify("CUSTOM TARGETS SAVED");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const rows = [
    ["targetKcal", "Calories", "kcal"],
    ["targetProtein", "Protein", "g"],
    ["targetCarbs", "Carbs", "g"],
    ["targetFat", "Fat", "g"],
    ["targetFiber", "Fiber", "g"],
  ] as const;

  return (
    <Card
      title="Daily targets"
      action={
        editing ? (
          <Button size="sm" onClick={save}>
            Save
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setT({ targetKcal: p.targetKcal, targetProtein: p.targetProtein, targetCarbs: p.targetCarbs, targetFat: p.targetFat, targetFiber: p.targetFiber });
              setEditing(true);
            }}
          >
            Override
          </Button>
        )
      }
    >
      <div className="grid grid-cols-5 gap-2">
        {rows.map(([k, l, u]) =>
          editing ? (
            <Input key={k} label={l} type="number" value={t[k]} onChange={(e) => setT({ ...t, [k]: Math.round(Number(e.target.value) || 0) })} className="h-10 px-1! text-center text-sm" />
          ) : (
            <div key={k} className="cut cut-sm border border-line bg-black/40 p-2 text-center">
              <div className="font-mono text-lg font-bold tabular-nums text-ink">{p[k]}</div>
              <div className="font-mono text-[9px] uppercase tracking-wide text-muted">
                {l} {u !== "kcal" && `(${u})`}
              </div>
            </div>
          ),
        )}
      </div>
      <ErrorText>{error}</ErrorText>
      <p className="mt-3 text-xs text-ink-2">
        Calculated from your stats{p.bodyFatPct ? " and AI body-fat estimate" : ""}. Saving your profile or logging a new weight recalculates them.
      </p>
    </Card>
  );
}

type SessionRow = { id: string; userAgent: string | null; ip: string | null; createdAt: string; lastUsedAt: string; current: boolean; active: boolean };

function deviceName(ua: string | null) {
  if (!ua) return "Unknown device";
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Device";
  const br = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  return `${br} on ${os}`;
}

function SessionsCard({ notify }: { notify: (m: string) => void }) {
  const [rows, setRows] = useState<SessionRow[] | null>(null);
  const [showAll, setShowAll] = useState(false);
  const load = useCallback(() => api<{ sessions: SessionRow[] }>("/api/auth/sessions").then((r) => setRows(r.sessions)), []);
  useEffect(() => {
    load().catch((e) => notify(e.message));
  }, [load, notify]);

  async function revoke(q: string) {
    await api(`/api/auth/sessions?${q}`, { method: "DELETE" });
    await load();
    notify("SESSION TERMINATED");
  }

  const active = rows?.filter((r) => r.active) ?? [];
  const list = showAll ? (rows ?? []) : active;
  const fmt = (d: string) => new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

  return (
    <Card
      title="Sessions"
      action={
        active.length > 1 && (
          <Button size="sm" variant="danger" onClick={() => revoke("others=1")}>
            Sign out others
          </Button>
        )
      }
    >
      <ul className="divide-y divide-line">
        {list.map((s) => (
          <li key={s.id} className="flex items-center gap-3 py-2.5">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                {deviceName(s.userAgent)}
                {s.current && <span className="border border-good/50 bg-good/10 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-good text-glow-cyan">THIS DEVICE</span>}
                {!s.active && <span className="border border-line px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-muted">ENDED</span>}
              </div>
              <div className="font-mono text-[11px] text-muted">
                Signed in {fmt(s.createdAt)} · last active {fmt(s.lastUsedAt)}
                {s.ip ? ` · ${s.ip}` : ""}
              </div>
            </div>
            {s.active && !s.current && (
              <Button size="sm" variant="ghost" onClick={() => revoke(`id=${s.id}`)}>
                Sign out
              </Button>
            )}
          </li>
        ))}
      </ul>
      {rows && rows.length > active.length && (
        <button onClick={() => setShowAll((v) => !v)} className="mt-2 font-mono text-[10px] font-bold uppercase tracking-wider text-accent hover:underline">
          {showAll ? "Show active only" : `Show full history (${rows.length})`}
        </button>
      )}
    </Card>
  );
}
