import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { draftAutonomousMarket, MarketPromptRejectedError } from "@/lib/autonomous-ai";
import { getGalactusLockedPayload } from "@/lib/galactus-access";
import {
  createAiMarketDraft,
  getGenerationEligibilityStateForSession,
  getLatestAiMarketDrafts,
} from "@/lib/paytocommit-data";
import { getAuthenticatedSupabaseUser, toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

export async function GET() {
  const viewer = await getAuthenticatedSupabaseUser();
  const sessionToken = viewer ? toAuthenticatedAppSessionToken(viewer.id) : null;
  const generationEligibilityState = await getGenerationEligibilityStateForSession(sessionToken);

  return NextResponse.json({
    drafts: viewer && sessionToken ? await getLatestAiMarketDrafts(sessionToken) : [],
    generationEligibility: generationEligibilityState.eligibility,
    generationEligibilityState,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { prompt?: string };
    const viewer = await getAuthenticatedSupabaseUser();

    if (!body.prompt?.trim()) {
      return NextResponse.json({ error: "prompt is required." }, { status: 400 });
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

    const authenticatedSessionToken = toAuthenticatedAppSessionToken(viewer!.id);
    const generationEligibility = generationEligibilityState.eligibility;

    try {
      return NextResponse.json({
        draft: await createAiMarketDraft(authenticatedSessionToken, body.prompt.trim()),
        generationEligibility,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Creation session unavailable.") {
        const draft = await draftAutonomousMarket(body.prompt.trim());

        return NextResponse.json({
          draft,
          generationEligibility,
        });
      }

      throw error;
    }
  } catch (error) {
    if (error instanceof MarketPromptRejectedError) {
      return NextResponse.json(
        {
          error: error.decision.reason?.body ?? "That request cannot open here.",
          decision: error.decision,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to draft market." },
      { status: 400 },
    );
  }
}
