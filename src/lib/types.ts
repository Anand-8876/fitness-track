// Shapes returned by the API, shared by client components.

export interface Profile {
  sex: string;
  age: number;
  heightCm: number;
  weightKg: number;
  goal: "lose" | "maintain" | "gain";
  activity: "sedentary" | "light" | "moderate" | "active" | "athlete";
  diet: "veg" | "eggitarian" | "nonveg" | "vegan";
  targetKcal: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetFiber: number;
  waterGoal: number;
  bodyFatPct: number | null;
  physiqueReport: PhysiqueReport | null;
}

export interface PhysiqueReport {
  usable: boolean;
  body_fat_pct: number;
  body_fat_low: number;
  body_fat_high: number;
  build: string;
  summary: string;
  strengths: string[];
  focus_areas: string[];
  suggested_goal: "lose" | "maintain" | "gain";
  goal_reason: string;
  analyzedAt?: string;
}

export interface Me {
  user: { id: string; name: string; email: string; createdAt: string };
  profile: Profile;
  plan: import("./workouts").WeekPlan | null;
  photos: { id: string; pose: string; createdAt: string; url: string }[];
}

export interface FoodEntry {
  id: string;
  date: string;
  meal: "breakfast" | "lunch" | "snack" | "dinner";
  name: string;
  portion: string | null;
  grams: number | null;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  source: string;
  photoUrl: string | null;
}

export interface DayData {
  date: string;
  entries: FoodEntry[];
  water: number;
  workoutDone: boolean;
}

export interface AiFoodItem {
  name: string;
  portion: string;
  grams: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  confidence: "high" | "medium" | "low";
}

export interface AiFoodAnalysis {
  is_food: boolean;
  meal_name: string;
  items: AiFoodItem[];
  notes: string;
}
