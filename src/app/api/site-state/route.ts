import { NextResponse } from "next/server";

import { getSiteState } from "@/lib/paytocommit-data";
import { getAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

export async function GET() {
  const sessionToken = await getAuthenticatedAppSessionToken();
  return NextResponse.json(await getSiteState(sessionToken));
}
