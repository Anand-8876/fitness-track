import { z } from "zod";
import { createSession, hashPassword, HttpError } from "@/lib/auth";
import { json, route } from "@/lib/api";
import { prisma } from "@/lib/db";
import { calcTargets } from "@/lib/nutrition";
import { assertImage, saveImage } from "@/lib/uploads";
import { defaultPlan } from "@/lib/workouts";

const SignupSchema = z.object({
  name: z.string().trim().min(1, "required").max(60),
  email: z.string().trim().toLowerCase().email("invalid email"),
  password: z.string().min(8, "must be at least 8 characters").max(200),
  sex: z.enum(["male", "female", "other"]),
  age: z.coerce.number().int().min(13).max(100),
  heightCm: z.coerce.number().min(100).max(250),
  weightKg: z.coerce.number().min(30).max(300),
  goal: z.enum(["lose", "maintain", "gain"]),
  activity: z.enum(["sedentary", "light", "moderate", "active", "athlete"]),
  diet: z.enum(["veg", "eggitarian", "nonveg", "vegan"]),
  routine: z.enum(["gym", "cardio", "both"]),
});

const POSES = ["front", "side", "back", "other"];

export const POST = route(async (req) => {
  const form = await req.formData();
  const data = SignupSchema.parse(Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")));

  const photos = form.getAll("photos");
  const poses = form.getAll("poses").map(String);
  if (photos.length > 4) throw new HttpError(400, "Up to 4 physique photos");
  photos.forEach(assertImage);

  if (await prisma.user.findUnique({ where: { email: data.email } })) {
    throw new HttpError(409, "An account with this email already exists");
  }

  const { name, email, password, routine, ...stats } = data;
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      profile: { create: { ...stats, ...calcTargets(stats) } },
      workoutPlan: { create: { split: JSON.stringify(defaultPlan(routine)) } },
    },
  });

  for (const [i, file] of (photos as File[]).entries()) {
    const saved = await saveImage(user.id, "physique", file);
    await prisma.physiquePhoto.create({
      data: {
        userId: user.id,
        pose: POSES.includes(poses[i]) ? poses[i] : "other",
        filePath: saved.relPath,
        mimeType: saved.mimeType,
      },
    });
  }

  await createSession(user.id);
  return json({ ok: true, hasPhotos: photos.length > 0 });
});
