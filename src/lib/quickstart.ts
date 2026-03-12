import { getGalactusAccessState } from "@/lib/galactus-access";
import type { GalactusAccessState, GenerationEligibilityState, QuickstartStep, WalletState } from "@/lib/types";

export interface QuickstartState {
  title: string;
  subtitle: string;
  steps: QuickstartStep[];
  enterpriseSteps: QuickstartStep[];
  galactusAccess: GalactusAccessState;
  completedCount: number;
  totalCount: number;
  nextStep: QuickstartStep;
  isComplete: boolean;
}

export function getQuickstartState(
  walletState: WalletState,
  eligibilityState: GenerationEligibilityState,
  nextPath = "/quickstart",
): QuickstartState {
  const viewer = walletState.viewer;
  const hasVerifiedIdentity = viewer?.identityStatus === "verified";
  const hasFundedWallet = walletState.transactions.some(
    (transaction) => transaction.type === "funding_posted" && transaction.status === "posted",
  );
  const hasJoinedCommitment = walletState.positions.length > 0 || walletState.tickets.length > 0;
  const hasUnlockedGalactus = eligibilityState.eligibility === "unlocked";
  const hasStartedFirstCommitmentPath = hasVerifiedIdentity || hasFundedWallet || hasJoinedCommitment || hasUnlockedGalactus;

  const steps: QuickstartStep[] = [
    {
      id: "account",
      label: "Step 1",
      title: "Check your email",
      description: "Your email is confirmed and the account is ready to browse. Identity begins only when you fund or place a live stake.",
      status: "completed",
      href: "/app",
      actionLabel: "Open My Portfolio",
    },
    {
      id: "discover",
      label: "Step 2",
      title: "Pick your first commitment",
      description: "Browse Commitment Markets first. You do not need identity just to open your account and look around.",
      status: hasStartedFirstCommitmentPath ? "completed" : "current",
      href: "/pools",
      actionLabel: "Browse Commitment Markets",
    },
    {
      id: "fund",
      label: "Step 3",
      title: "Deposit your first $10",
      description: "Add your first $10 when you are ready to fund or stake. If identity is still missing, verification opens first at that point.",
      status: hasFundedWallet ? "completed" : hasStartedFirstCommitmentPath ? "current" : "locked",
      href: "/app/wallet/fund",
      actionLabel: hasFundedWallet ? "View wallet" : "Add funds",
    },
    {
      id: "commitment",
      label: "Step 4",
      title: "Finish one commitment",
      description: "Join a live market, send proof before the deadline, and finish with a verified result.",
      status: hasUnlockedGalactus ? "completed" : hasFundedWallet || hasJoinedCommitment ? "current" : "locked",
      href: "/pools",
      actionLabel: "Browse Commitment Markets",
    },
    {
      id: "galactus",
      label: "Step 5",
      title: "Unlock Galactus",
      description: "Docs, support, sales, and market generation turn on after one verified finish in the active 30-day window.",
      status: hasUnlockedGalactus ? "completed" : hasJoinedCommitment || hasFundedWallet ? "current" : "locked",
      href: "/docs",
      actionLabel: hasUnlockedGalactus ? "Open docs" : "See requirements",
    },
  ];

  const enterpriseSteps: QuickstartStep[] = [
    {
      id: "enterprise-identity",
      label: "Enterprise",
      title: "Verify the primary steward",
      description: "Enterprise access still starts from one verified person with an active completion window, but that check begins only when funding or protected access begins.",
      status: hasVerifiedIdentity ? "completed" : "current",
      href: "/app/verify",
      actionLabel: "Verify identity",
    },
    {
      id: "enterprise-application",
      label: "Enterprise",
      title: "Submit your HRS use case",
      description: "Explain why your team needs reliability access, what volume you expect, and how consent will work.",
      status: hasUnlockedGalactus ? "current" : "locked",
      href: "/sales",
      actionLabel: "Open sales flow",
    },
    {
      id: "enterprise-api",
      label: "Enterprise",
      title: "Review API scope and billing",
      description: "Review consent scope, usage billing, and how protected keys work before you apply.",
      status: hasUnlockedGalactus ? "current" : "locked",
      href: "/docs/human-reliability-api",
      actionLabel: "Review API docs",
    },
  ];

  const galactusAccess = getGalactusAccessState(eligibilityState, "generate", nextPath);
  const completedCount = steps.filter((step) => step.status === "completed").length;
  const nextStep = steps.find((step) => step.status !== "completed") ?? steps[steps.length - 1];

  return {
    title: "QUICKSTART",
    subtitle:
      "Check your email, pick a commitment, add your first $10 when you are ready, finish one verified commitment, and unlock Galactus.",
    steps,
    enterpriseSteps,
    galactusAccess,
    completedCount,
    totalCount: steps.length,
    nextStep,
    isComplete: completedCount === steps.length,
  };
}
