import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getWalletAccountForSession } from "@/lib/paytocommit-data";
import type { NotifyMeSubscription } from "@/lib/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedSupabaseUser, toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

async function getViewerAndClient() {
  const authUser = await getAuthenticatedSupabaseUser();
  if (!authUser) {
    return { admin: null, viewer: null as Awaited<ReturnType<typeof getWalletAccountForSession>>["viewer"] };
  }

  const sessionToken = toAuthenticatedAppSessionToken(authUser.id);
  const { viewer } = await getWalletAccountForSession(sessionToken);
  return {
    admin: createSupabaseAdminClient(),
    viewer,
  };
}

async function getPoolIdBySlug(admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>, poolSlug: string) {
  const { data, error } = await admin
    .from("commitment_pools")
    .select("id")
    .eq("slug", poolSlug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id ?? null;
}

function normalizeSubscription(input: {
  poolSlug: string;
  active: boolean;
  channels: string[] | null;
  events: string[] | null;
  updatedAt?: string | null;
}): NotifyMeSubscription {
  return {
    poolSlug: input.poolSlug,
    active: input.active,
    channels: (input.channels ?? ["push", "email", "in_app"]) as NotifyMeSubscription["channels"],
    events: (input.events ?? ["market_open", "join_closing_soon", "last_call", "schedule_change"]) as NotifyMeSubscription["events"],
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const poolSlug = request.nextUrl.searchParams.get("poolSlug");
  if (!poolSlug) {
    return NextResponse.json({ error: "poolSlug is required." }, { status: 400 });
  }

  const { admin, viewer } = await getViewerAndClient();
  if (!admin || !viewer) {
    return NextResponse.json({
      subscription: null,
      requiresAuth: true,
    });
  }

  const poolId = await getPoolIdBySlug(admin, poolSlug);
  if (!poolId) {
    return NextResponse.json({ error: "Market not found." }, { status: 404 });
  }

  const { data, error } = await admin
    .from("market_watch_subscriptions")
    .select("active, channels, events, updated_at")
    .eq("app_user_id", viewer.id)
    .eq("pool_id", poolId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    subscription: data
      ? normalizeSubscription({
          poolSlug,
          active: data.active,
          channels: data.channels,
          events: data.events,
          updatedAt: data.updated_at,
        })
      : null,
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { poolSlug?: string };
  if (!body.poolSlug) {
    return NextResponse.json({ error: "poolSlug is required." }, { status: 400 });
  }

  const { admin, viewer } = await getViewerAndClient();
  if (!admin || !viewer) {
    return NextResponse.json({ error: "Log in or sign up to save market reminders." }, { status: 401 });
  }

  const poolId = await getPoolIdBySlug(admin, body.poolSlug);
  if (!poolId) {
    return NextResponse.json({ error: "Market not found." }, { status: 404 });
  }

  const updatedAt = new Date().toISOString();
  const payload = {
    app_user_id: viewer.id,
    pool_id: poolId,
    active: true,
    channels: ["push", "email", "in_app"],
    events: ["market_open", "join_closing_soon", "last_call", "schedule_change"],
    updated_at: updatedAt,
  };

  const { error } = await admin.from("market_watch_subscriptions").upsert(payload, {
    onConflict: "app_user_id,pool_id",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    subscription: normalizeSubscription({
      poolSlug: body.poolSlug,
      active: true,
      channels: payload.channels,
      events: payload.events,
      updatedAt,
    }),
  });
}

export async function DELETE(request: NextRequest) {
  const body = (await request.json()) as { poolSlug?: string };
  if (!body.poolSlug) {
    return NextResponse.json({ error: "poolSlug is required." }, { status: 400 });
  }

  const { admin, viewer } = await getViewerAndClient();
  if (!admin || !viewer) {
    return NextResponse.json({ error: "Log in or sign up to manage market reminders." }, { status: 401 });
  }

  const poolId = await getPoolIdBySlug(admin, body.poolSlug);
  if (!poolId) {
    return NextResponse.json({ error: "Market not found." }, { status: 404 });
  }

  const { error } = await admin
    .from("market_watch_subscriptions")
    .delete()
    .eq("app_user_id", viewer.id)
    .eq("pool_id", poolId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
