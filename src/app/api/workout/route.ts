import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { json, route } from "@/lib/api";
import { DATE_RE } from "@/lib/dates";
import { prisma } from "@/lib/db";
import { CARDIO, DAYS, GYM_SPLITS } from "@/lib/workouts";

const DayPlan = z.discriminatedUnion("type", [
  z.object({ type: z.literal("rest") }),
  z.object({ type: z.literal("gym"), split: z.string().refine((s) => s in GYM_SPLITS, "unknown split") }),
  z.object({
    type: z.literal("cardio"),
    cardioType: z.string().refine((s) => s in CARDIO, "unknown cardio"),
    cardioGoal: z.number().int().min(1).max(100000),
  }),
]);

const Schema = z.union([
  z.object({ plan: z.object(Object.fromEntries(DAYS.map((d) => [d, DayPlan])) as Record<(typeof DAYS)[number], typeof DayPlan>) }),
  z.object({ date: z.string().regex(DATE_RE), done: z.boolean(), notes: z.string().max(500).optional() }),
]);

/** Saves either the weekly plan (`{plan}`) or a day's completion (`{date, done}`). */
export const PUT = route(async (req) => {
  const user = await requireUser();
  const body = Schema.parse(await req.json());
  if ("plan" in body) {
    const split = JSON.stringify(body.plan);
    await prisma.workoutPlan.upsert({ where: { userId: user.id }, create: { userId: user.id, split }, update: { split } });
  } else {
    const { date, done, notes } = body;
    await prisma.workoutLog.upsert({
      where: { userId_date: { userId: user.id, date } },
      create: { userId: user.id, date, done, notes },
      update: { done, notes },
    });
  }
  return json({ ok: true });
});
