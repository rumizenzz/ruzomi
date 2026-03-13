import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { APP_SESSION_COOKIE } from "@/lib/session-constants";

const DOCS_HOSTS = new Set(["docs.paytocommit.com", "www.docs.paytocommit.com", "docs.localhost"]);
const RUZOMI_HOSTS = new Set(["ruzomi.com", "www.ruzomi.com", "ruzomi.localhost"]);
const STATUS_HOSTS = new Set(["status.paytocommit.com", "www.status.paytocommit.com", "status.localhost"]);
const DEVELOPER_HOSTS = new Set([
  "developers.paytocommit.com",
  "www.developers.paytocommit.com",
  "developers.localhost",
]);
const PLATFORM_HOSTS = new Set([
  "platform.paytocommit.com",
  "www.platform.paytocommit.com",
  "platform.localhost",
]);
const PRIMARY_HOSTS = new Set(["paytocommit.com", "www.paytocommit.com", "localhost"]);
const RUZOMI_NETLIFY_SUFFIX = "ruzomi.netlify.app";
const HOSTED_DEVELOPER_PASSTHROUGH_PREFIXES = ["/api", "/auth", "/__developers", "/__platform"];
const SPECIAL_HOST_PASSTHROUGH_PREFIXES = [
  "/api",
  "/app",
  "/auth",
  "/chains",
  "/contact",
  "/developers",
  "/docs",
  "/faqs",
  "/faq",
  "/fees",
  "/forgot-password",
  "/help-center",
  "/leaderboard",
  "/legal",
  "/login",
  "/mobile",
  "/pools",
  "/privacy",
  "/profiles",
  "/quickstart",
  "/reliability",
  "/ruzomi",
  "/sales",
  "/security",
  "/settings",
  "/signup",
  "/spark",
  "/status",
  "/terms",
];

function normalizeHost(host: string | null | undefined) {
  return (host ?? "")
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "");
}

function isRuzomiHost(host: string) {
  return RUZOMI_HOSTS.has(host) || host === RUZOMI_NETLIFY_SUFFIX || host.endsWith(`--${RUZOMI_NETLIFY_SUFFIX}`);
}

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
  const host = normalizeHost(request.headers.get("host"));
  const { pathname } = request.nextUrl;

  if (
    process.env.NODE_ENV === "production" &&
    PRIMARY_HOSTS.has(host) &&
    pathname.startsWith("/ruzomi")
  ) {
    const redirectUrl = request.nextUrl.clone();
    const strippedPath = pathname.slice("/ruzomi".length) || "/";
    redirectUrl.host = "ruzomi.com";
    redirectUrl.protocol = "https:";
    redirectUrl.pathname = strippedPath.startsWith("/") ? strippedPath : `/${strippedPath}`;
    return withSessionCookie(request, NextResponse.redirect(redirectUrl, 308));
  }

  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.png" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return withSessionCookie(request, NextResponse.next());
  }

  if (DEVELOPER_HOSTS.has(host) || PLATFORM_HOSTS.has(host)) {
    const passthrough = HOSTED_DEVELOPER_PASSTHROUGH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    if (passthrough) {
      return withSessionCookie(request, NextResponse.next());
    }

    const rewriteUrl = request.nextUrl.clone();
    const internalPrefix = PLATFORM_HOSTS.has(host) ? "/__platform" : "/__developers";
    rewriteUrl.pathname = pathname === "/" ? internalPrefix : `${internalPrefix}${pathname}`;
    return withSessionCookie(request, NextResponse.rewrite(rewriteUrl));
  }

  const isSpecialHost =
    DOCS_HOSTS.has(host) ||
    isRuzomiHost(host) ||
    STATUS_HOSTS.has(host) ||
    DEVELOPER_HOSTS.has(host) ||
    PLATFORM_HOSTS.has(host);
  const allowPassthrough = SPECIAL_HOST_PASSTHROUGH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isSpecialHost && allowPassthrough) {
    return withSessionCookie(request, NextResponse.next());
  }

  if (isRuzomiHost(host) && !pathname.startsWith("/ruzomi")) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = pathname === "/" ? "/ruzomi" : `/ruzomi${pathname}`;
    return withSessionCookie(request, NextResponse.rewrite(rewriteUrl));
  }

  if (STATUS_HOSTS.has(host) && !pathname.startsWith("/status")) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = pathname === "/" ? "/status" : `/status${pathname}`;
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
