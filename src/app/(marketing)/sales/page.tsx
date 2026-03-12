import type { Metadata } from "next";

import { SalesScreen } from "@/components/sales-screen";
import { getGalactusAccessState } from "@/lib/galactus-access";
import { getGenerationEligibilityStateForSession } from "@/lib/paytocommit-data";
import { getAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

export const metadata: Metadata = {
  title: "Enterprise Sales",
  description:
    "Start the Human Reliability API enterprise access review, compare the standard rollout and the strategic partner path, and move into the developer and platform workspace.",
};

export default async function SalesPage() {
  const sessionToken = await getAuthenticatedAppSessionToken();
  const eligibilityState = await getGenerationEligibilityStateForSession(sessionToken);
  const galactusAccess = getGalactusAccessState(eligibilityState, "sales", "/sales");

  return <SalesScreen access={galactusAccess} />;
}
