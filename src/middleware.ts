import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const cookie = req.cookies.get("bk_user")?.value;
  const pathname = req.nextUrl.pathname;

  const publicRoutes = ["/admin/login", "/admin/register"];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  if (!cookie) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const user = JSON.parse(cookie);

  if (user.role === "ADMIN") {
    if (
      pathname.startsWith("/admin/users") ||
      pathname.startsWith("/admin/pending")
    ) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  if (user.role === "VIEWER") {
    if (pathname !== "/admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};