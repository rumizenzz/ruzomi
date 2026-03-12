import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { APP_SESSION_COOKIE } from "@/lib/session-constants";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function readRequestSession(request: NextRequest) {
  return request.cookies.get(APP_SESSION_COOKIE)?.value ?? null;
}

export function ensureRequestSession(request: NextRequest) {
  const existing = readRequestSession(request);
  return {
    sessionToken: existing ?? crypto.randomUUID(),
    isNew: !existing,
  };
}

export function withRequestSession(
  request: NextRequest,
  response: NextResponse,
  sessionToken: string | null | undefined,
) {
  if (!sessionToken || readRequestSession(request) === sessionToken) {
    return response;
  }

  response.cookies.set(APP_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    maxAge: ONE_YEAR_SECONDS,
    path: "/",
  });

  return response;
}
