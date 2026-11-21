// Workout library carried over from the original app.

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export type Day = (typeof DAYS)[number];

export type DayPlan =
  | { type: "rest" }
  | { type: "gym"; split: string }
  | { type: "cardio"; cardioType: string; cardioGoal: number };

export type WeekPlan = Record<Day, DayPlan>;

export const GYM_SPLITS: Record<string, { tag: string; exs: string[] }> = {
  "Push Day": {
    tag: "Chest · Shoulders · Triceps",
    exs: ["Barbell Bench Press 4×8", "Incline DB Press 3×10", "Cable Flyes 3×12", "Overhead Press 3×10", "Tricep Rope Pushdown 3×15", "Lateral Raises 3×15"],
  },
  "Pull Day": {
    tag: "Back · Biceps · Rear Delts",
    exs: ["Lat Pulldowns 4×10", "Bent-over Row 4×8", "Seated Cable Row 3×12", "Face Pulls 3×15", "Barbell Curl 3×12", "Hammer Curls 3×12"],
  },
  "Leg Day": {
    tag: "Quads · Hamstrings · Glutes",
    exs: ["Barbell Squat 4×8", "Romanian Deadlift 3×10", "Leg Press 3×12", "Leg Curl 3×12", "Walking Lunges 3×12", "Calf Raises 4×20"],
  },
  "Upper Body": {
    tag: "Push + Pull Combined",
    exs: ["DB Bench Press 3×10", "Bent-over Row 3×10", "Overhead Press 3×10", "Lat Pulldown 3×10", "Lateral Raises 3×15", "Bicep Curls 3×12"],
  },
  "Lower Body": {
    tag: "Squat + Hinge Pattern",
    exs: ["Goblet Squat 4×10", "Romanian Deadlift 3×10", "Leg Press 3×12", "Leg Curl 3×12", "Bulgarian Split Squat 3×10", "Calf Raises 3×20"],
  },
  "Full Body": {
    tag: "Compound Full Body",
    exs: ["Deadlift 3×5", "Bench Press 3×8", "Pull-ups 3×8", "Overhead Press 3×10", "Lunges 3×10", "Plank 3×45s"],
  },
  "Chest & Triceps": {
    tag: "Chest Focus + Triceps",
    exs: ["Flat Bench Press 4×8", "Incline Flyes 3×12", "Cable Crossover 3×15", "Skull Crushers 3×10", "Tricep Dips 3×12", "Close-grip Bench 3×10"],
  },
  "Back & Biceps": {
    tag: "Back Width + Thickness",
    exs: ["Pull-ups 4×8", "DB Row 4×10", "Cable Pullover 3×12", "Preacher Curl 3×12", "Incline DB Curl 3×12", "Reverse Curl 3×12"],
  },
  "Shoulders & Arms": {
    tag: "Delts · Bis · Tris",
    exs: ["Overhead Press 4×8", "Lateral Raises 4×12", "Rear Delt Flyes 3×15", "Barbell Curl 3×10", "Tricep Pushdown 3×12", "Face Pulls 3×15"],
  },
  "Core & Abs": {
    tag: "Core Strength & Stability",
    exs: ["Hanging Leg Raises 4×15", "Cable Crunch 3×20", "Ab Wheel Rollout 3×10", "Russian Twists 3×30", "Plank 3×60s", "Side Plank 3×40s each"],
  },
};

export const CARDIO: Record<string, { icon: string; unit: string; def: number; desc: (g: number) => string }> = {
  "Steps Goal": { icon: "🚶", unit: "steps", def: 10000, desc: (g) => `Walk or run ${g.toLocaleString()} steps` },
  "HIIT Sprints": { icon: "🏃", unit: "rounds", def: 10, desc: (g) => `${g} × (30 s sprint + 60 s jog)` },
  "Steady Jog": { icon: "🏃", unit: "min", def: 45, desc: (g) => `Steady jog for ${g} min at 65–70% max HR` },
  Cycling: { icon: "🚴", unit: "min", def: 45, desc: (g) => `${g} min cycling at a moderate pace` },
  "Jump Rope": { icon: "🪢", unit: "rounds", def: 5, desc: (g) => `${g} rounds of 3 min rope + 1 min rest` },
  Swimming: { icon: "🏊", unit: "min", def: 30, desc: (g) => `${g} min of continuous laps` },
  Elliptical: { icon: "🔄", unit: "min", def: 40, desc: (g) => `${g} min on the elliptical, resistance 7+` },
};

export function defaultPlan(routine: "gym" | "cardio" | "both"): WeekPlan {
  const gym = ["Push Day", "Pull Day", "Leg Day", "Upper Body", "Lower Body"];
  const active = [0, 1, 3, 4, 5]; // Wed + Sun rest
  const plan = {} as WeekPlan;
  DAYS.forEach((d, i) => {
    const slot = active.indexOf(i);
    if (slot < 0) plan[d] = { type: "rest" };
    else if (routine === "gym") plan[d] = { type: "gym", split: gym[slot] };
    else if (routine === "cardio")
      plan[d] = slot % 2 ? { type: "cardio", cardioType: "HIIT Sprints", cardioGoal: 10 } : { type: "cardio", cardioType: "Steps Goal", cardioGoal: 10000 };
    else
      plan[d] = slot % 2 ? { type: "cardio", cardioType: "HIIT Sprints", cardioGoal: 10 } : { type: "gym", split: ["Push Day", "Pull Day", "Leg Day"][slot / 2] };
  });
  return plan;
}

export function describeDay(p: DayPlan): { title: string; subtitle: string; items: string[] } {
  if (p.type === "gym") {
    const s = GYM_SPLITS[p.split];
    return { title: p.split, subtitle: s?.tag ?? "Gym", items: s?.exs ?? [] };
  }
  if (p.type === "cardio") {
    const c = CARDIO[p.cardioType] ?? CARDIO["Steps Goal"];
    return { title: `${c.icon} ${p.cardioType}`, subtitle: "Cardio", items: [c.desc(p.cardioGoal)] };
  }
  return { title: "Rest day", subtitle: "Recover", items: ["Stretch, walk, hydrate and sleep well."] };
}
