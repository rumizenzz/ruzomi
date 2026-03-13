import { headers } from "next/headers";

import { MarketingShell } from "@/components/marketing-shell";
import { getHostModeFromHost } from "@/lib/host-mode";
import { getSiteState } from "@/lib/paytocommit-data";
import { getAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hostMode = getHostModeFromHost((await headers()).get("host"));

  if (hostMode !== "paytocommit") {
    return children;
  }

  const sessionToken = await getAuthenticatedAppSessionToken();
  const initialSiteState = await getSiteState(sessionToken);

  return (
    <MarketingShell hostMode={hostMode} initialSiteState={initialSiteState}>
      {children}
    </MarketingShell>
  );
}
