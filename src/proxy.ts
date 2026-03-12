import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { APP_SESSION_COOKIE } from "@/lib/session-constants";

const DOCS_HOSTS = new Set(["docs.paytocommit.com", "www.docs.paytocommit.com"]);
const RUZOMI_HOSTS = new Set(["ruzomi.com", "www.ruzomi.com"]);
const STATUS_HOSTS = new Set(["status.paytocommit.com", "www.status.paytocommit.com"]);
const DEVELOPER_HOSTS = new Set(["developers.paytocommit.com", "www.developers.paytocommit.com"]);
const PLATFORM_HOSTS = new Set(["platform.paytocommit.com", "www.platform.paytocommit.com"]);
const RUZOMI_PASSTHROUGH_PREFIXES = [
  "/ruzomi",
  "/login",
  "/signup",
  "/forgot-password",
  "/set-new-password",
  "/profiles",
  "/api",
  "/auth",
  "/quickstart",
  "/settings",
];

function withSessionCookie(request: NextRequest, response: NextResponse) {
  if (request.cookies.get(APP_SESSION_COOKIE)?.value) {
    return response;
  }

  response.cookies.set(APP_SESSION_COOKIE, crypto.randomUUID(), {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return response;
}

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.png" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return withSessionCookie(request, NextResponse.next());
  }

  if (RUZOMI_HOSTS.has(host) && !RUZOMI_PASSTHROUGH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = pathname === "/" ? "/ruzomi" : `/ruzomi${pathname}`;
    return withSessionCookie(request, NextResponse.rewrite(rewriteUrl));
  }

  if (STATUS_HOSTS.has(host) && !pathname.startsWith("/status")) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = pathname === "/" ? "/status" : `/status${pathname}`;
    return withSessionCookie(request, NextResponse.rewrite(rewriteUrl));
  }

  if ((DEVELOPER_HOSTS.has(host) || PLATFORM_HOSTS.has(host)) && !pathname.startsWith("/developers")) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = pathname === "/" ? "/developers" : `/developers${pathname}`;
    return withSessionCookie(request, NextResponse.rewrite(rewriteUrl));
  }

  if (!DOCS_HOSTS.has(host) || pathname.startsWith("/docs")) {
    return withSessionCookie(request, NextResponse.next());
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = pathname === "/" ? "/docs" : `/docs${pathname}`;
  return withSessionCookie(request, NextResponse.rewrite(rewriteUrl));
}

export const config = {
  matcher: ["/((?!.*\\.).*)"],
};
