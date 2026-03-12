import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getChainBySlug, listChains, placeChainTicket } from "@/lib/paytocommit-data";
import { getAuthenticatedSupabaseUser, toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const chain = await getChainBySlug(slug);
    if (!chain) {
      return NextResponse.json({ error: "Chain not found" }, { status: 404 });
    }
    return NextResponse.json({ chain });
  }

  return NextResponse.json({ chains: await listChains() });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { chainSlug?: string; stakeCents?: number };
    if (!body.chainSlug || !body.stakeCents) {
      return NextResponse.json({ error: "chainSlug and stakeCents are required." }, { status: 400 });
    }

    const viewer = await getAuthenticatedSupabaseUser();
    if (!viewer) {
      return NextResponse.json({ error: "Log in or sign up to join this Chain." }, { status: 401 });
    }

    const sessionToken = toAuthenticatedAppSessionToken(viewer.id);
    const walletState = await placeChainTicket(sessionToken, body.chainSlug, body.stakeCents);
    return NextResponse.json({ walletState });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to join Chain." },
      { status: 400 },
    );
  }
}
