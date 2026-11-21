import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PAGES = ["/welcome", "/login", "/signup"];

// Optimistic check only (cookie present). The real session lookup happens
// server-side in pages and API routes.
export function proxy(req: NextRequest) {
  const hasSession = req.cookies.has("ft_session");
  if (!hasSession && !PUBLIC_PAGES.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/welcome", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\.(?:png|jpg|svg|ico|webmanifest)$).*)"],
};
