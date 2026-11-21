import { hashSync } from "bcryptjs";
import { z } from "zod";
import { createSession, HttpError, verifyPassword } from "@/lib/auth";
import { json, route } from "@/lib/api";
import { prisma } from "@/lib/db";

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const DUMMY_HASH = hashSync("timing-equaliser", 12);

export const POST = route(async (req) => {
  const { email, password } = LoginSchema.parse(await req.json());
  const user = await prisma.user.findUnique({ where: { email } });
  // Compare even when the user is missing so timing doesn't reveal which emails exist.
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) throw new HttpError(401, "Wrong email or password");
  await createSession(user.id);
  return json({ ok: true });
});
