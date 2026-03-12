import {
  featuredPools as fallbackPools,
  networkLedger as fallbackNetworkLedger,
  sparkFeed as fallbackSparkFeed,
} from "@/lib/mock-data";
import { getSovereignSparkFeeCents } from "@/lib/fee-schedule";
import { buildShareCampaignText } from "@/lib/share-campaign";
import type {
  AiAppealJob,
  AiDocsAnswer,
  AiMarketDraft,
  AiVerificationJob,
  AppUser,
  Chain,
  ChainLeg,
  ChainTicket,
  CommitmentPool,
  ContactSyncConsent,
  CustomActivityStatus,
  GenerationEligibilityState,
  GenerationEligibility,
  InviteCountdownTimer,
  LeaderboardEntry,
  MarketFeedItem,
  NetworkLedgerEntry,
  NotificationEvent,
  PoolCategorySummary,
  PoolMessage,
  PoolPositionAggregate,
  PoolTicket,
  PublicProfile,
  PresenceStatus,
  RewardProgress,
  ResultCard,
  SiteState,
  SparkPoll,
  SparkReactionName,
  SparkMessageType,
  StepCompletionChecklist,
  WalletState,
  WalletAccount,
  WalletTransaction,
} from "@/lib/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseReadClient } from "@/lib/supabase/read";

export { CARD_TOP_UP_FEE_RATE, SOVEREIGN_SPARK_RATE, getFeeSchedule, getSovereignSparkFeeCents } from "@/lib/fee-schedule";
export const STARTER_WALLET_CENTS = 4000;
const STARTER_WALLET_REFERENCE = "starter-wallet-v1";
const DEFAULT_CONTACT_SYNC_CONSENT: ContactSyncConsent = {
  status: "unknown",
};

function getSupabaseErrorShape(error: unknown) {
  if (!error || typeof error !== "object") {
    return { message: "", code: "" };
  }

  return {
    message: "message" in error && typeof error.message === "string" ? error.message : "",
    code: "code" in error && typeof error.code === "string" ? error.code : "",
  };
}

function isRecoverablePublicDataError(error: unknown) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes("invalid api key");
  }

  const { message, code } = getSupabaseErrorShape(error);
  const normalized = message.toLowerCase();

  return (
    normalized.includes("invalid api key") ||
    normalized.includes("does not exist") ||
    normalized.includes("schema cache") ||
    normalized.includes("could not find") ||
    code === "42703" ||
    code === "42P01" ||
    code === "PGRST116" ||
    code === "PGRST200" ||
    code === "PGRST204"
  );
}

function compactWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function sanitizeHandleCandidate(value: string | null | undefined) {
  const normalized = compactWhitespace(value ?? "")
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  const clipped = normalized.slice(0, 20).replace(/_+$/g, "");
  if (!clipped) {
    return "member";
  }

  return /^[a-z]/.test(clipped) ? clipped : `member_${clipped}`.slice(0, 24);
}

function formatFallbackDisplayName(value: string | null | undefined) {
  const cleaned = compactWhitespace(
    (value ?? "")
      .replace(/[._-]+/g, " ")
      .replace(/\s+/g, " "),
  );

  if (!cleaned) {
    return "";
  }

  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function isAuthenticatedSessionToken(sessionToken: string | null | undefined) {
  return Boolean(sessionToken?.startsWith("auth:"));
}

function logPublicDataFallback(scope: string, error: unknown) {
  const reason =
    error instanceof Error
      ? error.message
      : error && typeof error === "object" && "message" in error && typeof error.message === "string"
        ? error.message
        : "Unknown error";
  console.warn(`[paytocommit-data] ${scope} falling back to safe public data: ${reason}`);
}

type PoolRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  status: string;
  stake_min_cents: number;
  stake_max_cents: number;
  proof_mode: string;
  rules: string[] | null;
  opens_at: string | null;
  join_opens_at: string | null;
  join_closes_at: string | null;
  closes_at: string | null;
  resolves_at: string | null;
  proof_window_minutes: number;
  challenge_window_minutes: number;
  target_goal: string;
  stake_band_label: string | null;
  result_state: string;
  network_state: string;
  payout_label: string;
  trend_label: string;
  tags: string[] | null;
  featured: boolean;
  pool_stats?: PoolStatsRow | PoolStatsRow[] | null;
};

type PoolStatsRow = {
  pool_id: string;
  participant_count: number;
  ticket_count: number;
  total_staked_cents: number;
  completed_count: number;
  missed_count: number;
  message_count: number;
  live_total_visible: boolean;
  last_activity_at: string | null;
};

type ChainRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  status: string;
  stake_min_cents: number;
  stake_max_cents: number;
  assembly_fee_cents: number;
  payout_label: string;
  primary_pool?: PoolLegRow | PoolLegRow[] | null;
  secondary_pool?: PoolLegRow | PoolLegRow[] | null;
};

type PoolLegRow = {
  slug: string;
  title: string;
  closes_at: string | null;
  proof_mode: string;
};

type WalletAccountRow = {
  id: string;
  app_user_id: string;
  currency: string;
  available_cents: number;
  pending_cents: number;
  locked_cents: number;
};

type AppUserRow = {
  id: string;
  session_token: string;
  display_name: string;
  handle: string;
  joined_at: string;
};

type ProfileIdentityRow = {
  identity_status: "not_started" | "pending" | "verified" | "failed" | null;
};

type AuthenticatedAppProfileSeed = {
  displayName: string;
  handle: string;
};

type WalletTransactionRow = {
  id: string;
  type: string;
  status: string;
  amount_cents: number;
  fee_cents: number;
  net_cents: number;
  summary: string;
  external_reference: string | null;
  created_at: string;
};

type TicketRow = {
  id: string;
  pool_id: string;
  stake_cents: number;
  contract_fee_cents: number;
  proof_status: string;
  result_status: string;
  metadata: Record<string, unknown> | null;
  joined_at: string;
  commitment_pools?: {
    slug: string;
    title: string;
    category: string;
    status: string;
    closes_at: string | null;
    proof_window_minutes: number;
    proof_mode: string;
    payout_label: string;
  } | Array<{
    slug: string;
    title: string;
    category: string;
    status: string;
    closes_at: string | null;
    proof_window_minutes: number;
    proof_mode: string;
    payout_label: string;
  }> | null;
};

type ChainTicketRow = {
  id: string;
  stake_cents: number;
  result_status: string;
  joined_at: string;
  chains?: {
    slug: string;
    title: string;
  } | Array<{
    slug: string;
    title: string;
  }> | null;
};

type MessageRow = {
  id: string;
  pool_id: string | null;
  body: string;
  message_type: SparkMessageType | null;
  metadata: Record<string, unknown> | null;
  tenor_gif_url: string | null;
  created_at: string;
  app_user_id?: string;
  app_users?: {
    display_name: string;
    handle: string;
  } | Array<{
    display_name: string;
    handle: string;
  }> | null;
  commitment_pools?: {
    slug: string;
    title: string;
  } | Array<{
    slug: string;
    title: string;
  }> | null;
};

type MessageReplyRow = {
  id: string;
  message_id: string;
  body: string;
  tenor_gif_url: string | null;
  created_at: string;
  app_users?: {
    display_name: string;
    handle: string;
  } | Array<{
    display_name: string;
    handle: string;
  }> | null;
};

type MessageReactionRow = {
  target_type: string;
  target_id: string;
  app_user_id: string;
  reaction: SparkReactionName;
};

type RewardRow = {
  successful_stakes: number;
  required_stakes: number;
  fees_captured_cents: number;
  payout_unlocked: boolean;
};

type LedgerRow = {
  id: string;
  event_type: string;
  created_at: string;
  payload: Record<string, unknown>;
  commitment_pools?: {
    title: string;
  } | Array<{
    title: string;
  }> | null;
};

type NotificationRow = {
  id: string;
  title: string;
  summary: string;
  tone: "live" | "upcoming" | "settling" | "settled";
  created_at: string;
};

type PublicProfileRow = {
  app_user_id: string;
  headline: string;
  home_base: string;
  visibility: "public" | "private";
  share_proof_artifacts: boolean;
  presence_status?: PresenceStatus;
  custom_activity_text?: string | null;
  custom_activity_expires_at?: string | null;
};

type AiMarketDraftRow = {
  id: string;
  prompt: string;
  title: string;
  category: string;
  summary: string;
  target_goal: string;
  proof_mode: string;
  stake_min_cents: number;
  stake_max_cents: number;
  closes_at: string;
  resolves_at: string;
  proof_window_minutes: number;
  challenge_window_minutes: number;
  rules: string[] | null;
  invalidation_cases: string[] | null;
  proof_checklist: string[] | null;
  tags: string[] | null;
  status: "drafted" | "confirmed" | "opened";
};

type AiVerificationJobRow = {
  id: string;
  ticket_id: string;
  outcome: "completed" | "missed" | "needs_more_evidence";
  confidence: number;
  explanation: string;
  model: string;
  status: "queued" | "resolved" | "appealed";
  proof_summary: string;
  proof_links: string[] | null;
  created_at: string;
  resolved_at: string | null;
  pool_tickets?: {
    pool_id: string;
    commitment_pools?: {
      slug: string;
      title: string;
      proof_mode: string;
    } | Array<{
      slug: string;
      title: string;
      proof_mode: string;
    }> | null;
  } | Array<{
    pool_id: string;
    commitment_pools?: {
      slug: string;
      title: string;
      proof_mode: string;
    } | Array<{
      slug: string;
      title: string;
      proof_mode: string;
    }> | null;
  }> | null;
};

type AiAppealJobRow = {
  id: string;
  verification_job_id: string;
  ticket_id: string;
  appeal_reason: string;
  outcome: "completed" | "missed" | "needs_more_evidence";
  confidence: number;
  explanation: string;
  model: string;
  status: "queued" | "resolved";
  created_at: string;
  resolved_at: string | null;
};

type ResultCardRow = {
  ticket_id: string;
  card_type: "completed" | "missed";
  title: string;
  subtitle: string;
  summary: string;
  net_result_cents: number;
  created_at: string;
};

function compactCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 1,
    notation: amount >= 1000 ? "compact" : "standard",
  }).format(amount);
}

export function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function formatPoolTotal(cents: number) {
  return `${compactCurrency(cents / 100)} pooled`;
}

export function formatDateLabel(value: string | null) {
  if (!value) {
    return "TBD";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short",
  }).format(new Date(value));
}

export function formatDurationLabel(minutes: number) {
  if (minutes === 0) {
    return "Proof closes at deadline";
  }

  if (minutes < 60) {
    return `${minutes} minutes after deadline`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (!remainder) {
    return `${hours} hour${hours === 1 ? "" : "s"} after deadline`;
  }

  return `${hours}h ${remainder}m after deadline`;
}

function addMinutesToIso(value: string, minutes: number) {
  return new Date(new Date(value).getTime() + minutes * 60 * 1000).toISOString();
}

function buildFallbackIso(seed: string, offsetMinutes: number) {
  const hash = seed.split("").reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 7), 0);
  return new Date(Date.now() + (offsetMinutes + (hash % 45)) * 60 * 1000).toISOString();
}

function formatCountdownLabel(value: string) {
  const delta = new Date(value).getTime() - Date.now();
  if (delta <= 0) {
    return "now";
  }

  const totalMinutes = Math.ceil(delta / (60 * 1000));
  if (totalMinutes < 60) {
    return `in ${totalMinutes} minute${totalMinutes === 1 ? "" : "s"}`;
  }

  const totalHours = Math.ceil(totalMinutes / 60);
  if (totalHours < 48) {
    return `in ${totalHours} hour${totalHours === 1 ? "" : "s"}`;
  }

  const totalDays = Math.ceil(totalHours / 24);
  return `in ${totalDays} day${totalDays === 1 ? "" : "s"}`;
}

function buildScheduleSummary(parts: Array<string | null | undefined>) {
  return parts.filter((part): part is string => Boolean(part && part.trim())).join(" • ");
}

function buildPoolScheduleState(input: {
  seed: string;
  status: CommitmentPool["status"];
  opensAt: string | null;
  joinOpensAt: string | null;
  joinClosesAt: string | null;
  closesAt: string | null;
  resolvesAt: string | null;
  proofWindowMinutes: number;
}) {
  const opensAt =
    input.opensAt ??
    (input.status === "upcoming"
      ? buildFallbackIso(`${input.seed}-open`, 12 * 60)
      : buildFallbackIso(`${input.seed}-open`, -24 * 60));
  const joinOpensAt =
    input.joinOpensAt ??
    (input.status === "upcoming"
      ? new Date(new Date(opensAt).getTime() - 6 * 60 * 60 * 1000).toISOString()
      : opensAt);
  const joinClosesAt =
    input.joinClosesAt ??
    input.closesAt ??
    buildFallbackIso(input.seed, input.status === "upcoming" ? 30 * 60 : 6 * 60);
  const proofWindowOpensAt = joinClosesAt;
  const proofWindowClosesAt = addMinutesToIso(proofWindowOpensAt, input.proofWindowMinutes || 60);
  const resolutionTargetAt = input.resolvesAt ?? addMinutesToIso(proofWindowClosesAt, 120);
  const settlementFinalizedAt =
    input.status === "settled" ? addMinutesToIso(resolutionTargetAt, 120) : null;
  let lifecycleState: CommitmentPool["lifecycleState"] = "join_open";
  const nowMs = Date.now();
  const opensAtMs = new Date(opensAt).getTime();
  const joinOpenMs = new Date(joinOpensAt).getTime();
  const joinCloseMs = new Date(joinClosesAt).getTime();
  const proofWindowCloseMs = new Date(proofWindowClosesAt).getTime();
  const resolutionTargetMs = new Date(resolutionTargetAt).getTime();
  const preOpenStakeLive = nowMs >= joinOpenMs && nowMs < opensAtMs;
  const opensInLabel = nowMs < opensAtMs ? `Opens ${formatCountdownLabel(opensAt)}` : null;
  const joinClosesInLabel = nowMs < joinCloseMs ? `Join closes ${formatCountdownLabel(joinClosesAt)}` : "Join closed";
  const proofClosesInLabel =
    nowMs <= proofWindowCloseMs ? `Proof closes ${formatCountdownLabel(proofWindowClosesAt)}` : "Proof window closed";

  if (input.status === "settling") {
    lifecycleState = "under_review";
  } else if (input.status === "settled") {
    lifecycleState = "resolved";
  } else if (nowMs < joinOpenMs) {
    lifecycleState = input.status === "upcoming" ? "upcoming" : "scheduled";
  } else if (nowMs > joinCloseMs && nowMs <= proofWindowCloseMs) {
    lifecycleState = "proof_window_open";
  } else if (nowMs > proofWindowCloseMs && nowMs <= resolutionTargetMs) {
    lifecycleState = "proof_window_closed";
  } else if (resolutionTargetMs < nowMs) {
    lifecycleState = "under_review";
  } else if (joinCloseMs - nowMs <= 6 * 60 * 60 * 1000) {
    lifecycleState = "join_closing_soon";
  }

  return {
    lifecycleState,
    opensAt,
    joinOpensAt,
    joinClosesAt,
    opensAtLabel: formatDateLabel(opensAt),
    joinClosesAtLabel: formatDateLabel(joinClosesAt),
    opensInLabel,
    joinClosesInLabel,
    proofWindowOpensAt,
    proofWindowClosesAt,
    resolutionTargetAt,
    settlementFinalizedAt,
    joinStatusLabel:
      preOpenStakeLive
        ? `Stake live now • official open ${formatCountdownLabel(opensAt)}`
        : lifecycleState === "upcoming" || lifecycleState === "scheduled"
        ? `Opens ${formatCountdownLabel(opensAt)}`
        : lifecycleState === "join_open" || lifecycleState === "join_closing_soon"
          ? `Join closes ${formatCountdownLabel(joinClosesAt)}`
          : lifecycleState === "proof_window_open"
            ? `Proof closes ${formatCountdownLabel(proofWindowClosesAt)}`
            : lifecycleState === "proof_window_closed"
              ? "Proof window closed"
              : lifecycleState === "under_review"
                ? "Under review"
                : "Join closed",
    timingSummaryLabel:
      preOpenStakeLive
        ? buildScheduleSummary(["Stake live now", opensInLabel, joinClosesInLabel])
        : lifecycleState === "upcoming" || lifecycleState === "scheduled"
          ? buildScheduleSummary([opensInLabel, joinClosesInLabel])
          : lifecycleState === "join_open" || lifecycleState === "join_closing_soon"
            ? buildScheduleSummary([joinClosesInLabel, `Official open ${formatDateLabel(opensAt)}`])
            : lifecycleState === "proof_window_open"
                ? buildScheduleSummary([proofClosesInLabel, `Result target ${formatDateLabel(resolutionTargetAt)}`])
                : lifecycleState === "proof_window_closed"
                  ? buildScheduleSummary(["Proof window closed", `Result target ${formatDateLabel(resolutionTargetAt)}`])
                  : lifecycleState === "under_review"
                    ? buildScheduleSummary(["Under review", `Result target ${formatDateLabel(resolutionTargetAt)}`])
                    : lifecycleState === "resolved"
                      ? "Resolved and settled under the posted rules."
                      : lifecycleState === "voided"
                        ? "This market was voided under the posted rules."
                        : lifecycleState === "canceled"
                          ? "This market was canceled before completion."
                          : joinClosesInLabel,
    notifyMeAvailable: lifecycleState === "upcoming" || lifecycleState === "scheduled",
    marketOpenReminderAvailable:
      lifecycleState === "upcoming" || lifecycleState === "scheduled" || preOpenStakeLive,
    preOpenStakeLive,
  };
}

