import { NextResponse } from "next/server";

import { getWalletState } from "@/lib/paytocommit-data";
import { getAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

export async function GET() {
  const sessionToken = await getAuthenticatedAppSessionToken();
  return NextResponse.json(await getWalletState(sessionToken));
}
