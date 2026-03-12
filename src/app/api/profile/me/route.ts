import { NextResponse } from "next/server";

import { getOrCreateAppUser, getPublicProfile } from "@/lib/paytocommit-data";
import { toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is unavailable." }, { status: 500 });
  }

  const {
    data: { user: viewer },
  } = await supabase.auth.getUser();

  if (!viewer) {
    return NextResponse.json({ error: "Log in or sign up to view your Spark profile." }, { status: 401 });
  }

  const sessionToken = toAuthenticatedAppSessionToken(viewer.id);
  const appUser = await getOrCreateAppUser(sessionToken);

  if (!appUser) {
    return NextResponse.json({ error: "Unable to load your Spark profile." }, { status: 500 });
  }

  return NextResponse.json({
    profile: await getPublicProfile(appUser.handle),
  });
}
