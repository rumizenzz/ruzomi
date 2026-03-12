import { buildAuthHref } from "@/lib/auth-flow";
import type {
  GalactusAccessContext,
  GalactusAccessState,
  GalactusLockedPayload,
  GenerationEligibilityState,
} from "@/lib/types";

export const GALACTUS_UNLOCK_RULE =
  "Galactus unlocks after one verified completed commitment in the last 30 days.";

function formatCountdown(expiresAt: string | null) {
  if (!expiresAt) {
    return null;
  }

  const remainingMs = new Date(expiresAt).getTime() - Date.now();
  if (Number.isNaN(remainingMs)) {
    return null;
  }

  if (remainingMs <= 0) {
    return "The last active window has ended.";
  }

  const totalHours = Math.floor(remainingMs / (60 * 60 * 1000));
  const totalDays = Math.floor(totalHours / 24);

  if (totalDays >= 1) {
    return `${totalDays} day${totalDays === 1 ? "" : "s"} left in the active 30-day window.`;
  }

  return `${Math.max(totalHours, 1)} hour${totalHours === 1 ? "" : "s"} left in the active 30-day window.`;
}

function getContextTitle(context: GalactusAccessContext) {
  switch (context) {
    case "sales":
      return "Galactus for enterprise";
    case "support":
      return "Galactus for support";
    case "generate":
      return "Galactus for market drafts";
    case "docs":
    default:
      return "Ask Galactus";
  }
}

function getLockedBody(context: GalactusAccessContext, reason: GenerationEligibilityState["reason"]) {
  const destination =
    context === "sales"
      ? "Enterprise sales"
      : context === "support"
        ? "Support"
        : context === "docs"
          ? "Docs AI"
          : "Generate";

  if (reason === "guest") {
    return `${GALACTUS_UNLOCK_RULE} Create your account first, then finish one verified commitment to open ${destination}.`;
  }

  if (reason === "expired_window") {
    return `${GALACTUS_UNLOCK_RULE} Your active window has ended, so ${destination} stays locked until you complete another verified commitment.`;
  }

  return `${GALACTUS_UNLOCK_RULE} ${destination} stays locked until that first verified finish lands and the new 30-day window starts.`;
}

export function getGalactusAccessState(
  eligibility: GenerationEligibilityState,
  context: GalactusAccessContext,
  nextPath: string,
): GalactusAccessState {
  const title = getContextTitle(context);
  const quickstartHref = "/quickstart";

  if (eligibility.eligibility === "unlocked") {
    return {
      allowed: true,
      context,
      title,
      body: "Galactus is ready. Ask about markets, rules, funding, consent, support, or enterprise access from this surface.",
      countdownLabel: formatCountdown(eligibility.expiresAt),
      ctaLabel: "Access active",
      ctaHref: nextPath,
    };
  }

  if (eligibility.reason === "guest") {
    return {
      allowed: false,
      context,
      title,
      body: getLockedBody(context, eligibility.reason),
      countdownLabel: null,
      ctaLabel: "Log in or sign up",
      ctaHref: buildAuthHref("login", nextPath),
    };
  }

  if (eligibility.reason === "expired_window") {
    return {
      allowed: false,
      context,
      title,
      body: getLockedBody(context, eligibility.reason),
      countdownLabel: formatCountdown(eligibility.expiresAt),
      ctaLabel: "Open quickstart",
      ctaHref: quickstartHref,
    };
  }

  return {
    allowed: false,
    context,
    title,
    body: getLockedBody(context, eligibility.reason),
    countdownLabel: null,
    ctaLabel: "See quickstart",
    ctaHref: quickstartHref,
  };
}

export function getGalactusAccessStatusCode(eligibility: GenerationEligibilityState) {
  return eligibility.reason === "guest" ? 401 : 403;
}

export function getGalactusLockedPayload(
  eligibility: GenerationEligibilityState,
  context: GalactusAccessContext,
  nextPath: string,
): { payload: GalactusLockedPayload; status: number } {
  const access = getGalactusAccessState(eligibility, context, nextPath);

  return {
    status: getGalactusAccessStatusCode(eligibility),
    payload: {
      locked: true,
      error: access.body,
      message: access.body,
      access,
    },
  };
}
