import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getOrCreateAppUser, toggleSparkReaction } from "@/lib/paytocommit-data";
import { normalizeSparkReaction } from "@/lib/spark-reactions";
import { getAuthenticatedSupabaseUser, toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";
import type { SparkReactionName } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      targetType?: "message" | "reply";
      targetId?: string;
      reaction?: SparkReactionName;
    };

    const normalizedReaction = normalizeSparkReaction(body.reaction);

    if (!body.targetType || !body.targetId || !normalizedReaction) {
      return NextResponse.json({ error: "targetType, targetId, and reaction are required." }, { status: 400 });
    }

    const viewer = await getAuthenticatedSupabaseUser();
    if (!viewer) {
      return NextResponse.json({ error: "Log in or sign up to react in Spark." }, { status: 401 });
    }

    const sessionToken = toAuthenticatedAppSessionToken(viewer.id);
    await getOrCreateAppUser(sessionToken);

    return NextResponse.json(await toggleSparkReaction(sessionToken, {
        targetType: body.targetType,
        targetId: body.targetId,
        reaction: normalizedReaction,
      }));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update reaction." },
      { status: 400 },
    );
  }
}
