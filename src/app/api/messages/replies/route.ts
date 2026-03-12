import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createSparkReply, getOrCreateAppUser } from "@/lib/paytocommit-data";
import { getAuthenticatedSupabaseUser, toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      messageId?: string;
      body?: string;
      tenorGifUrl?: string | null;
    };

    if (!body.messageId) {
      return NextResponse.json({ error: "messageId is required." }, { status: 400 });
    }

    if (!body.body?.trim() && !body.tenorGifUrl) {
      return NextResponse.json({ error: "Add a reply or GIF." }, { status: 400 });
    }

    const viewer = await getAuthenticatedSupabaseUser();
    if (!viewer) {
      return NextResponse.json({ error: "Log in or sign up to reply in Spark." }, { status: 401 });
    }

    const sessionToken = toAuthenticatedAppSessionToken(viewer.id);
    await getOrCreateAppUser(sessionToken);

    return NextResponse.json({
      messages: await createSparkReply(sessionToken, {
        messageId: body.messageId,
        body: body.body?.trim() ?? "",
        tenorGifUrl: body.tenorGifUrl ?? null,
      }),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to post reply." },
      { status: 400 },
    );
  }
}
