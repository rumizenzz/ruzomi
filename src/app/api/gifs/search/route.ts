import { getServerEnv, hasTenorServerEnv } from "@/lib/env";
import { searchCuratedGifs, type GifSearchResult } from "@/lib/gif-catalog";

type TenorMediaFormat = {
  url?: string;
  gif?: { url?: string };
  mediumgif?: { url?: string };
  tinygif?: { url?: string };
};

type TenorResult = {
  id?: string;
  content_description?: string;
  media_formats?: TenorMediaFormat;
  tags?: string[];
};

function mapTenorResult(result: TenorResult): GifSearchResult | null {
  const media = result.media_formats;
  const previewUrl = media?.gif?.url ?? media?.mediumgif?.url ?? media?.tinygif?.url ?? media?.url;
  if (!result.id || !previewUrl) {
    return null;
  }

  return {
    id: `tenor-${result.id}`,
    title: result.content_description || "GIF",
    previewUrl,
    tags: result.tags ?? [],
    source: "tenor",
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim();

  if (!query) {
    return Response.json({ gifs: searchCuratedGifs("") });
  }

  if (!hasTenorServerEnv()) {
    return Response.json({ gifs: searchCuratedGifs(query) });
  }

  try {
    const env = getServerEnv();
    const searchUrl = new URL("https://tenor.googleapis.com/v2/search");
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("key", env.tenorApiKey);
    searchUrl.searchParams.set("client_key", env.tenorClientKey);
    searchUrl.searchParams.set("limit", "12");
    searchUrl.searchParams.set("media_filter", "gif,mediumgif,tinygif");

    const response = await fetch(searchUrl, {
      headers: {
        accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return Response.json({ gifs: searchCuratedGifs(query) });
    }

    const json = (await response.json()) as { results?: TenorResult[] };
    const gifs = (json.results ?? []).map(mapTenorResult).filter((result): result is GifSearchResult => Boolean(result));

    return Response.json({
      gifs: gifs.length ? gifs : searchCuratedGifs(query),
    });
  } catch {
    return Response.json({ gifs: searchCuratedGifs(query) });
  }
}
