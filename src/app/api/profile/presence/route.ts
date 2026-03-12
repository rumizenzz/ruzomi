import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getOrCreateAppUser, updatePublicPresence } from "@/lib/paytocommit-data";
import { getAuthenticatedSupabaseUser, toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";
import type { PresenceStatus } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      status?: PresenceStatus;
      customActivityText?: string | null;
      expiresAt?: string | null;
    };

    if (!body.status) {
      return NextResponse.json({ error: "status is required." }, { status: 400 });
    }

    const viewer = await getAuthenticatedSupabaseUser();
    if (!viewer) {
      return NextResponse.json({ error: "Log in or sign up to update your status." }, { status: 401 });
    }

    const sessionToken = toAuthenticatedAppSessionToken(viewer.id);
    await getOrCreateAppUser(sessionToken);

    return NextResponse.json(await updatePublicPresence(sessionToken, {
        status: body.status,
        customActivityText: body.customActivityText ?? null,
        expiresAt: body.expiresAt ?? null,
      }));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update presence." },
      { status: 400 },
    );
  }
}
