import { NextResponse } from "next/server";

import { getWalletState } from "@/lib/paytocommit-data";
import { toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is unavailable." }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Log in or sign up to view wallet state." }, { status: 401 });
  }

  const sessionToken = toAuthenticatedAppSessionToken(user.id);
  return NextResponse.json(await getWalletState(sessionToken));
}
