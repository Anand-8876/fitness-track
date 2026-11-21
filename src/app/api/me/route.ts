import { z } from "zod";
import { HttpError, requireUser } from "@/lib/auth";
import { json, route } from "@/lib/api";
import { prisma } from "@/lib/db";
import { calcTargets, type Activity, type Goal, type Sex } from "@/lib/nutrition";

async function loadMe(userId: string) {
  const [user, profile, plan, photos] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { id: true, name: true, email: true, createdAt: true } }),
    prisma.profile.findUnique({ where: { userId } }),
    prisma.workoutPlan.findUnique({ where: { userId } }),
    prisma.physiquePhoto.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  ]);
  if (!profile) throw new HttpError(404, "Profile missing");
  return {
    user,
    profile: { ...profile, physiqueReport: profile.physiqueReport ? JSON.parse(profile.physiqueReport) : null },
    plan: plan ? JSON.parse(plan.split) : null,
    photos: photos.map((p) => ({ id: p.id, pose: p.pose, createdAt: p.createdAt, url: `/api/photos/${p.filePath}` })),
  };
}

export const GET = route(async () => {
  const user = await requireUser();
  return json(await loadMe(user.id));
});

const PatchSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  sex: z.enum(["male", "female", "other"]).optional(),
  age: z.number().int().min(13).max(100).optional(),
  heightCm: z.number().min(100).max(250).optional(),
  weightKg: z.number().min(30).max(300).optional(),
  goal: z.enum(["lose", "maintain", "gain"]).optional(),
  activity: z.enum(["sedentary", "light", "moderate", "active", "athlete"]).optional(),
  diet: z.enum(["veg", "eggitarian", "nonveg", "vegan"]).optional(),
  waterGoal: z.number().int().min(1).max(20).optional(),
  // When present, these override the calculated targets.
  targets: z
    .object({
      targetKcal: z.number().int().min(800).max(8000),
      targetProtein: z.number().int().min(0).max(500),
      targetCarbs: z.number().int().min(0).max(1000),
      targetFat: z.number().int().min(0).max(400),
      targetFiber: z.number().int().min(0).max(150),
    })
    .optional(),
});

export const PATCH = route(async (req) => {
  const user = await requireUser();
  const { name, targets, ...stats } = PatchSchema.parse(await req.json());
  if (name) await prisma.user.update({ where: { id: user.id }, data: { name } });

  const cur = await prisma.profile.findUniqueOrThrow({ where: { userId: user.id } });
  const next = { ...cur, ...stats };
  await prisma.profile.update({
    where: { userId: user.id },
    data: {
      ...stats,
      ...(targets ??
        calcTargets({
          ...next,
          sex: next.sex as Sex,
          goal: next.goal as Goal,
          activity: next.activity as Activity,
        })),
    },
  });
  return json(await loadMe(user.id));
});
