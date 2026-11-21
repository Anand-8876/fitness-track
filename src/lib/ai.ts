import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { HttpError } from "./auth";
import type { ImageType } from "./uploads";

const MODEL = "claude-opus-5";

let _client: Anthropic | null = null;
function client() {
  // The SDK reads ANTHROPIC_API_KEY (or an `ant auth login` profile) itself.
  _client ??= new Anthropic();
  return _client;
}

type Img = { bytes: Buffer; mimeType: ImageType };
type Effort = "low" | "medium" | "high";

/**
 * One structured-output call. `fallbacks: "default"` lets the API re-route to
 * another model server-side if the primary one declines the request.
 */
async function structured<T extends z.ZodType>(opts: {
  schema: T;
  system: string;
  images?: Img[];
  text: string;
  effort: Effort;
}): Promise<z.infer<T>> {
  const content: Anthropic.Beta.BetaContentBlockParam[] = [
    ...(opts.images ?? []).map(
      (img): Anthropic.Beta.BetaImageBlockParam => ({
        type: "image",
        source: { type: "base64", media_type: img.mimeType, data: img.bytes.toString("base64") },
      }),
    ),
    { type: "text", text: opts.text },
  ];

  let res;
  try {
    res = await client().beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: opts.system,
      messages: [{ role: "user", content }],
      output_config: { effort: opts.effort, format: betaZodOutputFormat(opts.schema) },
    });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) {
      throw new HttpError(503, "AI is not configured — set ANTHROPIC_API_KEY in .env");
    }
    if (e instanceof Anthropic.RateLimitError) {
      throw new HttpError(429, "AI is busy right now, try again in a moment");
    }
    if (e instanceof Anthropic.APIConnectionError) {
      throw new HttpError(503, "Couldn't reach the AI service");
    }
    if (e instanceof Anthropic.APIError) {
      console.error("Anthropic API error", e.status, e.message);
      throw new HttpError(502, "AI request failed");
    }
    if (e instanceof Error && /api key|apiKey|authentication/i.test(e.message)) {
      throw new HttpError(503, "AI is not configured — set ANTHROPIC_API_KEY in .env");
    }
    throw e;
  }

  if (res.stop_reason === "refusal") {
    throw new HttpError(422, "The AI couldn't analyze this request");
  }
  if (!res.parsed_output) {
    throw new HttpError(502, "The AI returned an unreadable answer, please try again");
  }
  return res.parsed_output;
}

// ─── Food recognition ─────────────────────────────────────────────────────

const FoodItem = z.object({
  name: z.string().describe("Specific dish or food name, e.g. 'Paneer butter masala'"),
  portion: z.string().describe("Human-friendly portion, e.g. '1 katori (150 g)' or '2 medium rotis'"),
  grams: z.number().describe("Estimated edible weight in grams"),
  kcal: z.number(),
  protein_g: z.number(),
  carbs_g: z.number(),
  fat_g: z.number(),
  fiber_g: z.number(),
  confidence: z.enum(["high", "medium", "low"]),
});

export const FoodAnalysis = z.object({
  is_food: z.boolean().describe("False if the input contains no identifiable food or drink"),
  meal_name: z.string().describe("Short title for the whole meal"),
  items: z.array(FoodItem),
  notes: z
    .string()
    .describe("One or two short sentences: assumptions made (oil, portion) and anything the user should double-check"),
});
export type FoodAnalysis = z.infer<typeof FoodAnalysis>;

const FOOD_SYSTEM = `You are a precise sports nutritionist who estimates the nutrition of meals, with deep knowledge of Indian home, restaurant and street food as well as global cuisine.

How to estimate:
- List each distinct food separately (e.g. roti, dal, sabzi, rice, raita, salad) so the user can edit them individually.
- Estimate portion size from visual cues: plate/katori/glass size, cutlery, hands, packaging. State the portion in familiar units plus grams.
- Account for hidden cooking fats: tadka, ghee on roti, butter in gravies, deep frying. Restaurant dishes usually carry more oil than home cooking.
- Base values on IFCT 2017 (Indian Food Composition Tables) and USDA data. Make kcal consistent with macros (≈ 4·protein + 4·carbs + 9·fat, within ~10%).
- If the user gives a hint (quantity, brand, how it was cooked), trust it over what you see.
- Round sensibly: kcal to the nearest 5, macros to one decimal.
- Mark confidence "low" when the dish or portion is ambiguous.
- If there is no food, set is_food=false and return an empty items list.`;

function round(items: FoodAnalysis["items"]) {
  return items.map((i) => ({
    ...i,
    grams: Math.max(0, Math.round(i.grams)),
    kcal: Math.max(0, Math.round(i.kcal)),
    protein_g: Math.max(0, Math.round(i.protein_g * 10) / 10),
    carbs_g: Math.max(0, Math.round(i.carbs_g * 10) / 10),
    fat_g: Math.max(0, Math.round(i.fat_g * 10) / 10),
    fiber_g: Math.max(0, Math.round(i.fiber_g * 10) / 10),
  }));
}

