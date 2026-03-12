import type { AiMarketDraft } from "@/lib/types";

const PENDING_MARKET_DRAFT_KEY = "paytocommit.pending-market-draft";

type PendingMarketDraftRecord = {
  draft: AiMarketDraft;
  savedAt: string;
  source: "hero" | "forge";
};

export function readPendingMarketDraft() {
  const raw = readPendingMarketDraftRaw();
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PendingMarketDraftRecord | null;
    if (!parsed?.draft?.id || !parsed.draft.prompt) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function readPendingMarketDraftRaw() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(PENDING_MARKET_DRAFT_KEY);
  } catch {
    return null;
  }
}

export function writePendingMarketDraft(draft: AiMarketDraft, source: PendingMarketDraftRecord["source"]) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: PendingMarketDraftRecord = {
    draft,
    savedAt: new Date().toISOString(),
    source,
  };

  window.localStorage.setItem(PENDING_MARKET_DRAFT_KEY, JSON.stringify(payload));
}

export function clearPendingMarketDraft() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PENDING_MARKET_DRAFT_KEY);
}
