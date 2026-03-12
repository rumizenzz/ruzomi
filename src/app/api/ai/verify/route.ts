import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { submitAiProofReview } from "@/lib/paytocommit-data";
import { getAuthenticatedSupabaseUser, toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      ticketId?: string;
      proofSummary?: string;
      proofLinks?: string[];
    };

    if (!body.ticketId || !body.proofSummary?.trim()) {
      return NextResponse.json({ error: "ticketId and proofSummary are required." }, { status: 400 });
    }

    const viewer = await getAuthenticatedSupabaseUser();
    if (!viewer) {
      return NextResponse.json({ error: "Log in or sign up to verify proof." }, { status: 401 });
    }

    const sessionToken = toAuthenticatedAppSessionToken(viewer.id);
    return NextResponse.json({
      verification: await submitAiProofReview(sessionToken, {
        ticketId: body.ticketId,
        proofSummary: body.proofSummary.trim(),
        proofLinks: body.proofLinks ?? [],
      }),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to verify proof." },
      { status: 400 },
    );
  }
}
