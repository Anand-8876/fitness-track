import { getSession, HttpError } from "@/lib/auth";
import { json, route } from "@/lib/api";
import { prisma } from "@/lib/db";

async function current() {
  const s = await getSession();
  if (!s) throw new HttpError(401, "Not signed in");
  return s;
}

/** Every sign-in for this account, newest first. */
export const GET = route(async () => {
  const s = await current();
  const sessions = await prisma.session.findMany({
    where: { userId: s.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, userAgent: true, ip: true, createdAt: true, lastUsedAt: true, expiresAt: true, revokedAt: true },
  });
  const now = new Date();
  return json({
    sessions: sessions.map((x) => ({
      ...x,
      current: x.id === s.id,
      active: !x.revokedAt && x.expiresAt > now,
    })),
  });
});

/** Sign out: `?id=<sessionId>` for one device, or `?others=1` for every device except this one. */
export const DELETE = route(async (req) => {
  const s = await current();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const where = url.searchParams.get("others")
    ? { userId: s.userId, id: { not: s.id } }
    : id
      ? { userId: s.userId, id }
      : null;
  if (!where) throw new HttpError(400, "Pass id or others=1");
  await prisma.session.updateMany({ where: { ...where, revokedAt: null }, data: { revokedAt: new Date() } });
  return json({ ok: true });
});
