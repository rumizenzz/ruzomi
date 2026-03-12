import { NextResponse } from "next/server";

import { getStatusSnapshot } from "@/lib/status-data";

export async function GET() {
  return NextResponse.json(getStatusSnapshot(), {
    headers: {
      "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