function buildInviteCountdown(baseIso: string | null): InviteCountdownTimer | null {
  if (!baseIso) {
    return null;
  }

  const base = new Date(baseIso);
  if (Number.isNaN(base.getTime())) {
    return null;
  }

  const expiresAt = new Date(base.getTime() + 14 * 24 * 60 * 60 * 1000);
  const remainingSeconds = Math.max(Math.floor((expiresAt.getTime() - Date.now()) / 1000), 0);
  const days = Math.floor(remainingSeconds / (24 * 60 * 60));
  const hours = Math.floor((remainingSeconds % (24 * 60 * 60)) / 3600);

  return {
    label: remainingSeconds === 0 ? "Invite bonus expired" : `${days}d ${hours}h left`,
    expiresAt: expiresAt.toISOString(),
    remainingSeconds,
  };
}

function buildReferralChecklist(input: {
  hasViewer: boolean;
  hasFundedWallet: boolean;
  hasStake: boolean;
  hasVerifiedCompletion: boolean;
}): StepCompletionChecklist[] {
  return [
    {
      id: "signup",
      label: "Sign up",
      completed: input.hasViewer,
    },
    {
      id: "fund-wallet",
      label: "Fund wallet",
      completed: input.hasFundedWallet,
    },
    {
      id: "stake",
      label: "Stake",
      completed: input.hasStake,
    },
    {
      id: "submit-proof",
      label: "Submit STP proof",
      completed: input.hasVerifiedCompletion,
    },
  ];
}

function parseDurationLabelToMinutes(value: string | null | undefined, fallbackMinutes: number) {
  if (!value) {
    return fallbackMinutes;
  }

  const normalized = compactWhitespace(value).toLowerCase();

  if (normalized === "proof closes at deadline") {
    return 0;
  }

  const hourMinuteMatch = normalized.match(/^(\d+)h\s*(\d+)m/);
  if (hourMinuteMatch) {
    return Number(hourMinuteMatch[1]) * 60 + Number(hourMinuteMatch[2]);
  }

  const hourMatch = normalized.match(/^(\d+)\s*hour/);
  if (hourMatch) {
    return Number(hourMatch[1]) * 60;
  }

  const minuteMatch = normalized.match(/^(\d+)\s*minute/);
  if (minuteMatch) {
    return Number(minuteMatch[1]);
  }

  return fallbackMinutes;
}

function normalizeDraftDate(value: string | null | undefined, fallbackMinutesFromNow: number) {
  if (value) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return new Date(Date.now() + fallbackMinutesFromNow * 60 * 1000).toISOString();
}

function buildTrendPoints(
  seed: string,
  totalCents: number,
  status: CommitmentPool["status"],
  exactDollarsVisible: boolean,
) {
  const base = Math.max(18, Math.min(88, Math.round(totalCents / 125)));
  const source = seed.split("").reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 3), 0);
  const direction = status === "upcoming" ? 1 : status === "settling" ? -1 : 0;
  const baseTime = Date.now() - 6 * 60 * 60 * 1000;

  return Array.from({ length: 7 }, (_, index) => {
    const drift = ((source + index * 17) % 14) - 7;
    const wave = Math.round(Math.sin((source + index * 33) / 40) * 8);
    const value = Math.max(6, Math.min(96, base + drift + wave + direction * index));
    const pulseCents = Math.max(1000, Math.round(totalCents / 10 + index * 375 + ((source + index * 19) % 900)));
    const timestamp = new Date(baseTime + index * 60 * 60 * 1000);
    return {
      label: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Now"][index] ?? `T${index + 1}`,
      value,
      volume: Math.max(1, Math.round(totalCents / 100 + index * 4 + ((source + index) % 9))),
      timestampLabel: timestamp.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      pulseLabel: exactDollarsVisible ? `${formatCurrency(pulseCents)} stake verified` : "Stake activity building",
      truthAnchorTitle: index % 2 === 0 ? "Proof packet in review" : "Ledger activity synced",
      truthAnchorDetail:
        index % 2 === 0
          ? "Recent proof events and stake movement are aligned on the same timeline."
          : "Market activity and result timing remain inside the published reveal policy.",
      revealState: exactDollarsVisible ? ("revealed" as const) : ("hidden" as const),
    };
  });
}

function relationOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

function toPool(row: PoolRow): CommitmentPool {
  const stats = relationOne(row.pool_stats);
  const min = row.stake_min_cents ?? 0;
  const max = row.stake_max_cents ?? 0;
  const stakeBand = row.stake_band_label ?? `${formatCurrency(min)} to ${formatCurrency(max)}`;
  const visiblePoolTotal = Boolean(stats?.live_total_visible);
  const totalStakedCents = stats?.total_staked_cents ?? 0;
  const schedule = buildPoolScheduleState({
    seed: row.slug,
    status: (row.status as CommitmentPool["status"]) ?? "upcoming",
    opensAt: row.opens_at,
    joinOpensAt: row.join_opens_at,
    joinClosesAt: row.join_closes_at,
    closesAt: row.closes_at,
    resolvesAt: row.resolves_at,
    proofWindowMinutes: row.proof_window_minutes,
  });

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    summary: row.summary,
    status: (row.status as CommitmentPool["status"]) ?? "upcoming",
    lifecycleState: schedule.lifecycleState,
    stakeRange: stakeBand,
    stakeFloor: formatCurrency(min),
    stakeFloorCents: min,
    stakeMaxCents: max,
    stakeBand,
    participantCount: stats?.participant_count ?? 0,
    volumeLabel: visiblePoolTotal ? formatPoolTotal(totalStakedCents) : "Pool total opens on first committed stake",
    targetGoal: row.target_goal,
    preOpenDisplayState: visiblePoolTotal ? "first-join" : "market-open",
    visiblePoolTotal,
    opensAt: schedule.opensAt,
    joinOpensAt: schedule.joinOpensAt,
    joinClosesAt: schedule.joinClosesAt,
    opensAtLabel: schedule.opensAtLabel,
    joinClosesAtLabel: schedule.joinClosesAtLabel,
    opensInLabel: schedule.opensInLabel,
    joinClosesInLabel: schedule.joinClosesInLabel,
    timingSummaryLabel: schedule.timingSummaryLabel,
    proofWindowOpensAt: schedule.proofWindowOpensAt,
    proofWindowClosesAt: schedule.proofWindowClosesAt,
    resolutionTargetAt: schedule.resolutionTargetAt,
    settlementFinalizedAt: schedule.settlementFinalizedAt,
    joinStatusLabel: schedule.joinStatusLabel,
    notifyMeAvailable: schedule.notifyMeAvailable,
    marketOpenReminderAvailable: schedule.marketOpenReminderAvailable,
    preOpenStakeLive: schedule.preOpenStakeLive,
    closesAt: formatDateLabel(schedule.joinClosesAt),
    resolvesAt: formatDateLabel(row.resolves_at),
    proofWindow: formatDurationLabel(row.proof_window_minutes),
    challengeWindow: formatDurationLabel(row.challenge_window_minutes),
    evidenceMode: row.proof_mode,
    payoutLabel: row.payout_label,
    resultState: row.result_state,
    networkState: row.network_state,
    rulesPath: `/pools/${row.slug}/rules`,
    sparkCount: stats?.message_count ?? 0,
    trendLabel: row.trend_label,
    ruleHighlights: row.rules ?? [],
    tags: row.tags ?? [],
    ticketCount: stats?.ticket_count ?? 0,
    liveTotalCents: totalStakedCents,
    categoryAnchor: slugify(row.category),
    trendPoints: buildTrendPoints(
      row.slug,
      totalStakedCents || min,
      (row.status as CommitmentPool["status"]) ?? "live",
      visiblePoolTotal,
    ),
  };
}

function toChainLeg(row: PoolLegRow | null): ChainLeg {
  return {
    poolSlug: row?.slug ?? "",
    poolTitle: row?.title ?? "Unknown pool",
    deadlineLabel: formatDateLabel(row?.closes_at ?? null),
    proofMode: row?.proof_mode ?? "Proof required",
  };
}

function toChain(row: ChainRow): Chain {
  const legA = toChainLeg(relationOne(row.primary_pool));
  const legB = toChainLeg(relationOne(row.secondary_pool));

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    summary: row.summary,
    status: (row.status as Chain["status"]) ?? "live",
    assemblyFeeLabel: formatCurrency(row.assembly_fee_cents),
    stakeBand: `${formatCurrency(row.stake_min_cents)} to ${formatCurrency(row.stake_max_cents)}`,
    totalStakedLabel: "Fully funded by Chain entrants",
    completionRule: "Both legs must resolve completed or the Chain closes missed.",
    payoutLabel: row.payout_label,
    sparkCount: 0,
    legA,
    legB,
  };
}

function toWalletAccount(row: WalletAccountRow | null): WalletAccount {
  return {
    id: row?.id ?? "wallet",
    availableCents: row?.available_cents ?? 0,
    pendingCents: row?.pending_cents ?? 0,
    lockedCents: row?.locked_cents ?? 0,
    availableLabel: formatCurrency(row?.available_cents ?? 0),
    pendingLabel: formatCurrency(row?.pending_cents ?? 0),
    lockedLabel: formatCurrency(row?.locked_cents ?? 0),
    currency: row?.currency ?? "USD",
  };
}

function toWalletTransaction(row: WalletTransactionRow): WalletTransaction {
  return {
    id: row.id,
    type: row.type as WalletTransaction["type"],
    status: row.status as WalletTransaction["status"],
    amountCents: row.amount_cents,
    feeCents: row.fee_cents,
    netCents: row.net_cents,
    amountLabel: formatCurrency(row.amount_cents),
    feeLabel: formatCurrency(row.fee_cents),
    netLabel: formatCurrency(row.net_cents),
    summary: row.summary,
    createdAt: formatDateLabel(row.created_at),
    externalReference: row.external_reference,
  };
}

