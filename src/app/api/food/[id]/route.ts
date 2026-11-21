import { z } from "zod";
import { HttpError, requireUser } from "@/lib/auth";
import { json, route } from "@/lib/api";
import { prisma } from "@/lib/db";
import { MEALS } from "@/lib/nutrition";
import { FoodInput } from "@/lib/schemas";

type Ctx = { params: Promise<{ id: string }> };

async function owned(userId: string, id: string) {
  const entry = await prisma.foodEntry.findUnique({ where: { id } });
  if (!entry || entry.userId !== userId) throw new HttpError(404, "Not found");
  return entry;
}

export const PATCH = route<Ctx>(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  await owned(user.id, id);
  const data = FoodInput.partial().extend({ meal: z.enum(MEALS).optional() }).parse(await req.json());
  const entry = await prisma.foodEntry.update({ where: { id }, data });
  return json({ entry });
});

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  await owned(user.id, id);
  await prisma.foodEntry.delete({ where: { id } });
  return json({ ok: true });
});
