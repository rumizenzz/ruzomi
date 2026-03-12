import type { Metadata } from "next";

import { SettingsScreen } from "@/components/settings-screen";
import { getGenerationEligibilityStateForSession, getWalletState } from "@/lib/paytocommit-data";
import { getQuickstartState } from "@/lib/quickstart";
import { getAuthenticatedSupabaseUser, toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage notifications, privacy, wallet access, contact sync, and session controls on PayToCommit.",
};

export default async function SettingsPage() {
  const authUser = await getAuthenticatedSupabaseUser();
  const sessionToken = authUser ? toAuthenticatedAppSessionToken(authUser.id) : null;
  const showQuickstart = Boolean(authUser?.email_confirmed_at);
  const [walletState, eligibilityState] = await Promise.all([
    getWalletState(sessionToken),
    getGenerationEligibilityStateForSession(sessionToken),
  ]);
  const quickstartState =
    showQuickstart && walletState.viewer ? getQuickstartState(walletState, eligibilityState, "/settings") : null;

  return (
    <SettingsScreen
      quickstartState={quickstartState}
      viewerEmail={authUser?.email ?? null}
      walletState={walletState}
    />
  );
}
