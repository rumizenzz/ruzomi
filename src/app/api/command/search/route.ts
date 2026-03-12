import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getGenerationEligibilityStateForSession, listChains, listPools } from "@/lib/paytocommit-data";
import { getAuthenticatedSupabaseUser, toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";
import type { CommitmentPool } from "@/lib/types";

function getPoolSearchStatusLabel(pool: CommitmentPool) {
  if (pool.preOpenStakeLive) {
    return "Early stake live";
  }

  switch (pool.lifecycleState) {
    case "scheduled":
      return "Scheduled";
    case "upcoming":
      return "Opening";
    case "join_closing_soon":
      return "Join closing";
    case "join_closed_active":
      return "Join closed";
    case "proof_window_open":
      return "Proof open";
    case "proof_window_closed":
    case "under_review":
      return "Under review";
    case "resolved":
      return "Resolved";
    case "voided":
      return "Voided";
    case "canceled":
      return "Canceled";
    default:
      return "Live";
  }
}

function getPoolTimingLabel(pool: CommitmentPool) {
  if (pool.timingSummaryLabel) {
    return pool.timingSummaryLabel;
  }

  if (
    pool.preOpenStakeLive ||
    pool.notifyMeAvailable ||
    pool.lifecycleState === "join_open" ||
    pool.lifecycleState === "join_closing_soon"
  ) {
    return pool.joinStatusLabel;
  }

  if (pool.lifecycleState === "join_closed_active") {
    return "Existing members continue";
  }

  if (pool.lifecycleState === "proof_window_open" || pool.lifecycleState === "proof_window_closed" || pool.lifecycleState === "under_review") {
    return pool.proofWindow;
  }

  return pool.joinStatusLabel;
}

function getPoolActionLabel(pool: CommitmentPool) {
  if (pool.preOpenStakeLive) {
    return "Stake early";
  }

  if (pool.notifyMeAvailable) {
    return "View timing";
  }

  if (pool.lifecycleState === "join_closed_active") {
    return "View progress";
  }

  if (pool.lifecycleState === "proof_window_open" || pool.lifecycleState === "proof_window_closed" || pool.lifecycleState === "under_review") {
    return "View proof";
  }

  return "Open market";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();
  const viewer = await getAuthenticatedSupabaseUser();
  const sessionToken = viewer ? toAuthenticatedAppSessionToken(viewer.id) : null;
  const generationEligibilityState = await getGenerationEligibilityStateForSession(sessionToken);

  const [pools, chains] = await Promise.all([listPools(), listChains()]);

  const matchedPools = pools
    .filter((pool) => {
      if (!query) {
        return pool.status === "live" || pool.status === "upcoming";
      }

      const haystack = [
        pool.title,
        pool.category,
        pool.summary,
        pool.targetGoal,
        pool.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    })
    .slice(0, 7)
    .map((pool) => ({
      kind: "pool" as const,
      slug: pool.slug,
      title: pool.title,
      category: pool.category,
      summary: pool.summary,
      status: pool.status,
      statusLabel: getPoolSearchStatusLabel(pool),
      href: `/pools/${pool.slug}`,
      stakeBand: pool.stakeBand,
      metricLabel: pool.visiblePoolTotal ? pool.volumeLabel : pool.targetGoal,
      timingLabel: getPoolTimingLabel(pool),
      proofLabel: pool.evidenceMode,
      sparkCount: pool.sparkCount,
      trendLabel: pool.trendLabel,
      actionLabel: getPoolActionLabel(pool),
    }));

  const matchedChains = chains
    .filter((chain) => {
      if (!query) {
        return true;
      }

      const haystack = [chain.title, chain.category, chain.summary].join(" ").toLowerCase();
      return haystack.includes(query);
    })
    .slice(0, 4)
    .map((chain) => ({
      kind: "chain" as const,
      slug: chain.slug,
      title: chain.title,
      category: chain.category,
      summary: chain.summary,
      status: chain.status,
      statusLabel: chain.status === "settling" ? "Settling" : chain.status === "settled" ? "Closed" : "Live",
      href: `/chains/${chain.slug}`,
      stakeBand: chain.stakeBand,
      metricLabel: chain.totalStakedLabel,
      timingLabel: `${chain.legA.deadlineLabel} + ${chain.legB.deadlineLabel}`,
      proofLabel: chain.completionRule,
      sparkCount: chain.sparkCount,
      trendLabel: `${chain.legA.poolTitle} + ${chain.legB.poolTitle}`,
      actionLabel: "View chain",
    }));

  return NextResponse.json({
    generationEligibility: generationEligibilityState.eligibility,
    generationEligibilityState,
    results: [...matchedPools, ...matchedChains],
    hasExactMatch: [...matchedPools, ...matchedChains].some((item) => item.title.toLowerCase() === query),
  });
}
