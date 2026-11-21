import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/AuthShell";
import { IconArrow, IconBolt, IconCamera, IconChart, IconDrop, IconDumbbell, IconScan, IconShield, IconSpark, IconTarget, IconText } from "@/components/icons";
import { MacroBar, Ring } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "FitTrack — Snap your plate. Know your macros.",
};

const btn = "cut cut-sm inline-flex items-center justify-center gap-2 border font-display font-bold uppercase tracking-[0.14em] transition active:scale-[0.98]";
const primary = `${btn} border-accent bg-accent text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] [--cut-color:var(--accent)] hover:bg-[#ff2a5c]`;
const outline = `${btn} chip-off hover:chip-on`;

const FEATURES = [
  { icon: IconCamera, title: "Snap to log", body: "Point your camera at any plate. AI itemises every dish — roti, dal, sabzi, biryani — with calories and macros per item." },
  { icon: IconText, title: "Just describe it", body: "Type “2 rotis and a katori of dal makhani” and get a full breakdown. Or enter it manually, your call." },
  { icon: IconTarget, title: "Targets built for you", body: "BMR, TDEE and macro targets from your body stats, goal and activity — recalculated every weigh-in." },
  { icon: IconDumbbell, title: "Weekly split", body: "Push, pull, legs, cardio or rest. Build your week, then tick off each session as you crush it." },
  { icon: IconScan, title: "Physique scan", body: "Optional front/side/back photos. AI estimates body-fat % and dials in protein from your lean mass." },
  { icon: IconChart, title: "Progress HUD", body: "14/30-day calorie and protein charts, weight trend, logging streaks and a photo timeline." },
];

const STEPS = [
  { n: "01", title: "Calibrate", body: "Sign up with your stats and goal. Add physique photos if you want sharper targets." },
  { n: "02", title: "Scan your fuel", body: "Snap or describe every meal. Tweak portions with one tap before logging." },
  { n: "03", title: "Close the ring", body: "Hit your calories and protein, log water and workouts, watch the trend lines move." },
];

const FOODS = ["Roti", "Dal makhani", "Paneer tikka", "Poha", "Idli sambar", "Chicken biryani", "Masala chaas", "Rajma chawal", "Upma", "Chole bhature", "Egg bhurji", "Curd rice", "Aloo paratha", "Sprouts chaat"];

export default async function WelcomePage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-dvh overflow-x-clip">
      {/* ---------- Nav ---------- */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-accent/20 bg-black/60 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Brand />
          <nav className="hidden items-center gap-8 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-2 md:flex">
            <a href="#features" className="hover:text-accent">Features</a>
            <a href="#how" className="hover:text-accent">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link href="/" className={`${primary} h-10 px-4 text-[10px]`}>
                Dashboard <IconArrow width={16} height={16} />
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden px-3 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-ink-2 hover:text-accent sm:block">
                  Sign in
                </Link>
                <Link href="/signup" className={`${primary} h-10 px-4 text-[10px]`}>
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative flex min-h-dvh items-center pb-16 pt-28">
        <div aria-hidden className="absolute inset-0 bg-[url('/cyberpunk_bg.jpg')] bg-cover bg-center" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(100deg,rgba(5,0,0,0.95)_0%,rgba(5,0,0,0.75)_45%,rgba(5,0,0,0.55)_100%)]" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,#050000_2%,transparent_40%)]" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 overflow-hidden opacity-50">
          <div className="grid-floor absolute -inset-x-1/2 top-0 h-[200%]" />
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="animate-rise">
            <p className="inline-flex items-center gap-2 border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
              <IconSpark width={14} height={14} /> AI macro + fitness tracker
            </p>
            <h1 className="mt-6 font-display text-5xl font-black uppercase leading-[0.95] sm:text-6xl lg:text-7xl">
              <span className="glitch block text-ink" data-text="Snap your plate.">
                Snap your plate.
              </span>
              <span className="glitch mt-2 block text-accent text-glow" data-text="Know your macros.">
                Know your macros.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
              FitTrack turns a photo of your meal into calories, protein, carbs, fat and fiber in seconds — Indian food included. Then it tracks your water, workouts, weight and physique so
              you can see exactly what&apos;s working.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={user ? "/" : "/signup"} className={`${primary} h-14 px-7 text-xs`}>
                {user ? "Open dashboard" : "Start free"} <IconArrow width={18} height={18} />
              </Link>
              {!user && (
                <Link href="/login" className={`${outline} h-14 px-7 text-xs`}>
                  I have an account
                </Link>
              )}
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6">
              {[
                ["3", "ways to log"],
                ["5", "macros tracked"],
                ["~5s", "per AI scan"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-display text-3xl font-black text-ink text-glow">{v}</dt>
                  <dd className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <HeroHud />
        </div>
      </section>

      {/* ---------- Food ticker ---------- */}
      <div className="relative border-y border-accent/30 bg-accent/5 py-3" aria-hidden>
        <div className="animate-marquee flex w-max gap-8 font-mono text-xs uppercase tracking-[0.25em] text-ink-2">
          {[...FOODS, ...FOODS].map((f, i) => (
            <span key={i} className="flex items-center gap-8">
              {f}
              <span className="text-accent">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ---------- Features ---------- */}
      <section id="features" className="relative mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8">
        <SectionHead kicker="// Loadout" title="Everything you need." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: I, title, body }) => (
            <article key={title} className="cut group border border-line bg-surface p-6 backdrop-blur-md transition hover:border-accent/60 hover:bg-accent/5 hover:[--cut-color:rgba(255,0,60,0.6)]">
              <span className="absolute left-0 top-0 h-0.5 w-10 bg-accent shadow-[0_0_8px_var(--accent)] transition-all group-hover:w-full" />
              <span className="cut cut-sm grid h-12 w-12 place-items-center border border-accent/50 bg-accent/10 text-accent [--cut-color:rgba(255,0,60,0.5)]">
                <I width={22} height={22} />
              </span>
              <h3 className="mt-5 font-display text-base font-bold uppercase tracking-[0.08em] text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how" className="relative scroll-mt-20 border-y border-line bg-black/40 py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <SectionHead kicker="// Protocol" title="Three steps. Zero guesswork." />
          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.n} className="relative">
                <div className="cut h-full border border-line bg-surface p-6 backdrop-blur-md">
                  <div className="font-display text-5xl font-black text-transparent [-webkit-text-stroke:1px_var(--accent)]">{s.n}</div>
                  <h3 className="mt-4 font-display text-lg font-bold uppercase tracking-[0.08em] text-ink">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{s.body}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <IconArrow aria-hidden className="absolute -right-3.5 top-1/2 z-10 hidden -translate-y-1/2 text-accent md:block" width={22} height={22} />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <div className="cut cut-lg relative overflow-hidden border border-accent/60 p-10 text-center [--cut-color:rgba(255,0,60,0.6)] sm:p-16">
          <div aria-hidden className="absolute inset-0 bg-[url('/cyberpunk_bg.jpg')] bg-cover bg-[center_30%] opacity-25" />
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,60,0.25),rgba(5,0,0,0.9)_70%)]" />
          <div className="relative">
            <IconBolt width={36} height={36} className="mx-auto fill-accent text-accent drop-shadow-[0_0_10px_var(--accent)]" />
            <h2 className="glitch mt-4 font-display text-3xl font-black uppercase text-ink text-glow sm:text-5xl" data-text="Ready to upgrade?">
              Ready to upgrade?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-ink-2">Set up takes about a minute. Your data stays private to your account.</p>
            <Link href={user ? "/" : "/signup"} className={`${primary} mt-8 h-14 px-8 text-xs`}>
              {user ? "Open dashboard" : "Create your account"} <IconArrow width={18} height={18} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:flex-row sm:px-8">
          <Brand />
          <span className="flex items-center gap-2">
            <IconShield width={14} height={14} className="text-good" /> Private by default · AI estimates are not medical advice
          </span>
        </div>
      </footer>
    </div>
  );
}

