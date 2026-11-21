import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { suggestMeals } from "@/lib/ai";
import { json, route } from "@/lib/api";
import { DATE_RE } from "@/lib/dates";
import { prisma } from "@/lib/db";
import { MEALS, sumMacros } from "@/lib/nutrition";

const Schema = z.object({ date: z.string().regex(DATE_RE), meal: z.enum(MEALS) });

/** Meal ideas that fit what's left of today's macros. */
export const POST = route(async (req) => {
  const user = await requireUser();
  const { date, meal } = Schema.parse(await req.json());
  const [p, entries] = await Promise.all([
    prisma.profile.findUniqueOrThrow({ where: { userId: user.id } }),
    prisma.foodEntry.findMany({ where: { userId: user.id, date } }),
  ]);
  const eaten = sumMacros(entries);
  const result = await suggestMeals({
    diet: p.diet,
    meal,
    remaining: {
      kcal: Math.max(0, p.targetKcal - eaten.kcal),
      protein: Math.max(0, p.targetProtein - eaten.protein),
      carbs: Math.max(0, p.targetCarbs - eaten.carbs),
      fat: Math.max(0, p.targetFat - eaten.fat),
    },
    eatenToday: entries.map((e) => e.name),
  });
  return json(result);
});
