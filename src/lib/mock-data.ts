import type {
  ApiEndpoint,
  CommitmentPool,
  DocPage,
  FeeSchedule,
  LeaderboardEntry,
  NetworkLedgerEntry,
  NotificationEvent,
  PoolCategorySummary,
  RewardProgram,
  RewardProgress,
  ReviewDecision,
  SparkEvent,
} from "@/lib/types";

type PoolSeed = Omit<
  CommitmentPool,
  | "lifecycleState"
  | "stakeFloor"
  | "stakeBand"
  | "targetGoal"
  | "preOpenDisplayState"
  | "visiblePoolTotal"
  | "opensAt"
  | "joinOpensAt"
  | "joinClosesAt"
  | "proofWindowOpensAt"
  | "proofWindowClosesAt"
  | "resolutionTargetAt"
  | "settlementFinalizedAt"
  | "joinStatusLabel"
  | "notifyMeAvailable"
  | "marketOpenReminderAvailable"
  | "preOpenStakeLive"
  | "resultState"
  | "networkState"
  | "rulesPath"
>;

function hashSeed(value: string) {
  return value.split("").reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 11), 0);
}

function addMinutes(base: Date, minutes: number) {
  return new Date(base.getTime() + minutes * 60 * 1000);
}

function formatCountdownLabel(value: Date) {
  const delta = value.getTime() - Date.now();
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

function buildScheduleState(seed: string, status: CommitmentPool["status"], proofWindow: string) {
  const base = hashSeed(seed);
  const now = new Date();
  const proofMinutes = proofWindow.includes("90")
    ? 90
    : proofWindow.includes("60")
      ? 60
      : proofWindow.includes("45")
        ? 45
        : proofWindow.includes("30")
          ? 30
          : proofWindow.includes("2 hours")
            ? 120
            : 60;
  let joinOpensAt = addMinutes(now, -(12 + (base % 36)) * 60);
  let joinClosesAt = addMinutes(now, (3 + (base % 18)) * 60);
  let lifecycleState: CommitmentPool["lifecycleState"] = "join_open";

  if (status === "upcoming") {
    const officialOpenAt = addMinutes(now, (10 + (base % 50)) * 60);
    joinOpensAt = addMinutes(officialOpenAt, -6 * 60);
    joinClosesAt = addMinutes(officialOpenAt, (24 + (base % 36)) * 60);
    lifecycleState = now.getTime() < joinOpensAt.getTime() ? "upcoming" : "join_open";
  } else if (status === "settling") {
    joinClosesAt = addMinutes(now, -(2 + (base % 10)) * 60);
    lifecycleState = "under_review";
  } else if (status === "settled") {
    joinClosesAt = addMinutes(now, -(24 + (base % 48)) * 60);
    lifecycleState = "resolved";
  } else if (joinClosesAt.getTime() - now.getTime() <= 6 * 60 * 60 * 1000) {
    lifecycleState = "join_closing_soon";
  }

  const opensAt = status === "upcoming" ? addMinutes(joinOpensAt, 6 * 60) : addMinutes(joinOpensAt, -6 * 60);
  const proofWindowOpensAt = joinClosesAt;
  const proofWindowClosesAt = addMinutes(proofWindowOpensAt, proofMinutes);
  const resolutionTargetAt = status === "settled" ? addMinutes(proofWindowClosesAt, -2 * 60) : addMinutes(proofWindowClosesAt, 2 * 60);
  const settlementFinalizedAt = status === "settled" ? addMinutes(resolutionTargetAt, 2 * 60).toISOString() : null;
  const nowMs = now.getTime();
  const joinOpenMs = joinOpensAt.getTime();
  const joinCloseMs = joinClosesAt.getTime();
  const proofWindowCloseMs = proofWindowClosesAt.getTime();
  const resolutionTargetMs = resolutionTargetAt.getTime();

  if (nowMs < joinOpenMs) {
    lifecycleState = status === "upcoming" ? "upcoming" : "scheduled";
  } else if (status === "upcoming" && nowMs < opensAt.getTime()) {
    lifecycleState = joinCloseMs - nowMs <= 6 * 60 * 60 * 1000 ? "join_closing_soon" : "join_open";
  } else if (status === "live" && nowMs > joinCloseMs && nowMs <= proofWindowCloseMs) {
    lifecycleState = "proof_window_open";
  } else if (status === "live" && nowMs > proofWindowCloseMs && nowMs <= resolutionTargetMs) {
    lifecycleState = "proof_window_closed";
  } else if (status === "live" && nowMs > resolutionTargetMs) {
    lifecycleState = "under_review";
  }

  const preOpenStakeLive = status === "upcoming" && nowMs >= joinOpenMs && nowMs < opensAt.getTime();

  const joinStatusLabel =
    preOpenStakeLive
      ? `Official open ${formatCountdownLabel(opensAt)}`
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
              : "Join closed";

  return {
    lifecycleState,
    opensAt: opensAt.toISOString(),
    joinOpensAt: joinOpensAt.toISOString(),
    joinClosesAt: joinClosesAt.toISOString(),
    proofWindowOpensAt: proofWindowOpensAt.toISOString(),
    proofWindowClosesAt: proofWindowClosesAt.toISOString(),
    resolutionTargetAt: resolutionTargetAt.toISOString(),
    settlementFinalizedAt,
    joinStatusLabel,
    notifyMeAvailable: lifecycleState === "upcoming" || lifecycleState === "scheduled",
    marketOpenReminderAvailable:
      lifecycleState === "upcoming" || lifecycleState === "scheduled" || preOpenStakeLive,
    preOpenStakeLive,
  };
}

function enrichPool(pool: PoolSeed): CommitmentPool {
  const visiblePoolTotal = pool.status !== "upcoming";
  const schedule = buildScheduleState(pool.slug, pool.status, pool.proofWindow);

  return {
    ...pool,
    ...schedule,
    stakeFloor: "$10",
    stakeBand: pool.stakeRange,
    targetGoal: visiblePoolTotal
      ? "Completed splits the losing side after PayToCommit fees."
      : "Goal set. The pool total opens on the first committed stake.",
    preOpenDisplayState: visiblePoolTotal ? "first-join" : "market-open",
    visiblePoolTotal,
    resultState: "Completed entrants recover stake and split the forfeited side.",
    networkState:
      pool.status === "settling"
        ? "Ruling and fee capture moving through the Commitment Network."
        : schedule.preOpenStakeLive
          ? "Early stake is live ahead of the official open. Proof and settlement still follow the published rules."
          : pool.status === "upcoming"
          ? "Rules locked. Waiting for the first committed stake."
          : "Stake, proof, and result events are publishing live.",
    rulesPath: `/pools/${pool.slug}/rules`,
  };
}

const poolSeeds: PoolSeed[] = [
  {
    slug: "run-5k-before-sunrise",
    title: "Run 5K Before Sunrise",
    category: "Fitness",
    summary:
      "Commit to a clean 5K before the day starts. GPS proof or treadmill export required before the deadline closes.",
    status: "live",
    stakeRange: "$25 to $250",
    participantCount: 612,
    volumeLabel: "$12.5k pooled",
    closesAt: "Tomorrow, 6:45 AM ET",
    resolvesAt: "Tomorrow, 8:00 AM ET",
    proofWindow: "60 minutes after deadline",
    challengeWindow: "6 hours",
    evidenceMode: "GPS, treadmill export, or verified coach upload",
    payoutLabel: "Settles same day after review",
    sparkCount: 124,
    trendLabel: "+18% this week",
    ruleHighlights: [
      "Distance must be logged in one continuous session.",
      "Late proof is marked missed unless an incident exception is recorded.",
      "Visible splits are required for uploaded proof packets.",
    ],
    tags: ["morning", "verified proof", "popular"],
  },
  {
    slug: "publish-the-shipped-feature",
    title: "Ship the Feature by Friday",
    category: "Work",
    summary:
      "Attach the repo, publish the deploy preview, and close the scope before the Friday cutoff hits.",
    status: "live",
    stakeRange: "$50 to $500",
    participantCount: 344,
    volumeLabel: "$29.8k pooled",
    closesAt: "Friday, 5:00 PM ET",
    resolvesAt: "Friday, 8:30 PM ET",
    proofWindow: "90 minutes after deadline",
    challengeWindow: "12 hours",
    evidenceMode: "Git commit, deploy preview, and changelog receipt",
    payoutLabel: "Settles after autonomous verification",
    sparkCount: 86,
    trendLabel: "+9% this week",
    ruleHighlights: [
      "A visible deploy preview is required.",
      "Proof must include linked release notes or completed task receipt.",
      "Broken builds are not considered shipped.",
    ],
    tags: ["builders", "deploy proof", "high stakes"],
  },
  {
    slug: "finish-the-reading-block",
    title: "Read 100 Pages This Week",
    category: "Learning",
    summary:
      "Track reading across one or more sessions and finish the full target before the weekly close.",
    status: "upcoming",
    stakeRange: "$10 to $100",
    participantCount: 928,
    volumeLabel: "$8.4k reserved",
    closesAt: "Opens Monday, 12:00 AM ET",
    resolvesAt: "Sunday, 10:00 PM ET",
    proofWindow: "2 hours after deadline",
    challengeWindow: "12 hours",
    evidenceMode: "Reading tracker, photo proof, or verified study group note",
    payoutLabel: "Notifies before opening",
    sparkCount: 213,
    trendLabel: "+31% watchlist growth",
    ruleHighlights: [
      "Only pages completed inside the pool window count.",
      "Audio books require minute conversion receipts.",
      "Manual submissions must include timestamped progress snapshots.",
    ],
    tags: ["study", "weekly", "group favorite"],
  },
  {
    slug: "zero-sugar-seven-days",
    title: "Zero Sugar for Seven Days",
    category: "Health",
    summary:
      "One week, no sugary drinks or desserts. Receipt checks and daily check-ins lock the result.",
    status: "settling",
    stakeRange: "$20 to $150",
    participantCount: 471,
    volumeLabel: "$14.1k under review",
    closesAt: "Window closed",
    resolvesAt: "Reviewing now",
    proofWindow: "Closed",
    challengeWindow: "4 hours remaining",
    evidenceMode: "Receipt snapshots and daily streak confirmations",
    payoutLabel: "Ruling in progress",
    sparkCount: 75,
    trendLabel: "18 active disputes",
    ruleHighlights: [
      "Autonomous verification checks flagged ingredient lists.",
      "Only approved substitutions count.",
      "Missed daily check-in triggers an appeal-ready verification pass.",
    ],
    tags: ["wellness", "review live", "discipline"],
  },
  {
    slug: "wash-the-dishes-before-eight",
    title: "Wash Every Dish Before 8:00 PM",
    category: "Home",
    summary:
      "Put a hard deadline on the cleanup. Kitchen photo proof, sink clear-down, and finish timestamp are required.",
    status: "live",
    stakeRange: "$5 to $40",
    participantCount: 1382,
    volumeLabel: "$16.7k pooled",
    closesAt: "Tonight, 8:00 PM ET",
    resolvesAt: "Tonight, 9:15 PM ET",
    proofWindow: "30 minutes after deadline",
    challengeWindow: "3 hours",
    evidenceMode: "Before-and-after kitchen photos with timestamp overlay",
    payoutLabel: "Settles after visual review",
    sparkCount: 318,
    trendLabel: "+42% this week",
    ruleHighlights: [
      "All visible dishes, pans, and utensils must be cleaned and stored.",
      "Counter and sink must be visible in the finish proof.",
      "Proof taken before the pool opens is invalid.",
    ],
    tags: ["home", "short window", "popular"],
  },
  {
    slug: "inbox-zero-before-noon",
    title: "Inbox Zero Before Noon",
    category: "Work",
    summary:
      "Clear the backlog, archive what is done, and finish with a visible zero-state before lunch.",
    status: "live",
    stakeRange: "$15 to $150",
    participantCount: 764,
    volumeLabel: "$22.3k pooled",
    closesAt: "Today, 12:00 PM ET",
    resolvesAt: "Today, 1:30 PM ET",
    proofWindow: "20 minutes after deadline",
    challengeWindow: "4 hours",
    evidenceMode: "Inbox screenshot or exported mail status",
    payoutLabel: "Closes with quick proof review",
    sparkCount: 167,
    trendLabel: "+14% this morning",
    ruleHighlights: [
      "Primary inbox must show zero unread and zero pending.",
      "Snoozed mail counts as unresolved.",
      "Manual cropping that hides timestamps is invalid.",
    ],
    tags: ["focus", "office", "same-day"],
  },
  {
    slug: "ten-thousand-steps-before-midnight",
    title: "10,000 Steps Before Midnight",
    category: "Fitness",
    summary:
      "Track the full day and cross the line before the clock resets. Device proof closes the pool.",
    status: "live",
    stakeRange: "$10 to $120",
    participantCount: 2184,
    volumeLabel: "$41.2k pooled",
    closesAt: "Tonight, 11:59 PM ET",
    resolvesAt: "Tomorrow, 1:00 AM ET",
    proofWindow: "45 minutes after deadline",
    challengeWindow: "6 hours",
    evidenceMode: "Apple Health, Fitbit, Garmin, or approved step export",
    payoutLabel: "Device proof routes to fast review",
    sparkCount: 442,
    trendLabel: "+27% this week",
    ruleHighlights: [
      "Step totals must be captured after midnight lock or end-of-day export.",
      "Edited screenshots are rejected.",
      "Manual conversions from distance logs are not accepted.",
    ],
    tags: ["daily", "device proof", "high volume"],
  },
  {
    slug: "call-your-parents-before-nine",
    title: "Call Your Parents Before 9:00 PM",
    category: "Relationships",
    summary:
      "A small promise with a real deadline. Call logs or verified voice receipts lock the result.",
    status: "live",
    stakeRange: "$5 to $75",
    participantCount: 529,
    volumeLabel: "$7.9k pooled",
    closesAt: "Tonight, 9:00 PM ET",
    resolvesAt: "Tonight, 10:00 PM ET",
    proofWindow: "25 minutes after deadline",
    challengeWindow: "3 hours",
    evidenceMode: "Call log, screen recording, or approved voice receipt",
    payoutLabel: "Short review cycle",
    sparkCount: 98,
    trendLabel: "+11% this week",
    ruleHighlights: [
      "Missed calls do not count.",
      "The proof must show the call happened inside the pool window.",
      "Blocked-contact labels are not accepted for review.",
    ],
    tags: ["social", "family", "short deadline"],
  },
  {
    slug: "lights-out-before-eleven",
    title: "Lights Out Before 11:00 PM",
    category: "Sleep",
    summary:
      "Lock in a clean bedtime with device down and room dark before the nightly cutoff.",
    status: "settling",
    stakeRange: "$15 to $110",
    participantCount: 603,
    volumeLabel: "$13.4k under review",
    closesAt: "Window closed",
    resolvesAt: "Reviewing now",
    proofWindow: "Closed",
    challengeWindow: "2 hours remaining",
    evidenceMode: "Sleep mode receipt, room-light photo, or wearable sleep start",
    payoutLabel: "Ruling flow active",
    sparkCount: 121,
    trendLabel: "9 proof checks pending",
    ruleHighlights: [
      "Proof must confirm device down and room dark state.",
      "Late sleep-mode toggles are flagged for review.",
      "Challenge window reopens if timing metadata is missing.",
    ],
    tags: ["sleep", "night routine", "review live"],
  },
  {
    slug: "read-one-chapter-tonight",
    title: "Read One Chapter Tonight",
    category: "Learning",
    summary:
      "Open the book, finish the chapter, and submit the final page spread before the session closes.",
    status: "upcoming",
    stakeRange: "$5 to $60",
    participantCount: 704,
    volumeLabel: "$4.8k reserved",
    closesAt: "Opens tonight, 7:00 PM ET",
    resolvesAt: "Tonight, 11:00 PM ET",
    proofWindow: "40 minutes after deadline",
    challengeWindow: "4 hours",
    evidenceMode: "Reading tracker, page photo, or study group receipt",
    payoutLabel: "Notify me before open",
    sparkCount: 89,
    trendLabel: "+23% watchlist growth",
    ruleHighlights: [
      "Chapter start and finish pages must both be shown.",
      "Audio adaptation does not count for this pool.",
      "Timestamp must land inside the pool window.",
    ],
    tags: ["study", "night", "upcoming"],
  },
  {
    slug: "ship-the-newsletter-this-morning",
    title: "Send the Newsletter This Morning",
    category: "Work",
    summary:
      "Draft, send, and verify the campaign before the morning window closes.",
    status: "upcoming",
    stakeRange: "$25 to $220",
    participantCount: 292,
    volumeLabel: "$9.1k reserved",
    closesAt: "Opens tomorrow, 8:00 AM ET",
    resolvesAt: "Tomorrow, 11:30 AM ET",
    proofWindow: "30 minutes after deadline",
    challengeWindow: "6 hours",
    evidenceMode: "Campaign send receipt and live archive link",
    payoutLabel: "Opens with send window",
    sparkCount: 63,
    trendLabel: "+17% new followers",
    ruleHighlights: [
      "A draft does not count without a send receipt.",
      "Archived link must resolve publicly or through approved audience proof.",
      "Broken links trigger a second verification pass.",
    ],
    tags: ["creator", "morning", "launch"],
  },
  {
    slug: "no-spend-weekend",
    title: "No Spend Weekend",
    category: "Finance",
    summary:
      "Hold the line from Friday close through Sunday night and finish with a clean transaction window.",
    status: "upcoming",
    stakeRange: "$20 to $200",
    participantCount: 911,
    volumeLabel: "$18.6k reserved",
    closesAt: "Opens Friday, 6:00 PM ET",
    resolvesAt: "Sunday, 11:45 PM ET",
    proofWindow: "90 minutes after deadline",
    challengeWindow: "8 hours",
    evidenceMode: "Card timeline, bank activity window, or approved cash log",
    payoutLabel: "Watchlist open",
    sparkCount: 174,
    trendLabel: "+36% watchlist growth",
    ruleHighlights: [
      "Essential auto-pay items approved before open are exempt.",
      "Cash spending must be logged if the user opts into cash mode.",
      "Transfers between owned accounts do not count as spend.",
    ],
    tags: ["money", "weekend", "watchlist"],
  },
  {
    slug: "meditate-twenty-minutes-at-dawn",
    title: "Meditate 20 Minutes at Dawn",
    category: "Mindset",
    summary:
      "Open the session before sunrise, stay through the timer, and close with a verified completion receipt.",
    status: "upcoming",
    stakeRange: "$10 to $90",
    participantCount: 487,
    volumeLabel: "$6.2k reserved",
    closesAt: "Opens tomorrow, 5:15 AM ET",
    resolvesAt: "Tomorrow, 7:00 AM ET",
    proofWindow: "20 minutes after deadline",
    challengeWindow: "3 hours",
    evidenceMode: "Meditation app export or continuous timer proof",
    payoutLabel: "Opens at dawn",
    sparkCount: 77,
    trendLabel: "+15% this week",
    ruleHighlights: [
      "Continuous session only.",
      "Muted background audio is allowed; other app usage is not.",
      "Timer start must land inside the official open window.",
    ],
    tags: ["habit", "morning", "focus"],
  },
  {
    slug: "thirty-minutes-of-language-practice",
    title: "30 Minutes of Language Practice",
    category: "Learning",
    summary:
      "Log a focused language block and close the pool with verified lesson history or live-session proof.",
    status: "live",
    stakeRange: "$10 to $80",
    participantCount: 358,
    volumeLabel: "$5.4k pooled",
    closesAt: "Tonight, 10:00 PM ET",
    resolvesAt: "Tonight, 11:15 PM ET",
    proofWindow: "30 minutes after deadline",
    challengeWindow: "3 hours",
    evidenceMode: "Lesson export, tutor receipt, or session capture",
    payoutLabel: "Fast verification close",
    sparkCount: 91,
    trendLabel: "+8% today",
    ruleHighlights: [
      "The full 30-minute block must be completed inside the pool window.",
      "Passive listening without session proof does not count.",
      "Tutor receipts must show date and duration.",
    ],
    tags: ["study", "skills", "daily"],
  },
  {
    slug: "kitchen-reset-before-bed",
    title: "Kitchen Reset Before Bed",
    category: "Home",
    summary:
      "Counters clear, trash out, appliances off, and the room reset before the night closes.",
    status: "settling",
    stakeRange: "$10 to $70",
    participantCount: 414,
    volumeLabel: "$6.1k under review",
    closesAt: "Window closed",
    resolvesAt: "Reviewing now",
    proofWindow: "Closed",
    challengeWindow: "1 hour remaining",
    evidenceMode: "Wide-angle kitchen photo set and finish timestamp",
    payoutLabel: "Visual review active",
    sparkCount: 66,
    trendLabel: "6 disputes active",
    ruleHighlights: [
      "All counters and sink areas must be visible.",
      "The final proof must be taken after the reset is complete.",
      "Unseen problem areas may trigger an additional proof request.",
    ],
    tags: ["home", "night", "settling"],
  },
];

export const featuredPools: CommitmentPool[] = poolSeeds.map(enrichPool);

export const sparkFeed: SparkEvent[] = [
  {
    id: "spark-1",
    actor: "Avery James",
    handle: "@averyj",
    message: "Locked in the sunrise 5K pool and posted the route preview.",
    context: "Run 5K Before Sunrise",
    reactionCount: 214,
    status: "new_commitment",
    tenorGifUrl: "https://media1.giphy.com/media/cZ7rmKfFYOvYI/200.gif",
  },
  {
    id: "spark-2",
    actor: "Mina Cole",
    handle: "@mina.c",
    message: "Closed day six of zero sugar. Two hours until result review.",
    context: "Zero Sugar for Seven Days",
    reactionCount: 148,
    status: "streak",
    tenorGifUrl: "https://media1.giphy.com/media/ICOgUNjpvO0PC/200.gif",
  },
  {
    id: "spark-3",
    actor: "Jordan Lee",
    handle: "@jordanl",
    message: "Submitted deploy receipts and changelog notes before the Friday window closed.",
    context: "Ship the Feature by Friday",
    reactionCount: 287,
    status: "result",
    tenorGifUrl: "https://media1.giphy.com/media/3oEjI6SIIHBdRxXI40/200.gif",
  },
];

export const leaderboard: LeaderboardEntry[] = [
  {
    id: "leader-1",
    name: "Avery James",
    score: 98.4,
    streakDays: 42,
    verifiedPools: 19,
    winRate: "94%",
    tier: "Prime",
  },
  {
    id: "leader-2",
    name: "Jordan Lee",
    score: 96.1,
    streakDays: 31,
    verifiedPools: 24,
    winRate: "91%",
    tier: "Prime",
  },
  {
    id: "leader-3",
    name: "Mina Cole",
    score: 93.6,
    streakDays: 27,
    verifiedPools: 17,
    winRate: "89%",
    tier: "Verified",
  },
  {
    id: "leader-4",
    name: "Theo Park",
    score: 91.8,
    streakDays: 22,
    verifiedPools: 15,
    winRate: "87%",
    tier: "Verified",
  },
];

export const networkLedger: NetworkLedgerEntry[] = [
  {
    id: "ledger-1",
    poolTitle: "Run 5K Before Sunrise",
    event: "Proof packet accepted",
    timestamp: "2026-03-08 05:54:12 UTC",
    proofStatus: "Verified",
    settlement: "Pending payout window",
    networkState: "Proof",
  },
  {
    id: "ledger-2",
    poolTitle: "Ship the Feature by Friday",
    event: "PayToCommit fee captured",
    timestamp: "2026-03-07 22:18:09 UTC",
    proofStatus: "Under review",
    settlement: "Awaiting autonomous close",
    networkState: "Fee capture",
    amountLabel: "$580.00",
  },
  {
    id: "ledger-3",
    poolTitle: "Zero Sugar for Seven Days",
    event: "Challenge opened",
    timestamp: "2026-03-07 18:42:55 UTC",
    proofStatus: "Challenge active",
    settlement: "Review window open",
    networkState: "Result",
  },
  {
    id: "ledger-4",
    poolTitle: "Read 100 Pages This Week",
    event: "Market draft opened",
    timestamp: "2026-03-06 14:12:04 UTC",
    proofStatus: "Ready",
    settlement: "Opening Monday",
    networkState: "Creation flow",
  },
  {
    id: "ledger-5",
    poolTitle: "Wash Every Dish Before 8:00 PM",
    event: "Completed side payout released",
    timestamp: "2026-03-05 01:14:31 UTC",
    proofStatus: "Closed clean",
    settlement: "Payout sent",
    networkState: "Payout",
    amountLabel: "$4,880.00",
  },
  {
    id: "ledger-6",
    poolTitle: "Invite Reward",
    event: "Reward issued after 3 completed stakes",
    timestamp: "2026-03-04 16:20:08 UTC",
    proofStatus: "Unlocked",
    settlement: "Wallet credit posted",
    networkState: "Reward",
    amountLabel: "$20.00",
  },
];

export const feeSchedule: FeeSchedule = {
  stakeFloor: "$10 minimum stake",
  depositFee: "ACH free · cards and instant funds 2.5%",
  infrastructureFee: "5% of each commitment stake",
  settlementCapture: "20% of the forfeited side when at least one entrant completes",
  zeroCompleteCapture: "100% of the pool when nobody completes",
  payoutRule:
    "Completed entrants recover their own stake and split the remaining forfeited side after PayToCommit capture.",
  items: [
    {
      label: "Funding",
      value: "ACH free · cards 2.5%",
      note: "Bank transfers stay free. Card and instant-fund deposits cover payment-rail costs.",
    },
    {
      label: "Sovereign Spark",
      value: "5%",
      note: "Each commitment stake carries a 5% infrastructure fee before the market closes.",
    },
    {
      label: "Stake floor",
      value: "$10 minimum",
      note: "Every pool opens with the same minimum stake floor.",
    },
    {
      label: "Winner split",
      value: "20% capture first",
      note: "If at least one entrant completes, the completed side splits the forfeited side after capture.",
    },
    {
      label: "No completions",
      value: "100% PayToCommit capture",
      note: "If nobody completes, the pool closes to PayToCommit.",
    },
  ],
};

export const reliabilityRewardProgram: RewardProgram = {
  title: "Invite Reward",
  summary:
    "Invite someone in, let them close three successful stakes, and both accounts receive wallet cash when the fee coverage is already there.",
  referrerReward: "$10 wallet credit",
  invitedReward: "$10 wallet credit",
  unlockRule: "Unlocks after the invited account closes 3 successful stakes.",
  coverageRule:
    "The release waits until deposit, join, and settlement fees from that cycle fully cover the reward.",
  steps: [
    {
      title: "Invite accepted",
      body: "A new account joins PayToCommit through your invite link.",
    },
    {
      title: "Three completed stakes",
      body: "The invited account must close three separate stakes on the completed side.",
    },
    {
      title: "Coverage check",
      body: "Reward release waits until the cycle has already generated enough captured fees.",
    },
    {
      title: "Wallet credit posted",
      body: "Both accounts receive $10 in wallet cash once the release condition clears.",
    },
  ],
};

export const reliabilityRewardProgress: RewardProgress = {
  completedStakes: 2,
  requiredStakes: 3,
  generatedFees: "$14.50",
  unlockState: "1 more completed stake to unlock",
  remaining: "Coverage gate still waiting on the third closed stake.",
  referrerReward: "$10 wallet credit",
  invitedReward: "$10 wallet credit",
  payoutState: "tracking",
  inviteCountdown: {
    label: "5d 8h left",
    expiresAt: "2026-03-16T22:00:00.000Z",
    remainingSeconds: 460800,
  },
  checklist: [
    { id: "signup", label: "Sign up", completed: true },
    { id: "fund-wallet", label: "Fund wallet", completed: true },
    { id: "stake", label: "Stake", completed: true },
    { id: "submit-proof", label: "Submit STP proof", completed: false },
  ],
};

export const apiEndpoints: ApiEndpoint[] = [
  {
    name: "Browse pools",
    method: "GET",
    path: "/api/pools",
    summary: "Return live, upcoming, and settling commitment pools.",
  },
  {
    name: "Pool detail",
    method: "GET",
    path: "/api/pools/:slug",
    summary: "Return one pool with rules, submission timing, and payout state.",
  },
  {
    name: "Pool activity",
    method: "GET",
    path: "/api/pools/:slug/activity",
    summary: "Return the latest Spark and settlement activity for a pool.",
  },
  {
    name: "Leaderboard",
    method: "GET",
    path: "/api/leaderboard",
    summary: "Return leaderboard rankings, completed-stake history, and result scores.",
  },
  {
    name: "Access grants",
    method: "POST",
    path: "/api/reliability/consents",
    summary: "Create or revoke a consent grant for private reliability access.",
  },
  {
    name: "Developer keys",
    method: "POST",
    path: "/api/developer/keys",
    summary: "Issue a developer key and log the issuance event.",
  },
];

export const notifications: NotificationEvent[] = [
  {
    id: "note-1",
    title: "Submit your route in 42 minutes",
    summary: "Run 5K Before Sunrise is waiting for your final route export.",
    time: "Now",
    tone: "live",
  },
  {
    id: "note-2",
    title: "New challenge requires review",
    summary: "A settlement dispute was opened in Zero Sugar for Seven Days.",
    time: "18 minutes ago",
    tone: "settling",
  },
  {
    id: "note-3",
    title: "Pool opens at midnight",
    summary: "Read 100 Pages This Week will begin accepting entries tonight.",
    time: "2 hours ago",
    tone: "upcoming",
  },
];

export const reviewQueue: ReviewDecision[] = [
  {
    id: "review-1",
    poolTitle: "Zero Sugar for Seven Days",
    reviewer: "Autonomous pass 04",
    evidenceStatus: "Three receipts flagged",
    disputeState: "Open challenge",
    nextAction: "Resolve ingredient exception",
  },
  {
    id: "review-2",
    poolTitle: "Ship the Feature by Friday",
    reviewer: "Verification pass 02",
    evidenceStatus: "Deploy receipt submitted",
    disputeState: "No challenge",
    nextAction: "Confirm build health",
  },
  {
    id: "review-3",
    poolTitle: "Run 5K Before Sunrise",
    reviewer: "Auto-route",
    evidenceStatus: "GPS export verified",
    disputeState: "No challenge",
    nextAction: "Release payout batch",
  },
];

export const poolHistory = [
  {
    title: "Proof received",
    body: "GPS export, pace splits, and route map locked to the pool ledger.",
  },
  {
    title: "Challenge window opened",
    body: "Participants may challenge proof during the active review interval and trigger an appeal rerun.",
  },
  {
    title: "Settlement recorded",
    body: "The Commitment Network posts the ruling, timestamp, and payout status.",
  },
];

export const dashboardMetrics = [
  { label: "Live markets", value: "186", note: "44 more opening in the next 24 hours" },
  { label: "Proof packets today", value: "4,382", note: "96% inside the first review window" },
  { label: "AI review flow", value: "42", note: "Median ruling time: 18m" },
];

export const accountSnapshot = {
  cash: "$4,250.00",
  portfolio: "$12,480.00",
  alerts: "3",
};

export const launchModes = [
  {
    title: "Open access",
    description: "Anyone can explore pools, add funds, and enter open commitment pools.",
  },
  {
    title: "Pool creation review",
    description: "Accounts stay open while new market creation routes through autonomous drafting and confirmation.",
  },
  {
    title: "Funding hold",
    description: "Browsing stays open while new funding and new commitment entries pause.",
  },
];

export const marketingLinks = [
  { href: "/", label: "Home" },
  { href: "/pools", label: "Markets" },
  { href: "/spark", label: "Spark" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/fees", label: "Fees" },
  { href: "/developers", label: "Developers" },
  { href: "/network", label: "Commitment Network" },
];

export const footerLinks = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/fees", label: "Fees" },
  { href: "/docs", label: "Docs" },
  { href: "/faqs", label: "FAQs" },
  { href: "/help-center", label: "Help Center" },
  { href: "/contact", label: "Contact" },
  { href: "/security", label: "Security" },
  { href: "/changelog", label: "Changelog" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/mobile", label: "Mobile" },
];

export const appLinks = [
  { href: "/app", label: "Overview" },
  { href: "/app/onboarding", label: "Onboarding" },
  { href: "/app/pools/new", label: "Create market" },
  { href: "/app/wallet", label: "Wallet" },
  { href: "/app/reliability", label: "Rewards & access" },
  { href: "/app/history", label: "History" },
  { href: "/app/notifications", label: "Notifications" },
  { href: "/app/profile", label: "Profile" },
];

export const docsPages: DocPage[] = [
  {
    slug: [],
    group: "Overview",
    title: "PayToCommit Docs",
    eyebrow: "Docs",
    summary: "Reference for API access, fees, rules, rewards, and the Commitment Network.",
    searchTerms: ["docs", "overview", "api", "fees", "rules", "network"],
    sections: [
      {
        id: "overview",
        title: "Pool model",
        body: [
          "PayToCommit runs completion-based pools. Entrants are always trying to finish on the completed side before the deadline closes.",
          "Pool totals, proof windows, review timing, and result rules stay visible on every pool page.",
        ],
      },
      {
        id: "funding",
        title: "Money flow",
        body: [
          "ACH deposits are free. Card and instant-fund deposits carry a 2.5% fee.",
          "Every commitment stake carries a 5% Sovereign Spark fee and every pool uses a $10 minimum stake floor.",
        ],
      },
      {
        id: "network",
        title: "Commitment Network",
        body: [
          "Stake placement, proof, fee capture, payout release, and reward issuance publish into the Commitment Network ledger.",
        ],
      },
    ],
  },
  {
    slug: ["api"],
    group: "Reference",
    title: "API Reference",
    eyebrow: "API",
    summary: "Pool, activity, leaderboard, key issuance, and consent routes.",
    searchTerms: ["api", "developer keys", "consent", "leaderboard", "pools"],
    sections: [
      {
        id: "auth",
        title: "Keys and consent",
        body: [
          "Every private lookup requires a developer key, an allowed scope, and a matching consent record.",
          "There is no open legal-name search and no silent enrichment path.",
        ],
      },
      {
        id: "endpoints",
        title: "Available endpoints",
        body: [
          "Use pool browse and detail endpoints for public inventory and activity.",
          "Use key issuance and access grants for consent-bound integrations.",
        ],
      },
    ],
  },
  {
    slug: ["fees"],
    group: "Reference",
    title: "Fees and Payouts",
    eyebrow: "Fees",
    summary: "Funding, Sovereign Spark fees, settlement capture, and winner splits.",
    searchTerms: ["fees", "payouts", "settlement", "sovereign spark", "deposit fee"],
    sections: [
      {
        id: "funding",
        title: "Funding fees",
        body: [
          "ACH stays free. Card and instant-fund deposits carry a 2.5% fee.",
          "Every commitment stake adds a 5% Sovereign Spark fee before the market closes.",
        ],
      },
      {
        id: "settlement",
        title: "Settlement capture",
        body: [
          "If at least one entrant completes, PayToCommit captures 20% of the forfeited side before winner distribution.",
          "If nobody completes, PayToCommit captures the full pool.",
        ],
      },
    ],
  },
  {
    slug: ["reliability-rewards"],
    group: "Programs",
    title: "Reliability Reward",
    eyebrow: "Rewards",
    summary: "Invite flow, three-completion unlock, and wallet release rules.",
    searchTerms: ["reliability reward", "invite", "referral", "wallet credit"],
    sections: [
      {
        id: "unlock",
        title: "Unlock rule",
        body: [
          "The invited account must finish 3 successful stakes.",
          "Both the referrer and invited user receive $10 in wallet cash once the coverage rule clears.",
        ],
      },
      {
        id: "coverage",
        title: "Coverage gate",
        body: [
          "Rewards do not release until captured deposit, infrastructure, and settlement fees from that cycle cover the payout liability.",
        ],
      },
    ],
  },
  {
    slug: ["network"],
    group: "Reference",
    title: "Commitment Network",
    eyebrow: "Network",
    summary: "Ledger states for stake, proof, fee capture, payout, and reward release.",
    searchTerms: ["commitment network", "ledger", "events", "payout", "fees"],
    sections: [
      {
        id: "events",
        title: "Ledger events",
        body: [
          "Each pool can publish stake placement, proof acceptance, challenge state, fee capture, payout release, and reward issuance.",
        ],
      },
      {
        id: "audit",
        title: "Audit trail",
        body: [
          "Each entry includes a timestamp, pool reference, state transition, and public-facing result label.",
        ],
      },
    ],
  },
  {
    slug: ["review-standards"],
    group: "Reference",
    title: "Rules and Review Standards",
    eyebrow: "Rules",
    summary: "How rules are authored, how evidence is checked, and when pools are invalidated.",
    searchTerms: ["rules", "review", "proof", "invalid", "challenge"],
    sections: [
      {
        id: "rules",
        title: "Pool rules",
        body: [
          "Every pool must define the deadline, proof requirement, challenge window, invalidation cases, and payout math before it opens.",
        ],
      },
      {
        id: "review",
        title: "Review standards",
        body: [
          "Staff review focuses on whether the proof matches the written rule, whether timing is inside the pool window, and whether the evidence can survive challenge.",
        ],
      },
    ],
  },
];

export function getCategoryAnchor(category: string) {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function getPoolCategories(poolsInput: CommitmentPool[] = featuredPools): PoolCategorySummary[] {
  const grouped = poolsInput.reduce<Map<string, CommitmentPool[]>>((map, pool) => {
    const existing = map.get(pool.category) ?? [];
    existing.push(pool);
    map.set(pool.category, existing);
    return map;
  }, new Map());

  return Array.from(grouped.entries())
    .map(([category, pools]) => ({
      category,
      anchor: getCategoryAnchor(category),
      totalCount: pools.length,
      liveCount: pools.filter((pool) => pool.status === "live").length,
      upcomingCount: pools.filter((pool) => pool.status === "upcoming").length,
      settlingCount: pools.filter((pool) => pool.status === "settling").length,
      leadPoolSlug: pools[0]?.slug ?? "",
      leadPoolTitle: pools[0]?.title ?? "",
    }))
    .sort((left, right) => right.totalCount - left.totalCount || left.category.localeCompare(right.category));
}

export function getPoolBySlug(slug: string) {
  return featuredPools.find((pool) => pool.slug === slug);
}

export function getDocPath(slug: string[], docsHost = false) {
  if (docsHost) {
    return slug.length ? `/${slug.join("/")}` : "/";
  }

  return slug.length ? `/docs/${slug.join("/")}` : "/docs";
}

export function getDocPageBySlug(slug: string[] = []) {
  return docsPages.find((page) => page.slug.join("/") === slug.join("/")) ?? docsPages[0];
}
