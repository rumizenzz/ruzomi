import { NextRequest, NextResponse } from "next/server";

import { COUNTRY_NAME_TO_CODE } from "@/lib/location-options";

export const dynamic = "force-dynamic";

type NominatimResult = {
  display_name: string;
  address?: {
    house_number?: string;
    road?: string;
    pedestrian?: string;
    footway?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    province?: string;
    region?: string;
    postcode?: string;
    country?: string;
  };
};

function buildAddressLine(result: NominatimResult) {
  const address = result.address ?? {};
  const street =
    address.road ??
    address.pedestrian ??
    address.footway ??
    address.neighbourhood ??
    address.suburb ??
    "";

  const line = [address.house_number, street].filter(Boolean).join(" ").trim();
  if (line) {
    return line;
  }

  return result.display_name.split(",")[0]?.trim() ?? "";
}

function mapSuggestion(result: NominatimResult) {
  const address = result.address ?? {};

  return {
    label: result.display_name,
    addressLine1: buildAddressLine(result),
    city:
      address.city ??
      address.town ??
      address.village ??
      address.municipality ??
      address.suburb ??
      "",
    region:
      address.state ??
      address.province ??
      address.region ??
      address.county ??
      "",
    postalCode: address.postcode ?? "",
    country: address.country ?? "",
  };
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const country = request.nextUrl.searchParams.get("country")?.trim() ?? "";
  const region = request.nextUrl.searchParams.get("region")?.trim() ?? "";
  const city = request.nextUrl.searchParams.get("city")?.trim() ?? "";
  const postalCode = request.nextUrl.searchParams.get("postalCode")?.trim() ?? "";

  if (query.length < 4) {
    return NextResponse.json({ suggestions: [] });
  }

  const endpoint = new URL("https://nominatim.openstreetmap.org/search");
  endpoint.searchParams.set("format", "jsonv2");
  endpoint.searchParams.set("addressdetails", "1");
  endpoint.searchParams.set("limit", "5");
  endpoint.searchParams.set(
    "q",
    [query, city, region, postalCode, country].filter(Boolean).join(", "),
  );

  const countryCode = COUNTRY_NAME_TO_CODE.get(country);
  if (countryCode) {
    endpoint.searchParams.set("countrycodes", countryCode.toLowerCase());
  }

  try {
    const response = await fetch(endpoint, {
      headers: {
        "accept-language": "en-US,en;q=0.9",
        "user-agent": "PayToCommit/1.0 address autocomplete",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ suggestions: [] }, { status: 200 });
    }

    const payload = (await response.json()) as NominatimResult[];
    const seen = new Set<string>();
    const suggestions = payload
      .map(mapSuggestion)
      .filter((suggestion) => {
        if (!suggestion.addressLine1 || seen.has(suggestion.label)) {
          return false;
        }

        seen.add(suggestion.label);
        return true;
      });

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] }, { status: 200 });
  }
}
