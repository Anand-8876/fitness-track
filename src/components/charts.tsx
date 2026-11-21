"use client";

import { useEffect, useId, useRef, useState } from "react";

/** Tracks the container width so the SVG is drawn 1:1 and text stays legible on phones. */
function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(240, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}
const PAD = { t: 12, r: 8, b: 22, l: 34 };

function niceMax(v: number) {
  if (v <= 0) return 10;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  return Math.ceil(v / p / 0.5) * 0.5 * p;
}

/** Evenly spaced x-axis labels; always shows first and last, dropping any that would crowd the last one. */
function showLabel(i: number, n: number, W: number) {
  const step = Math.ceil(n / Math.max(3, Math.floor(W / 90)));
  if (i === 0 || i === n - 1) return true;
  return i % step === 0 && n - 1 - i >= step * 0.6;
}

function Tooltip({ x, W, lines, h }: { x: number; W: number; lines: string[]; h: number }) {
  const left = `${Math.min(88, Math.max(12, (x / W) * 100))}%`;
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 border border-accent/60 bg-black/90 px-2.5 py-1.5 font-mono text-[11px] shadow-[0_0_16px_rgba(255,0,60,0.3)]"
      style={{ left, top: 0, transform: `translate(-50%, -${h > 0 ? 100 : 0}%)` }}
    >
      {lines.map((l, i) => (
        <div key={i} className={i === 0 ? "font-bold uppercase text-accent" : "tabular-nums text-ink"}>
          {l}
        </div>
      ))}
    </div>
  );
}

/** Single-series bar chart with an optional dashed target line and per-bar hover. */
export function BarChart({
  data,
  target,
  color,
  unit,
  height = 160,
  label,
}: {
  data: { label: string; tip: string; value: number }[];
  target?: number;
  color: string;
  unit: string;
  height?: number;
  label: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [ref, W] = useWidth();
  const gid = `bar${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const max = niceMax(Math.max(target ?? 0, ...data.map((d) => d.value)) * 1.1);
  const iw = W - PAD.l - PAD.r;
  const ih = height - PAD.t - PAD.b;
  const slot = iw / data.length;
  const bw = Math.max(4, Math.min(28, slot - 2));
  const y = (v: number) => PAD.t + ih - (v / max) * ih;
  const ticks = [0, max / 2, max];

  return (
    <div ref={ref} className="relative" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img" aria-label={label}>
        <defs>
          <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.85} />
            <stop offset="100%" stopColor={color} stopOpacity={0.15} />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth={1} strokeDasharray="2 3" />
            <text x={PAD.l - 6} y={y(t) + 3} textAnchor="end" fontSize={10} fill="var(--muted)" fontFamily="var(--font-mono)">
              {Math.round(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = PAD.l + i * slot + (slot - bw) / 2;
          const h = Math.max(0, y(0) - y(d.value));
          return (
            <g key={i}>
              {h > 0 && (
                <g opacity={hover === null || hover === i ? 1 : 0.4}>
                  <rect x={x} y={y(d.value)} width={bw} height={h} fill={`url(#${gid})`} />
                  <rect x={x} y={y(d.value)} width={bw} height={2} fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
                </g>
              )}
              {showLabel(i, data.length, W) && (
                <text x={x + bw / 2} y={height - 6} textAnchor={i === data.length - 1 ? "end" : i === 0 ? "start" : "middle"} fontSize={10} fill="var(--muted)" fontFamily="var(--font-mono)">
                  {d.label}
                </text>
              )}
              <rect x={PAD.l + i * slot} y={PAD.t} width={slot} height={ih} fill="transparent" onMouseEnter={() => setHover(i)} onTouchStart={() => setHover(i)} />
            </g>
          );
        })}
        {target !== undefined && target > 0 && (
          <g>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(target)} y2={y(target)} stroke="var(--good)" strokeWidth={1.2} strokeDasharray="5 4" style={{ filter: "drop-shadow(0 0 3px var(--good))" }} />
            <text x={W - PAD.r} y={y(target) - 5} textAnchor="end" fontSize={10} fill="var(--good)" fontFamily="var(--font-mono)">
              TARGET {target}
            </text>
          </g>
        )}
      </svg>
      {hover !== null && (
        <Tooltip
          W={W}
          x={PAD.l + hover * slot + slot / 2}
          h={1}
          lines={[data[hover].tip, `${Math.round(data[hover].value)} ${unit}${target ? ` of ${target}` : ""}`]}
        />
      )}
    </div>
  );
}

/** Single-series line chart with crosshair hover. */
export function LineChart({ data, unit, height = 180, label }: { data: { tip: string; label: string; value: number }[]; unit: string; height?: number; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const [ref, W] = useWidth();
  const gid = `line${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  if (data.length === 0) return null;
  const vals = data.map((d) => d.value);
  const pad = Math.max(1, (Math.max(...vals) - Math.min(...vals)) * 0.2);
  const lo = Math.floor(Math.min(...vals) - pad);
  const hi = Math.ceil(Math.max(...vals) + pad);
  const iw = W - PAD.l - PAD.r;
  const ih = height - PAD.t - PAD.b;
  const x = (i: number) => PAD.l + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const y = (v: number) => PAD.t + ih - ((v - lo) / (hi - lo)) * ih;
  const path = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.value)}`).join(" ");
  const ticks = [lo, (lo + hi) / 2, hi];

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    data.forEach((_, i) => {
      if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i;
    });
    setHover(best);
  }

  return (
    <div ref={ref} className="relative" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full touch-none" role="img" aria-label={label} onPointerMove={onMove} onPointerDown={onMove}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth={1} strokeDasharray="2 3" />
            <text x={PAD.l - 6} y={y(t) + 3} textAnchor="end" fontSize={10} fill="var(--muted)" fontFamily="var(--font-mono)">
              {t.toFixed(t % 1 ? 1 : 0)}
            </text>
          </g>
        ))}
        <defs>
          <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={PAD.t + ih} stroke="var(--accent)" strokeOpacity={0.5} strokeWidth={1} />}
        {data.length > 1 && <path d={`${path} L${x(data.length - 1)},${PAD.t + ih} L${x(0)},${PAD.t + ih} Z`} fill={`url(#${gid})`} />}
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 5px var(--accent))" }} />
        {data.map((d, i) => (
          <rect key={i} x={x(i) - (hover === i ? 4 : 3)} y={y(d.value) - (hover === i ? 4 : 3)} width={hover === i ? 8 : 6} height={hover === i ? 8 : 6} fill="#050000" stroke="var(--accent)" strokeWidth={1.5} transform={`rotate(45 ${x(i)} ${y(d.value)})`} />
        ))}
        {data.map(
          (d, i) =>
            showLabel(i, data.length, W) && (
              <text key={`l${i}`} x={x(i)} y={height - 6} textAnchor={i === data.length - 1 && data.length > 1 ? "end" : i === 0 && data.length > 1 ? "start" : "middle"} fontSize={10} fill="var(--muted)" fontFamily="var(--font-mono)">
                {d.label}
              </text>
            ),
        )}
      </svg>
      {hover !== null && <Tooltip W={W} x={x(hover)} h={1} lines={[data[hover].tip, `${data[hover].value} ${unit}`]} />}
    </div>
  );
}
