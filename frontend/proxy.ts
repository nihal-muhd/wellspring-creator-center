import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ACCESS_TOKEN_COOKIE_NAME = "access_token";

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME);

  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "returnTo",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/programs/:path*", "/audit-logs/:path*"],
};
