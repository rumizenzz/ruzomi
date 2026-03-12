import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function getNextPath(rawNext: string | null) {
  if (!rawNext || !rawNext.startsWith("/")) {
    return "/app";
  }

  return rawNext;
}

function buildRedirectPath(basePath: string, nextPath: string, extras?: Record<string, string>) {
  const params = new URLSearchParams();

  if (nextPath.startsWith("/")) {
    params.set("next", nextPath);
  }

  for (const [key, value] of Object.entries(extras ?? {})) {
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const recoveryType = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const nextPath = getNextPath(requestUrl.searchParams.get("next"));
  const returnTo = getNextPath(requestUrl.searchParams.get("returnTo"));
  const supabase = await createSupabaseServerClient();

  if (code && recoveryType === "recovery" && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL(buildRedirectPath("/set-new-password", returnTo, { status: "expired" }), requestUrl.origin),
      );
    }

    return NextResponse.redirect(new URL(buildRedirectPath("/set-new-password", returnTo), requestUrl.origin));
  }

  if (code && supabase) {
    await supabase.auth.exchangeCodeForSession(code);
    return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
  }

  if (tokenHash && recoveryType === "recovery" && supabase) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: recoveryType,
    });

    if (error) {
      return NextResponse.redirect(
        new URL(buildRedirectPath("/set-new-password", returnTo, { status: "expired" }), requestUrl.origin),
      );
    }

    return NextResponse.redirect(new URL(buildRedirectPath("/set-new-password", returnTo), requestUrl.origin));
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
