import type { Metadata } from "next";
import { headers } from "next/headers";

import { DeveloperPortalShell } from "@/components/developer-portal-shell";
import {
  developerPortalPages,
  getDeveloperPortalPageBySlug,
  getDeveloperPortalPath,
} from "@/lib/developer-platform-content";
import { getGalactusAccessState } from "@/lib/galactus-access";
import { getGenerationEligibilityStateForSession } from "@/lib/paytocommit-data";
import { getAuthenticatedAppSessionToken, getAuthenticatedSupabaseUser } from "@/lib/supabase/authenticated-user";

export function getDeveloperHostMode(host: string): "path" | "developers" | "platform" {
  if (host === "developers.paytocommit.com" || host === "www.developers.paytocommit.com") {
    return "developers";
  }
  if (host === "platform.paytocommit.com" || host === "www.platform.paytocommit.com") {
    return "platform";
  }
  return "path";
}

function getResolvedDeveloperSlug(slug: string[], hostMode: "path" | "developers" | "platform") {
  if (slug.length === 0 && hostMode === "platform") {
    return ["platform-dashboard"];
  }

  return slug;
}

export async function getDeveloperPortalMetadata(slug: string[]): Promise<Metadata> {
  const host = (await headers()).get("host") ?? "";
  const hostMode = getDeveloperHostMode(host);
  const resolvedSlug = getResolvedDeveloperSlug(slug, hostMode);
  const page = getDeveloperPortalPageBySlug(resolvedSlug);
  const baseUrl =
    hostMode === "platform"
      ? "https://platform.paytocommit.com"
      : hostMode === "developers"
        ? "https://developers.paytocommit.com"
        : "https://paytocommit.com";
  const path = getDeveloperPortalPath(slug, hostMode);

  return {
    title: hostMode === "platform" ? `${page.title} | Platform` : page.title,
    description: page.summary,
    alternates: {
      canonical: `${baseUrl}${path}`,
    },
    openGraph: {
      title: page.title,
      description: page.summary,
      url: `${baseUrl}${path}`,
    },
  };
}

export async function renderDeveloperPortalPage(slug: string[], searchQuery?: string) {
  const host = (await headers()).get("host") ?? "";
  const hostMode = getDeveloperHostMode(host);
  const resolvedSlug = getResolvedDeveloperSlug(slug, hostMode);
  const page = getDeveloperPortalPageBySlug(resolvedSlug);
  const authUser = await getAuthenticatedSupabaseUser();
  const sessionToken = await getAuthenticatedAppSessionToken();
  const eligibilityState = await getGenerationEligibilityStateForSession(sessionToken);
  const galactusAccess = getGalactusAccessState(eligibilityState, "sales", "/developers");

  return (
    <DeveloperPortalShell
      currentPage={page}
      galactusAccess={galactusAccess}
      hostMode={hostMode}
      pages={developerPortalPages}
      searchQuery={searchQuery}
      viewerEmail={authUser?.email ?? null}
    />
  );
}
