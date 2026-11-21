import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { json, route } from "@/lib/api";
import { DATE_RE } from "@/lib/dates";
import { prisma } from "@/lib/db";

const Schema = z.object({ date: z.string().regex(DATE_RE), glasses: z.number().int().min(0).max(30) });

export const PUT = route(async (req) => {
  const user = await requireUser();
  const { date, glasses } = Schema.parse(await req.json());
  await prisma.waterLog.upsert({
    where: { userId_date: { userId: user.id, date } },
    create: { userId: user.id, date, glasses },
    update: { glasses },
  });
  return json({ ok: true });
});