function toPoolTicket(row: TicketRow): PoolTicket {
  const pool = relationOne(row.commitment_pools);
  const poolClosesAt = pool?.closes_at ?? null;
  const proofWindowClosesAt =
    poolClosesAt && pool?.proof_window_minutes
      ? addMinutesToIso(poolClosesAt, pool.proof_window_minutes)
      : null;
  const nowMs = Date.now();
  const closeMs = poolClosesAt ? new Date(poolClosesAt).getTime() : Number.NaN;
  const proofWindowMs = proofWindowClosesAt ? new Date(proofWindowClosesAt).getTime() : Number.NaN;
  const exitType =
    row.metadata && typeof row.metadata === "object" && typeof row.metadata.exit_type === "string"
      ? row.metadata.exit_type
      : null;
  let lifecycleState: PoolTicket["lifecycleState"] = "join_open";

  if (row.result_status === "completed" || row.result_status === "missed") {
    lifecycleState = "resolved";
  } else if (exitType === "early_release") {
    lifecycleState = "voided";
  } else if (Number.isFinite(closeMs) && nowMs > closeMs && Number.isFinite(proofWindowMs) && nowMs <= proofWindowMs) {
    lifecycleState = "proof_window_open";
  } else if (Number.isFinite(proofWindowMs) && nowMs > proofWindowMs) {
    lifecycleState = "under_review";
  } else if (Number.isFinite(closeMs) && closeMs - nowMs <= 6 * 60 * 60 * 1000) {
    lifecycleState = "join_closing_soon";
  }

  const earlyReleaseAvailable = row.result_status === "active" && Number.isFinite(closeMs) && nowMs < closeMs;
  const penaltyCents = Math.round(row.stake_cents * 0.05);
  const refundCents = Math.max(row.stake_cents - penaltyCents, 0);

  return {
    id: row.id,
    poolId: row.pool_id,
    poolSlug: pool?.slug ?? "",
    poolTitle: pool?.title ?? "Pool",
    poolCategory: pool?.category ?? "Commitment Markets",
    stakeCents: row.stake_cents,
    stakeLabel: formatCurrency(row.stake_cents),
    status: row.result_status as PoolTicket["status"],
    proofStatus: row.proof_status,
    joinedAt: formatDateLabel(row.joined_at),
    lifecycleState,
    joinStatusLabel:
      lifecycleState === "join_open" || lifecycleState === "join_closing_soon"
        ? `Join closes ${formatCountdownLabel(poolClosesAt ?? new Date().toISOString())}`
        : lifecycleState === "proof_window_open"
          ? `Proof closes ${formatCountdownLabel(proofWindowClosesAt ?? new Date().toISOString())}`
          : lifecycleState === "under_review"
            ? "Under review"
            : lifecycleState === "voided"
              ? "Left early"
              : "Join closed",
    joinClosesAt: poolClosesAt,
    proofWindowClosesAt,
    proofMode: pool?.proof_mode ?? "Standard proof",
    earlyReleaseAvailable,
    earlyReleaseQuote: earlyReleaseAvailable
      ? {
          originalStakeCents: row.stake_cents,
          originalStakeLabel: formatCurrency(row.stake_cents),
          penaltyRate: 0.05,
          penaltyCents,
          penaltyLabel: formatCurrency(penaltyCents),
          refundCents,
          refundLabel: formatCurrency(refundCents),
          confirmedAtLabel: formatDateLabel(new Date().toISOString()),
        }
      : null,
    integrityImpactPreview: earlyReleaseAvailable
      ? {
          title: "Integrity Score impact preview",
          body:
            "Early Release records an abandoned commitment. It can lower your HRS now, but later verified finishes can rebuild that standing over time.",
          trend: "negative",
        }
      : null,
    noRejoinMessage: earlyReleaseAvailable
      ? "Once Early Release is confirmed, this market instance stays closed to you and the exit remains in your history."
      : null,
    resultLabel:
      exitType === "early_release"
        ? "Early Release recorded"
        : row.result_status === "active"
          ? "Waiting on proof and result review"
          : row.result_status,
    feeLabel: formatCurrency(row.contract_fee_cents),
  };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function hashToken(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}

function deterministicPresence(handle: string): PresenceStatus {
  const hash = Number.parseInt(hashToken(handle), 36);
  const bucket = Math.abs(hash) % 4;

  switch (bucket) {
    case 0:
      return "online";
    case 1:
      return "away";
    case 2:
      return "dnd";
    default:
      return "invisible";
  }
}

function deterministicActivity(handle: string): CustomActivityStatus | null {
  const activities = [
    "Drafting a fresh market",
    "Closing a streak clean",
    "Watching live proof",
    "Running a live Chain",
  ];
  const hash = Number.parseInt(hashToken(`${handle}-activity`), 36);
  const text = activities[Math.abs(hash) % activities.length];

  return {
    text,
    expiresAt: null,
    durationLabel: "Until cleared",
  };
}

function toCustomActivityStatus(record?: {
  custom_activity_text?: string | null;
  custom_activity_expires_at?: string | null;
} | null, handle?: string): CustomActivityStatus | null {
  if (record?.custom_activity_text) {
    return {
      text: record.custom_activity_text,
      expiresAt: record.custom_activity_expires_at ?? null,
      durationLabel: record.custom_activity_expires_at ? "Scheduled" : "Until cleared",
    };
  }

  return handle ? deterministicActivity(handle) : null;
}

type SparkPollVoteRecord = {
  appUserId: string;
  optionId: string | null;
};

function normalizeSparkPollVotes(metadata: Record<string, unknown>): SparkPollVoteRecord[] {
  const votes = metadata.pollVotes;
  if (!Array.isArray(votes)) {
    return [];
  }

  return votes.reduce<SparkPollVoteRecord[]>((accumulator, entry) => {
    if (typeof entry === "string") {
      accumulator.push({
        appUserId: entry,
        optionId: null,
      });
      return accumulator;
    }

    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return accumulator;
    }

    const vote = entry as Record<string, unknown>;
    if (typeof vote.appUserId !== "string") {
      return accumulator;
    }

    accumulator.push({
      appUserId: vote.appUserId,
      optionId: typeof vote.optionId === "string" ? vote.optionId : null,
    });
    return accumulator;
  }, []);
}

function normalizeMessageMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function toSparkPoll(metadata: Record<string, unknown>, viewerId?: string | null): SparkPoll | null {
  const poll = metadata.poll;
  if (!poll || typeof poll !== "object" || Array.isArray(poll)) {
    return null;
  }

  const pollRecord = poll as Record<string, unknown>;
  const question = typeof pollRecord.question === "string" ? pollRecord.question : null;
  const options: SparkPoll["options"] = Array.isArray(pollRecord.options)
    ? pollRecord.options.reduce<SparkPoll["options"]>((accumulator, option) => {
        if (!option || typeof option !== "object" || Array.isArray(option)) {
          return accumulator;
        }

        const candidate = option as Record<string, unknown>;
        if (typeof candidate.id !== "string" || typeof candidate.label !== "string") {
          return accumulator;
        }

        accumulator.push({
          id: candidate.id,
          label: candidate.label,
          votes: typeof candidate.votes === "number" ? candidate.votes : 0,
        });
        return accumulator;
      }, [])
    : [];

  if (!question || !options.length) {
    return null;
  }

  const votes = normalizeSparkPollVotes(metadata);
  const viewerVote = viewerId ? votes.find((vote) => vote.appUserId === viewerId) ?? null : null;

  return {
    question,
    options: options.map((option) => ({
      ...option,
      viewerSelected: viewerVote?.optionId === option.id,
    })),
    totalVotes: options.reduce((total, option) => total + option!.votes, 0),
    expiresAt: typeof pollRecord.expiresAt === "string" ? pollRecord.expiresAt : null,
    viewerHasVoted: Boolean(viewerVote),
  };
}

function aggregateCategories(pools: CommitmentPool[]): PoolCategorySummary[] {
  const categories = new Map<string, PoolCategorySummary>();

  pools.forEach((pool) => {
    const anchor = slugify(pool.category);
    const current = categories.get(pool.category) ?? {
      category: pool.category,
      anchor,
      totalCount: 0,
      liveCount: 0,
      upcomingCount: 0,
      settlingCount: 0,
      leadPoolSlug: pool.slug,
      leadPoolTitle: pool.title,
    };

    current.totalCount += 1;
    if (pool.status === "live") current.liveCount += 1;
    if (pool.status === "upcoming") current.upcomingCount += 1;
    if (pool.status === "settling") current.settlingCount += 1;
    if ((pool.liveTotalCents ?? 0) > 0 && (pool.liveTotalCents ?? 0) > (pools.find((item) => item.slug === current.leadPoolSlug)?.liveTotalCents ?? 0)) {
      current.leadPoolSlug = pool.slug;
      current.leadPoolTitle = pool.title;
    }

    categories.set(pool.category, current);
  });

  return [...categories.values()].sort((left, right) => right.liveCount - left.liveCount || left.category.localeCompare(right.category));
}

async function fetchPoolsRaw() {
  const client = createSupabaseReadClient();

  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from("commitment_pools")
    .select(
      `
        id,
        slug,
        title,
        category,
        summary,
        status,
        stake_min_cents,
        stake_max_cents,
        proof_mode,
        rules,
        opens_at,
        join_opens_at,
        join_closes_at,
        closes_at,
        resolves_at,
        proof_window_minutes,
        challenge_window_minutes,
        target_goal,
        stake_band_label,
        result_state,
        network_state,
        payout_label,
        trend_label,
        tags,
        featured,
        pool_stats (
          pool_id,
          participant_count,
          ticket_count,
          total_staked_cents,
          completed_count,
          missed_count,
          message_count,
          live_total_visible,
          last_activity_at
        )
      `,
    )
    .order("featured", { ascending: false })
    .order("closes_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as PoolRow[];
}

export async function listPools(options?: {
  status?: CommitmentPool["status"];
  category?: string;
  featuredOnly?: boolean;
}) {
  let pools = fallbackPools;

  try {
    const poolRows = await fetchPoolsRaw();
    if (poolRows.length) {
      pools = poolRows.map(toPool);
    }
  } catch (error) {
    logPublicDataFallback("listPools", error);
    if (!isRecoverablePublicDataError(error)) {
      throw error;
    }
  }

  return pools.filter((pool) => {
    if (options?.status && pool.status !== options.status) {
      return false;
    }
    if (options?.category && pool.category !== options.category) {
      return false;
    }
    return true;
  });
}

export async function listFeaturedPools() {
  return listPools();
}

export async function getPoolBySlug(slug: string) {
  const pools = await listPools();
  return pools.find((pool) => pool.slug === slug) ?? null;
}

export async function getPoolCategories() {
  return aggregateCategories(await listPools());
}

export async function listChains() {
  const client = createSupabaseReadClient();

  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from("chains")
    .select(
      `
        id,
        slug,
        title,
        summary,
        category,
        status,
        stake_min_cents,
        stake_max_cents,
        assembly_fee_cents,
        payout_label,
        primary_pool:commitment_pools!chains_primary_pool_id_fkey (
          slug,
          title,
          closes_at,
          proof_mode
        ),
        secondary_pool:commitment_pools!chains_secondary_pool_id_fkey (
          slug,
          title,
          closes_at,
          proof_mode
        )
      `,
    )
    .order("created_at", { ascending: true });

  if (error) {
    logPublicDataFallback("listChains", error);
    if (isRecoverablePublicDataError(error)) {
      return [] as Chain[];
    }
    throw error;
  }

  return ((data ?? []) as ChainRow[]).map(toChain);
}

export async function getChainBySlug(slug: string) {
  const chains = await listChains();
  return chains.find((chain) => chain.slug === slug) ?? null;
}

async function findAppUserBySessionToken(
  client: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  sessionToken: string,
) {
  const { data, error } = await client
    .from("app_users")
    .select("id, session_token, display_name, handle, joined_at")
    .eq("session_token", sessionToken)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as AppUserRow | null) ?? null;
}

async function getIdentityStatusForSession(
  client: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  sessionToken: string,
) {
  const authUserId = sessionToken.slice(5);
  const { data, error } = await client
    .from("profiles")
    .select("identity_status")
    .eq("user_id", authUserId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return ((data as ProfileIdentityRow | null)?.identity_status ?? "not_started") as "not_started" | "pending" | "verified" | "failed";
}

export async function getGenerationEligibilityStateForSession(
  sessionToken: string | null | undefined,
): Promise<GenerationEligibilityState> {
  const client = createSupabaseAdminClient();
  const viewer = await getOrCreateAppUser(sessionToken);

  if (!client || !viewer) {
    return {
      eligibility: "locked",
      reason: "guest",
      lastVerifiedCompletionAt: null,
      expiresAt: null,
    };
  }

  const { data, error } = await client
    .from("pool_tickets")
    .select("result_status, settled_at, joined_at")
    .eq("app_user_id", viewer.id)
    .eq("result_status", "completed")
    .order("settled_at", { ascending: false, nullsFirst: false })
    .order("joined_at", { ascending: false, nullsFirst: false })
    .limit(25);

  if (error) {
    throw error;
  }

  const latestCompletedTicket = ((data ?? []) as Array<{ settled_at: string | null; joined_at: string | null }>).find(
    (ticket) => {
      const referenceDate = ticket.settled_at ?? ticket.joined_at;
      if (!referenceDate) {
        return false;
      }

      const parsed = new Date(referenceDate);
      return !Number.isNaN(parsed.getTime());
    },
  );

  if (!latestCompletedTicket) {
    return {
      eligibility: "locked",
      reason: "no_verified_completion",
      lastVerifiedCompletionAt: null,
      expiresAt: null,
    };
  }

  const lastVerifiedCompletionAt = latestCompletedTicket.settled_at ?? latestCompletedTicket.joined_at;
  const lastCompletionMs = new Date(lastVerifiedCompletionAt as string).getTime();
  const expiresAtMs = lastCompletionMs + 30 * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(expiresAtMs).toISOString();
  const isActiveWindow = expiresAtMs >= Date.now();

  return {
    eligibility: isActiveWindow ? "unlocked" : "locked",
    reason: isActiveWindow ? "active_window" : "expired_window",
    lastVerifiedCompletionAt: lastVerifiedCompletionAt ?? null,
    expiresAt,
  };
}

export async function getGenerationEligibilityForSession(sessionToken: string | null | undefined) {
  const state = await getGenerationEligibilityStateForSession(sessionToken);
  return state.eligibility as GenerationEligibility;
}

async function resolveUniqueHandle(
  client: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  baseHandle: string,
  sessionToken: string,
  existingUserId?: string,
) {
  const tokenSuffix = sessionToken.replace(/[^a-z0-9]/gi, "").toLowerCase().slice(-6) || hashToken(sessionToken).slice(0, 6);
  const candidates = [
    baseHandle,
    `${baseHandle}_${tokenSuffix.slice(0, 4)}`,
    `${baseHandle}_${tokenSuffix}`,
    `member_${tokenSuffix}`,
  ];

  for (const candidate of candidates) {
    const clipped = candidate.slice(0, 26).replace(/_+$/g, "");
    const { data, error } = await client.from("app_users").select("id").eq("handle", clipped).maybeSingle();

    if (error) {
      throw error;
    }

    if (!data || data.id === existingUserId) {
      return clipped;
    }
  }

  return `member_${hashToken(sessionToken).slice(0, 10)}`;
}

async function buildAuthenticatedAppProfileSeed(
  client: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  sessionToken: string,
) {
  const authUserId = sessionToken.slice(5);
  let profileDisplayName: string | null = null;
  let profileHandle: string | null = null;
  let emailLocalPart: string | null = null;
  let metadataHandle: string | null = null;
  let metadataName: string | null = null;

  const { data: profileRow, error: profileError } = await client
    .from("profiles")
    .select("display_name, handle")
    .eq("user_id", authUserId)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  profileDisplayName = profileRow?.display_name ?? null;
  profileHandle = profileRow?.handle ?? null;

  const { data: authUserData, error: authUserError } = await client.auth.admin.getUserById(authUserId);
  if (!authUserError && authUserData.user) {
    emailLocalPart = authUserData.user.email?.split("@")[0] ?? null;
    const metadata = authUserData.user.user_metadata;

    if (metadata && typeof metadata === "object") {
      metadataHandle =
        typeof metadata.preferred_username === "string"
          ? metadata.preferred_username
          : typeof metadata.user_name === "string"
            ? metadata.user_name
            : typeof metadata.username === "string"
              ? metadata.username
              : typeof metadata.handle === "string"
                ? metadata.handle
                : null;
      metadataName =
        typeof metadata.display_name === "string"
          ? metadata.display_name
          : typeof metadata.full_name === "string"
            ? metadata.full_name
            : typeof metadata.name === "string"
              ? metadata.name
              : null;
    }
  }

  const displayName =
    compactWhitespace(profileDisplayName ?? metadataName ?? formatFallbackDisplayName(emailLocalPart) ?? "") ||
    `Member ${authUserId.slice(0, 4).toUpperCase()}`;
  const handle = sanitizeHandleCandidate(profileHandle ?? metadataHandle ?? emailLocalPart ?? displayName);

  return {
    displayName,
    handle,
  } satisfies AuthenticatedAppProfileSeed;
}

export async function getOrCreateAppUser(sessionToken: string | null | undefined) {
  const client = createSupabaseAdminClient();

  if (!client || !sessionToken || !isAuthenticatedSessionToken(sessionToken)) {
    return null;
  }

  const existing = await findAppUserBySessionToken(client, sessionToken);

  if (existing) {
    if (existing.handle.startsWith("member_") || existing.display_name.startsWith("Member ")) {
      const seed = await buildAuthenticatedAppProfileSeed(client, sessionToken);
      const nextHandle = await resolveUniqueHandle(client, seed.handle, sessionToken, existing.id);

      const { data: updated, error: updateError } = await client
        .from("app_users")
        .update({
          display_name: seed.displayName,
          handle: nextHandle,
        })
        .eq("id", existing.id)
        .select("id, session_token, display_name, handle, joined_at")
        .single();

      if (updateError) {
        throw updateError;
      }

      return updated as AppUserRow;
    }

    return existing as AppUserRow;
  }

  const seed = await buildAuthenticatedAppProfileSeed(client, sessionToken);
  let nextHandle = await resolveUniqueHandle(client, seed.handle, sessionToken);

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const { data: inserted, error: insertError } = await client
      .from("app_users")
      .upsert(
        {
          session_token: sessionToken,
          display_name: seed.displayName,
          handle: nextHandle,
        },
        {
          onConflict: "session_token",
          ignoreDuplicates: false,
        },
      )
      .select("id, session_token, display_name, handle, joined_at")
      .single();

    if (!insertError && inserted) {
      await client.from("wallet_accounts").upsert(
        {
          app_user_id: inserted.id,
          currency: "USD",
        },
        { onConflict: "app_user_id" },
      );

      return inserted as AppUserRow;
    }

    if (insertError?.code === "23505") {
      const racedInsert = await findAppUserBySessionToken(client, sessionToken);

      if (racedInsert) {
        await client.from("wallet_accounts").upsert(
          {
            app_user_id: racedInsert.id,
            currency: "USD",
          },
          { onConflict: "app_user_id" },
        );

        return racedInsert as AppUserRow;
      }

      nextHandle = await resolveUniqueHandle(
        client,
        `${seed.handle}_${hashToken(`${sessionToken}-${attempt}`).slice(0, 4)}`,
        sessionToken,
      );
      continue;
    }

    if (insertError) {
      throw insertError;
    }
  }

  const fallbackInsert = await findAppUserBySessionToken(client, sessionToken);
  if (fallbackInsert) {
    await client.from("wallet_accounts").upsert(
      {
        app_user_id: fallbackInsert.id,
        currency: "USD",
      },
      { onConflict: "app_user_id" },
    );

    return fallbackInsert as AppUserRow;
  }

  throw new Error("Unable to initialize your PayToCommit account.");
}

