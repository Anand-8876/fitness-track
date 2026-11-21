import Link from "next/link";
import type { ReactNode } from "react";
import { IconBolt, IconCamera, IconDumbbell, IconScan, IconTarget } from "./icons";

/** Full-screen split layout for login/sign-up: neon city panel on desktop, glass form panel on the right. */
export default function AuthShell({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <main className="relative grid min-h-dvh lg:grid-cols-[1.15fr_1fr]">
      {/* Left: image panel (desktop) */}
      <div className="relative hidden overflow-hidden border-r border-accent/40 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div aria-hidden className="absolute inset-0 bg-[url('/cyberpunk_bg.jpg')] bg-cover bg-center" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,0,0,0.92)_0%,rgba(5,0,0,0.55)_55%,rgba(5,0,0,0.85)_100%)]" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,#050000_0%,transparent_45%)]" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 overflow-hidden opacity-40">
          <div className="grid-floor absolute -inset-x-1/2 top-0 h-[200%]" />
        </div>

        <div className="relative flex items-center justify-between">
          <Link href="/welcome">
            <Brand />
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-good text-glow-cyan">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-good" />
            SYS ONLINE
          </span>
        </div>

        <div className="relative max-w-lg">{aside ?? <DefaultAside />}</div>

        <div className="relative flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          <span>{"// Data encrypted · private to your account"}</span>
          <span>v2.077</span>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="relative flex min-h-dvh flex-col bg-[#050000]/85 px-5 py-6 backdrop-blur-xl sm:px-10 lg:px-16">
        {/* mobile: faint image band behind the header */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-56 bg-[url('/cyberpunk_bg.jpg')] bg-cover bg-center opacity-30 [mask-image:linear-gradient(to_bottom,#000,transparent)] lg:hidden" />
        <div className="relative flex items-center justify-between lg:hidden">
          <Link href="/welcome">
            <Brand />
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-good text-glow-cyan">● ONLINE</span>
        </div>
        <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">{children}</div>
      </div>
    </main>
  );
}

function DefaultAside() {
  const features = [
    { icon: IconCamera, text: "AI food recognition — Indian meals included" },
    { icon: IconTarget, text: "Calorie & macro targets built from your body" },
    { icon: IconDumbbell, text: "Workout splits, streaks and weigh-ins" },
    { icon: IconScan, text: "Optional physique scans to track change" },
  ];
  return (
    <>
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">{"// Initialize operative"}</p>
      <h2 className="glitch mt-3 font-display text-5xl font-black uppercase leading-[1.05] text-ink text-glow" data-text="Upgrade your body.">
        Upgrade your body.
      </h2>
      <ul className="mt-8 space-y-3">
        {features.map(({ icon: I, text }) => (
          <li key={text} className="flex items-center gap-3 text-ink-2">
            <span className="cut cut-sm grid h-9 w-9 shrink-0 place-items-center border border-accent/50 bg-accent/10 text-accent [--cut-color:rgba(255,0,60,0.5)]">
              <I width={18} height={18} />
            </span>
            {text}
          </li>
        ))}
      </ul>
    </>
  );
}

export function Brand({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <div className={`flex items-center gap-2.5 font-display font-black uppercase text-accent text-glow ${size === "lg" ? "text-2xl tracking-[0.25em]" : "text-sm tracking-[0.3em]"}`}>
      <span className="relative grid place-items-center">
        <span className="animate-pulse-ring absolute h-3 w-3 rounded-full bg-accent" />
        <IconBolt width={size === "lg" ? 22 : 16} height={size === "lg" ? 22 : 16} className="relative fill-accent" />
      </span>
      {size === "lg" ? (
        <span className="glitch" data-text="FITTRACK">
          FITTRACK
        </span>
      ) : (
        <span className="animate-flicker">FITTRACK</span>
      )}
    </div>
  );
}
