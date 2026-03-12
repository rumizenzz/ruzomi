import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { rerunAiAppeal } from "@/lib/paytocommit-data";
import { getAuthenticatedSupabaseUser, toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      ticketId?: string;
      appealReason?: string;
    };

    if (!body.ticketId || !body.appealReason?.trim()) {
      return NextResponse.json({ error: "ticketId and appealReason are required." }, { status: 400 });
    }

    const viewer = await getAuthenticatedSupabaseUser();
    if (!viewer) {
      return NextResponse.json({ error: "Log in or sign up to rerun an appeal." }, { status: 401 });
    }

    const sessionToken = toAuthenticatedAppSessionToken(viewer.id);
    return NextResponse.json({
      appeal: await rerunAiAppeal(sessionToken, {
        ticketId: body.ticketId,
        appealReason: body.appealReason.trim(),
      }),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to rerun appeal." },
      { status: 400 },
    );
  }
}