async function ensureStarterWalletState(
  client: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  viewer: AppUserRow,
  walletRow: WalletAccountRow | null,
) {
  const [
    { data: starterTransaction, error: starterTransactionError },
    { data: existingTransactions, error: existingTransactionsError },
    { data: existingPoolTickets, error: existingPoolTicketsError },
    { data: existingChainTickets, error: existingChainTicketsError },
  ] = await Promise.all([
    client
      .from("wallet_transactions")
      .select("id")
      .eq("app_user_id", viewer.id)
      .eq("external_reference", STARTER_WALLET_REFERENCE)
      .maybeSingle(),
    client.from("wallet_transactions").select("id").eq("app_user_id", viewer.id).limit(1),
    client.from("pool_tickets").select("id").eq("app_user_id", viewer.id).limit(1),
    client.from("chain_tickets").select("id").eq("app_user_id", viewer.id).limit(1),
  ]);

  if (starterTransactionError) throw starterTransactionError;
  if (existingTransactionsError) throw existingTransactionsError;
  if (existingPoolTicketsError) throw existingPoolTicketsError;
  if (existingChainTicketsError) throw existingChainTicketsError;

  if (starterTransaction) {
    return walletRow;
  }

  const hasExistingHistory =
    (existingTransactions ?? []).length > 0 ||
    (existingPoolTickets ?? []).length > 0 ||
    (existingChainTickets ?? []).length > 0;

  const shouldSeed =
    !hasExistingHistory &&
    (walletRow?.available_cents ?? 0) === 0 &&
    (walletRow?.pending_cents ?? 0) === 0 &&
    (walletRow?.locked_cents ?? 0) === 0;

  if (!shouldSeed) {
    return walletRow;
  }

  const { data: updatedWallet, error: walletUpdateError } = await client
    .from("wallet_accounts")
    .update({
      available_cents: STARTER_WALLET_CENTS,
    })
    .eq("app_user_id", viewer.id)
    .select("id, app_user_id, currency, available_cents, pending_cents, locked_cents")
    .single();

  if (walletUpdateError) {
    throw walletUpdateError;
  }

  const { error: transactionInsertError } = await client.from("wallet_transactions").insert({
    wallet_account_id: updatedWallet.id,
    app_user_id: viewer.id,
    type: "funding_posted",
    status: "posted",
    amount_cents: STARTER_WALLET_CENTS,
    fee_cents: 0,
    net_cents: STARTER_WALLET_CENTS,
    summary: "Opening wallet cash is ready.",
    external_reference: STARTER_WALLET_REFERENCE,
  });

  if (transactionInsertError) {
    if (transactionInsertError.code === "23505") {
      return updatedWallet as WalletAccountRow;
    }

    throw transactionInsertError;
  }

  return updatedWallet as WalletAccountRow;
}

async function ensurePublicProfileSettings(
  client: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  viewer: AppUserRow,
) {
  await client.from("public_profile_settings").upsert(
    {
      app_user_id: viewer.id,
      headline: "Closing commitment markets in public.",
      home_base: "PayToCommit",
      visibility: "public",
      share_proof_artifacts: false,
    },
    { onConflict: "app_user_id" },
  );
}

