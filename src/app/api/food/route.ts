import { z } from "zod";
import { HttpError, requireUser } from "@/lib/auth";
import { json, route } from "@/lib/api";
import { DATE_RE } from "@/lib/dates";
import { prisma } from "@/lib/db";
import { MEALS } from "@/lib/nutrition";
import { FoodInput } from "@/lib/schemas";

const CreateSchema = z.object({
  date: z.string().regex(DATE_RE),
  meal: z.enum(MEALS),
  source: z.enum(["photo", "text", "manual"]),
  photoPath: z.string().max(300).nullish(),
  items: z.array(FoodInput).min(1).max(30),
});

/** Adds one or more food items to a meal. */
export const POST = route(async (req) => {
  const user = await requireUser();
  const { items, photoPath, ...rest } = CreateSchema.parse(await req.json());
  if (photoPath && !photoPath.startsWith(`${user.id}/food/`)) throw new HttpError(400, "Invalid photo");

  await prisma.foodEntry.createMany({
    data: items.map((i) => ({ ...i, ...rest, photoPath: photoPath ?? null, userId: user.id })),
  });
  return json({ ok: true });
});