function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">{kicker}</p>
      <h2 className="mt-3 font-display text-3xl font-black uppercase text-ink sm:text-4xl">{title}</h2>
    </div>
  );
}

/** Static product preview: a mini dashboard plus a floating AI-scan result. */
function HeroHud() {
  return (
    <div className="relative mx-auto mb-28 w-full max-w-sm animate-rise [animation-delay:150ms] lg:mx-0 lg:justify-self-end">
      <div className="cut cut-lg border border-accent/50 bg-black/75 p-5 shadow-[inset_0_0_40px_rgba(255,0,60,0.1)] backdrop-blur-xl [--cut-color:rgba(255,0,60,0.5)]">
        <div className="flex items-center justify-between border-b border-line pb-3 font-mono text-[10px] uppercase tracking-[0.2em]">
          <span className="text-accent">{"// Today"}</span>
          <span className="text-good text-glow-cyan">● Synced</span>
        </div>
        <div className="mt-5 flex items-center gap-5">
          <Ring value={1320} target={2150} size={130} stroke={8}>
            <div>
              <div className="font-mono text-2xl font-bold text-ink">830</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted">kcal left</div>
            </div>
          </Ring>
          <div className="flex-1 space-y-2.5">
            <MacroBar label="Pro" value={96} target={140} color="var(--protein)" />
            <MacroBar label="Carb" value={150} target={240} color="var(--carbs)" />
            <MacroBar label="Fat" value={38} target={65} color="var(--fat)" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="cut cut-sm border border-line bg-surface-2 p-3">
            <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
              <IconDrop width={12} height={12} /> Water
            </div>
            <div className="mt-1 font-mono text-lg font-bold text-ink">
              6<span className="text-muted">/8</span>
            </div>
          </div>
          <div className="cut cut-sm border border-good/40 bg-good/5 p-3 [--cut-color:rgba(0,255,204,0.4)]">
            <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
              <IconDumbbell width={12} height={12} /> Push day
            </div>
            <div className="mt-1 font-mono text-lg font-bold text-good text-glow-cyan">✓ Done</div>
          </div>
        </div>
      </div>

      {/* floating scan result */}
      <div className="hud absolute -bottom-32 -left-3 w-60 bg-black/90 p-4 shadow-[0_0_30px_rgba(255,0,60,0.2)] backdrop-blur-xl sm:-left-14">
        <div className="relative overflow-hidden">
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-accent">
            <IconScan width={12} height={12} /> AI scan complete
          </div>
          <ul className="mt-2 space-y-1.5 text-xs">
            {[
              ["Dal makhani", "1 katori", 320],
              ["Tandoori roti", "×2", 240],
              ["Cucumber raita", "1 bowl", 90],
            ].map(([n, p, k]) => (
              <li key={n as string} className="flex justify-between gap-2">
                <span className="text-ink">
                  {n} <span className="text-muted">{p}</span>
                </span>
                <span className="font-mono text-ink-2">{k}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between border-t border-line pt-2 font-mono text-xs font-bold">
            <span className="text-muted">TOTAL</span>
            <span className="text-accent text-glow">650 kcal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