export async function analyzeFoodPhoto(image: Img, hint?: string): Promise<FoodAnalysis> {
  const out = await structured({
    schema: FoodAnalysis,
    system: FOOD_SYSTEM,
    images: [image],
    text: hint?.trim()
      ? `Identify the food in this photo and estimate its nutrition. User's note: "${hint.trim()}"`
      : "Identify the food in this photo and estimate its nutrition.",
    effort: "medium",
  });
  return { ...out, items: round(out.items) };
}

export async function analyzeFoodText(description: string): Promise<FoodAnalysis> {
  const out = await structured({
    schema: FoodAnalysis,
    system: FOOD_SYSTEM,
    text: `Estimate the nutrition of what I ate: "${description.trim()}"`,
    effort: "medium",
  });
  return { ...out, items: round(out.items) };
}

// ─── Physique analysis ────────────────────────────────────────────────────

export const PhysiqueAnalysis = z.object({
  usable: z
    .boolean()
    .describe("False if the photos don't show enough of the body to assess (too dark, cropped, clothed)"),
  body_fat_pct: z.number().describe("Best single estimate of body-fat percentage"),
  body_fat_low: z.number(),
  body_fat_high: z.number(),
  build: z.string().describe("A few neutral words, e.g. 'lean with moderate muscle mass'"),
  summary: z.string().describe("2–3 encouraging, specific sentences about the current starting point"),
  strengths: z.array(z.string()).describe("2–4 short points"),
  focus_areas: z.array(z.string()).describe("2–4 short, actionable training focus points"),
  suggested_goal: z.enum(["lose", "maintain", "gain"]),
  goal_reason: z.string().describe("One sentence on why that goal fits"),
});
export type PhysiqueAnalysis = z.infer<typeof PhysiqueAnalysis>;

const PHYSIQUE_SYSTEM = `You are an experienced, supportive strength coach helping a client set up their fitness plan from progress photos they chose to share.

- Estimate body-fat percentage visually using standard reference charts, and give an honest range (usually ±3–4 points).
- Be objective and encouraging. Describe the body neutrally — never shame, never comment on attractiveness.
- Use the stated age, sex, height, weight and goal as context.
- Focus areas should be practical (e.g. "add upper-back volume for posture", "prioritise protein and a modest deficit").
- This is a visual estimate for planning, not a medical assessment.
- If the photos aren't usable, set usable=false, use 0 for the numbers, and explain in the summary what photo would work (full body, good light, fitted clothing).`;

export async function analyzePhysique(
  images: { img: Img; pose: string }[],
  stats: { sex: string; age: number; heightCm: number; weightKg: number; goal: string },
): Promise<PhysiqueAnalysis> {
  const poses = images.map((p, i) => `Photo ${i + 1}: ${p.pose}`).join(", ");
  return structured({
    schema: PhysiqueAnalysis,
    system: PHYSIQUE_SYSTEM,
    images: images.map((p) => p.img),
    text: `${poses}.\nClient: ${stats.sex}, ${stats.age} years, ${stats.heightCm} cm, ${stats.weightKg} kg. Stated goal: ${stats.goal}.\nAssess the current physique.`,
    effort: "high",
  });
}

// ─── Meal suggestions ─────────────────────────────────────────────────────

export const MealSuggestions = z.object({
  suggestions: z.array(
    z.object({
      name: z.string(),
      description: z.string().describe("Ingredients and quantities in one line"),
      kcal: z.number(),
      protein_g: z.number(),
      carbs_g: z.number(),
      fat_g: z.number(),
      why: z.string().describe("Why it fits the remaining macros, in under 15 words"),
    }),
  ),
});
export type MealSuggestions = z.infer<typeof MealSuggestions>;

export async function suggestMeals(input: {
  diet: string;
  meal: string;
  remaining: { kcal: number; protein: number; carbs: number; fat: number };
  eatenToday: string[];
}): Promise<MealSuggestions> {
  const r = input.remaining;
  return structured({
    schema: MealSuggestions,
    system:
      "You are a practical nutrition coach. Suggest realistic, easy-to-cook meals — mostly Indian home-style — with accurate macros (IFCT/USDA based). Respect the diet strictly: veg = no meat, fish or egg; eggitarian = veg + eggs; vegan = no animal products; nonveg = anything.",
    text: `Diet: ${input.diet}. Next meal: ${input.meal}.
Remaining for today: ${Math.round(r.kcal)} kcal, ${Math.round(r.protein)} g protein, ${Math.round(r.carbs)} g carbs, ${Math.round(r.fat)} g fat.
Already eaten today: ${input.eatenToday.length ? input.eatenToday.join(", ") : "nothing yet"}.
Give 3 varied options for this meal that help close the gap (prioritise protein), sized for one meal, not the whole remainder unless it is dinner.`,
    effort: "low",
  });
}
