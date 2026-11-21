import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { analyzeFoodText } from "@/lib/ai";
import { json, route } from "@/lib/api";

const Schema = z.object({ text: z.string().trim().min(2).max(500) });

/** Free-text logging: "2 rotis, a bowl of dal and some curd" → itemised macros. */
export const POST = route(async (req) => {
  await requireUser();
  const { text } = Schema.parse(await req.json());
  return json({ analysis: await analyzeFoodText(text) });
});
