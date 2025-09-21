import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// Auth logic removed for UI-only build phase.

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  // UI build mode: always allow admin routes without any auth or redirect
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
