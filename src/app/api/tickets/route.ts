import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { placePoolTicket } from "@/lib/paytocommit-data";
import { getAuthenticatedSupabaseUser, toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { poolSlug?: string; stakeCents?: number };

    if (!body.poolSlug || !body.stakeCents) {
      return NextResponse.json({ error: "poolSlug and stakeCents are required." }, { status: 400 });
    }

    const viewer = await getAuthenticatedSupabaseUser();
    if (!viewer) {
      return NextResponse.json({ error: "Log in or sign up to commit to this market." }, { status: 401 });
    }

    const sessionToken = toAuthenticatedAppSessionToken(viewer.id);
    const { walletState, postStakeNotifyPrompt } = await placePoolTicket(sessionToken, body.poolSlug, body.stakeCents);
    return NextResponse.json({ walletState, postStakeNotifyPrompt });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to place ticket." },
      { status: 400 },
    );
  }
}
