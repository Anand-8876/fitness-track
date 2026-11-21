"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AuthShell from "@/components/AuthShell";
import PhysiqueReportView from "@/components/PhysiqueReportView";
import { IconArrow, IconChevron, IconClose, IconUser } from "@/components/icons";
import { Button, cx, ErrorText, Input, Label, Pills, ScanLine } from "@/components/ui";
import { api, resizeImage } from "@/lib/client";
import { ACTIVITY_LABELS, calcTargets, DIET_LABELS, GOAL_LABELS, type Activity, type Diet, type Goal, type Sex } from "@/lib/nutrition";
import type { PhysiqueReport } from "@/lib/types";

const STEPS = ["Account", "Body", "Goals", "Physique", "Your plan"];
const POSES = [
  { key: "front", label: "Front" },
  { key: "side", label: "Side" },
  { key: "back", label: "Back" },
] as const;
type Pose = (typeof POSES)[number]["key"];

export default function SignupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<"form" | "analyzing" | "report">("form");
  const [report, setReport] = useState<PhysiqueReport | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("");
  const [heightCm, setHeight] = useState("");
  const [weightKg, setWeight] = useState("");
  const [goal, setGoal] = useState<Goal>("lose");
  const [activity, setActivity] = useState<Activity>("moderate");
  const [diet, setDiet] = useState<Diet>("veg");
  const [routine, setRoutine] = useState<"gym" | "cardio" | "both">("gym");
  const [photos, setPhotos] = useState<Partial<Record<Pose, File>>>({});

  const previews = useMemo(
    () => Object.fromEntries(Object.entries(photos).map(([k, f]) => [k, URL.createObjectURL(f as File)])) as Partial<Record<Pose, string>>,
    [photos],
  );
  useEffect(() => () => Object.values(previews).forEach((u) => u && URL.revokeObjectURL(u)), [previews]);

  const stats = { sex, age: +age, heightCm: +heightCm, weightKg: +weightKg, goal, activity };
  const targets = useMemo(
    () => (+age && +heightCm && +weightKg ? calcTargets(stats) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sex, age, heightCm, weightKg, goal, activity],
  );

  function validate(s: number): string {
    if (s === 0) {
      if (!name.trim()) return "Enter your name";
      if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email";
      if (password.length < 8) return "Password must be at least 8 characters";
    }
    if (s === 1) {
      if (!(+age >= 13 && +age <= 100)) return "Age must be 13–100";
      if (!(+heightCm >= 100 && +heightCm <= 250)) return "Height must be 100–250 cm";
      if (!(+weightKg >= 30 && +weightKg <= 300)) return "Weight must be 30–300 kg";
    }
    return "";
  }

  function next() {
    const err = validate(step);
    setError(err);
    if (!err) setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  async function submit() {
    setError("");
    setSubmitting(true);
    try {
      const form = new FormData();
      Object.entries({ name, email, password, sex, age, heightCm, weightKg, goal, activity, diet, routine }).forEach(([k, v]) => form.append(k, String(v)));
      for (const [pose, file] of Object.entries(photos)) {
        form.append("photos", await resizeImage(file as File));
        form.append("poses", pose);
      }
      const res = await api<{ hasPhotos: boolean }>("/api/auth/signup", { form });
      if (!res.hasPhotos) {
        router.replace("/");
        return;
      }
      setPhase("analyzing");
      try {
        const { report } = await api<{ report: PhysiqueReport }>("/api/ai/physique", { method: "POST" });
        setReport(report);
        setPhase("report");
      } catch (e) {
        // The account exists either way; analysis can be re-run from Progress.
        setError(`Account created, but the physique analysis failed: ${(e as Error).message}`);
        setPhase("report");
      }
    } catch (e) {
      setError((e as Error).message);
      if (/email/i.test((e as Error).message)) setStep(0);
      setSubmitting(false);
    }
  }

  if (phase !== "form") {
    return (
      <AuthShell>
        {phase === "analyzing" ? (
          <div className="animate-rise flex flex-col items-center text-center">
            <div className="hud relative grid h-40 w-32 place-items-center overflow-hidden">
              <ScanLine />
              <IconUser width={64} height={64} className="text-accent/60" strokeWidth={1} />
            </div>
            <h1 className="glitch mt-8 font-display text-2xl font-black uppercase text-ink text-glow" data-text="Analyzing physique">
              Analyzing physique
            </h1>
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-accent">
              Body composition scan<span className="animate-blink">_</span>
            </p>
            <p className="mt-4 text-ink-2">Estimating body composition to fine-tune your calorie and protein targets.</p>
          </div>
        ) : (
          <div className="animate-rise">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-good text-glow-cyan">● Calibration complete</p>
            <h1 className="mt-2 font-display text-3xl font-black uppercase leading-tight text-ink text-glow">You&apos;re all set, {name.split(" ")[0]}</h1>
            <div className="mt-6">
              <ErrorText>{error}</ErrorText>
              {report && <PhysiqueReportView report={report} />}
            </div>
            <Button size="lg" className="mt-8 w-full" onClick={() => router.replace("/")}>
              Enter dashboard <IconArrow width={18} height={18} />
            </Button>
          </div>
        )}
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div>
        <div className="mb-8 flex gap-1.5" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <div key={s} className={cx("h-1 flex-1 -skew-x-[30deg] transition", i <= step ? "bg-accent shadow-[0_0_8px_var(--accent)]" : "bg-line")} />
          ))}
        </div>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
          <span className="text-muted">[ {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")} ]</span> {STEPS[step]}
        </p>

        <div key={step} className="animate-rise mt-2">
          {step === 0 && (
            <>
              <h1 className="font-display text-3xl font-black uppercase leading-tight text-ink text-glow">Create your account</h1>
              <p className="mt-2 text-ink-2">Initialize your operative profile. Stay signed in on every device you use.</p>
              <div className="mt-8 space-y-4">
                <Input label="Name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                <Input label="Password" hint="min 8 characters" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="font-display text-3xl font-black uppercase leading-tight text-ink text-glow">Your body stats</h1>
              <p className="mt-2 text-ink-2">Used to calculate your energy needs.</p>
              <div className="mt-8 space-y-5">
                <div>
                  <Label>Biological sex</Label>
                  <Pills columns={3} value={sex} onChange={setSex} options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Age" hint="yrs" type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" />
                  <Input label="Height" hint="cm" type="number" inputMode="decimal" value={heightCm} onChange={(e) => setHeight(e.target.value)} placeholder="175" />
                  <Input label="Weight" hint="kg" type="number" inputMode="decimal" value={weightKg} onChange={(e) => setWeight(e.target.value)} placeholder="70" />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="font-display text-3xl font-black uppercase leading-tight text-ink text-glow">Goals & preferences</h1>
              <div className="mt-6 space-y-5">
                <div>
                  <Label>Goal</Label>
                  <Pills columns={3} value={goal} onChange={setGoal} options={(Object.keys(GOAL_LABELS) as Goal[]).map((g) => ({ value: g, label: GOAL_LABELS[g] }))} />
                </div>
                <div>
                  <Label>Activity level</Label>
                  <Pills
                    columns={2}
                    value={activity}
                    onChange={setActivity}
                    options={(Object.keys(ACTIVITY_LABELS) as Activity[]).map((a) => ({ value: a, label: ACTIVITY_LABELS[a].label, hint: ACTIVITY_LABELS[a].hint }))}
                  />
                </div>
                <div>
                  <Label>Diet</Label>
                  <Pills columns={2} value={diet} onChange={setDiet} options={(Object.keys(DIET_LABELS) as Diet[]).map((d) => ({ value: d, label: DIET_LABELS[d] }))} />
                </div>
                <div>
                  <Label>Training style</Label>
                  <Pills
                    columns={3}
                    value={routine}
                    onChange={setRoutine}
                    options={[
                      { value: "gym", label: "🏋️ Gym" },
                      { value: "cardio", label: "🏃 Cardio" },
                      { value: "both", label: "⚡ Both" },
                    ]}
                  />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="font-display text-3xl font-black uppercase leading-tight text-ink text-glow">
                Physique scan <span className="font-mono text-xs font-semibold tracking-wider text-muted">(optional)</span>
              </h1>
              <p className="mt-2 text-ink-2">
                AI estimates your body-fat % to personalise protein and calories, and you&apos;ll have a baseline to compare against later. Photos stay private to your account.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {POSES.map(({ key, label }) => (
                  <label
                    key={key}
                    className="hud group relative aspect-[3/4] cursor-pointer overflow-hidden bg-black/40 p-1 transition [--hud:rgba(255,0,60,0.5)] hover:bg-accent/10 hover:[--hud:var(--accent)]"
                  >
                    {previews[key] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previews[key]} alt={`${label} photo`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-center text-muted group-hover:text-accent">
                        <div>
                          <IconUser width={40} height={40} strokeWidth={1} className="mx-auto" />
                          <div className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em]">+ {label}</div>
                        </div>
                      </div>
                    )}
                    {previews[key] && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setPhotos((p) => Object.fromEntries(Object.entries(p).filter(([k]) => k !== key)));
                        }}
                        className="absolute right-2 top-2 grid h-7 w-7 place-items-center border border-accent/60 bg-black/80 text-accent"
                        aria-label={`Remove ${label} photo`}
                      >
                        <IconClose width={14} height={14} />
                      </button>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setPhotos((p) => ({ ...p, [key]: f }));
                        e.target.value = "";
                      }}
                    />
                  </label>
                ))}
              </div>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-muted">Tip: full body, good light, fitted clothing, relaxed stance.</p>
            </>
          )}

          {step === 4 && targets && (
            <>
              <h1 className="font-display text-3xl font-black uppercase leading-tight text-ink text-glow">Your daily targets</h1>
              <p className="mt-2 text-ink-2">
                {Object.keys(photos).length
                  ? "These will be refined after your physique analysis."
                  : "You can adjust these anytime from your profile."}
              </p>
              <div className="cut cut-lg mt-6 border border-accent/50 bg-surface p-6 shadow-[inset_0_0_40px_rgba(255,0,60,0.1)] [--cut-color:rgba(255,0,60,0.5)]">
                <div className="font-mono text-6xl font-bold tabular-nums text-accent text-glow">{targets.targetKcal.toLocaleString()}</div>
                <div className="mt-1 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted">kcal / day</div>
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  {[
                    ["Protein", targets.targetProtein, "var(--protein)"],
                    ["Carbs", targets.targetCarbs, "var(--carbs)"],
                    ["Fat", targets.targetFat, "var(--fat)"],
                  ].map(([l, v, c]) => (
                    <div key={l as string} className="cut cut-sm border border-line bg-black/40 p-3">
                      <div className="mx-auto mb-2 h-0.5 w-8" style={{ background: c as string, boxShadow: `0 0 8px ${c}` }} />
                      <div className="font-mono text-xl font-bold tabular-nums text-ink">{v}g</div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-muted">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6">
          <ErrorText>{error}</ErrorText>
        </div>

        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <Button variant="outline" size="lg" onClick={() => (setError(""), setStep((s) => s - 1))} disabled={submitting}>
              <IconChevron left width={18} height={18} />
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button size="lg" className="flex-1" onClick={next}>
              {step === 3 && !Object.keys(photos).length ? "Skip for now" : "Continue"} <IconArrow width={18} height={18} />
            </Button>
          ) : (
            <Button size="lg" className="flex-1" onClick={submit} loading={submitting}>
              Create account
            </Button>
          )}
        </div>

        {step === 0 && (
          <p className="mt-6 text-center text-sm text-ink-2">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-accent underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </AuthShell>
  );
}
