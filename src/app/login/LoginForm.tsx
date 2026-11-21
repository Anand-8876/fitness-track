"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import AuthShell from "@/components/AuthShell";
import { IconArrow, IconShield } from "@/components/icons";
import { Button, ErrorText, Input } from "@/components/ui";
import { api } from "@/lib/client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/api/auth/login", { body: { email, password } });
      router.replace("/");
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <AuthShell aside={<LoginAside />}>
      <div className="animate-rise">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">
          {"// Access terminal"}
          <span className="animate-blink ml-1">_</span>
        </p>
        <h1 className="glitch mt-3 font-display text-4xl font-black uppercase leading-none text-ink text-glow sm:text-5xl" data-text="Jack in">
          Jack in
        </h1>
        <p className="mt-3 text-ink-2">Welcome back, runner. Sign in to sync today&apos;s fuel and training.</p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <Input label="Email" hint="operative id" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <div className="relative">
            <Input
              label="Password"
              hint="passkey"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-16"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute bottom-0 right-0 h-12 px-4 font-mono text-[10px] font-bold uppercase tracking-widest text-muted hover:text-accent"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
          <ErrorText>{error}</ErrorText>
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            {loading ? "Authenticating…" : "Sign in"}
            {!loading && <IconArrow width={18} height={18} />}
          </Button>
        </form>

        <div className="my-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          <span className="h-px flex-1 bg-line" />
          New operative?
          <span className="h-px flex-1 bg-line" />
        </div>

        <Link
          href="/signup"
          className="cut cut-sm chip-off flex h-12 w-full items-center justify-center gap-2 border font-display text-[11px] font-bold uppercase tracking-[0.14em] transition hover:chip-on"
        >
          Create an account
        </Link>

        <p className="mt-8 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          <IconShield width={14} height={14} className="text-good" />
          Sessions encrypted · revoke any device from profile
        </p>
      </div>
    </AuthShell>
  );
}

function LoginAside() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const readouts = [
    ["Fuel scan", "AI · photo / text"],
    ["Targets", "BMR · TDEE · macros"],
    ["Training", "7-day split"],
    ["Physique", "Body-fat estimate"],
  ];

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">{"// Night city · regen gym"}</p>
      <h2 className="glitch mt-3 font-display text-5xl font-black uppercase leading-[1.02] text-ink text-glow xl:text-6xl" data-text="Welcome back.">
        Welcome back.
      </h2>
      <p className="mt-4 max-w-md text-lg text-ink-2">Your stats are where you left them. Snap a plate, hit your macros, close the ring.</p>

      <div className="cut mt-10 border border-accent/40 bg-black/60 p-5 backdrop-blur-md [--cut-color:rgba(255,0,60,0.4)]">
        <div className="flex items-center justify-between border-b border-line pb-3 font-mono text-[10px] uppercase tracking-[0.2em]">
          <span className="text-accent">System status</span>
          <span className="tabular-nums text-ink" suppressHydrationWarning>
            {now ? now.toLocaleTimeString("en-GB") : "--:--:--"}
          </span>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3">
          {readouts.map(([k, v]) => (
            <div key={k}>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{k}</dt>
              <dd className="mt-0.5 flex items-center gap-2 text-sm text-ink">
                <span className="h-1.5 w-1.5 bg-good shadow-[0_0_6px_var(--good)]" />
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
