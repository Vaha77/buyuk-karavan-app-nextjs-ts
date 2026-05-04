import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const isLoggedIn = req.cookies.get("bk_user");
  const pathname = req.nextUrl.pathname;

  const publicAdminRoutes = ["/admin/login", "/admin/register"];

  if (publicAdminRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};