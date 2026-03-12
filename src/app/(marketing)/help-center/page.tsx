import type { Metadata } from "next";

import { HelpCenterScreen } from "@/components/help-center-screen";
import { getGalactusAccessState } from "@/lib/galactus-access";
import { getGenerationEligibilityStateForSession } from "@/lib/paytocommit-data";
import { getAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Search PayToCommit guides, troubleshooting steps, account access help, funding support, and developer questions.",
};

export default async function HelpCenterPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; article?: string }>;
}) {
  const { q, article } = await searchParams;
  const sessionToken = await getAuthenticatedAppSessionToken();
  const eligibilityState = await getGenerationEligibilityStateForSession(sessionToken);
  const supportAccess = getGalactusAccessState(eligibilityState, "support", "/help-center");

  return <HelpCenterScreen initialArticleSlug={article} initialQuery={q ?? ""} supportAccess={supportAccess} />;
}
