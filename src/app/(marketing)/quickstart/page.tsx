import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { QuickstartScreen } from "@/components/quickstart-screen";
import { buildAuthHref } from "@/lib/auth-flow";
import { getGenerationEligibilityStateForSession, getWalletState } from "@/lib/paytocommit-data";
import { getAuthenticatedSupabaseUser, toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";
import { getQuickstartState } from "@/lib/quickstart";

export const metadata: Metadata = {
  title: "Quickstart",
  description: "Follow the shortest path from account access into identity, funding, your first commitment, and Galactus access.",
};

export default async function QuickstartPage() {
  const authUser = await getAuthenticatedSupabaseUser();

  if (!authUser) {
    redirect(buildAuthHref("login", "/quickstart"));
  }

  if (!authUser.email_confirmed_at) {
    redirect("/app");
  }

  const sessionToken = toAuthenticatedAppSessionToken(authUser.id);
  const [walletState, eligibilityState] = await Promise.all([
    getWalletState(sessionToken),
    getGenerationEligibilityStateForSession(sessionToken),
  ]);
  const quickstartState = getQuickstartState(walletState, eligibilityState, "/quickstart");

  return (
    <QuickstartScreen
      enterpriseSteps={quickstartState.enterpriseSteps}
      galactusAccess={quickstartState.galactusAccess}
      steps={quickstartState.steps}
      subtitle={quickstartState.subtitle}
      title={quickstartState.title}
    />
  );
}
