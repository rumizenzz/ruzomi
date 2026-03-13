import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { RuzomiScreen } from "@/components/ruzomi-screen";
import { getGalactusAccessState } from "@/lib/galactus-access";
import { buildHostedHref } from "@/lib/host-links";
import { getHostModeFromHost } from "@/lib/host-mode";
import { getGenerationEligibilityStateForSession, getSiteState, getWalletState, listSparkFeed } from "@/lib/paytocommit-data";
import { getQuickstartState } from "@/lib/quickstart";
import { getAuthenticatedSupabaseUser, toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

export const metadata: Metadata = {
  title: "Ruzomi",
  description:
    "Open the network around every commitment market, move through joined channels, direct Sparks, result artifacts, and live follow-through.",
};

type RuzomiSearchParams = {
  share?: string;
  lane?: string;
  channel?: string;
  dm?: string;
};

function normalizeLane(value: string | undefined) {
  if (value === "direct" || value === "artifacts") {
    return value;
  }

  return "feed";
}

export default async function RuzomiPage({
  searchParams,
}: {
  searchParams: Promise<RuzomiSearchParams>;
}) {
  const { share, lane, channel, dm } = await searchParams;
  const host = (await headers()).get("host") ?? "";
  const hostMode = getHostModeFromHost(host);

  if (hostMode === "paytocommit") {
    const nextSearch = new URLSearchParams();

    if (share) {
      nextSearch.set("share", share);
    }
    if (lane) {
      nextSearch.set("lane", lane);
    }
    if (channel) {
      nextSearch.set("channel", channel);
    }
    if (dm) {
      nextSearch.set("dm", dm);
    }

    const query = nextSearch.toString();
    redirect(buildHostedHref("ruzomi", query ? `/?${query}` : "/"));
  }

  const authUser = await getAuthenticatedSupabaseUser();
  const sessionToken = authUser ? toAuthenticatedAppSessionToken(authUser.id) : null;
  const [siteState, walletState, sparkFeed, eligibilityState] = await Promise.all([
    getSiteState(sessionToken),
    getWalletState(sessionToken),
    listSparkFeed(sessionToken),
    getGenerationEligibilityStateForSession(sessionToken),
  ]);
  const quickstartState =
    authUser?.email_confirmed_at && walletState.viewer
      ? getQuickstartState(walletState, eligibilityState, "/ruzomi")
      : null;

  return (
    <RuzomiScreen
      galactusAccess={getGalactusAccessState(eligibilityState, "support", "/ruzomi")}
      quickstartState={quickstartState}
      selectedChannel={channel ?? "global"}
      selectedDmHandle={dm ?? null}
      selectedLane={normalizeLane(lane)}
      shareTicketId={share ?? null}
      hostMode={hostMode}
      siteState={siteState}
      sparkFeed={sparkFeed}
      walletState={walletState}
    />
  );
}
