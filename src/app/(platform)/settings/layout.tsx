import { AppShell } from "@/components/app-shell";
import { getAppShellState } from "@/lib/paytocommit-data";
import { getAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionToken = await getAuthenticatedAppSessionToken();
  const { siteState, walletState } = await getAppShellState(sessionToken);

  return (
    <AppShell initialSiteState={siteState} initialWalletState={walletState}>
      {children}
    </AppShell>
  );
}
