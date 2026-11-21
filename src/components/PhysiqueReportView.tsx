import type { PhysiqueReport } from "@/lib/types";

export default function PhysiqueReportView({ report }: { report: PhysiqueReport }) {
  if (!report.usable) {
    return (
      <div className="cut border border-danger/40 bg-surface p-5 [--cut-color:rgba(255,45,85,0.4)]">
        <div className="font-mono text-xs font-bold uppercase tracking-wider text-danger">Scan failed · couldn&apos;t assess these photos</div>
        <p className="mt-1 text-sm text-ink-2">{report.summary}</p>
      </div>
    );
  }
  return (
    <div className="cut space-y-4 border border-accent/40 bg-surface p-5 backdrop-blur-md [--cut-color:rgba(255,0,60,0.4)]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Est. body fat</div>
          <div className="font-mono text-5xl font-bold tabular-nums text-accent text-glow">
            {Math.round(report.body_fat_pct)}
            <span className="text-xl text-muted">%</span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
            range {Math.round(report.body_fat_low)}–{Math.round(report.body_fat_high)}%
          </div>
        </div>
        <div className="max-w-[55%] text-right font-display text-xs font-bold uppercase tracking-wider text-ink-2">{report.build}</div>
      </div>
      <p className="text-sm leading-relaxed text-ink-2">{report.summary}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <List title="Strengths" items={report.strengths} />
        <List title="Focus areas" items={report.focus_areas} />
      </div>
      <p className="cut cut-sm border border-accent/40 bg-accent/10 p-3 text-sm [--cut-color:rgba(255,0,60,0.4)]">
        <b className="font-mono uppercase text-accent">Suggested goal › {report.suggested_goal}.</b> <span className="text-ink-2">{report.goal_reason}</span>
      </p>
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Visual AI estimate for planning — not a medical measurement.</p>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-accent">{"// "}{title}</div>
      <ul className="space-y-1 text-sm">
        {items.map((s) => (
          <li key={s} className="flex gap-2">
            <span className="text-accent">›</span>
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
