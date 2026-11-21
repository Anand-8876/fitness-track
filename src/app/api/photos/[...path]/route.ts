import { HttpError, requireUser } from "@/lib/auth";
import { route } from "@/lib/api";
import { readOwnedImage } from "@/lib/uploads";

type Ctx = { params: Promise<{ path: string[] }> };

/** Serves an uploaded image, only to the user who owns it. */
export const GET = route<Ctx>(async (_req, { params }) => {
  const user = await requireUser();
  const rel = (await params).path.join("/");
  try {
    const { bytes, mimeType } = await readOwnedImage(user.id, rel);
    return new Response(new Uint8Array(bytes), {
      headers: { "Content-Type": mimeType, "Cache-Control": "private, max-age=31536000, immutable" },
    });
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(404, "Not found");
  }
});
