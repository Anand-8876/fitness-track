"use client";

import { useCallback, useEffect, useState, type ReactNode, type SVGProps } from "react";
import AddFoodSheet from "./AddFoodSheet";
import { IconCamera, IconChart, IconChevron, IconDumbbell, IconPlate, IconUser } from "./icons";
import { Brand } from "./AuthShell";
import ProfileView from "./ProfileView";
import ProgressView from "./ProgressView";
import TodayView from "./TodayView";
import { cx, Spinner, Toast } from "./ui";
import WorkoutView from "./WorkoutView";
import { api } from "@/lib/client";
import { addDays, formatDate, localDateStr } from "@/lib/dates";
import type { Meal } from "@/lib/nutrition";
import type { DayData, Me } from "@/lib/types";

type Tab = "today" | "workout" | "progress" | "profile";
const TABS: { id: Tab; icon: (p: SVGProps<SVGSVGElement>) => ReactNode; label: string }[] = [
  { id: "today", icon: IconPlate, label: "Today" },
  { id: "workout", icon: IconDumbbell, label: "Workout" },
  { id: "progress", icon: IconChart, label: "Progress" },
  { id: "profile", icon: IconUser, label: "Profile" },
];

export default function AppShell() {
  const [me, setMe] = useState<Me | null>(null);
  const [tab, setTab] = useState<Tab>("today");
  const [date, setDate] = useState(localDateStr);
  const [day, setDay] = useState<DayData | null>(null);
  const [addFor, setAddFor] = useState<Meal | "auto" | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const loadMe = useCallback(() => api<Me>("/api/me").then(setMe), []);
  const loadDay = useCallback(() => api<DayData>(`/api/day?date=${date}`).then(setDay), [date]);

  useEffect(() => {
    loadMe().catch((e) => notify(e.message));
  }, [loadMe, notify]);
  useEffect(() => {
    loadDay().catch((e) => notify(e.message));
  }, [loadDay, notify]);

  if (!me) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="flex flex-col items-center gap-4">
          <Brand size="lg" />
          <div className="relative h-0.5 w-48 overflow-hidden bg-line">
            <div className="absolute inset-y-0 w-1/3 animate-load bg-accent shadow-[0_0_10px_var(--accent)]" />
          </div>
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
            <Spinner className="h-3 w-3" /> Booting HUD
          </p>
        </div>
      </div>
    );
  }

  const today = localDateStr();
  const isToday = date === today;

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col">
      <header className="sticky top-0 z-30 border-b border-accent/30 bg-black/70 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Brand />
          <nav className="hidden gap-1 md:flex">
            {TABS.map(({ id, icon: I, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cx(
                  "cut cut-sm flex items-center gap-2 border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] transition",
                  tab === id ? "chip-on" : "border-transparent text-ink-2 hover:text-accent",
                )}
              >
                <I width={15} height={15} />
                {label}
              </button>
            ))}
          </nav>
          {(tab === "today" || tab === "workout") && (
            <div className="cut cut-sm flex items-center border border-line bg-black/50 font-mono text-xs">
              <button aria-label="Previous day" className="grid h-8 w-8 place-items-center text-ink-2 hover:text-accent" onClick={() => setDate(addDays(date, -1))}>
                <IconChevron left width={16} height={16} />
              </button>
              <button className="min-w-24 px-1 py-1 font-bold uppercase tracking-[0.12em] text-accent" onClick={() => setDate(today)}>
                {isToday ? "Today" : formatDate(date, { weekday: "short", day: "numeric", month: "short" })}
              </button>
              <button
                aria-label="Next day"
                className="grid h-8 w-8 place-items-center text-ink-2 hover:text-accent disabled:opacity-25"
                disabled={isToday}
                onClick={() => setDate(addDays(date, 1))}
              >
                <IconChevron width={16} height={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 pb-36 pt-5 sm:px-6 md:pb-12">
        <div key={tab} className="animate-rise">
          {tab === "today" && <TodayView me={me} day={day} date={date} onAdd={setAddFor} reload={loadDay} notify={notify} />}
          {tab === "workout" && <WorkoutView me={me} day={day} date={date} reloadMe={loadMe} reloadDay={loadDay} notify={notify} />}
          {tab === "progress" && <ProgressView me={me} reloadMe={loadMe} notify={notify} />}
          {tab === "profile" && <ProfileView me={me} setMe={setMe} notify={notify} />}
        </div>
      </main>

      {/* Floating log button */}
      <button onClick={() => setAddFor("auto")} className="group fixed bottom-24 right-5 z-40 md:bottom-8 md:right-8" aria-label="Log food">
        <span aria-hidden className="animate-pulse-soft absolute inset-0 bg-accent/50 [clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))]" />
        <span className="cut relative flex h-14 items-center gap-2 border border-accent bg-accent px-5 font-display text-xs font-black uppercase tracking-[0.14em] text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition group-hover:bg-[#ff2a5c] group-active:scale-95">
          <IconCamera width={20} height={20} /> Log food
        </span>
      </button>

      {/* Mobile bottom nav */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-accent/40 bg-black/85 backdrop-blur-md md:hidden">
        {TABS.map(({ id, icon: I, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cx("relative flex flex-col items-center gap-1 py-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] transition", tab === id ? "text-accent text-glow" : "text-muted")}
          >
            {tab === id && <span className="absolute inset-x-6 top-0 h-0.5 bg-accent shadow-[0_0_10px_var(--accent)]" />}
            <I width={22} height={22} className={tab === id ? "drop-shadow-[0_0_6px_var(--accent)]" : ""} />
            {label}
          </button>
        ))}
      </nav>

      {addFor !== null && (
      <AddFoodSheet
        open
        initialMeal={addFor === "auto" ? null : addFor}
        date={date}
        onClose={() => setAddFor(null)}
        onSaved={() => {
          setAddFor(null);
          loadDay();
          notify("LOGGED ✓");
        }}
      />
      )}
      <Toast message={toast} />
    </div>
  );
}
