import type { Metadata } from "next";
import { headers } from "next/headers";

import { DeveloperDocsHub } from "@/components/developer-docs-hub";
import { DeveloperPortalShell } from "@/components/developer-portal-shell";
import { PlatformAuthGate } from "@/components/platform-auth-gate";
import { PlatformWorkspaceShell } from "@/components/platform-workspace-shell";
import {
  developerPortalPages,
  getDeveloperPortalPageBySlug,
  getDeveloperPortalPath,
} from "@/lib/developer-platform-content";
import { getGalactusAccessState } from "@/lib/galactus-access";
import { getHostModeFromHost } from "@/lib/host-mode";
import { getGenerationEligibilityStateForSession } from "@/lib/paytocommit-data";
import { getAuthenticatedAppSessionToken, getAuthenticatedSupabaseUser } from "@/lib/supabase/authenticated-user";

export function getDeveloperHostMode(host: string): "path" | "developers" | "platform" {
  const hostMode = getHostModeFromHost(host);

  if (hostMode === "developers") {
    return "developers";
  }
  if (hostMode === "platform") {
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

export async function renderDeveloperPortalPage(slug: string[], searchQuery?: string | string[]) {
  const host = (await headers()).get("host") ?? "";
  const hostMode = getDeveloperHostMode(host);
  const resolvedSlug = getResolvedDeveloperSlug(slug, hostMode);
  const page = getDeveloperPortalPageBySlug(resolvedSlug);
  const authUser = await getAuthenticatedSupabaseUser();
  const sessionToken = await getAuthenticatedAppSessionToken();
  const eligibilityState = await getGenerationEligibilityStateForSession(sessionToken);
  const galactusAccess = getGalactusAccessState(eligibilityState, "sales", "/developers");
  const normalizedSearchQuery = Array.isArray(searchQuery) ? searchQuery[0] : searchQuery;

  if (hostMode === "platform") {
    if (!authUser) {
      return <PlatformAuthGate initialMode={slug[0] === "signup" ? "signup" : "login"} />;
    }

    return <PlatformWorkspaceShell currentPage={page} pages={developerPortalPages} viewerEmail={authUser?.email ?? null} />;
  }

  if (hostMode === "developers") {
    return <DeveloperDocsHub currentPage={page} isHome={slug.length === 0} pages={developerPortalPages} />;
  }

  return (
    <DeveloperPortalShell
      currentPage={page}
      galactusAccess={galactusAccess}
      hostMode={hostMode}
      pages={developerPortalPages}
      searchQuery={normalizedSearchQuery}
      viewerEmail={authUser?.email ?? null}
    />
  );
}
