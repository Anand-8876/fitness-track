import { destroyCurrentSession } from "@/lib/auth";
import { json, route } from "@/lib/api";

export const POST = route(async () => {
  await destroyCurrentSession();
  return json({ ok: true });
});
