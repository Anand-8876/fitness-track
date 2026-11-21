import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { json, route } from "@/lib/api";
import { DATE_RE } from "@/lib/dates";
import { prisma } from "@/lib/db";
import { calcTargets, type Activity, type Goal, type Sex } from "@/lib/nutrition";

export const GET = route(async () => {
  const user = await requireUser();
  const logs = await prisma.weightLog.findMany({ where: { userId: user.id }, orderBy: { date: "asc" } });
  return json({ logs: logs.map((l) => ({ date: l.date, weightKg: l.weightKg })) });
});

const Schema = z.object({ date: z.string().regex(DATE_RE), weightKg: z.number().min(30).max(300) });

/** Logs a weigh-in and, if it's the latest one, updates the profile weight and targets. */
export const POST = route(async (req) => {
  const user = await requireUser();
  const { date, weightKg } = Schema.parse(await req.json());
  await prisma.weightLog.upsert({
    where: { userId_date: { userId: user.id, date } },
    create: { userId: user.id, date, weightKg },
    update: { weightKg },
  });

  const latest = await prisma.weightLog.findFirst({ where: { userId: user.id }, orderBy: { date: "desc" } });
  if (latest?.date === date) {
    const p = await prisma.profile.findUniqueOrThrow({ where: { userId: user.id } });
    const targets = calcTargets({
      ...p,
      weightKg,
      sex: p.sex as Sex,
      goal: p.goal as Goal,
      activity: p.activity as Activity,
    });
    await prisma.profile.update({ where: { userId: user.id }, data: { weightKg, ...targets } });
  }
  return json({ ok: true });
});
