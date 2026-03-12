import type { Metadata } from "next";

import { RuzomiScreen } from "@/components/ruzomi-screen";
import { getQuickstartState } from "@/lib/quickstart";
import { getGalactusAccessState } from "@/lib/galactus-access";
import { getGenerationEligibilityStateForSession, getSiteState, getWalletState, listSparkFeed } from "@/lib/paytocommit-data";
import { getAuthenticatedAppSessionToken, getAuthenticatedSupabaseUser } from "@/lib/supabase/authenticated-user";

export const metadata: Metadata = {
  title: "Ruzomi",
  description: "Open the full PayToCommit network view for Spark, commitment channels, verified wins, and the Commitment Pulse.",
};

export default async function RuzomiPage({
  searchParams,
}: {
  searchParams: Promise<{ share?: string; lane?: string; channel?: string; dm?: string }>;
}) {
  const { share, lane, channel, dm } = await searchParams;
  const authUser = await getAuthenticatedSupabaseUser();
  const sessionToken = await getAuthenticatedAppSessionToken();
  const [siteState, walletState, sparkFeed, eligibilityState] = await Promise.all([
    getSiteState(sessionToken),
    getWalletState(sessionToken),
    listSparkFeed(sessionToken),
    getGenerationEligibilityStateForSession(sessionToken),
  ]);

  const galactusAccess = getGalactusAccessState(eligibilityState, "support", "/ruzomi");
  const quickstartState =
    walletState.viewer && authUser?.email_confirmed_at
      ? getQuickstartState(walletState, eligibilityState, "/ruzomi")
      : null;
  const selectedLane =
    lane === "direct" || lane === "artifacts" || lane === "feed"
      ? lane
      : share
        ? "artifacts"
        : "feed";
  const selectedChannel = channel ?? "global";
  const selectedDmHandle = dm ?? null;

  return (
    <RuzomiScreen
      galactusAccess={galactusAccess}
      quickstartState={quickstartState}
      selectedChannel={selectedChannel}
      selectedDmHandle={selectedDmHandle}
      selectedLane={selectedLane}
      shareTicketId={share ?? null}
      siteState={siteState}
      sparkFeed={sparkFeed}
      walletState={walletState}
    />
  );
}
