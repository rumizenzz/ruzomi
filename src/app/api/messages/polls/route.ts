import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getOrCreateAppUser, voteSparkPoll } from "@/lib/paytocommit-data";
import { getAuthenticatedSupabaseUser, toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      messageId?: string;
      optionId?: string;
    };

    if (!body.messageId || !body.optionId) {
      return NextResponse.json({ error: "messageId and optionId are required." }, { status: 400 });
    }

    const viewer = await getAuthenticatedSupabaseUser();
    if (!viewer) {
      return NextResponse.json({ error: "Log in or sign up to vote in Spark." }, { status: 401 });
    }

    const sessionToken = toAuthenticatedAppSessionToken(viewer.id);
    await getOrCreateAppUser(sessionToken);

    return NextResponse.json(await voteSparkPoll(sessionToken, {
        messageId: body.messageId,
        optionId: body.optionId,
      }));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to record poll vote." },
      { status: 400 },
    );
  }
}
