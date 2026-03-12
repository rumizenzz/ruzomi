import type { Metadata } from "next";

import { DeskOverview } from "@/components/desk-overview";
import { listPools } from "@/lib/paytocommit-data";

export const metadata: Metadata = {
  title: "My Portfolio",
  description: "Track wallet cash, open tickets, result cards, and new market drafts on PayToCommit.",
};

export default async function AppOverviewPage() {
  const pools = await listPools();
  const activePools = pools.filter((pool) => pool.status === "live");
  const upcomingPools = pools.filter((pool) => pool.status === "upcoming");

  return (
    <DeskOverview
      livePools={activePools}
      openingPools={upcomingPools}
    />
  );
}
