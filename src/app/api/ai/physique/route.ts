import { HttpError, requireUser } from "@/lib/auth";
import { analyzePhysique } from "@/lib/ai";
import { json, route } from "@/lib/api";
import { prisma } from "@/lib/db";
import { calcTargets, type Activity, type Goal, type Sex } from "@/lib/nutrition";
import { readOwnedImage } from "@/lib/uploads";

/**
 * Analyses the most recent physique photos. A usable body-fat estimate feeds
 * back into the calorie/macro targets (Katch-McArdle BMR, lean-mass protein).
 */
export const POST = route(async () => {
  const user = await requireUser();
  const photos = await prisma.physiquePhoto.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 4,
  });
  if (!photos.length) throw new HttpError(400, "Upload a physique photo first");

  const p = await prisma.profile.findUniqueOrThrow({ where: { userId: user.id } });
  const images = await Promise.all(
    photos.map(async (ph) => ({ img: await readOwnedImage(user.id, ph.filePath), pose: ph.pose })),
  );
  const report = await analyzePhysique(images, p);

  const bodyFatPct = report.usable && report.body_fat_pct > 3 && report.body_fat_pct < 60 ? report.body_fat_pct : p.bodyFatPct;
  const targets = calcTargets({
    ...p,
    bodyFatPct,
    sex: p.sex as Sex,
    goal: p.goal as Goal,
    activity: p.activity as Activity,
  });
  await prisma.profile.update({
    where: { userId: user.id },
    data: {
      bodyFatPct,
      physiqueReport: JSON.stringify({ ...report, analyzedAt: new Date().toISOString() }),
      ...targets,
    },
  });
  return json({ report });
});
