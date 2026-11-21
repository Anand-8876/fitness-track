"use client";

import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { IconClose } from "./icons";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "danger" | "done";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cx(
        "cut cut-sm inline-flex items-center justify-center gap-2 border font-display font-bold uppercase tracking-[0.12em] transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
        size === "sm" && "h-9 px-3 text-[10px]",
        size === "md" && "h-11 px-4 text-[11px]",
        size === "lg" && "h-14 px-6 text-xs",
        variant === "primary" &&
          "border-accent bg-accent text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_0_18px_rgba(255,255,255,0.12)] [--cut-color:var(--accent)] hover:bg-[#ff2a5c]",
        variant === "ghost" && "border-transparent text-ink-2 [--cut-color:transparent] hover:bg-accent/10 hover:text-accent",
        variant === "outline" && "chip-off hover:chip-on",
        variant === "done" && "done",
        variant === "danger" && "border-danger/50 bg-danger/5 text-danger [--cut-color:rgba(255,45,85,0.5)] hover:bg-danger/15",
        className,
      )}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <span aria-hidden className={cx("inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent", className)} />;
}

/** Full-width laser line sweeping over its (relative) parent. */
export function ScanLine() {
  return (
    <span aria-hidden className="animate-scan pointer-events-none absolute inset-x-0 h-0.5 bg-accent shadow-[0_0_12px_2px_var(--accent)]" />
  );
}

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <span className="mb-1.5 flex items-baseline gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
      {children}
      {hint && <span className="normal-case tracking-normal text-muted/70">{hint}</span>}
    </span>
  );
}

export function Input({ label, hint, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string }) {
  return (
    <label className="block">
      {label && <Label hint={hint}>{label}</Label>}
      <input
        {...rest}
        className={cx(
          "cut cut-sm h-12 w-full border border-line bg-black/50 px-4 text-[15px] text-ink outline-none transition placeholder:text-muted/60 focus:border-accent focus:bg-accent/5 focus:shadow-[inset_0_0_14px_rgba(255,0,60,0.25)] focus:[--cut-color:var(--accent)]",
          rest.type === "number" && "font-mono",
          className,
        )}
      />
    </label>
  );
}

export function Pills<T extends string>({
  options,
  value,
  onChange,
  columns,
}: {
  options: { value: T; label: ReactNode; hint?: string }[];
  value: T;
  onChange: (v: T) => void;
  columns?: number;
}) {
  return (
    <div className={cx("grid gap-2", columns === 2 && "grid-cols-2", columns === 3 && "grid-cols-3", columns === 4 && "grid-cols-4", !columns && "grid-cols-1")}>
      {options.map((o) => (
        <button
          type="button"
          key={o.value}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cx("cut cut-sm border px-3 py-3 text-left text-sm font-semibold transition", value === o.value ? "chip-on" : "chip-off")}
        >
          <div>{o.label}</div>
          {o.hint && <div className={cx("mt-0.5 text-xs font-normal", value === o.value ? "text-ink-2 [text-shadow:none]" : "text-muted")}>{o.hint}</div>}
        </button>
      ))}
    </div>
  );
}

/** Compact segmented toggle (tabs, ranges, poses). */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cx("cut cut-sm flex gap-1 border border-line bg-black/50 p-1", className)}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cx(
            "cut cut-sm flex flex-1 items-center justify-center gap-1.5 border px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition",
            value === o.value ? "chip-on" : "border-transparent text-ink-2 hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Card({ children, className, title, action }: { children: ReactNode; className?: string; title?: string; action?: ReactNode }) {
  return (
    <section
      className={cx(
        "cut border border-line bg-surface p-4 shadow-[inset_0_0_30px_rgba(255,0,60,0.05)] backdrop-blur-md [--cut-color:var(--border)]",
        className,
      )}
    >
      <span aria-hidden className="absolute left-0 top-0 h-0.5 w-10 bg-accent shadow-[0_0_8px_var(--accent)]" />
      {(title || action) && (
        <div className="mb-3 flex min-h-9 items-center justify-between gap-2 border-b border-line pb-2">
          {title && (
            <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
              <span className="text-muted">{"// "}</span>
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Bottom sheet on mobile, centered dialog on larger screens. */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="animate-sheet pb-safe relative flex max-h-[92dvh] w-full flex-col border-t border-accent bg-[#0a0103] shadow-[0_-10px_40px_rgba(255,0,60,0.25)] sm:cut sm:cut-lg sm:max-w-lg sm:border sm:border-accent/60 sm:[--cut-color:rgba(255,0,60,0.6)]"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-accent text-glow">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="cut cut-sm grid h-8 w-8 place-items-center border border-line text-ink-2 hover:border-accent hover:text-accent">
            <IconClose width={16} height={16} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function ErrorText({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p className="cut cut-sm border border-danger/40 bg-danger/10 px-3 py-2 font-mono text-xs text-danger [--cut-color:rgba(255,45,85,0.4)]">
      <b>ERR ›</b> {children}
    </p>
  );
}

// Server and browser trig can differ in the last digit; round so SSR markup hydrates cleanly.
const fix = (n: number) => Math.round(n * 100) / 100;

/** Neon progress ring with a tick-mark track; flips to magenta when over target. */
export function Ring({ value, target, size = 150, stroke = 10, children }: { value: number; target: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2 - 8;
  const c = 2 * Math.PI * r;
  const pct = target > 0 ? Math.min(1, value / target) : 0;
  const over = value > target * 1.05;
  const color = over ? "var(--carbs)" : "var(--accent)";
  const mid = size / 2;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 overflow-visible">
        {/* outer tick dial */}
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i / 60) * Math.PI * 2;
          const r1 = size / 2 - 1;
          const r2 = r1 - (i % 5 === 0 ? 5 : 2.5);
          const lit = i / 60 < pct;
          return (
            <line
              key={i}
              x1={fix(mid + Math.cos(a) * r1)}
              y1={fix(mid + Math.sin(a) * r1)}
              x2={fix(mid + Math.cos(a) * r2)}
              y2={fix(mid + Math.sin(a) * r2)}
              stroke={lit ? color : "var(--border)"}
              strokeWidth={1.2}
            />
          );
        })}
        <circle cx={mid} cy={mid} r={r} fill="none" stroke="rgba(255,0,60,0.1)" strokeWidth={stroke} />
        <circle cx={mid} cy={mid} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} strokeDasharray="2 4" />
        <circle
          cx={mid}
          cy={mid}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="butt"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 0.9s ease", filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function MacroBar({ label, value, target, color, unit = "g" }: { label: string; value: number; target: number; color: string; unit?: string }) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink-2">
          <span className="h-2 w-2 rotate-45" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
          {label}
        </span>
        <span className="font-mono text-ink-2 tabular-nums">
          <b className="text-ink">{Math.round(value)}</b>/{target}
          {unit}
        </span>
      </div>
      <div className="relative h-2 bg-white/5">
        <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 10px ${color}` }} />
        {/* segment gaps */}
        <div aria-hidden className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_9px,#050000_9px_11px)]" />
      </div>
    </div>
  );
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="animate-rise cut cut-sm fixed inset-x-0 top-16 z-[60] mx-auto w-fit max-w-[90vw] border border-good/60 bg-black/90 px-5 py-2.5 font-mono text-sm font-bold text-good text-glow-cyan shadow-[0_0_24px_rgba(0,255,204,0.25)] [--cut-color:rgba(0,255,204,0.6)]"
    >
      <span className="text-good/60">&gt; </span>
      {message}
    </div>
  );
}
