import "server-only";
import { createHash, randomBytes } from "crypto";
import { cookies, headers } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

export const SESSION_COOKIE = "ft_session";
const SESSION_DAYS = 90;
const TOUCH_INTERVAL_MS = 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 12);
}

export async function verifyPassword(pw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pw, hash);
}

async function setSessionCookie(token: string, expires: Date) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

/** Creates a new DB-backed session and sets the cookie. Call from route handlers only. */
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000);
  const h = await headers();
  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
      userAgent: h.get("user-agent")?.slice(0, 300) ?? null,
      ip: (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip"))?.trim() ?? null,
    },
  });
  await setSessionCookie(token, expiresAt);
}

/**
 * Returns the current session + user, or null. Sessions slide: once a day the
 * expiry is pushed forward, so active users stay signed in indefinitely.
 */
export async function getSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
  if (!session || session.revokedAt || session.expiresAt < new Date()) return null;

  if (Date.now() - session.lastUsedAt.getTime() > TOUCH_INTERVAL_MS) {
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000);
    await prisma.session.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date(), expiresAt },
    });
    // Cookies can't be written while rendering a Server Component; the DB
    // expiry is still extended and the cookie is refreshed on the next API call.
    try {
      await setSessionCookie(token, expiresAt);
    } catch {}
  }
  return session;
}

export async function getCurrentUser() {
  return (await getSession())?.user ?? null;
}

export async function destroyCurrentSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.updateMany({
      where: { tokenHash: hashToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  store.delete(SESSION_COOKIE);
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** For route handlers: returns the user or throws a 401. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "Not signed in");
  return user;
}
