import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { HttpError } from "./auth";

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

/** Wraps a route handler so thrown HttpErrors / ZodErrors become JSON responses. */
export function route<C = unknown>(fn: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof HttpError) {
        return NextResponse.json({ error: e.message }, { status: e.status });
      }
      if (e instanceof ZodError) {
        const msg = e.issues.map((i) => `${i.path.join(".") || "input"}: ${i.message}`).join("; ");
        return NextResponse.json({ error: msg }, { status: 400 });
      }
      console.error(e);
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
  };
}

export const json = NextResponse.json;
