import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { releasePoolTicket } from "@/lib/paytocommit-data";
import { getAuthenticatedSupabaseUser, toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ ticketId: string }> },
) {
  try {
    const { ticketId } = await context.params;

    if (!ticketId) {
      return NextResponse.json({ error: "ticketId is required." }, { status: 400 });
    }

    const viewer = await getAuthenticatedSupabaseUser();
    if (!viewer) {
      return NextResponse.json({ error: "Log in or sign up to manage this ticket." }, { status: 401 });
    }

    const sessionToken = toAuthenticatedAppSessionToken(viewer.id);
    const walletState = await releasePoolTicket(sessionToken, ticketId);
    return NextResponse.json({ walletState });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to record Early Release." },
      { status: 400 },
    );
  }
}
