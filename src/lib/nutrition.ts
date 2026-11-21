// Pure calculation helpers — safe to import from client and server.

export type Sex = "male" | "female" | "other";
export type Goal = "lose" | "maintain" | "gain";
export type Activity = "sedentary" | "light" | "moderate" | "active" | "athlete";
export type Diet = "veg" | "eggitarian" | "nonveg" | "vegan";

export interface BodyStats {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  goal: Goal;
  activity: Activity;
  bodyFatPct?: number | null;
}

export interface Targets {
  targetKcal: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetFiber: number;
}

export const ACTIVITY_LABELS: Record<Activity, { label: string; hint: string; factor: number }> = {
  sedentary: { label: "Sedentary", hint: "Desk job, little exercise", factor: 1.2 },
  light: { label: "Light", hint: "1–3 workouts / week", factor: 1.375 },
  moderate: { label: "Moderate", hint: "3–5 workouts / week", factor: 1.55 },
  active: { label: "Active", hint: "6–7 workouts / week", factor: 1.725 },
  athlete: { label: "Athlete", hint: "Hard training twice a day", factor: 1.9 },
};

export const GOAL_LABELS: Record<Goal, string> = {
  lose: "🔥 Lose fat",
  maintain: "⚖️ Maintain",
  gain: "💪 Build muscle",
};

export const DIET_LABELS: Record<Diet, string> = {
  veg: "🥦 Vegetarian",
  eggitarian: "🥚 Eggitarian",
  nonveg: "🍗 Non-veg",
  vegan: "🌱 Vegan",
};

export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export function bmiCategory(v: number): string {
  if (v < 18.5) return "Underweight";
  if (v < 25) return "Normal";
  if (v < 30) return "Overweight";
  return "Obese";
}

/**
 * BMR: Katch-McArdle when a body-fat estimate is available (from the AI
 * physique analysis), otherwise Mifflin-St Jeor.
 */
export function bmr(s: BodyStats): number {
  if (s.bodyFatPct && s.bodyFatPct > 3 && s.bodyFatPct < 60) {
    const lbm = s.weightKg * (1 - s.bodyFatPct / 100);
    return 370 + 21.6 * lbm;
  }
  const base = 10 * s.weightKg + 6.25 * s.heightCm - 5 * s.age;
  if (s.sex === "male") return base + 5;
  if (s.sex === "female") return base - 161;
  return base - 78;
}

export function tdee(s: BodyStats): number {
  return bmr(s) * ACTIVITY_LABELS[s.activity].factor;
}

export function calcTargets(s: BodyStats): Targets {
  const maintenance = tdee(s);
  let kcal = maintenance;
  if (s.goal === "lose") kcal = Math.max(maintenance - 750, maintenance * 0.8);
  if (s.goal === "gain") kcal = maintenance + 300;
  const floor = s.sex === "female" ? 1200 : 1500;
  kcal = Math.max(floor, Math.round(kcal / 10) * 10);

  // Protein is anchored to lean mass when we know it; otherwise to body weight,
  // capped at the weight a BMI of 25 would give so it isn't inflated by fat mass.
  let proteinBase: number;
  if (s.bodyFatPct && s.bodyFatPct > 3 && s.bodyFatPct < 60) {
    const lbm = s.weightKg * (1 - s.bodyFatPct / 100);
    proteinBase = lbm * (s.goal === "maintain" ? 2.0 : 2.4);
  } else {
    const m = s.heightCm / 100;
    const refWeight = Math.min(s.weightKg, 25 * m * m);
    proteinBase = refWeight * (s.goal === "maintain" ? 1.6 : 2.0);
  }
  const protein = Math.round(proteinBase);

  const fat = Math.round(Math.max((kcal * 0.25) / 9, s.weightKg * 0.6));
  const carbs = Math.max(50, Math.round((kcal - protein * 4 - fat * 9) / 4));
  const fiber = Math.round((kcal / 1000) * 14);

  return {
    targetKcal: kcal,
    targetProtein: protein,
    targetCarbs: carbs,
    targetFat: fat,
    targetFiber: fiber,
  };
}

export interface Macros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export function sumMacros(items: Macros[]): Macros {
  return items.reduce(
    (a, b) => ({
      kcal: a.kcal + b.kcal,
      protein: a.protein + b.protein,
      carbs: a.carbs + b.carbs,
      fat: a.fat + b.fat,
      fiber: a.fiber + (b.fiber || 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
}

export const MEALS = ["breakfast", "lunch", "snack", "dinner"] as const;
export type Meal = (typeof MEALS)[number];

export const MEAL_LABELS: Record<Meal, string> = {
  breakfast: "🌅 Breakfast",
  lunch: "☀️ Lunch",
  snack: "🍵 Snack",
  dinner: "🌙 Dinner",
};

/** Guess the meal slot from the current local time. */
export function mealForNow(d: Date = new Date()): Meal {
  const h = d.getHours();
  if (h < 11) return "breakfast";
  if (h < 16) return "lunch";
  if (h < 19) return "snack";
  return "dinner";
}
