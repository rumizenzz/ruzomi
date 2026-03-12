import type { FeeSchedule } from "@/lib/types";

export const CARD_TOP_UP_FEE_RATE = 0.025;
export const SOVEREIGN_SPARK_RATE = 0.05;

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function getSovereignSparkFeeCents(stakeCents: number) {
  return Math.max(0, Math.round(stakeCents * SOVEREIGN_SPARK_RATE));
}

export function getFeeSchedule(): FeeSchedule {
  return {
    stakeFloor: formatCurrency(1000),
    depositFee: "ACH free, card or instant 2.5%",
    infrastructureFee: "5% of each commitment stake",
    settlementCapture: "20% of the forfeited side is captured before winner distribution.",
    zeroCompleteCapture: "If nobody completes, PayToCommit captures the full pool.",
    payoutRule: "Completed entrants recover stake and split the post-fee forfeited side equally.",
    items: [
      {
        label: "ACH deposit",
        value: "Free",
        note: "Standard funding clears into wallet cash without a platform deposit fee.",
      },
      {
        label: "Card or instant deposit",
        value: "2.5%",
        note: "Applied before wallet cash becomes spendable.",
      },
      {
        label: "Sovereign Spark",
        value: "5%",
        note: "Charged on every market or Chain stake to cover PayToCommit AI infrastructure.",
      },
    ],
  };
}
