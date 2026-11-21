import { HttpError, requireUser } from "@/lib/auth";
import { json, route } from "@/lib/api";
import { DATE_RE } from "@/lib/dates";
import { prisma } from "@/lib/db";

/** Everything logged on one date: food, water and workout status. */
export const GET = route(async (req) => {
  const user = await requireUser();
  const date = new URL(req.url).searchParams.get("date") ?? "";
  if (!DATE_RE.test(date)) throw new HttpError(400, "date must be YYYY-MM-DD");

  const [entries, water, workout] = await Promise.all([
    prisma.foodEntry.findMany({ where: { userId: user.id, date }, orderBy: { createdAt: "asc" } }),
    prisma.waterLog.findUnique({ where: { userId_date: { userId: user.id, date } } }),
    prisma.workoutLog.findUnique({ where: { userId_date: { userId: user.id, date } } }),
  ]);
  return json({
    date,
    entries: entries.map((e) => ({ ...e, photoUrl: e.photoPath ? `/api/photos/${e.photoPath}` : null })),
    water: water?.glasses ?? 0,
    workoutDone: workout?.done ?? false,
    workoutNotes: workout?.notes ?? "",
  });
});
