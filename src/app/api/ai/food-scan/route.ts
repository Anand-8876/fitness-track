import { requireUser } from "@/lib/auth";
import { analyzeFoodPhoto } from "@/lib/ai";
import { json, route } from "@/lib/api";
import { saveImage } from "@/lib/uploads";

/**
 * Multipart `image` (+ optional `hint`). Stores the photo and returns Claude's
 * itemised estimate. Nothing is logged until the user confirms via POST /api/food.
 */
export const POST = route(async (req) => {
  const user = await requireUser();
  const form = await req.formData();
  const saved = await saveImage(user.id, "food", form.get("image") as File);
  const hint = String(form.get("hint") ?? "").slice(0, 300);
  const analysis = await analyzeFoodPhoto({ bytes: saved.bytes, mimeType: saved.mimeType }, hint);
  return json({ analysis, photoPath: saved.relPath, photoUrl: `/api/photos/${saved.relPath}` });
});
