"use client";

import clsx from "clsx";
import Link from "next/link";
import { LockKeyhole, Search, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { buildAuthHref } from "@/lib/auth-flow";
import { featuredPools as fallbackPools } from "@/lib/mock-data";
import { clearPendingMarketDraft, readPendingMarketDraft, readPendingMarketDraftRaw, writePendingMarketDraft } from "@/lib/pending-market-draft";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type {
  AiMarketDraft,
  AiModerationDecision,
  CommandMode,
  GenerationEligibility,
  GenerationEligibilityState,
  MarketDraftConversation,
  MarketQuestion,
} from "@/lib/types";

const forgeStages = [
  "Reading request",
  "Writing rules",
  "Setting proof",
  "Setting deadline",
  "Saving draft",
] as const;

type SearchResult = {
  kind: "pool" | "chain";
  slug: string;
  title: string;
  category: string;
  summary: string;
  status: string;
  statusLabel: string;
  href: string;
  stakeBand: string;
  metricLabel: string;
  timingLabel: string;
  proofLabel: string;
  sparkCount: number;
  trendLabel: string;
  actionLabel: string;
};

const boardCategories = [
  { id: "all", label: "All Markets" },
  { id: "fitness", label: "Fitness" },
  { id: "work", label: "Work" },
  { id: "learning", label: "Learning" },
  { id: "home", label: "Home" },
  { id: "finance", label: "Finance" },
  { id: "social", label: "Social" },
  { id: "health", label: "Health" },
  { id: "enterprise", label: "Enterprise" },
] as const;

function getFallbackPoolTimingLabel(pool: (typeof fallbackPools)[number]) {
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

function getFallbackPoolActionLabel(pool: (typeof fallbackPools)[number]) {
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

type BoardCategoryId = (typeof boardCategories)[number]["id"];

function normalizeBoardCategory(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function matchesBoardCategory(value: string, categoryId: BoardCategoryId) {
  if (categoryId === "all") {
    return true;
  }

  const normalized = normalizeBoardCategory(value);
  return normalized === categoryId || normalized.includes(categoryId);
}

function extractPulseAmounts(result: SearchResult) {
  const rawMatches = [
    ...(result.stakeBand.match(/\$[\d,.]+(?:\.\d+)?[kK]?/g) ?? []),
    ...(result.metricLabel.match(/\$[\d,.]+(?:\.\d+)?[kK]?/g) ?? []),
  ];
  const uniqueMatches = Array.from(new Set(rawMatches));

  if (uniqueMatches.length >= 3) {
    return uniqueMatches.slice(0, 3);
  }

  if (uniqueMatches.length === 2) {
    return [uniqueMatches[0], uniqueMatches[1], uniqueMatches[0]];
  }

  if (uniqueMatches.length === 1) {
    return [uniqueMatches[0], "$10", uniqueMatches[0]];
  }

  return ["$10", "$25", "$50"];
}

const fallbackBoardResults: SearchResult[] = fallbackPools
  .filter((pool) => pool.status === "live" || pool.status === "upcoming")
  .slice(0, 7)
  .map((pool) => ({
    kind: "pool",
    slug: pool.slug,
    title: pool.title,
    category: pool.category,
    summary: pool.summary,
    status: pool.status,
    statusLabel:
      pool.status === "upcoming"
        ? "Opening"
        : pool.status === "settling"
          ? "Settling"
          : pool.status === "settled"
            ? "Closed"
            : "Live",
    href: `/pools/${pool.slug}`,
    stakeBand: pool.stakeBand,
    metricLabel: pool.visiblePoolTotal ? pool.volumeLabel : pool.targetGoal,
    timingLabel: getFallbackPoolTimingLabel(pool),
    proofLabel: pool.evidenceMode,
    sparkCount: pool.sparkCount,
    trendLabel: pool.trendLabel,
    actionLabel: getFallbackPoolActionLabel(pool),
  }));

function formatSparkCount(count: number) {
  return `${count.toLocaleString()} Spark`;
}

function formatWindowCountdown(target: string | null) {
  if (!target) {
    return null;
  }

  const deltaMs = new Date(target).getTime() - Date.now();
  if (!Number.isFinite(deltaMs)) {
    return null;
  }

  const totalSeconds = Math.max(0, Math.floor(deltaMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h left`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }

  return `${Math.max(minutes, 0)}m left`;
}

function formatExpiredWindow(target: string | null) {
  if (!target) {
    return null;
  }

  const deltaMs = Date.now() - new Date(target).getTime();
  if (!Number.isFinite(deltaMs) || deltaMs < 0) {
    return null;
  }

  const totalHours = Math.floor(deltaMs / (1000 * 60 * 60));
  if (totalHours < 24) {
    return `${totalHours}h ago`;
  }

  return `${Math.floor(totalHours / 24)}d ago`;
}

export function HeroMarketForge() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const railCardRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [viewer, setViewer] = useState<{ id: string } | null>(null);
  const persistedDraftRaw = useSyncExternalStore(
    () => () => {},
    () => readPendingMarketDraftRaw(),
    () => null,
  );
  const persistedDraft = useMemo(() => {
    if (!persistedDraftRaw) {
      return null;
    }

    return readPendingMarketDraft()?.draft ?? null;
  }, [persistedDraftRaw]);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [mode, setMode] = useState<CommandMode>("search");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [decision, setDecision] = useState<AiModerationDecision | null>(null);
  const [activeDraft, setActiveDraft] = useState<AiMarketDraft | null>(null);
  const [activeStage, setActiveStage] = useState(0);
  const [dismissedPersistedDraft, setDismissedPersistedDraft] = useState(false);
  const [savedDraftExpanded, setSavedDraftExpanded] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>(fallbackBoardResults);
  const [searchPending, setSearchPending] = useState(false);
  const [generationEligibility, setGenerationEligibility] = useState<GenerationEligibility>("locked");
  const [generationEligibilityState, setGenerationEligibilityState] = useState<GenerationEligibilityState>({
    eligibility: "locked",
    reason: "guest",
    lastVerifiedCompletionAt: null,
    expiresAt: null,
  });
  const [planConversation, setPlanConversation] = useState<MarketDraftConversation | null>(null);
  const [planCustomAnswer, setPlanCustomAnswer] = useState("");
  const [isCommandFocused, setIsCommandFocused] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [justUnlockedGenerate, setJustUnlockedGenerate] = useState(false);
  const [isCompactRail, setIsCompactRail] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [slowDeviceMotion, setSlowDeviceMotion] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [activeCategory, setActiveCategory] = useState<BoardCategoryId>("all");
  const previousEligibilityRef = useRef<GenerationEligibility>("locked");
  const currentDraft =
    activeDraft ?? (savedDraftExpanded && !dismissedPersistedDraft ? persistedDraft : null);
  const hasSavedDraft = !dismissedPersistedDraft && Boolean(persistedDraft);
  const currentPrompt = prompt ?? currentDraft?.prompt ?? "";
  const deferredPrompt = useDeferredValue(currentPrompt.trim());
  const hasPrompt = currentPrompt.trim().length > 0;
  const currentNotice = notice;
  const showOverlay = pending || Boolean(currentDraft) || Boolean(currentNotice) || Boolean(planConversation);
  const loginToOpenHref = buildAuthHref("login", "/app/pools/new?resumeDraft=1");
  const authToGenerateHref = buildAuthHref("signup", "/app?mode=generate");
  const canGenerate = Boolean(viewer) && generationEligibility === "unlocked";
  const isSearchMode = mode === "search";
  const query = deferredPrompt;
  const searchingExistingMarkets = isSearchMode && query.length > 0;
  const categoryResultCount = useMemo(() => {
    return activeCategory === "all"
      ? searchResults.length
      : searchResults.filter((result) => matchesBoardCategory(result.category, activeCategory)).length;
  }, [activeCategory, searchResults]);
  const filteredSearchResults = useMemo(() => {
    if (activeCategory === "all") {
      return searchResults;
    }

    const scopedResults = searchResults.filter((result) => matchesBoardCategory(result.category, activeCategory));
    return scopedResults.length > 0 ? scopedResults : searchResults;
  }, [activeCategory, searchResults]);
  const displayedResultCount = activeCategory === "all" || categoryResultCount > 0 ? categoryResultCount : filteredSearchResults.length;
  const featuredResults = filteredSearchResults.slice(0, 5);
  const heroSearchResults =
    mode === "search" && !currentPrompt.trim() && featuredResults.length > 1 ? featuredResults.slice(1) : featuredResults;
  const showFocusRail =
    mode === "search" &&
    !showOverlay &&
    !currentPrompt.trim() &&
    featuredResults.length > 0;
  const commandPortalVisible =
    mode === "search" &&
    !showOverlay &&
    !currentPrompt.trim() &&
    !isCommandFocused &&
    featuredResults.length > 0;
  const showGenerateGate = !showOverlay && mode === "generate" && !canGenerate;
  const activeWindowLabel = formatWindowCountdown(generationEligibilityState.expiresAt);
  const expiredWindowLabel = formatExpiredWindow(generationEligibilityState.expiresAt);
  const generateLockTitle = !viewer
    ? "Create an account to draft a market"
    : generationEligibilityState.reason === "expired_window"
      ? "Drafting paused after an inactive stretch"
      : "Drafting unlocks after one verified finish";
  const generateLockBody = !viewer
    ? "Search stays open for everyone. Drafting turns on after you sign up and finish a verified commitment."
    : generationEligibilityState.reason === "expired_window"
      ? `Your last verified finish aged out ${expiredWindowLabel ?? "recently"}. Complete another verified commitment to reopen Generate.`
      : "Complete one verified commitment in the last 30 days to unlock Generate.";
  const generateLockActionHref = !viewer ? authToGenerateHref : "/app";
  const generateLockActionLabel = !viewer ? "Log in or sign up" : "View my commitments";
  const commandStatusTitle = isSearchMode
    ? searchingExistingMarkets
      ? "Searching existing markets"
      : "Search markets already open"
    : canGenerate
      ? "Generate a new market"
      : generateLockTitle;
  const commandStatusBody = isSearchMode
    ? searchingExistingMarkets
      ? "See matching markets first. If nothing fits, you can draft a new one when Generate is unlocked."
      : "Type a goal to search live markets, linked commitments, and recent openings."
    : canGenerate
      ? `PayToCommit will ask a few questions, draft the rules, and wait for you to open the market.${activeWindowLabel ? ` Generate stays open for ${activeWindowLabel}.` : ""}`
      : generateLockBody;
  const searchStateLabel = query.length > 0 ? "Search results" : "Trending live";
  const shouldSoftenRailMotion = prefersReducedMotion || slowDeviceMotion;
  const railIntervalMs = isCompactRail || shouldSoftenRailMotion ? 5600 : 4200;
  const orderedFeaturedResults = useMemo(() => {
    if (!featuredResults.length) {
      return [];
    }

    return featuredResults
      .map((result, index) => ({
        result,
        index,
        offset: (index - featuredIndex + featuredResults.length) % featuredResults.length,
      }))
      .sort((left, right) => left.offset - right.offset);
  }, [featuredIndex, featuredResults]);
  const spotlightMobileEntry = orderedFeaturedResults[0] ?? null;
  const spotlightMobileResult = spotlightMobileEntry?.result ?? null;
  const supportingMobileResults = orderedFeaturedResults.slice(1);

  useEffect(() => {
    const previousEligibility = previousEligibilityRef.current;
    if (previousEligibility !== "unlocked" && generationEligibility === "unlocked") {
      setJustUnlockedGenerate(true);
      const timeout = window.setTimeout(() => {
        setJustUnlockedGenerate(false);
      }, 3600);

      previousEligibilityRef.current = generationEligibility;
      return () => window.clearTimeout(timeout);
    }

    previousEligibilityRef.current = generationEligibility;
  }, [generationEligibility]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (!mounted) {
        return;
      }

      setViewer(data.user ? { id: data.user.id } : null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setViewer(session?.user ? { id: session.user.id } : null);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!pending) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveStage((current) => Math.min(current + 1, forgeStages.length - 1));
    }, 520);

    return () => window.clearInterval(interval);
  }, [pending]);

  useEffect(() => {
    if (!viewer) {
      setGenerationEligibility("locked");
      setPlanConversation(null);
      return;
    }
  }, [viewer]);

  const activeQuestion = useMemo(() => {
    return planConversation?.plan?.questions.find((question) => question.status === "awaiting_response") ?? null;
  }, [planConversation]);

  const answeredQuestions = useMemo(() => {
    return planConversation?.plan?.questions.filter((question) => question.response) ?? [];
  }, [planConversation]);

  const allQuestionsAnswered = Boolean(planConversation?.plan?.questions.length) && !activeQuestion;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const compactRailQuery = window.matchMedia("(max-width: 680px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateViewportState = () => {
      setIsCompactRail(compactRailQuery.matches);
      setPrefersReducedMotion(reducedMotionQuery.matches);
    };

    updateViewportState();
    compactRailQuery.addEventListener("change", updateViewportState);
    reducedMotionQuery.addEventListener("change", updateViewportState);

    return () => {
      compactRailQuery.removeEventListener("change", updateViewportState);
      reducedMotionQuery.removeEventListener("change", updateViewportState);
    };
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined") {
      return;
    }

    const deviceMemory = "deviceMemory" in navigator ? Number((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) : 8;
    const hardwareThreads = navigator.hardwareConcurrency ?? 8;
    setSlowDeviceMotion(deviceMemory <= 4 || hardwareThreads <= 4);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const handleVisibility = () => {
      setIsPageVisible(!document.hidden);
    };

    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setSearchPending(true);

      try {
        const response = await fetch(`/api/command/search?q=${encodeURIComponent(deferredPrompt)}`, {
          cache: "no-store",
        });
        const json = (await response.json()) as {
          results?: SearchResult[];
          generationEligibility?: GenerationEligibility;
          generationEligibilityState?: GenerationEligibilityState;
        };

        if (cancelled) {
          return;
        }

        setSearchResults(json.results ?? []);
        setGenerationEligibility(json.generationEligibility ?? "locked");
        setGenerationEligibilityState(
          json.generationEligibilityState ?? {
            eligibility: json.generationEligibility ?? "locked",
            reason: viewer ? "no_verified_completion" : "guest",
            lastVerifiedCompletionAt: null,
            expiresAt: null,
          },
        );
      } catch {
        if (!cancelled) {
          setSearchResults([]);
          setGenerationEligibilityState({
            eligibility: "locked",
            reason: viewer ? "no_verified_completion" : "guest",
            lastVerifiedCompletionAt: null,
            expiresAt: null,
          });
        }
      } finally {
        if (!cancelled) {
          setSearchPending(false);
        }
      }
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [deferredPrompt, mode, viewer]);

  useEffect(() => {
    if (
      mode !== "search" ||
      isCommandFocused ||
      currentPrompt.trim() ||
      showOverlay ||
      featuredResults.length <= 1 ||
      !isPageVisible
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      const advanceSpotlight = () => {
        startTransition(() => {
          setFeaturedIndex((current) => (current + 1) % featuredResults.length);
        });
      };

      if (isCompactRail || shouldSoftenRailMotion) {
        window.requestAnimationFrame(advanceSpotlight);
        return;
      }

      advanceSpotlight();
    }, railIntervalMs);

    return () => window.clearInterval(interval);
  }, [
    currentPrompt,
    featuredResults.length,
    isCommandFocused,
    isCompactRail,
    isPageVisible,
    mode,
    railIntervalMs,
    shouldSoftenRailMotion,
    showOverlay,
  ]);

  useEffect(() => {
    setFeaturedIndex(0);
  }, [activeCategory, mode, currentPrompt, featuredResults.length]);

  useEffect(() => {
    if (!isCompactRail || !showFocusRail || !isPageVisible) {
      return;
    }

    const spotlightCard = railCardRefs.current[featuredIndex];
    if (!spotlightCard) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      spotlightCard.scrollIntoView({
        behavior: shouldSoftenRailMotion ? "auto" : "smooth",
        block: "nearest",
        inline: "center",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [featuredIndex, isCompactRail, isPageVisible, shouldSoftenRailMotion, showFocusRail]);

  async function startPlanning() {
    const value = currentPrompt.trim();
    if (!value || !viewer || generationEligibility !== "unlocked") {
      return;
    }

    setPending(true);
    setNotice(null);
    setDecision(null);
    setActiveDraft(null);
    setSavedDraftExpanded(false);

    const response = await fetch("/api/command/plan", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ prompt: value }),
    });
    const json = (await response.json()) as {
      error?: string;
      conversation?: MarketDraftConversation;
    };

    setPending(false);

    if (!response.ok || !json.conversation) {
      setNotice(json.error ?? "Unable to start market planning.");
      return;
    }

    setPlanConversation(json.conversation);
    setPlanCustomAnswer("");
  }

  async function draftMarket(nextPrompt?: string) {
    const value = (nextPrompt ?? currentPrompt).trim();
    if (!value) return;
    if (!viewer) {
      setNotice("Log in and complete a verified commitment before you draft a new market.");
      startTransition(() => {
        router.push(authToGenerateHref);
      });
      return;
    }

    if (generationEligibility !== "unlocked") {
      setNotice("Complete one verified commitment in the last 30 days to draft a new market.");
      return;
    }

    setPending(true);
    setNotice(null);
    setDecision(null);
    setActiveDraft(null);
    setPlanConversation(null);
    setActiveStage(0);
    setDismissedPersistedDraft(false);
    setSavedDraftExpanded(false);

    const responsePromise = fetch("/api/ai/market-draft", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ prompt: value }),
    });

    const [response] = await Promise.all([
      responsePromise,
      new Promise((resolve) => window.setTimeout(resolve, 2100)),
    ]);

    const json = (await response.json()) as { error?: string; draft?: AiMarketDraft; decision?: AiModerationDecision };

    if (!response.ok || !json.draft) {
      setPending(false);
      setDecision(json.decision ?? null);
      setNotice(json.error ?? "Unable to draft that market.");
      return;
    }

    setPending(false);
    setPrompt(value);
    setActiveStage(forgeStages.length - 1);
    setActiveDraft(json.draft);
    setDecision(json.draft.moderation ?? null);
    writePendingMarketDraft(json.draft, "hero");
    setSavedDraftExpanded(true);
  }

  function answerQuestion(question: MarketQuestion, answer: string) {
    const response = answer.trim();
    if (!response) {
      return;
    }

    setPlanConversation((current) => {
      if (!current?.plan) {
        return current;
      }

      return {
        ...current,
        messages: [
          ...current.messages,
          {
            id: `${question.id}-response`,
            role: "user",
            body: response,
          },
        ],
        plan: {
          ...current.plan,
          questions: current.plan.questions.map((item) =>
            item.id === question.id
              ? {
                  ...item,
                  status: "answered",
                  response,
                }
              : item,
          ),
        },
      };
    });
    setPlanCustomAnswer("");
  }

  function goBackOneQuestion() {
    setPlanConversation((current) => {
      if (!current?.plan) {
        return current;
      }

      const answered = [...current.plan.questions]
        .reverse()
        .find((question) => question.status === "answered" && question.response);

      if (!answered) {
        return current;
      }

      return {
        ...current,
        messages: current.messages.filter((message) => message.id !== `${answered.id}-response`),
        plan: {
          ...current.plan,
          questions: current.plan.questions.map((question) =>
            question.id === answered.id
              ? {
                  ...question,
                  status: "awaiting_response",
                  response: undefined,
                }
              : question,
          ),
        },
      };
    });
  }

  async function implementPlan() {
    if (!planConversation?.plan || !allQuestionsAnswered) {
      return;
    }

    const enrichedPrompt = [
      planConversation.prompt,
      ...planConversation.plan.questions.map((question) => `${question.prompt} ${question.response ?? ""}`),
    ].join("\n");

    await draftMarket(enrichedPrompt);
  }

  async function openMarket() {
    if (!currentDraft) return;

    setPending(true);
    setNotice(null);
    setDecision(null);

    const response = await fetch("/api/ai/market-create", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ draftId: currentDraft.id }),
    });
    const json = (await response.json()) as { error?: string; pool?: { slug?: string } | null };

    if (!response.ok || !json.pool?.slug) {
      setPending(false);
      setNotice(
        json.error === "Creation session unavailable."
          ? "Log in or sign up to open a market."
          : (json.error ?? "Unable to open that market."),
      );
      return;
    }

    setPending(false);
    clearPendingMarketDraft();
    setDismissedPersistedDraft(true);
    setSavedDraftExpanded(false);
    setNotice("Market opened.");
    startTransition(() => {
      router.push(`/pools/${json.pool?.slug}`);
      router.refresh();
    });
  }

  function renderMarketLedger(result: SearchResult, compact = false) {
    const pulseAmounts = extractPulseAmounts(result);

    return (
      <div className={clsx("forge-search-card-ledger", compact && "is-compact")} aria-hidden="true">
        <div className="forge-search-card-pulse">
          <span className="forge-search-card-wave forge-search-card-wave-a" />
          <span className="forge-search-card-wave forge-search-card-wave-b" />
          <span className="forge-search-card-wave forge-search-card-wave-c" />
        </div>
        <div className="forge-search-card-rain">
          {pulseAmounts.map((amount, amountIndex) => (
            <span
              key={`${result.slug}-${amount}-${amountIndex}`}
              className={clsx("forge-search-rain-token", `token-${(amountIndex % 3) + 1}`)}
            >
              {amount}
            </span>
          ))}
        </div>
      </div>
    );
  }

  function renderMarketCardContent(result: SearchResult, index: number, total: number, compact = false) {
    return (
      <>
        {renderMarketLedger(result, compact)}
        <div className="forge-search-card-head">
          <span className="mono-label">{result.category}</span>
          <span className="forge-search-result-index">
            {index + 1}
            <small>/{total}</small>
          </span>
        </div>
        <div className="forge-search-card-body">
          <strong>{result.title}</strong>
          <span className="detail-text">{result.summary}</span>
        </div>
        <div className="forge-search-card-foot">
          <div className="forge-search-card-metrics">
            <span>{result.metricLabel}</span>
            <span>{result.proofLabel}</span>
            <span>{result.timingLabel}</span>
          </div>
          <div className="forge-search-result-foot-copy">
            <span className="metric-chip">{result.statusLabel}</span>
            <span className="detail-text">
              {result.kind === "chain" ? result.trendLabel : `${formatSparkCount(result.sparkCount)} live`}
            </span>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="dashboard-search-panel forge-hero-shell">
      <form
        className={clsx(
          "dashboard-hero-search forge-hero-form",
          commandPortalVisible && "is-observing",
          currentPrompt.trim() && "is-writing",
        )}
        onSubmit={(event) => {
          event.preventDefault();
          if (mode === "search") {
            return;
          }

          if (!planConversation) {
            void startPlanning();
            return;
          }

          if (allQuestionsAnswered) {
            void implementPlan();
          }
        }}
        role="search"
      >
        <label className="sr-only" htmlFor="hero-market-forge">
          Commit on anything
        </label>
        <div className={clsx("forge-command-portal", commandPortalVisible && "is-visible")} aria-hidden="true">
          <div className="forge-command-surfer-line">
            <span
              className="forge-command-surfer-dot"
              style={{
                transform: `translateX(${featuredResults.length > 1 ? (featuredIndex / Math.max(featuredResults.length - 1, 1)) * 100 : 0}%)`,
              }}
            />
          </div>
        </div>
        <input
          id="hero-market-forge"
          onBlur={() => setIsCommandFocused(false)}
          onChange={(event) => setPrompt(event.target.value)}
          onFocus={() => setIsCommandFocused(true)}
          placeholder="Commit on anything"
          type="text"
          value={currentPrompt}
        />
        <div className={clsx("forge-mode-switch", canGenerate && "is-unlocked", justUnlockedGenerate && "is-celebrating")}>
          {canGenerate ? (
            <button
              className={clsx("forge-mode-button", mode === "generate" && "is-active")}
              onClick={() => setMode("generate")}
              type="button"
            >
              Generate
            </button>
          ) : (
            <button
              className={clsx(
                "forge-mode-button",
                mode === "search" && "is-active",
              )}
              onClick={() => setMode("search")}
              type="button"
            >
              <Search size={14} />
              <span>Search</span>
            </button>
          )}
          <button
            className={clsx(
              "forge-mode-button",
              canGenerate ? mode === "search" && "is-active" : mode === "generate" && "is-active",
              !canGenerate && "is-locked",
            )}
            onClick={() => setMode(canGenerate ? "search" : "generate")}
            type="button"
          >
            {canGenerate ? (
              <>
                <Search size={14} />
                <span>Search</span>
              </>
            ) : (
              <>
                <LockKeyhole size={14} />
                <span>Generate</span>
              </>
            )}
          </button>
        </div>
        {mode === "generate" && canGenerate ? (
          <button
            className={clsx("forge-hero-submit", !hasPrompt && !pending && "is-hidden")}
            disabled={pending}
            type="submit"
          >
            {pending ? "Working..." : allQuestionsAnswered ? "Implement plan" : "Plan market"}
          </button>
        ) : null}
      </form>

      <div className="forge-category-rail" aria-label="Commitment Board categories">
        {boardCategories.map((category) => (
          <button
            key={category.id}
            className={clsx("forge-category-chip", activeCategory === category.id && "is-active")}
            onClick={() => setActiveCategory(category.id)}
            type="button"
          >
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      <div className="forge-command-rail">
        <div className="forge-command-copy">
          <span className="mono-label">{commandStatusTitle}</span>
          <p>{commandStatusBody}</p>
        </div>
        {isSearchMode ? (
          <span className="metric-chip">
            {searchPending ? "Updating" : `${displayedResultCount} market${displayedResultCount === 1 ? "" : "s"}`}
          </span>
        ) : canGenerate ? (
          hasSavedDraft ? (
            <button
              className="action-secondary"
              onClick={() => setSavedDraftExpanded(true)}
              type="button"
            >
              Resume draft
            </button>
          ) : (
            <span className={clsx("metric-chip", justUnlockedGenerate && "is-unlocked")}>
              {justUnlockedGenerate
                ? "Generate unlocked"
                : activeWindowLabel
                  ? `Generate ${activeWindowLabel}`
                  : "Plan mode ready"}
            </span>
          )
        ) : !viewer ? (
          <Link className="action-secondary" href={authToGenerateHref}>
            Log in to unlock
          </Link>
        ) : (
          <Link className="action-secondary" href="/app">
            View my commitments
          </Link>
        )}
      </div>

      {!showOverlay ? (
        <div className="forge-search-state">
          {mode === "search" ? (
            <>
              <div className="forge-search-head">
                <div className="forge-search-status">
                  <span className="mono-label">Commitment Board</span>
                  <strong>{commandPortalVisible ? "Manifesting now" : searchStateLabel}</strong>
                </div>
                <span>
                  {searchPending
                    ? "Searching..."
                    : commandPortalVisible
                      ? `${featuredIndex + 1}/${featuredResults.length} in focus`
                      : `${searchResults.length} live results`}
                </span>
              </div>
              {showFocusRail ? (
                <>
                  <div
                    className={clsx("forge-search-carousel", isCompactRail && "is-compact")}
                    aria-label="Featured commitment markets"
                  >
                    {featuredResults.map((result, index) => (
                      <Link
                        key={`${result.kind}-${result.slug}`}
                        ref={(node) => {
                          railCardRefs.current[index] = node;
                        }}
                        className={clsx("forge-search-card", index === featuredIndex && "is-spotlight")}
                        href={result.href}
                      >
                        {renderMarketCardContent(result, index, featuredResults.length)}
                      </Link>
                    ))}
                  </div>
                  {spotlightMobileResult ? (
                    <div className="forge-search-carousel-mobile" aria-label="Featured commitment markets mobile">
                      <Link className="forge-search-mobile-spotlight" href={spotlightMobileResult.href}>
                        {renderMarketCardContent(
                          spotlightMobileResult,
                          spotlightMobileEntry?.index ?? featuredIndex,
                          featuredResults.length,
                        )}
                      </Link>
                      <div className="forge-search-mobile-grid">
                        {supportingMobileResults.map(({ result, index: resultIndex }) => (
                          <Link
                            key={`${result.kind}-${result.slug}-mobile`}
                            className="forge-search-mobile-card"
                            href={result.href}
                          >
                            {renderMarketCardContent(result, resultIndex, featuredResults.length, true)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="forge-search-results">
                  {heroSearchResults.map((result, index) => (
                    <Link
                      key={`${result.kind}-${result.slug}`}
                      className={clsx("forge-search-result", index === 0 && "is-featured")}
                      href={result.href}
                    >
                      <div className="forge-search-result-head">
                        <span className="mono-label">{result.category}</span>
                        <span className="forge-search-result-index">
                          {commandPortalVisible ? index + 2 : index + 1}
                          <small>/{featuredResults.length}</small>
                        </span>
                      </div>
                      <div className="forge-search-result-body">
                        <strong>{result.title}</strong>
                        <span className="detail-text">{result.summary}</span>
                        <div className="forge-search-result-grid">
                          <div className="forge-search-result-metric">
                            <span className="mono-label">Market</span>
                            <strong>{result.metricLabel}</strong>
                            <span>{result.stakeBand}</span>
                          </div>
                          <div className="forge-search-result-metric">
                            <span className="mono-label">Proof</span>
                            <strong>{result.proofLabel}</strong>
                            <span>{result.timingLabel}</span>
                          </div>
                        </div>
                      </div>
                      <div className="forge-search-result-foot">
                        <div className="forge-search-result-foot-copy">
                          <span className="metric-chip">{result.statusLabel}</span>
                          <span className="detail-text">
                            {result.kind === "chain" ? result.trendLabel : `${formatSparkCount(result.sparkCount)} live`}
                          </span>
                        </div>
                        <span className="inline-link">{result.actionLabel}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <div className="forge-search-results">
                {!searchPending && !searchResults.length ? (
                  <div className="forge-search-empty">
                    <strong>No matching markets yet.</strong>
                    <p className="detail-text">
                      {canGenerate
                        ? "Switch to Generate and let PayToCommit draft the market."
                        : generateLockBody}
                    </p>
                    {canGenerate ? (
                      <button className="action-secondary" onClick={() => setMode("generate")} type="button">
                        Switch to Generate
                      </button>
                    ) : (
                      <Link className="action-secondary" href={generateLockActionHref}>
                        {generateLockActionLabel}
                      </Link>
                    )}
                  </div>
                ) : null}
              </div>
            </>
          ) : showGenerateGate ? (
            <div className="forge-search-empty">
              <strong>{generateLockTitle}</strong>
              <p className="detail-text">{generateLockBody}</p>
              <Link className="action-secondary" href={generateLockActionHref}>
                {generateLockActionLabel}
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      {hasSavedDraft && !showOverlay ? (
        <div className="forge-saved-draft-bar">
          <div className="section-stack">
            <span className="mono-label">Saved draft</span>
            <strong>{persistedDraft?.title}</strong>
          </div>
          <div className="button-row button-row-tight">
            <button
              className="action-secondary"
              onClick={() => setSavedDraftExpanded(true)}
              type="button"
            >
              Resume
            </button>
            <Link className="inline-link" href={loginToOpenHref}>
              Sign in to open
            </Link>
          </div>
        </div>
      ) : null}

      {showOverlay ? (
        <div className="forge-hero-overlay">
          <div className="forge-overlay-head">
            <div className="section-stack">
              <span className="mono-label">Autonomous Market Forge</span>
              <strong>{pending ? "Drafting your market now" : currentDraft ? currentDraft.title : "Market update"}</strong>
            </div>
            <span className="metric-chip">{pending ? "live" : currentDraft ? "ready" : "saved"}</span>
          </div>

          {pending ? (
            <div className="section-stack">
              <div className="forge-progress-bar">
                <span style={{ width: `${((activeStage + 1) / forgeStages.length) * 100}%` }} />
              </div>
              <div className="timeline-list forge-progress-list">
                {(currentDraft?.draftingNotes?.length ? currentDraft.draftingNotes : forgeStages).map((stage, index) => (
                  <div
                    key={stage}
                    className={`timeline-item forge-progress-step ${index <= activeStage ? "is-active" : ""}`}
                  >
                    <div className="timeline-index">{index + 1}</div>
                    <div className="section-stack">
                      <strong>{stage}</strong>
                      <p className="detail-text">
                        {index === activeStage ? "In progress now." : "Up next."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {planConversation?.plan && !pending && !currentDraft ? (
            <div className="section-stack forge-plan-shell">
              <div className="section-stack section-stack-tight">
                <span className="mono-label">Plan mode</span>
                <strong>{planConversation.plan.summary}</strong>
                <p className="detail-text">
                  {allQuestionsAnswered
                    ? "The plan is ready. Implement it when you are ready to draft the market."
                    : "Answer the current question to keep drafting."}
                </p>
              </div>

              <div className="forge-plan-thread">
                {planConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={clsx("forge-plan-message", message.role === "assistant" ? "is-assistant" : "is-user")}
                  >
                    <span className="mono-label">{message.role === "assistant" ? "PayToCommit AI" : "You"}</span>
                    <p>{message.body}</p>
                  </div>
                ))}

                {answeredQuestions.map((question) => (
                  <div key={question.id} className="forge-plan-message is-assistant">
                    <span className="mono-label">Question answered</span>
                    <p>{question.prompt}</p>
                    <strong>{question.response}</strong>
                  </div>
                ))}
              </div>

              {activeQuestion ? (
                <div className="forge-plan-question">
                  <div className="forge-plan-question-head">
                    <span className="metric-chip">Awaiting response</span>
                    <span className="mono-label">
                      Question {answeredQuestions.length + 1} of {planConversation.plan.questions.length}
                    </span>
                  </div>
                  <strong>{activeQuestion.prompt}</strong>
                  <div className="forge-plan-options">
                    {activeQuestion.options.map((option) => (
                      <button
                        key={option.id}
                        className={clsx("forge-plan-option", option.recommended && "is-recommended")}
                        onClick={() => answerQuestion(activeQuestion, option.label)}
                        type="button"
                      >
                        <span>{option.label}</span>
                        {option.description ? <small>{option.description}</small> : null}
                      </button>
                    ))}
                  </div>
                  <div className="forge-plan-custom">
                    <input
                      onChange={(event) => setPlanCustomAnswer(event.target.value)}
                      placeholder="No, and tell PayToCommit AI to do differently."
                      type="text"
                      value={planCustomAnswer}
                    />
                    <button className="action-secondary" onClick={() => answerQuestion(activeQuestion, planCustomAnswer)} type="button">
                      Use custom
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="forge-plan-steps">
                {planConversation.plan.implementationSteps.map((step, index) => (
                  <div key={step} className="timeline-item forge-progress-step is-active">
                    <div className="timeline-index">{index + 1}</div>
                    <div className="section-stack section-stack-tight">
                      <strong>{step}</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="button-row">
                <button
                  className="action-primary"
                  disabled={!allQuestionsAnswered || pending}
                  onClick={() => void implementPlan()}
                  type="button"
                >
                  Implement plan
                </button>
                <button
                  className="action-secondary"
                  disabled={!answeredQuestions.length}
                  onClick={() => goBackOneQuestion()}
                  type="button"
                >
                  Back
                </button>
                <button
                  className="action-secondary"
                  onClick={() => {
                    setPlanConversation(null);
                    setPlanCustomAnswer("");
                  }}
                  type="button"
                >
                  Close
                </button>
              </div>
            </div>
          ) : null}

          {currentDraft ? (
            <div className="section-stack">
              <div className="forge-draft-prompt">
                <span>{currentDraft.prompt}</span>
              </div>
              {currentDraft.originCredit ? (
                <div className="spark-origin-credit">
                  <span>{currentDraft.originCredit.label}</span>
                  <strong>{currentDraft.originCredit.displayName}</strong>
                </div>
              ) : null}
              <p className="detail-text">{currentDraft.summary}</p>
              <div className="timeline-list forge-summary-grid">
                <div className="summary-card">
                  <span className="mono-label">Stake band</span>
                  <strong>{currentDraft.stakeBand}</strong>
                </div>
                <div className="summary-card">
                  <span className="mono-label">Proof mode</span>
                  <strong>{currentDraft.proofMode}</strong>
                </div>
                <div className="summary-card">
                  <span className="mono-label">Result timing</span>
                  <strong>{currentDraft.ruleset.resultTiming}</strong>
                </div>
              </div>
              {currentDraft.ruleset.rules.length ? (
                <div className="forge-rule-strip">
                  {currentDraft.ruleset.rules.slice(0, 3).map((rule) => (
                    <span key={rule}>{rule}</span>
                  ))}
                </div>
              ) : null}
              <div className="button-row">
                <button className="action-primary" disabled={pending} onClick={() => void openMarket()} type="button">
                  {pending ? "Opening..." : "Open market"}
                </button>
                <button
                  className="action-secondary"
                  onClick={() => {
                    setActiveDraft(null);
                    setNotice(null);
                    setSavedDraftExpanded(false);
                  }}
                  type="button"
                >
                  Close
                </button>
              </div>
            </div>
          ) : null}

          {currentNotice ? (
            <div className="form-notice">
              <Wand2 size={16} />
              <span>{currentNotice}</span>
            </div>
          ) : null}

          {decision?.reason ? (
            <div className="forge-neutral-notice">
              <strong>{decision.reason.title}</strong>
              <p>{decision.reason.body}</p>
              {decision.reason.suggestedRewrite ? (
                <button
                  className="inline-link button-reset"
                  onClick={() => {
                    setPrompt(decision.reason?.suggestedRewrite ?? "");
                    setDecision(null);
                  }}
                  type="button"
                >
                  Try: {decision.reason.suggestedRewrite}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
