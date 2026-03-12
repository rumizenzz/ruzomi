import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { importAiMarketDraft } from "@/lib/paytocommit-data";
import { getAuthenticatedSupabaseUser, toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";
import type { AiMarketDraft } from "@/lib/types";

function isDraftPayload(value: unknown): value is AiMarketDraft {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as Partial<AiMarketDraft>;
  return Boolean(
    draft.prompt &&
      draft.title &&
      draft.category &&
      draft.summary &&
      draft.targetGoal &&
      draft.proofMode &&
      draft.ruleset &&
      Array.isArray(draft.ruleset.rules) &&
      Array.isArray(draft.ruleset.invalidationCases) &&
      Array.isArray(draft.ruleset.proofChecklist),
  );
}

export async function POST(request: NextRequest) {
  const viewer = await getAuthenticatedSupabaseUser();

  if (!viewer) {
    return NextResponse.json({ error: "Creation session unavailable." }, { status: 401 });
  }

  const body = (await request.json()) as { draft?: unknown };

  if (!isDraftPayload(body.draft)) {
    return NextResponse.json({ error: "draft is required." }, { status: 400 });
  }

  const sessionToken = toAuthenticatedAppSessionToken(viewer.id);

  return NextResponse.json({
    draft: await importAiMarketDraft(sessionToken, body.draft),
  });
}
