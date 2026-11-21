import { HttpError, requireUser } from "@/lib/auth";
import { json, route } from "@/lib/api";
import { prisma } from "@/lib/db";
import { saveImage } from "@/lib/uploads";

const POSES = ["front", "side", "back", "other"];

/** Upload new physique photos (multipart: photos[], poses[]). */
export const POST = route(async (req) => {
  const user = await requireUser();
  const form = await req.formData();
  const photos = form.getAll("photos");
  const poses = form.getAll("poses").map(String);
  if (!photos.length || photos.length > 4) throw new HttpError(400, "Upload 1–4 photos");

  for (const [i, file] of photos.entries()) {
    const saved = await saveImage(user.id, "physique", file as File);
    await prisma.physiquePhoto.create({
      data: {
        userId: user.id,
        pose: POSES.includes(poses[i]) ? poses[i] : "other",
        filePath: saved.relPath,
        mimeType: saved.mimeType,
      },
    });
  }
  return json({ ok: true });
});
