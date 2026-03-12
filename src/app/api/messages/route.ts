import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createSparkMessage, getOrCreateAppUser, listSparkFeed, markPoolMessagesRead } from "@/lib/paytocommit-data";
import { getAuthenticatedSupabaseUser, toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const poolSlug = searchParams.get("poolSlug") ?? undefined;
  const markRead = searchParams.get("markRead") === "1";
  const viewer = await getAuthenticatedSupabaseUser();
  const sessionToken = viewer ? toAuthenticatedAppSessionToken(viewer.id) : null;

  if (sessionToken) {
    await getOrCreateAppUser(sessionToken);
  }

  if (poolSlug && markRead && sessionToken) {
    await markPoolMessagesRead(sessionToken, poolSlug);
  }

  return NextResponse.json({
    messages: await listSparkFeed(sessionToken, poolSlug),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      poolSlug?: string | null;
      body?: string;
      tenorGifUrl?: string | null;
      messageType?: "message" | "market_idea";
      pollQuestion?: string | null;
      pollOptions?: string[];
    };

    if (!body.body?.trim() && !body.tenorGifUrl) {
      return NextResponse.json({ error: "Add a message or GIF." }, { status: 400 });
    }

    const viewer = await getAuthenticatedSupabaseUser();
    if (!viewer) {
      return NextResponse.json({ error: "Log in or sign up to post in Spark." }, { status: 401 });
    }

    const sessionToken = toAuthenticatedAppSessionToken(viewer.id);
    await getOrCreateAppUser(sessionToken);
    const messages = await createSparkMessage(sessionToken, {
      poolSlug: body.poolSlug,
      body: body.body?.trim() ?? "",
      tenorGifUrl: body.tenorGifUrl ?? null,
      messageType: body.messageType ?? "message",
      pollQuestion: body.pollQuestion ?? null,
      pollOptions: body.pollOptions ?? [],
    });

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to publish message." },
      { status: 400 },
    );
  }
}
