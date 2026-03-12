import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getGalactusLockedPayload } from "@/lib/galactus-access";
import { confirmAiMarketDraft, getGenerationEligibilityStateForSession } from "@/lib/paytocommit-data";
import { getAuthenticatedSupabaseUser, toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { draftId?: string };
    const viewer = await getAuthenticatedSupabaseUser();

    if (!body.draftId) {
      return NextResponse.json({ error: "draftId is required." }, { status: 400 });
    }

    const sessionToken = viewer ? toAuthenticatedAppSessionToken(viewer.id) : null;
    const generationEligibilityState = await getGenerationEligibilityStateForSession(sessionToken);

    if (generationEligibilityState.eligibility !== "unlocked") {
      const locked = getGalactusLockedPayload(generationEligibilityState, "generate", "/app?mode=generate");
      return NextResponse.json(
        {
          ...locked.payload,
          generationEligibility: generationEligibilityState.eligibility,
          generationEligibilityState,
        },
        { status: locked.status },
      );
    }

    return NextResponse.json({
      pool: await confirmAiMarketDraft(toAuthenticatedAppSessionToken(viewer!.id), body.draftId),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to open market." },
      { status: 400 },
    );
  }
}
