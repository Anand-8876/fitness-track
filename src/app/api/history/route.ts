import { requireUser } from "@/lib/auth";
import { json, route } from "@/lib/api";
import { addDays, DATE_RE, localDateStr } from "@/lib/dates";
import { prisma } from "@/lib/db";

/** Per-day totals for the last N days (default 30), ending at `end`. */
export const GET = route(async (req) => {
  const user = await requireUser();
  const url = new URL(req.url);
  const endParam = url.searchParams.get("end") ?? "";
  const end = DATE_RE.test(endParam) ? endParam : localDateStr();
  const days = Math.min(365, Math.max(1, Number(url.searchParams.get("days")) || 30));
  const start = addDays(end, -(days - 1));
  const range = { userId: user.id, date: { gte: start, lte: end } };

  const [food, water, workouts] = await Promise.all([
    prisma.foodEntry.groupBy({
      by: ["date"],
      where: range,
      _sum: { kcal: true, protein: true, carbs: true, fat: true, fiber: true },
    }),
    prisma.waterLog.findMany({ where: range }),
    prisma.workoutLog.findMany({ where: range }),
  ]);

  const out = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(start, i);
    const f = food.find((x) => x.date === date)?._sum;
    out.push({
      date,
      kcal: Math.round(f?.kcal ?? 0),
      protein: Math.round(f?.protein ?? 0),
      carbs: Math.round(f?.carbs ?? 0),
      fat: Math.round(f?.fat ?? 0),
      fiber: Math.round(f?.fiber ?? 0),
      water: water.find((x) => x.date === date)?.glasses ?? 0,
      workoutDone: workouts.find((x) => x.date === date)?.done ?? false,
    });
  }
  return json({ days: out });
});
