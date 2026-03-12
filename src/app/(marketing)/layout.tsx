import { MarketingShell } from "@/components/marketing-shell";
import { getSiteState } from "@/lib/paytocommit-data";
import { getAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionToken = await getAuthenticatedAppSessionToken();
  const initialSiteState = await getSiteState(sessionToken);

  return <MarketingShell initialSiteState={initialSiteState}>{children}</MarketingShell>;
}
