import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const geoHeader =
    request.headers.get("x-country") ??
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("x-nf-geo-country");

  return Response.json({
    country: geoHeader ?? "US",
    source: geoHeader ? "edge-header" : "default",
  });
}