export async function getWalletAccountForSession(sessionToken: string | null | undefined) {
  const client = createSupabaseAdminClient();
  const viewer = await getOrCreateAppUser(sessionToken);

  if (!client || !viewer) {
    return { viewer: null, wallet: toWalletAccount(null) };
  }

  await client.from("wallet_accounts").upsert(
    {
      app_user_id: viewer.id,
      currency: "USD",
    },
    { onConflict: "app_user_id" },
  );
  await ensurePublicProfileSettings(client, viewer);

  const { data, error } = await client
    .from("wallet_accounts")
    .select("id, app_user_id, currency, available_cents, pending_cents, locked_cents")
    .eq("app_user_id", viewer.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const seededWallet = await ensureStarterWalletState(
    client,
    viewer,
    (data as WalletAccountRow | null) ?? null,
  );
  const identityStatus = await getIdentityStatusForSession(client, viewer.session_token);

  return {
    viewer: {
      id: viewer.id,
      displayName: viewer.display_name,
      handle: viewer.handle,
      sessionToken: viewer.session_token,
      joinedAt: formatDateLabel(viewer.joined_at),
      identityStatus,
    } as AppUser,
    wallet: toWalletAccount(seededWallet),
  };
}

export async function getWalletState(sessionToken: string | null | undefined) {
  const client = createSupabaseAdminClient();
  const { viewer, wallet } = await getWalletAccountForSession(sessionToken);

  if (!client || !viewer) {
    return {
      viewer,
      wallet,
      transactions: [] as WalletTransaction[],
      positions: [] as PoolPositionAggregate[],
      tickets: [] as PoolTicket[],
      chainTickets: [] as ChainTicket[],
      rewardProgress: {
        completedStakes: 0,
        requiredStakes: 3,
        generatedFees: formatCurrency(0),
        unlockState: "No reward cycle in progress",
        remaining: "3 completed stakes remaining",
        referrerReward: formatCurrency(1000),
        invitedReward: formatCurrency(1000),
        payoutState: "locked",
        inviteCountdown: null,
        checklist: [],
      } as RewardProgress,
      contactSyncConsent: DEFAULT_CONTACT_SYNC_CONSENT,
      notifications: [] as NotificationEvent[],
    };
  }

  const [{ data: txData, error: txError }, { data: ticketData, error: ticketError }, { data: chainTicketData, error: chainTicketError }, { data: rewardData, error: rewardError }, { data: notificationData, error: notificationError }] = await Promise.all([
    client
      .from("wallet_transactions")
      .select("id, type, status, amount_cents, fee_cents, net_cents, summary, external_reference, created_at")
      .eq("app_user_id", viewer.id)
      .order("created_at", { ascending: false })
      .limit(20),
    client
      .from("pool_tickets")
      .select(
        `
          id,
          pool_id,
          stake_cents,
          contract_fee_cents,
          proof_status,
          result_status,
          metadata,
          joined_at,
          commitment_pools (
            slug,
            title,
            category,
            status,
            closes_at,
            proof_window_minutes,
            proof_mode,
            payout_label
          )
        `,
      )
      .eq("app_user_id", viewer.id)
      .order("joined_at", { ascending: false }),
    client
      .from("chain_tickets")
      .select(
        `
          id,
          stake_cents,
          result_status,
          joined_at,
          chains (
            slug,
            title
          )
        `,
      )
      .eq("app_user_id", viewer.id)
      .order("joined_at", { ascending: false }),
    client
      .from("reliability_rewards")
      .select("successful_stakes, required_stakes, fees_captured_cents, payout_unlocked")
      .or(`referrer_user_id.eq.${viewer.id},invited_user_id.eq.${viewer.id}`)
      .limit(1)
      .maybeSingle(),
    client
      .from("app_notifications")
      .select("id, title, summary, tone, created_at")
      .eq("app_user_id", viewer.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (txError) throw txError;
  if (ticketError) throw ticketError;
  if (chainTicketError) throw chainTicketError;
  if (rewardError) throw rewardError;
  if (notificationError) throw notificationError;

  const tickets = ((ticketData ?? []) as TicketRow[]).map(toPoolTicket);
  const chainTickets = ((chainTicketData ?? []) as ChainTicketRow[]).map((ticket) => ({
    id: ticket.id,
    chainSlug: relationOne(ticket.chains)?.slug ?? "",
    title: relationOne(ticket.chains)?.title ?? "Chain",
    stakeLabel: formatCurrency(ticket.stake_cents),
    resultLabel: ticket.result_status,
    joinedAt: formatDateLabel(ticket.joined_at),
  }));
  const hasFundedWallet = ((txData ?? []) as WalletTransactionRow[]).some(
    (transaction) => transaction.type === "funding_posted" && transaction.status === "posted",
  );
  const hasStake = tickets.length > 0 || chainTickets.length > 0;
  const hasVerifiedCompletion = tickets.some((ticket) => ticket.status === "completed");
  const rewardBaseTimestamp =
    ((txData ?? []) as WalletTransactionRow[])[0]?.created_at ??
    ((ticketData ?? []) as TicketRow[])[0]?.joined_at ??
    null;
  const inviteCountdown = buildInviteCountdown(rewardBaseTimestamp);
  const checklist = buildReferralChecklist({
    hasViewer: true,
    hasFundedWallet,
    hasStake,
    hasVerifiedCompletion,
  });
  const groupedPositions = new Map<string, PoolPositionAggregate>();

  tickets.forEach((ticket) => {
    const current = groupedPositions.get(ticket.poolSlug) ?? {
      poolSlug: ticket.poolSlug,
      poolTitle: ticket.poolTitle,
      category: ticket.poolTitle,
      ticketCount: 0,
      totalStakeLabel: formatCurrency(0),
      currentState: ticket.resultLabel,
      resultLabel: ticket.resultLabel,
      payoutLabel: ticket.resultLabel,
      deadlineLabel: ticket.joinedAt,
    };

    current.ticketCount += 1;
    const currentStake = parseCurrencyLabel(current.totalStakeLabel);
    current.totalStakeLabel = formatCurrency(currentStake + ticket.stakeCents);
    current.currentState = ticket.status === "active" ? "Open" : ticket.status;
    current.resultLabel = ticket.resultLabel;
    current.payoutLabel = ticket.feeLabel;
    current.deadlineLabel = ticket.joinedAt;
    groupedPositions.set(ticket.poolSlug, current);
  });

  const reward = rewardData as RewardRow | null;
  const payoutState: RewardProgress["payoutState"] = reward?.payout_unlocked ? "ready" : reward || hasStake ? "tracking" : "locked";

  return {
    viewer,
    wallet,
    transactions: ((txData ?? []) as WalletTransactionRow[]).map(toWalletTransaction),
    positions: [...groupedPositions.values()],
    tickets,
    chainTickets,
    rewardProgress: {
      completedStakes: reward?.successful_stakes ?? 0,
      requiredStakes: reward?.required_stakes ?? 3,
      generatedFees: formatCurrency(reward?.fees_captured_cents ?? 0),
      unlockState: reward?.payout_unlocked ? "Unlocked" : "Waiting on covered completions",
      remaining: `${Math.max((reward?.required_stakes ?? 3) - (reward?.successful_stakes ?? 0), 0)} completed stakes remaining`,
      referrerReward: formatCurrency(1000),
      invitedReward: formatCurrency(1000),
      payoutState,
      inviteCountdown,
      checklist,
    },
    contactSyncConsent: DEFAULT_CONTACT_SYNC_CONSENT,
    notifications: ((notificationData ?? []) as NotificationRow[]).map((item) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      time: formatDateLabel(item.created_at),
      tone: item.tone,
    })),
  };
}

function parseCurrencyLabel(value: string) {
  const normalized = value.replace(/[^0-9.-]+/g, "");
  const numeric = Number(normalized);
  if (Number.isNaN(numeric)) {
    return 0;
  }
  return Math.round(numeric * 100);
}

function buildMarketHighway(pools: CommitmentPool[]) {
  return pools
    .filter((pool) => pool.status !== "settled")
    .slice(0, 6)
    .map((pool, index) => ({
      id: `${pool.slug}-highway`,
      label: pool.category.toUpperCase(),
      body:
        index % 2 === 0
          ? `@${pool.slug.replaceAll("-", "_")} just pushed ${pool.stakeFloor} into ${pool.title}.`
          : `${pool.title} is picking up speed with ${pool.sparkCount} live Spark updates.`,
      context: pool.visiblePoolTotal ? pool.volumeLabel : pool.targetGoal,
      tone: index % 3 === 0 ? "proof" : "live",
      time: pool.closesAt,
      poolSlug: pool.slug,
    })) satisfies MarketFeedItem[];
}

function buildSiteState(pools: CommitmentPool[], walletState: WalletState, sparkFeed: PoolMessage[], chains: Chain[]): SiteState {
  const livePools = pools.filter((pool) => pool.status === "live");
  const openingPools = pools.filter((pool) => pool.status === "upcoming");
  const settlingPools = pools.filter((pool) => pool.status === "settling");
  const categories = aggregateCategories(pools);
  const { wallet, tickets, notifications } = walletState;

  return {
    livePoolCount: livePools.length,
    liveChannelCount: Math.max(sparkFeed.length, livePools.length + chains.length),
    openingCount: openingPools.length,
    settlingCount: settlingPools.length,
    categories,
    topPools: [...pools]
      .sort((left, right) => (right.liveTotalCents ?? 0) - (left.liveTotalCents ?? 0))
      .slice(0, 4),
    openingPools: openingPools.slice(0, 4),
    settlingPools: settlingPools.slice(0, 4),
    marketHighway: buildMarketHighway(livePools.length ? livePools : pools),
    sparkHighlights: sparkFeed.slice(0, 5),
    chainSpotlight: chains.slice(0, 3),
    account: {
      cash: wallet.availableLabel,
      portfolio: formatCurrency(tickets.reduce((total, ticket) => total + ticket.stakeCents, 0)),
      alerts: notifications.length,
    },
  };
}

export async function getSiteState(sessionToken: string | null | undefined): Promise<SiteState> {
  const [pools, walletState, sparkFeed, chains] = await Promise.all([
    listPools(),
    getWalletState(sessionToken),
    listSparkFeed(sessionToken),
    listChains(),
  ]);

  return buildSiteState(pools, walletState, sparkFeed, chains);
}

export async function getAppShellState(sessionToken: string | null | undefined): Promise<{
  siteState: SiteState;
  walletState: WalletState;
}> {
  const [pools, walletState, sparkFeed, chains] = await Promise.all([
    listPools(),
    getWalletState(sessionToken),
    listSparkFeed(sessionToken),
    listChains(),
  ]);

  return {
    siteState: buildSiteState(pools, walletState, sparkFeed, chains),
    walletState,
  };
}

export async function getLeaderboard() {
  const client = createSupabaseAdminClient();

  if (!client) {
    return [] as LeaderboardEntry[];
  }

  const { data, error } = await client
    .from("pool_tickets")
    .select(
      `
        result_status,
        app_users (
          id,
          display_name,
          handle
        )
      `,
    );

  if (error) {
    throw error;
  }

  const leaderboard = new Map<string, { name: string; completed: number; missed: number }>();

  (data ?? []).forEach((row: { result_status: string; app_users?: { id: string; display_name: string } | Array<{ id: string; display_name: string }> | null }) => {
    const user = relationOne(row.app_users);
    if (!user) return;
    const current = leaderboard.get(user.id) ?? { name: user.display_name, completed: 0, missed: 0 };
    if (row.result_status === "completed") current.completed += 1;
    if (row.result_status === "missed") current.missed += 1;
    leaderboard.set(user.id, current);
  });

  return [...leaderboard.entries()]
    .map(([id, item], index) => {
      const total = item.completed + item.missed;
      const winRate = total ? `${Math.round((item.completed / total) * 100)}%` : "0%";
      return {
        id,
        name: item.name,
        score: item.completed * 100 - item.missed * 25,
        streakDays: item.completed * 3,
        verifiedPools: total,
        winRate,
        tier: index < 2 ? "Prime" : "Verified",
      } satisfies LeaderboardEntry;
    })
    .sort((left, right) => right.score - left.score);
}

export async function listSparkFeed(sessionToken: string | null | undefined, poolSlug?: string) {
  const client = createSupabaseAdminClient();

  if (!client) {
    return buildFallbackSparkFeed(poolSlug);
  }

  const viewer = sessionToken ? await findAppUserBySessionToken(client, sessionToken) : null;
  let poolId: string | null = null;

  if (poolSlug) {
    const { data: poolRow } = await client
      .from("commitment_pools")
      .select("id")
      .eq("slug", poolSlug)
      .maybeSingle();
    poolId = poolRow?.id ?? null;
  }

  let messageQuery = client
    .from("pool_messages")
    .select(
      `
        id,
        pool_id,
        app_user_id,
        body,
        message_type,
        metadata,
        tenor_gif_url,
        created_at,
        app_users (
          display_name,
          handle
        ),
        commitment_pools (
          slug,
          title
        )
      `,
    )
    .eq("moderation_state", "visible")
    .order("created_at", { ascending: false })
    .limit(poolId ? 30 : 40);

  if (poolId) {
    messageQuery = messageQuery.eq("pool_id", poolId);
  }

  const { data: messageData, error: messageError } = await messageQuery;
  if (messageError) {
    logPublicDataFallback("listSparkFeed", messageError);
    if (isRecoverablePublicDataError(messageError)) {
      return buildFallbackSparkFeed(poolSlug);
    }
    throw messageError;
  }

  const messages = (messageData ?? []) as MessageRow[];
  const messageIds = messages.map((message) => message.id);
  const poolIds = [...new Set(messages.map((message) => message.pool_id).filter(Boolean))] as string[];
  const authorIds = [...new Set(messages.map((message) => message.app_user_id).filter(Boolean))] as string[];

  const [{ data: replyData, error: replyError }, { data: readData, error: readError }, { data: profileData, error: profileError }] = await Promise.all([
    messageIds.length
      ? client
          .from("pool_message_replies")
          .select(
            `
              id,
              message_id,
              body,
              tenor_gif_url,
              created_at,
              app_users (
                display_name,
                handle
              )
            `,
          )
          .in("message_id", messageIds)
          .eq("moderation_state", "visible")
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    viewer && poolIds.length
      ? client
          .from("pool_message_reads")
          .select("pool_id, last_seen_at")
          .eq("app_user_id", viewer.id)
          .in("pool_id", poolIds)
      : Promise.resolve({ data: [], error: null }),
    authorIds.length
      ? client
          .from("public_profile_settings")
          .select("app_user_id, presence_status, custom_activity_text, custom_activity_expires_at")
          .in("app_user_id", authorIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const replyIds = ((replyData ?? []) as MessageReplyRow[]).map((reply) => reply.id);
  const reactionTargetIds = [...messageIds, ...replyIds];
  const { data: reactionData, error: reactionError } = reactionTargetIds.length
    ? await client
        .from("pool_message_reactions")
        .select("target_type, target_id, app_user_id, reaction")
        .in("target_id", reactionTargetIds)
    : { data: [], error: null };

  if (replyError) {
    logPublicDataFallback("listSparkFeed.replies", replyError);
    if (isRecoverablePublicDataError(replyError)) {
      return buildFallbackSparkFeed(poolSlug);
    }
    throw replyError;
  }
  if (reactionError) {
    logPublicDataFallback("listSparkFeed.reactions", reactionError);
    if (isRecoverablePublicDataError(reactionError)) {
      return buildFallbackSparkFeed(poolSlug);
    }
    throw reactionError;
  }
  if (readError) {
    logPublicDataFallback("listSparkFeed.reads", readError);
    if (isRecoverablePublicDataError(readError)) {
      return buildFallbackSparkFeed(poolSlug);
    }
    throw readError;
  }
  if (profileError) {
    logPublicDataFallback("listSparkFeed.profiles", profileError);
    if (isRecoverablePublicDataError(profileError)) {
      return buildFallbackSparkFeed(poolSlug);
    }
    throw profileError;
  }

  const replies = ((replyData ?? []) as MessageReplyRow[]).reduce<Record<string, MessageReplyRow[]>>((accumulator, reply) => {
    accumulator[reply.message_id] ??= [];
    accumulator[reply.message_id].push(reply);
    return accumulator;
  }, {});

  const reactionCounts = ((reactionData ?? []) as MessageReactionRow[]).reduce<Record<string, Record<string, number>>>((accumulator, reaction) => {
    accumulator[reaction.target_id] ??= {};
    accumulator[reaction.target_id][reaction.reaction] = (accumulator[reaction.target_id][reaction.reaction] ?? 0) + 1;
    return accumulator;
  }, {});

  const viewerReactions = ((reactionData ?? []) as MessageReactionRow[]).reduce<Record<string, SparkReactionName[]>>((accumulator, reaction) => {
    if (!viewer || reaction.app_user_id !== viewer.id) {
      return accumulator;
    }

    accumulator[reaction.target_id] ??= [];
    if (!accumulator[reaction.target_id].includes(reaction.reaction)) {
      accumulator[reaction.target_id].push(reaction.reaction);
    }
    return accumulator;
  }, {});

  const reads = new Map<string, string>();
  ((readData ?? []) as { pool_id: string; last_seen_at: string }[]).forEach((item) => {
    reads.set(item.pool_id, item.last_seen_at);
  });

  const presenceByUserId = new Map<
    string,
    {
      presence_status?: PresenceStatus;
      custom_activity_text?: string | null;
      custom_activity_expires_at?: string | null;
    }
  >();
  ((profileData ?? []) as PublicProfileRow[]).forEach((item) => {
    presenceByUserId.set(item.app_user_id, item);
  });

  return messages.map((message) => {
    const author = relationOne(message.app_users);
    const messagePool = relationOne(message.commitment_pools);
    const messageMetadata = normalizeMessageMetadata(message.metadata);
    const authorProfile = message.app_user_id ? presenceByUserId.get(message.app_user_id) : null;
    const messageReplies = (replies[message.id] ?? []).map((reply) => ({
      id: reply.id,
      messageId: reply.message_id,
      authorName: relationOne(reply.app_users)?.display_name ?? "PayToCommit member",
      authorHandle: relationOne(reply.app_users)?.handle ?? "member",
      body: reply.body,
      tenorGifUrl: reply.tenor_gif_url,
      hearts: reactionCounts[reply.id]?.heart ?? 0,
      createdAt: formatDateLabel(reply.created_at),
      viewerHearted: Boolean(viewerReactions[reply.id]?.includes("heart")),
      reactionCounts: reactionCounts[reply.id] ?? {},
      viewerReactions: viewerReactions[reply.id] ?? [],
    }));
    const lastSeen = message.pool_id ? reads.get(message.pool_id) : null;
    const authorHandle = author?.handle ?? "member";

    return {
      id: message.id,
      poolId: message.pool_id,
      poolSlug: messagePool?.slug ?? null,
      poolTitle: messagePool?.title ?? null,
      authorName: author?.display_name ?? "PayToCommit member",
      authorHandle,
      body: message.body,
      tenorGifUrl: message.tenor_gif_url,
      hearts: reactionCounts[message.id]?.heart ?? 0,
      replyCount: messageReplies.length,
      createdAt: formatDateLabel(message.created_at),
      unread: Boolean(lastSeen && new Date(message.created_at) > new Date(lastSeen)),
      messageType: message.message_type ?? "message",
      reactionCounts: reactionCounts[message.id] ?? {},
      viewerReactions: viewerReactions[message.id] ?? [],
      presenceStatus: authorProfile?.presence_status ?? deterministicPresence(authorHandle),
      customActivity: toCustomActivityStatus(authorProfile, authorHandle),
      poll: toSparkPoll(messageMetadata, viewer?.id ?? null),
      originCredit:
        messageMetadata.originCredit && typeof messageMetadata.originCredit === "object" && !Array.isArray(messageMetadata.originCredit)
          ? {
              handle: String((messageMetadata.originCredit as Record<string, unknown>).handle ?? authorHandle),
              displayName: String(
                (messageMetadata.originCredit as Record<string, unknown>).displayName ?? author?.display_name ?? "PayToCommit member",
              ),
              label: String((messageMetadata.originCredit as Record<string, unknown>).label ?? "Origin"),
            }
          : null,
      replies: messageReplies,
    } satisfies PoolMessage;
  });
}

export async function listNetworkLedger(poolSlug?: string) {
  const client = createSupabaseReadClient();

  if (!client) {
    return buildFallbackNetworkLedger(poolSlug);
  }

  let query = client
    .from("network_ledger_entries")
    .select(
      `
        id,
        event_type,
        payload,
        created_at,
        commitment_pools (
          title
        )
      `,
    )
    .order("created_at", { ascending: false })
    .limit(30);

  if (poolSlug) {
    const { data: poolRow } = await client
      .from("commitment_pools")
      .select("id")
      .eq("slug", poolSlug)
      .maybeSingle();
    if (poolRow?.id) {
      query = query.eq("pool_id", poolRow.id);
    }
  }

  const { data, error } = await query;
  if (error) {
    logPublicDataFallback("listNetworkLedger", error);
    if (isRecoverablePublicDataError(error)) {
      return buildFallbackNetworkLedger(poolSlug);
    }
    throw error;
  }

  return ((data ?? []) as LedgerRow[]).map((entry) => {
    const pool = relationOne(entry.commitment_pools);
    const amountCents = typeof entry.payload?.amount_cents === "number" ? (entry.payload.amount_cents as number) : null;
    return {
      id: entry.id,
      poolTitle: pool?.title ?? "Commitment Network",
      event: String(entry.payload?.summary ?? entry.event_type),
      timestamp: formatDateLabel(entry.created_at),
      proofStatus: String(entry.payload?.status ?? "recorded"),
      settlement: String(entry.payload?.summary ?? entry.event_type),
      networkState: entry.event_type.replaceAll("_", " "),
      amountLabel: amountCents === null ? undefined : formatCurrency(amountCents),
    } satisfies NetworkLedgerEntry;
  });
}

function buildFallbackSparkFeed(poolSlug?: string) {
  return fallbackSparkFeed
    .filter((event) => !poolSlug || event.message.toLowerCase().includes(poolSlug.replaceAll("-", " ").toLowerCase()))
    .slice(0, poolSlug ? 12 : 20)
    .map((event) => ({
      id: event.id,
      poolId: null,
      poolSlug: poolSlug ?? null,
      poolTitle: null,
      authorName: event.actor,
      authorHandle: event.handle,
      body: event.message,
      tenorGifUrl: event.tenorGifUrl ?? null,
      hearts: event.reactionCount,
      replyCount: 0,
      createdAt: event.context,
      unread: false,
      messageType: "message" as const,
      reactionCounts: { heart: event.reactionCount },
      viewerReactions: [],
      presenceStatus: deterministicPresence(event.handle),
      customActivity: deterministicActivity(event.handle),
      poll: null,
      originCredit: null,
      replies: [],
    }));
}

function buildFallbackNetworkLedger(poolSlug?: string) {
  const normalizedSlug = poolSlug?.replaceAll("-", " ").toLowerCase();

  return fallbackNetworkLedger.filter((entry) => {
    if (!normalizedSlug) {
      return true;
    }

    return entry.poolTitle.toLowerCase().includes(normalizedSlug);
  });
}

export async function placePoolTicket(sessionToken: string | null | undefined, poolSlug: string, stakeCents: number) {
  const client = createSupabaseAdminClient();
  const { viewer, wallet } = await getWalletAccountForSession(sessionToken);

  if (!client || !viewer) {
    throw new Error("Wallet session unavailable.");
  }

  if (viewer.identityStatus !== "verified") {
    throw new Error("Verify your identity before placing a live stake.");
  }

  const { data: poolRow, error: poolError } = await client
    .from("commitment_pools")
    .select("id, title, status, opens_at, join_opens_at, join_closes_at, closes_at, stake_min_cents, stake_max_cents, proof_window_minutes")
    .eq("slug", poolSlug)
    .maybeSingle();

  if (poolError) {
    throw poolError;
  }

  if (!poolRow) {
    throw new Error("Pool not found.");
  }

  const now = Date.now();
  const joinOpensAtIso = poolRow.join_opens_at ?? poolRow.opens_at;
  const joinClosesAtIso = poolRow.join_closes_at ?? poolRow.closes_at;
  const officialOpensAtIso = poolRow.opens_at ?? joinOpensAtIso;
  const joinOpensAtMs = joinOpensAtIso ? new Date(joinOpensAtIso).getTime() : null;
  const joinClosesAtMs = joinClosesAtIso ? new Date(joinClosesAtIso).getTime() : null;
  const officialOpensAtMs = officialOpensAtIso ? new Date(officialOpensAtIso).getTime() : null;
  const preOpenStakeLive = Boolean(officialOpensAtMs && now < officialOpensAtMs);

  if (poolRow.status === "settled" || poolRow.status === "settling") {
    throw new Error("This market is already moving through proof or result review. New joins are closed.");
  }

  if (joinOpensAtMs && now < joinOpensAtMs) {
    throw new Error("This market is not open for stake yet. Turn on notifications and come back when the join window opens.");
  }

  if (joinClosesAtMs && now >= joinClosesAtMs) {
    throw new Error("The join window closed for this market. Existing members continue under the posted rules.");
  }

  const { data: priorTicketRows, error: priorTicketError } = await client
    .from("pool_tickets")
    .select("metadata")
    .eq("app_user_id", viewer.id)
    .eq("pool_id", poolRow.id);

  if (priorTicketError) {
    throw priorTicketError;
  }

  const rejoinBlocked = ((priorTicketRows ?? []) as Array<{ metadata: Record<string, unknown> | null }>).some((row) => {
    if (!row.metadata || typeof row.metadata !== "object") {
      return false;
    }

    return row.metadata.exit_type === "early_release";
  });

  if (rejoinBlocked) {
    throw new Error("Early Release closed this market instance to your account. This market cannot be rejoined.");
  }

  if (stakeCents < poolRow.stake_min_cents || stakeCents > poolRow.stake_max_cents) {
    throw new Error(`Stake must stay between ${formatCurrency(poolRow.stake_min_cents)} and ${formatCurrency(poolRow.stake_max_cents)}.`);
  }

  const sovereignSparkCents = getSovereignSparkFeeCents(stakeCents);
  const totalDebit = stakeCents + sovereignSparkCents;
  if (wallet.availableCents < totalDebit) {
    throw new Error("Not enough wallet cash for this ticket.");
  }

  const proofDueAt = joinClosesAtIso
    ? new Date(new Date(joinClosesAtIso).getTime() + poolRow.proof_window_minutes * 60 * 1000).toISOString()
    : null;

  const { error: ticketError } = await client.from("pool_tickets").insert({
    pool_id: poolRow.id,
    app_user_id: viewer.id,
    wallet_account_id: wallet.id,
    stake_cents: stakeCents,
    contract_fee_cents: sovereignSparkCents,
    proof_due_at: proofDueAt,
    metadata: {
      source: "wallet",
      session_token: sessionToken,
    },
  });

  if (ticketError) {
    throw ticketError;
  }

  const { error: walletError } = await client
    .from("wallet_accounts")
    .update({
      available_cents: wallet.availableCents - totalDebit,
      locked_cents: wallet.lockedCents + stakeCents,
    })
    .eq("id", wallet.id);

  if (walletError) {
    throw walletError;
  }

  const { error: txError } = await client.from("wallet_transactions").insert([
    {
      wallet_account_id: wallet.id,
      app_user_id: viewer.id,
      type: "stake_debit",
      status: "posted",
      amount_cents: -stakeCents,
      fee_cents: 0,
      net_cents: -stakeCents,
      summary: preOpenStakeLive ? `Pre-open stake locked into ${poolRow.title}.` : `Stake moved into ${poolRow.title}.`,
      metadata: {
        pool_slug: poolSlug,
        pre_open: preOpenStakeLive,
      },
    },
    {
      wallet_account_id: wallet.id,
      app_user_id: viewer.id,
      type: "fee_capture",
      status: "posted",
      amount_cents: -sovereignSparkCents,
      fee_cents: sovereignSparkCents,
      net_cents: -sovereignSparkCents,
      summary: `Sovereign Spark captured for ${poolRow.title}.`,
      metadata: {
        pool_slug: poolSlug,
        pre_open: preOpenStakeLive,
      },
    },
  ]);

  if (txError) {
    throw txError;
  }

  const { error: ledgerError } = await client.from("network_ledger_entries").insert({
    pool_id: poolRow.id,
    event_type: "stake_placed",
    payload: {
      summary: preOpenStakeLive
        ? "Wallet cash moved into a pre-open ticket before the official market open."
        : "Wallet cash moved into a live ticket.",
      amount_cents: stakeCents,
      status: "posted",
      market_phase: preOpenStakeLive ? "pre_open" : "open",
      session_token: sessionToken,
    },
  });

  if (ledgerError) {
    throw ledgerError;
  }

  return {
    walletState: await getWalletState(sessionToken),
    postStakeNotifyPrompt:
      preOpenStakeLive && officialOpensAtIso && joinClosesAtIso
        ? {
            eligible: true,
            poolSlug,
            opensAt: officialOpensAtIso,
            joinClosesAt: joinClosesAtIso,
          }
        : null,
  };
}

export async function releasePoolTicket(sessionToken: string | null | undefined, ticketId: string) {
  const client = createSupabaseAdminClient();
  const { viewer, wallet } = await getWalletAccountForSession(sessionToken);

  if (!client || !viewer) {
    throw new Error("Wallet session unavailable.");
  }

  const { data: ticketRow, error: ticketError } = await client
    .from("pool_tickets")
    .select(
      `
        id,
        pool_id,
        wallet_account_id,
        stake_cents,
        contract_fee_cents,
        proof_status,
        result_status,
        metadata,
        joined_at,
        commitment_pools (
          slug,
          title,
          category,
          status,
          closes_at,
          proof_window_minutes,
          proof_mode,
          payout_label
        )
      `,
    )
    .eq("id", ticketId)
    .eq("app_user_id", viewer.id)
    .maybeSingle();

  if (ticketError) {
    throw ticketError;
  }

  if (!ticketRow) {
    throw new Error("Ticket not found.");
  }

  const ticket = ticketRow as TicketRow;
  const pool = relationOne(ticket.commitment_pools);
  const poolClosesAt = pool?.closes_at;
  const now = new Date();
  const closeAt = poolClosesAt ? new Date(poolClosesAt) : null;
  const metadata =
    ticket.metadata && typeof ticket.metadata === "object" ? { ...ticket.metadata } : {};

  if (metadata.exit_type === "early_release") {
    throw new Error("Early Release is already recorded for this ticket.");
  }

  if (ticket.result_status !== "active") {
    throw new Error("Only active tickets can use Early Release.");
  }

  if (!closeAt || Number.isNaN(closeAt.getTime()) || now.getTime() >= closeAt.getTime()) {
    throw new Error("Early Release closes once the join deadline has passed.");
  }

  const penaltyCents = Math.round(ticket.stake_cents * 0.05);
  const refundCents = Math.max(ticket.stake_cents - penaltyCents, 0);
  const confirmedAt = now.toISOString();

  const { error: releaseError } = await client
    .from("pool_tickets")
    .update({
      status: "released",
      result_status: "void",
      proof_status: "released",
      settled_at: confirmedAt,
      metadata: {
        ...metadata,
        exit_type: "early_release",
        rejoin_blocked: true,
        early_release_penalty_cents: penaltyCents,
        early_release_refund_cents: refundCents,
        early_release_confirmed_at: confirmedAt,
      },
    })
    .eq("id", ticket.id)
    .eq("app_user_id", viewer.id);

  if (releaseError) {
    throw releaseError;
  }

  const { error: walletError } = await client
    .from("wallet_accounts")
    .update({
      available_cents: wallet.availableCents + refundCents,
      locked_cents: Math.max(wallet.lockedCents - ticket.stake_cents, 0),
    })
    .eq("id", wallet.id);

  if (walletError) {
    throw walletError;
  }

  const { error: transactionError } = await client.from("wallet_transactions").insert({
    wallet_account_id: wallet.id,
    app_user_id: viewer.id,
    type: "stake_refund",
    status: "posted",
    amount_cents: refundCents,
    fee_cents: penaltyCents,
    net_cents: refundCents,
    summary: `Early Release posted for ${pool?.title ?? "this commitment"}.`,
    metadata: {
      pool_slug: pool?.slug ?? "",
      exit_type: "early_release",
      penalty_cents: penaltyCents,
      refund_cents: refundCents,
      confirmed_at: confirmedAt,
    },
  });

  if (transactionError) {
    throw transactionError;
  }

  const { error: ledgerError } = await client.from("network_ledger_entries").insert({
    pool_id: ticket.pool_id,
    event_type: "early_release",
    payload: {
      summary: "Early Release posted with the published 5% forfeiture.",
      amount_cents: refundCents,
      penalty_cents: penaltyCents,
      status: "posted",
      session_token: sessionToken,
    },
  });

  if (ledgerError) {
    throw ledgerError;
  }

  const { error: notificationError } = await client.from("app_notifications").insert({
    app_user_id: viewer.id,
    title: "Early Release posted",
    summary: `${formatCurrency(refundCents)} moved back into available balance. You received 95% of your original stake and this market instance is now closed to rejoin.`,
    tone: "review",
  });

  if (notificationError) {
    throw notificationError;
  }

  return getWalletState(sessionToken);
}

export async function placeChainTicket(sessionToken: string | null | undefined, chainSlug: string, stakeCents: number) {
  const client = createSupabaseAdminClient();
  const { viewer, wallet } = await getWalletAccountForSession(sessionToken);

  if (!client || !viewer) {
    throw new Error("Wallet session unavailable.");
  }

  if (viewer.identityStatus !== "verified") {
    throw new Error("Verify your identity before joining a live Chain.");
  }

  const { data: chainRow, error: chainError } = await client
    .from("chains")
    .select("id, title, stake_min_cents, stake_max_cents, assembly_fee_cents")
    .eq("slug", chainSlug)
    .maybeSingle();

  if (chainError) {
    throw chainError;
  }

  if (!chainRow) {
    throw new Error("Chain not found.");
  }

  if (stakeCents < chainRow.stake_min_cents || stakeCents > chainRow.stake_max_cents) {
    throw new Error(`Stake must stay between ${formatCurrency(chainRow.stake_min_cents)} and ${formatCurrency(chainRow.stake_max_cents)}.`);
  }

  const sovereignSparkCents = getSovereignSparkFeeCents(stakeCents);
  const totalDebit = stakeCents + sovereignSparkCents;
  if (wallet.availableCents < totalDebit) {
    throw new Error("Not enough wallet cash for this Chain.");
  }

  const { error: chainTicketError } = await client.from("chain_tickets").insert({
    chain_id: chainRow.id,
    app_user_id: viewer.id,
    wallet_account_id: wallet.id,
    stake_cents: stakeCents,
    assembly_fee_cents: sovereignSparkCents,
  });

  if (chainTicketError) {
    throw chainTicketError;
  }

  const { error: walletError } = await client
    .from("wallet_accounts")
    .update({
      available_cents: wallet.availableCents - totalDebit,
      locked_cents: wallet.lockedCents + stakeCents,
    })
    .eq("id", wallet.id);

  if (walletError) {
    throw walletError;
  }

  const { error: txError } = await client.from("wallet_transactions").insert([
    {
      wallet_account_id: wallet.id,
      app_user_id: viewer.id,
      type: "chain_debit",
      status: "posted",
      amount_cents: -stakeCents,
      fee_cents: 0,
      net_cents: -stakeCents,
      summary: `Stake moved into ${chainRow.title}.`,
      metadata: {
        chain_slug: chainSlug,
      },
    },
    {
      wallet_account_id: wallet.id,
      app_user_id: viewer.id,
      type: "fee_capture",
      status: "posted",
      amount_cents: -sovereignSparkCents,
      fee_cents: sovereignSparkCents,
      net_cents: -sovereignSparkCents,
      summary: `Sovereign Spark captured for ${chainRow.title}.`,
      metadata: {
        chain_slug: chainSlug,
      },
    },
  ]);

  if (txError) {
    throw txError;
  }

  return getWalletState(sessionToken);
}

export async function createSparkMessage(
  sessionToken: string | null | undefined,
  payload: {
    poolSlug?: string | null;
    body: string;
    tenorGifUrl?: string | null;
    messageType?: SparkMessageType;
    pollQuestion?: string | null;
    pollOptions?: string[];
  },
) {
  const client = createSupabaseAdminClient();
  const viewer = await getOrCreateAppUser(sessionToken);

  if (!client || !viewer) {
    throw new Error("Spark session unavailable.");
  }

  let poolId: string | null = null;
  if (payload.poolSlug) {
    const { data: poolRow, error: poolError } = await client
      .from("commitment_pools")
      .select("id")
      .eq("slug", payload.poolSlug)
      .maybeSingle();

    if (poolError) {
      throw poolError;
    }

    poolId = poolRow?.id ?? null;
  }

  const pollOptions = (payload.pollOptions ?? [])
    .map((option) => compactWhitespace(option))
    .filter(Boolean)
    .slice(0, 4);
  const metadata =
    payload.messageType === "market_idea"
      ? {
          originCredit: {
            handle: viewer.handle,
            displayName: viewer.display_name,
            label: "Started by",
          },
          poll:
            payload.pollQuestion && pollOptions.length >= 2
              ? {
                  question: compactWhitespace(payload.pollQuestion),
                  options: pollOptions.map((label, index) => ({
                    id: `option-${index + 1}`,
                    label,
                    votes: 0,
                  })),
                  expiresAt: null,
                }
              : null,
        }
      : {};

  const { error: insertError } = await client.from("pool_messages").insert({
    pool_id: poolId,
    app_user_id: viewer.id,
    body: payload.body,
    message_type: payload.messageType ?? "message",
    metadata,
    tenor_gif_url: payload.tenorGifUrl ?? null,
  });

  if (insertError) {
    throw insertError;
  }

  if (poolId) {
    await client.from("pool_message_reads").upsert(
      {
        pool_id: poolId,
        app_user_id: viewer.id,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "pool_id,app_user_id" },
    );
  }

  return listSparkFeed(sessionToken, payload.poolSlug ?? undefined);
}

export async function createSparkReply(
  sessionToken: string | null | undefined,
  payload: {
    messageId: string;
    body: string;
    tenorGifUrl?: string | null;
  },
) {
  const client = createSupabaseAdminClient();
  const viewer = await getOrCreateAppUser(sessionToken);

  if (!client || !viewer) {
    throw new Error("Spark session unavailable.");
  }

  const { data: messageRow, error: messageError } = await client
    .from("pool_messages")
    .select(
      `
        id,
        pool_id,
        commitment_pools (
          slug
        )
      `,
    )
    .eq("id", payload.messageId)
    .single();

  if (messageError) {
    throw messageError;
  }

  const message = messageRow as {
    pool_id: string | null;
    commitment_pools?: { slug: string } | Array<{ slug: string }> | null;
  };
  const poolSlug = relationOne(message.commitment_pools)?.slug ?? undefined;

  const { error: insertError } = await client.from("pool_message_replies").insert({
    message_id: payload.messageId,
    app_user_id: viewer.id,
    body: payload.body,
    tenor_gif_url: payload.tenorGifUrl ?? null,
  });

  if (insertError) {
    throw insertError;
  }

  if (message.pool_id) {
    await client.from("pool_message_reads").upsert(
      {
        pool_id: message.pool_id,
        app_user_id: viewer.id,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "pool_id,app_user_id" },
    );
  }

  return listSparkFeed(sessionToken, poolSlug);
}

export async function toggleSparkReaction(
  sessionToken: string | null | undefined,
  payload: { targetType: "message" | "reply"; targetId: string; reaction: SparkReactionName },
) {
  const client = createSupabaseAdminClient();
  const viewer = await getOrCreateAppUser(sessionToken);

  if (!client || !viewer) {
    throw new Error("Spark session unavailable.");
  }

  const { data: existing, error: existingError } = await client
    .from("pool_message_reactions")
    .select("id")
    .eq("target_type", payload.targetType)
    .eq("target_id", payload.targetId)
    .eq("app_user_id", viewer.id)
    .eq("reaction", payload.reaction)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing?.id) {
    const { error: deleteError } = await client.from("pool_message_reactions").delete().eq("id", existing.id);
    if (deleteError) throw deleteError;
  } else {
    const { error: insertError } = await client.from("pool_message_reactions").insert({
      target_type: payload.targetType,
      target_id: payload.targetId,
      app_user_id: viewer.id,
      reaction: payload.reaction,
    });
    if (insertError) throw insertError;
  }

  return { ok: true };
}

export async function voteSparkPoll(
  sessionToken: string | null | undefined,
  payload: { messageId: string; optionId: string },
) {
  const client = createSupabaseAdminClient();
  const viewer = await getOrCreateAppUser(sessionToken);

  if (!client || !viewer) {
    throw new Error("Spark session unavailable.");
  }

  const { data: row, error } = await client
    .from("pool_messages")
    .select("id, metadata")
    .eq("id", payload.messageId)
    .single();

  if (error) {
    throw error;
  }

  const metadata = normalizeMessageMetadata(row.metadata);
  const poll = toSparkPoll(metadata, viewer.id);

  if (!poll) {
    throw new Error("This Spark post does not have a poll.");
  }

  const existingVotes = normalizeSparkPollVotes(metadata);
  if (existingVotes.some((vote) => vote.appUserId === viewer.id)) {
    return { ok: true };
  }

  const nextPoll = {
    ...poll,
    options: poll.options.map((option) =>
      option.id === payload.optionId ? { ...option, votes: option.votes + 1 } : option,
    ),
  };

  const { error: updateError } = await client
    .from("pool_messages")
    .update({
      metadata: {
        ...metadata,
        poll: {
          question: nextPoll.question,
          options: nextPoll.options,
          expiresAt: nextPoll.expiresAt ?? null,
        },
        pollVotes: [
          ...existingVotes,
          {
            appUserId: viewer.id,
            optionId: payload.optionId,
          },
        ],
      },
    })
    .eq("id", payload.messageId);

  if (updateError) {
    throw updateError;
  }

  return { ok: true };
}

export async function updatePublicPresence(
  sessionToken: string | null | undefined,
  payload: {
    status: PresenceStatus;
    customActivityText?: string | null;
    expiresAt?: string | null;
  },
) {
  const client = createSupabaseAdminClient();
  const viewer = await getOrCreateAppUser(sessionToken);

  if (!client || !viewer) {
    throw new Error("Profile session unavailable.");
  }

  const { error } = await client.from("public_profile_settings").upsert(
    {
      app_user_id: viewer.id,
      presence_status: payload.status,
      custom_activity_text: payload.customActivityText ?? null,
      custom_activity_expires_at: payload.expiresAt ?? null,
    },
    { onConflict: "app_user_id" },
  );

  if (error) {
    throw error;
  }

  return { ok: true };
}

export async function markPoolMessagesRead(sessionToken: string | null | undefined, poolSlug: string) {
  const client = createSupabaseAdminClient();
  const viewer = await getOrCreateAppUser(sessionToken);

  if (!client || !viewer) {
    throw new Error("Spark session unavailable.");
  }

  const { data: poolRow, error: poolError } = await client
    .from("commitment_pools")
    .select("id")
    .eq("slug", poolSlug)
    .maybeSingle();

  if (poolError) {
    throw poolError;
  }

  if (!poolRow) {
    return { ok: true };
  }

  const { error: readError } = await client.from("pool_message_reads").upsert(
    {
      pool_id: poolRow.id,
      app_user_id: viewer.id,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "pool_id,app_user_id" },
  );

  if (readError) {
    throw readError;
  }

  return { ok: true };
}

export async function recordWalletTopUp(
  sessionToken: string | null | undefined,
  payload: {
    externalReference: string;
    grossCents: number;
    feeCents: number;
    summary: string;
  },
) {
  const client = createSupabaseAdminClient();
  const { viewer, wallet } = await getWalletAccountForSession(sessionToken);

  if (!client || !viewer) {
    throw new Error("Wallet session unavailable.");
  }

  const { data: existing, error: existingError } = await client
    .from("wallet_transactions")
    .select("id")
    .eq("external_reference", payload.externalReference)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (!existing) {
    const netCents = payload.grossCents - payload.feeCents;

    const { error: transactionError } = await client.from("wallet_transactions").insert({
      wallet_account_id: wallet.id,
      app_user_id: viewer.id,
      type: "funding_posted",
      status: "posted",
      amount_cents: payload.grossCents,
      fee_cents: payload.feeCents,
      net_cents: netCents,
      summary: payload.summary,
      external_reference: payload.externalReference,
    });

    if (transactionError) {
      throw transactionError;
    }

    const { error: walletError } = await client
      .from("wallet_accounts")
      .update({
        available_cents: wallet.availableCents + netCents,
      })
      .eq("id", wallet.id);

    if (walletError) {
      throw walletError;
    }
  }

  return getWalletState(sessionToken);
}

function toAiMarketDraft(row: AiMarketDraftRow): AiMarketDraft {
  return {
    id: row.id,
    prompt: row.prompt,
    title: row.title,
    category: row.category,
    summary: row.summary,
    targetGoal: row.target_goal,
    proofMode: row.proof_mode,
    stakeFloorCents: row.stake_min_cents,
    stakeMaxCents: row.stake_max_cents,
    stakeBand: `${formatCurrency(row.stake_min_cents)} to ${formatCurrency(row.stake_max_cents)}`,
    closesAt: formatDateLabel(row.closes_at),
    resolvesAt: formatDateLabel(row.resolves_at),
    proofWindow: formatDurationLabel(row.proof_window_minutes),
    challengeWindow: formatDurationLabel(row.challenge_window_minutes),
    ruleset: {
      summary: "AI-authored rules keep the market clear before the first stake lands.",
      rules: row.rules ?? [],
      invalidationCases: row.invalidation_cases ?? [],
      proofChecklist: row.proof_checklist ?? [],
      resultTiming: "AI result review begins as soon as the proof window closes.",
    },
    status: row.status,
    tags: row.tags ?? [],
  };
}

function toAiVerificationJob(row: AiVerificationJobRow): AiVerificationJob {
  const ticket = relationOne(row.pool_tickets);
  const pool = relationOne(ticket?.commitment_pools);

  return {
    id: row.id,
    ticketId: row.ticket_id,
    poolSlug: pool?.slug ?? "",
    proofSummary: row.proof_summary,
    proofLinks: row.proof_links ?? [],
    outcome: row.outcome,
    confidence: Number(row.confidence),
    explanation: row.explanation,
    status: row.status,
    model: row.model,
    createdAt: formatDateLabel(row.created_at),
    resolvedAt: row.resolved_at ? formatDateLabel(row.resolved_at) : null,
  };
}

function toAiAppealJob(row: AiAppealJobRow): AiAppealJob {
  return {
    id: row.id,
    verificationJobId: row.verification_job_id,
    ticketId: row.ticket_id,
    appealReason: row.appeal_reason,
    outcome: row.outcome,
    confidence: Number(row.confidence),
    explanation: row.explanation,
    status: row.status,
    model: row.model,
    createdAt: formatDateLabel(row.created_at),
    resolvedAt: row.resolved_at ? formatDateLabel(row.resolved_at) : null,
  };
}

function toResultCard(row: ResultCardRow): ResultCard {
  const baseLine =
    row.card_type === "completed"
      ? `Closed ${row.title} on PayToCommit ${formatCurrency(row.net_result_cents)}.`
      : `Missed ${row.title} on PayToCommit ${formatCurrency(row.net_result_cents)}.`;

  return {
    ticketId: row.ticket_id,
    type: row.card_type,
    title: row.title,
    subtitle: row.subtitle,
    summary: row.summary,
    netResultLabel: formatCurrency(row.net_result_cents),
    downloadPath: `/api/result-cards/${row.ticket_id}`,
    createdAt: formatDateLabel(row.created_at),
    sparkShareText: baseLine,
    externalShareText: buildShareCampaignText("artifact", `${baseLine} STP hardware-signed proof attached.`),
  };
}

async function settlePoolIfReady(
  client: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  poolId: string,
) {
  const { data: ticketRows, error: ticketError } = await client
    .from("pool_tickets")
    .select("id, app_user_id, wallet_account_id, stake_cents, result_status")
    .eq("pool_id", poolId)
    .order("joined_at", { ascending: true });

  if (ticketError) throw ticketError;

  const tickets = (ticketRows ?? []) as Array<{
    id: string;
    app_user_id: string;
    wallet_account_id: string | null;
    stake_cents: number;
    result_status: string;
  }>;

  if (!tickets.length || tickets.some((ticket) => ticket.result_status === "active")) {
    return;
  }

  const { data: existingSettlements, error: settlementError } = await client
    .from("pool_ticket_settlements")
    .select("ticket_id")
    .in("ticket_id", tickets.map((ticket) => ticket.id));

  if (settlementError) throw settlementError;
  if ((existingSettlements ?? []).length === tickets.length) {
    return;
  }

  const winners = tickets.filter((ticket) => ticket.result_status === "completed");
  const losers = tickets.filter((ticket) => ticket.result_status === "missed");
  const forfeitedCents = losers.reduce((total, ticket) => total + ticket.stake_cents, 0);
  const totalPoolCents = tickets.reduce((total, ticket) => total + ticket.stake_cents, 0);
  const platformCapture = winners.length ? Math.round(forfeitedCents * 0.2) : totalPoolCents;
  const distributable = winners.length ? forfeitedCents - platformCapture : 0;

  for (const ticket of tickets) {
    const grossPayout = winners.length
      ? ticket.result_status === "completed"
        ? ticket.stake_cents + Math.floor(distributable / Math.max(winners.length, 1))
        : 0
      : 0;
    const netResult = grossPayout - ticket.stake_cents;

    const { error: settlementInsertError } = await client.from("pool_ticket_settlements").upsert(
      {
        ticket_id: ticket.id,
        gross_payout_cents: grossPayout,
        platform_capture_cents: platformCapture,
        result_status: ticket.result_status,
      },
      { onConflict: "ticket_id" },
    );

    if (settlementInsertError) throw settlementInsertError;

    if (ticket.wallet_account_id) {
      const { data: walletRow, error: walletFetchError } = await client
        .from("wallet_accounts")
        .select("id, available_cents, locked_cents")
        .eq("id", ticket.wallet_account_id)
        .single();

      if (walletFetchError) throw walletFetchError;

      const availableDelta = grossPayout;
      const nextAvailable = walletRow.available_cents + availableDelta;
      const nextLocked = Math.max(walletRow.locked_cents - ticket.stake_cents, 0);

      const { error: walletUpdateError } = await client
        .from("wallet_accounts")
        .update({
          available_cents: nextAvailable,
          locked_cents: nextLocked,
        })
        .eq("id", ticket.wallet_account_id);

      if (walletUpdateError) throw walletUpdateError;

      if (grossPayout > 0) {
        const { error: walletTxError } = await client.from("wallet_transactions").insert({
          wallet_account_id: ticket.wallet_account_id,
          app_user_id: ticket.app_user_id,
          type: "stake_payout",
          status: "posted",
          amount_cents: grossPayout,
          fee_cents: 0,
          net_cents: grossPayout,
          summary: "Autonomous result payout posted to wallet cash.",
          metadata: {
            pool_id: poolId,
            ticket_id: ticket.id,
          },
        });

        if (walletTxError) throw walletTxError;
      }
    }

    const { error: cardError } = await client.from("result_cards").upsert(
      {
        ticket_id: ticket.id,
        app_user_id: ticket.app_user_id,
        card_type: ticket.result_status === "completed" ? "completed" : "missed",
        title: ticket.result_status === "completed" ? "Commitment closed" : "Reset and reload",
        subtitle: ticket.result_status === "completed" ? "Completed before the deadline." : "This market closed missed.",
        summary:
          ticket.result_status === "completed"
            ? "The result locked clean, the market paid out, and the close is ready to share."
            : "The market missed the close, but the record stays visible and the next market is one step away.",
        net_result_cents: netResult,
      },
      { onConflict: "ticket_id" },
    );

    if (cardError) throw cardError;
  }

  const { error: ledgerError } = await client.from("network_ledger_entries").insert({
    pool_id: poolId,
    event_type: "result_ruled",
    payload: {
      summary: winners.length
        ? "Results closed and payouts were released."
        : "Results closed with no completed side.",
      amount_cents: distributable,
      status: "posted",
    },
  });

  if (ledgerError) throw ledgerError;
}

export async function createAiMarketDraft(sessionToken: string | null | undefined, prompt: string) {
  const client = createSupabaseAdminClient();
  const viewer = await getOrCreateAppUser(sessionToken);

  if (!client || !viewer) {
    throw new Error("Creation session unavailable.");
  }

  const { draftAutonomousMarket } = await import("@/lib/autonomous-ai");
  const draft = await draftAutonomousMarket(prompt);
  const { data, error } = await client
    .from("ai_market_drafts")
    .insert({
      app_user_id: viewer.id,
      prompt: draft.prompt,
      title: draft.title,
      category: draft.category,
      summary: draft.summary,
      target_goal: draft.targetGoal,
      proof_mode: draft.proofMode,
      stake_min_cents: draft.stakeFloorCents,
      stake_max_cents: draft.stakeMaxCents,
      closes_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      resolves_at: new Date(Date.now() + 1000 * 60 * 60 * 30).toISOString(),
      proof_window_minutes: 90,
      challenge_window_minutes: 240,
      rules: draft.ruleset.rules,
      invalidation_cases: draft.ruleset.invalidationCases,
      proof_checklist: draft.ruleset.proofChecklist,
      tags: draft.tags,
    })
    .select(
      "id, prompt, title, category, summary, target_goal, proof_mode, stake_min_cents, stake_max_cents, closes_at, resolves_at, proof_window_minutes, challenge_window_minutes, rules, invalidation_cases, proof_checklist, tags, status",
    )
    .single();

  if (error) throw error;

  return toAiMarketDraft(data as AiMarketDraftRow);
}

export async function importAiMarketDraft(sessionToken: string | null | undefined, draft: AiMarketDraft) {
  const client = createSupabaseAdminClient();
  const viewer = await getOrCreateAppUser(sessionToken);

  if (!client || !viewer) {
    throw new Error("Creation session unavailable.");
  }

  const { data: existingRow, error: existingError } = await client
    .from("ai_market_drafts")
    .select(
      "id, prompt, title, category, summary, target_goal, proof_mode, stake_min_cents, stake_max_cents, closes_at, resolves_at, proof_window_minutes, challenge_window_minutes, rules, invalidation_cases, proof_checklist, tags, status",
    )
    .eq("app_user_id", viewer.id)
    .eq("prompt", draft.prompt)
    .eq("title", draft.title)
    .eq("category", draft.category)
    .eq("status", "drafted")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existingRow) {
    return toAiMarketDraft(existingRow as AiMarketDraftRow);
  }

  const { data, error } = await client
    .from("ai_market_drafts")
    .insert({
      app_user_id: viewer.id,
      prompt: draft.prompt,
      title: draft.title,
      category: draft.category,
      summary: draft.summary,
      target_goal: draft.targetGoal,
      proof_mode: draft.proofMode,
      stake_min_cents: draft.stakeFloorCents,
      stake_max_cents: draft.stakeMaxCents,
      closes_at: normalizeDraftDate(draft.closesAt, 60 * 24),
      resolves_at: normalizeDraftDate(draft.resolvesAt, 60 * 30),
      proof_window_minutes: parseDurationLabelToMinutes(draft.proofWindow, 90),
      challenge_window_minutes: parseDurationLabelToMinutes(draft.challengeWindow, 240),
      rules: draft.ruleset.rules,
      invalidation_cases: draft.ruleset.invalidationCases,
      proof_checklist: draft.ruleset.proofChecklist,
      tags: draft.tags,
      status: "drafted",
    })
    .select(
      "id, prompt, title, category, summary, target_goal, proof_mode, stake_min_cents, stake_max_cents, closes_at, resolves_at, proof_window_minutes, challenge_window_minutes, rules, invalidation_cases, proof_checklist, tags, status",
    )
    .single();

  if (error) {
    throw error;
  }

  return toAiMarketDraft(data as AiMarketDraftRow);
}

export async function confirmAiMarketDraft(sessionToken: string | null | undefined, draftId: string) {
  const client = createSupabaseAdminClient();
  const viewer = await getOrCreateAppUser(sessionToken);

  if (!client || !viewer) {
    throw new Error("Creation session unavailable.");
  }

  const { data: draftRow, error: draftError } = await client
    .from("ai_market_drafts")
    .select("*")
    .eq("id", draftId)
    .eq("app_user_id", viewer.id)
    .single();

  if (draftError) throw draftError;

  const row = draftRow as AiMarketDraftRow;
  const { buildDraftSlug } = await import("@/lib/autonomous-ai");
  const slugBase = buildDraftSlug(row.title);
  const slug = `${slugBase}-${draftId.slice(0, 6)}`;

  const { data: poolRow, error: poolError } = await client
    .from("commitment_pools")
    .insert({
      slug,
      title: row.title,
      category: row.category,
      summary: row.summary,
      status: "upcoming",
      stake_min_cents: row.stake_min_cents,
      stake_max_cents: row.stake_max_cents,
      proof_mode: row.proof_mode,
      rules: row.rules ?? [],
      closes_at: row.closes_at,
      resolves_at: row.resolves_at,
      proof_window_minutes: row.proof_window_minutes,
      challenge_window_minutes: row.challenge_window_minutes,
      target_goal: row.target_goal,
      stake_band_label: `${formatCurrency(row.stake_min_cents)} to ${formatCurrency(row.stake_max_cents)}`,
      result_state: "Each ticket closes to completed, missed, or needs more proof.",
      network_state: "Creation, staking, proof, appeals, and payouts post to the Commitment Network.",
      payout_label: "Closes as soon as the result is clear.",
      trend_label: "New market",
      tags: row.tags ?? [],
      featured: true,
      chain_eligible: true,
    })
    .select("id")
    .single();

  if (poolError) throw poolError;

  await client.from("ai_market_drafts").update({
    status: "opened",
    created_pool_id: poolRow.id,
  }).eq("id", draftId);

  await client.from("network_ledger_entries").insert({
    pool_id: poolRow.id,
    event_type: "market_created",
    payload: {
      summary: "A new commitment market opened.",
      status: "opened",
    },
  });

  return getPoolBySlug(slug);
}

export async function getLatestAiMarketDrafts(sessionToken: string | null | undefined) {
  const client = createSupabaseAdminClient();
  const viewer = await getOrCreateAppUser(sessionToken);

  if (!client || !viewer) {
    return [] as AiMarketDraft[];
  }

  const { data, error } = await client
    .from("ai_market_drafts")
    .select(
      "id, prompt, title, category, summary, target_goal, proof_mode, stake_min_cents, stake_max_cents, closes_at, resolves_at, proof_window_minutes, challenge_window_minutes, rules, invalidation_cases, proof_checklist, tags, status",
    )
    .eq("app_user_id", viewer.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw error;

  return ((data ?? []) as AiMarketDraftRow[]).map(toAiMarketDraft);
}

export async function submitAiProofReview(
  sessionToken: string | null | undefined,
  payload: { ticketId: string; proofSummary: string; proofLinks: string[] },
) {
  const client = createSupabaseAdminClient();
  const viewer = await getOrCreateAppUser(sessionToken);

  if (!client || !viewer) {
    throw new Error("Verification session unavailable.");
  }

  const { data: ticketRow, error: ticketError } = await client
    .from("pool_tickets")
    .select(
      `
        id,
        pool_id,
        app_user_id,
        commitment_pools (
          slug,
          title,
          proof_mode
        )
      `,
    )
    .eq("id", payload.ticketId)
    .eq("app_user_id", viewer.id)
    .single();

  if (ticketError) throw ticketError;

  const pool = relationOne(ticketRow.commitment_pools);
  const { verifyProofAutonomously } = await import("@/lib/autonomous-ai");
  const result = await verifyProofAutonomously({
    poolTitle: pool?.title ?? "Commitment market",
    poolSlug: pool?.slug ?? "",
    proofMode: pool?.proof_mode ?? "Timestamped proof",
    proofSummary: payload.proofSummary,
    proofLinks: payload.proofLinks,
  });

  const { data, error } = await client
    .from("ai_verification_jobs")
    .insert({
      ticket_id: ticketRow.id,
      pool_id: ticketRow.pool_id,
      app_user_id: viewer.id,
      proof_summary: payload.proofSummary,
      proof_links: payload.proofLinks,
      outcome: result.outcome,
      confidence: result.confidence,
      explanation: result.explanation,
      model: result.model,
      status: "resolved",
      resolved_at: new Date().toISOString(),
    })
    .select(
      `
        id,
        ticket_id,
        outcome,
        confidence,
        explanation,
        model,
        status,
        proof_summary,
        proof_links,
        created_at,
        resolved_at,
        pool_tickets (
          pool_id,
          commitment_pools (
            slug
          )
        )
      `,
    )
    .single();

  if (error) throw error;

  const nextResultStatus = result.outcome === "completed" ? "completed" : result.outcome === "missed" ? "missed" : "active";
  const nextProofStatus = result.outcome === "needs_more_evidence" ? "needs_more_evidence" : "verified";

  await client.from("pool_tickets").update({
    proof_status: nextProofStatus,
    result_status: nextResultStatus,
    settled_at: nextResultStatus === "active" ? null : new Date().toISOString(),
  }).eq("id", ticketRow.id);

  await client.from("network_ledger_entries").insert({
    pool_id: ticketRow.pool_id,
    participation_id: null,
    event_type: "proof_verified",
    payload: {
      summary: result.explanation,
      status: result.outcome,
      amount_cents: 0,
    },
  });

  if (nextResultStatus !== "active") {
    await settlePoolIfReady(client, ticketRow.pool_id);
  }

  return toAiVerificationJob(data as AiVerificationJobRow);
}

export async function rerunAiAppeal(
  sessionToken: string | null | undefined,
  payload: { ticketId: string; appealReason: string },
) {
  const client = createSupabaseAdminClient();
  const viewer = await getOrCreateAppUser(sessionToken);

  if (!client || !viewer) {
    throw new Error("Appeal session unavailable.");
  }

  const { data: latestReview, error: latestReviewError } = await client
    .from("ai_verification_jobs")
    .select(
      `
        id,
        ticket_id,
        outcome,
        confidence,
        explanation,
        model,
        status,
        proof_summary,
        proof_links,
        created_at,
        resolved_at,
        pool_tickets (
          pool_id,
          commitment_pools (
            slug,
            title,
            proof_mode
          )
        )
      `,
    )
    .eq("ticket_id", payload.ticketId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (latestReviewError) throw latestReviewError;

  const latestJob = latestReview as AiVerificationJobRow;
  const ticket = relationOne(latestJob.pool_tickets);
  const pool = relationOne(ticket?.commitment_pools);
  const { verifyProofAutonomously } = await import("@/lib/autonomous-ai");
  const rerun = await verifyProofAutonomously({
    poolTitle: pool?.title ?? "Commitment market",
    poolSlug: pool?.slug ?? "",
    proofMode: pool?.proof_mode ?? "Timestamped proof",
    proofSummary: latestJob.proof_summary,
    proofLinks: latestJob.proof_links ?? [],
    previousOutcome: latestJob.outcome,
    appealReason: payload.appealReason,
  });

  const { data, error } = await client
    .from("ai_appeal_jobs")
    .insert({
      verification_job_id: latestJob.id,
      ticket_id: payload.ticketId,
      app_user_id: viewer.id,
      appeal_reason: payload.appealReason,
      outcome: rerun.outcome,
      confidence: rerun.confidence,
      explanation: rerun.explanation,
      model: rerun.model,
      status: "resolved",
      resolved_at: new Date().toISOString(),
    })
    .select("id, verification_job_id, ticket_id, appeal_reason, outcome, confidence, explanation, model, status, created_at, resolved_at")
    .single();

  if (error) throw error;

  await client.from("ai_verification_jobs").update({ status: "appealed" }).eq("id", latestJob.id);

  const nextResultStatus = rerun.outcome === "completed" ? "completed" : rerun.outcome === "missed" ? "missed" : "active";
  const nextProofStatus = rerun.outcome === "needs_more_evidence" ? "needs_more_evidence" : "verified";

  await client.from("pool_tickets").update({
    proof_status: nextProofStatus,
    result_status: nextResultStatus,
    settled_at: nextResultStatus === "active" ? null : new Date().toISOString(),
  }).eq("id", payload.ticketId);

  if (ticket?.pool_id && nextResultStatus !== "active") {
    await settlePoolIfReady(client, ticket.pool_id);
  }

  return toAiAppealJob(data as AiAppealJobRow);
}

export async function getPublicProfile(handle: string) {
  const client = createSupabaseAdminClient();

  if (!client) {
    return null as PublicProfile | null;
  }

  const { data: userRow, error: userError } = await client
    .from("app_users")
    .select("id, session_token, display_name, handle, joined_at")
    .eq("handle", handle)
    .maybeSingle();

  if (userError) throw userError;
  if (!userRow) return null;

  const [{ data: profileRow, error: profileError }, walletState, sparkFeed, cardData] = await Promise.all([
    client
      .from("public_profile_settings")
      .select("app_user_id, headline, home_base, visibility, share_proof_artifacts, presence_status, custom_activity_text, custom_activity_expires_at")
      .eq("app_user_id", userRow.id)
      .maybeSingle(),
    getWalletState(userRow.session_token),
    client
      .from("pool_messages")
      .select(
        `
          id,
          pool_id,
          app_user_id,
          body,
          message_type,
          metadata,
          tenor_gif_url,
          created_at,
          app_users (
            display_name,
            handle
          ),
          commitment_pools (
            slug,
            title
          )
        `,
      )
      .eq("app_user_id", userRow.id)
      .eq("moderation_state", "visible")
      .order("created_at", { ascending: false })
      .limit(5),
    client
      .from("result_cards")
      .select("ticket_id, card_type, title, subtitle, summary, net_result_cents, created_at")
      .eq("app_user_id", userRow.id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  if (profileError) throw profileError;

  const settings = (profileRow as PublicProfileRow | null) ?? {
    app_user_id: userRow.id,
    headline: "Closing commitment markets in public.",
    home_base: "PayToCommit",
    visibility: "public",
    share_proof_artifacts: false,
    presence_status: deterministicPresence(userRow.handle),
    custom_activity_text: null,
    custom_activity_expires_at: null,
  };

  const tickets = walletState.tickets;
  const currentMarkets = tickets.filter((ticket) => ticket.status === "active");
  const recentResults = tickets.filter((ticket) => ticket.status !== "active").slice(0, 6);
  const completedCount = tickets.filter((ticket) => ticket.status === "completed").length;
  const missedCount = tickets.filter((ticket) => ticket.status === "missed").length;
  const netResultCents = recentResults.reduce((total, ticket) => {
    const amount = parseCurrencyLabel(ticket.stakeLabel);
    if (ticket.status === "completed") return total + Math.round(amount * 0.25);
    if (ticket.status === "missed") return total - amount;
    return total;
  }, 0);
  const sparkHighlights = sparkFeed.error
    ? []
    : ((sparkFeed.data ?? []) as MessageRow[]).map((message) => ({
        id: message.id,
        poolId: message.pool_id,
        poolSlug: relationOne(message.commitment_pools)?.slug ?? null,
        poolTitle: relationOne(message.commitment_pools)?.title ?? null,
        authorName: relationOne(message.app_users)?.display_name ?? "PayToCommit member",
        authorHandle: relationOne(message.app_users)?.handle ?? "member",
        body: message.body,
        tenorGifUrl: message.tenor_gif_url,
        hearts: 0,
        replyCount: 0,
        createdAt: formatDateLabel(message.created_at),
        unread: false,
        messageType: message.message_type ?? "message",
        reactionCounts: {},
        viewerReactions: [],
        presenceStatus: settings.presence_status ?? deterministicPresence(userRow.handle),
        customActivity: toCustomActivityStatus(settings, userRow.handle),
        poll: toSparkPoll(normalizeMessageMetadata(message.metadata), null),
        originCredit: null,
        replies: [],
      }));
  const cardRows = (cardData.data ?? []) as ResultCardRow[];

  return {
    id: userRow.id,
    handle: userRow.handle,
    displayName: userRow.display_name,
    headline: settings.headline,
    homeBase: settings.home_base,
    joinedAt: formatDateLabel(userRow.joined_at),
    presenceStatus: settings.presence_status ?? deterministicPresence(userRow.handle),
    customActivity: toCustomActivityStatus(settings, userRow.handle),
    visibility: settings.visibility,
    shareProofArtifacts: settings.share_proof_artifacts,
    netResultLabel: formatCurrency(netResultCents),
    completedCount,
    missedCount,
    activeCount: currentMarkets.length,
    streakLabel: completedCount ? `${completedCount} clean closes` : "First close loading",
    currentMarkets,
    recentResults,
    sparkHighlights,
    resultCards: cardRows
      .map((row) => {
        const ticket = tickets.find((item) => item.id === row.ticket_id);
        return ticket ? toResultCard(row) : null;
      })
      .filter(Boolean) as ResultCard[],
  } satisfies PublicProfile;
}

export async function getResultCard(ticketId: string) {
  const client = createSupabaseAdminClient();

  if (!client) {
    return null as ResultCard | null;
  }

  const [{ data: cardRow, error: cardError }, { data: ticketRow, error: ticketError }] = await Promise.all([
    client
      .from("result_cards")
      .select("ticket_id, card_type, title, subtitle, summary, net_result_cents, created_at")
      .eq("ticket_id", ticketId)
      .maybeSingle(),
    client
      .from("pool_tickets")
      .select(
        `
          id,
          stake_cents,
          contract_fee_cents,
          proof_status,
          result_status,
          joined_at,
          commitment_pools (
            slug,
            title,
            category,
            closes_at,
            payout_label
          )
        `,
      )
      .eq("id", ticketId)
      .maybeSingle(),
  ]);

  if (cardError) throw cardError;
  if (ticketError) throw ticketError;
  if (!cardRow || !ticketRow) return null;

  return toResultCard(cardRow as ResultCardRow);
}

export async function askDocsQuestion(question: string): Promise<AiDocsAnswer> {
  const { askDocsAi } = await import("@/lib/autonomous-ai");
  return askDocsAi(question);
}
