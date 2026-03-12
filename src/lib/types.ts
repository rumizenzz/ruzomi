export type PoolStatus = "live" | "upcoming" | "settling" | "settled";
export type PreOpenStakeState = "inactive" | "eligible" | "staked";
export type MarketLifecycleState =
  | "scheduled"
  | "upcoming"
  | "join_open"
  | "join_closing_soon"
  | "join_closed_active"
  | "proof_window_open"
  | "proof_window_closed"
  | "under_review"
  | "resolved"
  | "voided"
  | "canceled";
export type PreOpenDisplayState = "market-open" | "first-join";
export type TicketResultStatus = "active" | "completed" | "missed" | "void";
export type IdentityStatus = "not_started" | "pending" | "verified" | "failed";
export type CommandMode = "search" | "generate";
export type GenerationEligibility = "locked" | "unlocked";
export type GenerationEligibilityReason =
  | "guest"
  | "no_verified_completion"
  | "active_window"
  | "expired_window";
export type PresenceStatus = "online" | "away" | "dnd" | "invisible";
export type SparkMessageType = "message" | "market_idea";
export type SparkReactionName = string;
export type WalletTransactionType =
  | "funding_pending"
  | "funding_posted"
  | "stake_debit"
  | "stake_refund"
  | "stake_payout"
  | "fee_capture"
  | "reward_credit"
  | "chain_debit"
  | "chain_payout";
export type WalletTransactionStatus = "pending" | "posted" | "failed" | "reversed";
export type MessageTargetType = "message" | "reply";
export type ReferralPayoutState = "locked" | "tracking" | "ready" | "paid" | "expired";

export interface CustomActivityStatus {
  text: string;
  expiresAt: string | null;
  durationLabel: string;
}

export interface GenerationEligibilityState {
  eligibility: GenerationEligibility;
  reason: GenerationEligibilityReason;
  lastVerifiedCompletionAt: string | null;
  expiresAt: string | null;
}

export interface InviteCountdownTimer {
  label: string;
  expiresAt: string;
  remainingSeconds: number;
}

export interface StepCompletionChecklist {
  id: string;
  label: string;
  completed: boolean;
  completedAt?: string | null;
}

export interface ContactSyncConsent {
  status: "unknown" | "granted" | "denied";
  requestedAt?: string | null;
  grantedAt?: string | null;
}

export type NotifyMeChannelPreference = "push" | "email" | "sms" | "in_app";
export type NotifyMeEventType = "market_open" | "join_closing_soon" | "last_call" | "schedule_change";

export interface NotifyMeSubscription {
  poolSlug: string;
  active: boolean;
  channels: NotifyMeChannelPreference[];
  events: NotifyMeEventType[];
  updatedAt: string;
}

export interface PostStakeNotifyPromptState {
  eligible: boolean;
  poolSlug: string;
  opensAt: string;
  joinClosesAt: string;
}

export interface GuestSessionState {
  source: "direct" | "invite" | "share";
  campaignTag?: string | null;
  preferredCategory?: string | null;
}

export interface FractalMarketReadAccess {
  allowed: boolean;
  source: "guest" | "member";
  prompt?: string | null;
}

export interface FrictionLightAuthModal {
  open: boolean;
  poolSlug: string;
  poolTitle: string;
  stakeCents: number;
  nextHref: string;
}

export interface CrossPlatformHandoffSession {
  id: string;
  poolSlug: string;
  poolTitle: string;
  stakeCents: number;
  smartLink: string;
  qrValue: string;
  platformHint: "ios" | "android" | "desktop";
  createdAt: string;
}

export type GalactusAccessContext = "docs" | "sales" | "support" | "generate";

export interface GalactusAccessState {
  allowed: boolean;
  context: GalactusAccessContext;
  title: string;
  body: string;
  countdownLabel: string | null;
  ctaLabel: string;
  ctaHref: string;
}

export interface GalactusLockedPayload {
  locked: true;
  error: string;
  message: string;
  access: GalactusAccessState;
}

export interface IdentityProfile {
  status: IdentityStatus;
  fullName: string;
  birthDate: string;
  addressLine1: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  verifiedAt: string | null;
  failedReason: string | null;
  stripeSessionId?: string | null;
}

export interface SparkPollOption {
  id: string;
  label: string;
  votes: number;
  viewerSelected?: boolean;
}

export interface SparkPoll {
  question: string;
  options: SparkPollOption[];
  totalVotes: number;
  expiresAt?: string | null;
  viewerHasVoted?: boolean;
}

export interface FaqSection {
  id: string;
  title: string;
  summary: string;
  description: string;
}

export interface FaqItem {
  id: string;
  sectionId: string;
  question: string;
  searchTerms: string[];
  answer: string[];
}

export interface FaqSearchResult {
  id: string;
  sectionId: string;
  question: string;
  match: string;
}

export interface MarketOriginCredit {
  handle: string;
  displayName: string;
  label: string;
}

export interface AiProviderTrace {
  provider: "openai" | "twelve_labs" | "heuristic";
  model: string;
  stage: "moderation" | "draft" | "docs" | "verification" | "appeal";
  summary: string;
}

export type GalactusReasoningEffort = "low" | "medium" | "high" | "xhigh";

export interface GalactusCoreModelConfig {
  alias: string;
  snapshot: string | null;
  defaultReasoningEffort: GalactusReasoningEffort;
  maxOutputTokens: number;
}

export interface OpenAiResponsesRuntimeConfig {
  baseUrl: string;
  model: string;
  snapshot: string | null;
  defaultReasoningEffort: GalactusReasoningEffort;
  maxOutputTokens: number;
}

export interface SnapshotPinState {
  alias: string;
  snapshot: string | null;
  pinned: boolean;
}

export interface ReasoningEffortPolicy {
  stage: AiProviderTrace["stage"];
  effort: GalactusReasoningEffort;
}

export interface AiCostBudget {
  maxInputTokens: number;
  maxOutputTokens: number;
  maxToolCalls: number;
}

export interface WorkflowUnitEconomics {
  workflow: "docs" | "market_generation" | "proof_review" | "support" | "sales";
  estimatedCostUsd: number;
  targetMarginUsd: number;
  profitable: boolean;
}

export interface MarginGuardrailState {
  workflow: WorkflowUnitEconomics["workflow"];
  withinBudget: boolean;
  reason?: string;
}

export interface ToolCallBudget {
  maxCalls: number;
  usedCalls: number;
}

export interface PromptCompactionPolicy {
  maxContextItems: number;
  maxInputChars: number;
}

export interface VideoPerceptionPipelineState {
  enabled: boolean;
  provider: "twelve_labs";
  activeForUpload: boolean;
}

export interface TwelveLabsVideoAnalysisState {
  status: "idle" | "queued" | "processing" | "ready" | "failed";
  provider: "twelve_labs";
}

export interface DerivedVideoContext {
  summary: string;
  timestamps?: string[];
}

export interface OpenAiProviderState {
  provider: "openai";
  runtime: "responses";
  model: string;
}

export interface ProviderRemovalState {
  provider: "legacy_vertex_provider";
  removed: boolean;
}

export interface AgentRunCostBreakdown {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens?: number;
  workflowCostUsd: number;
}

export interface EnterpriseWorkflowCostState {
  workflow: "enterprise_support" | "enterprise_sales" | "enterprise_api";
  totalCostUsd: number;
}

export interface MarketGenerationCostState {
  totalCostUsd: number;
  withinBudget: boolean;
}

export interface ProofReviewCostState {
  totalCostUsd: number;
  videoAnalysisCostUsd: number;
  withinBudget: boolean;
}

export interface AiRejectionReason {
  code:
    | "unsafe_self_harm"
    | "unsafe_violence"
    | "unsafe_illegal"
    | "unsafe_harassment"
    | "unsafe_sexual"
    | "unsafe_minor"
    | "unsafe_extreme_risk"
    | "unsafe_fraud"
    | "unsafe_hate";
  title: string;
  body: string;
  suggestedRewrite?: string;
}

export interface AiModerationDecision {
  allowed: boolean;
  reason?: AiRejectionReason;
  traces: AiProviderTrace[];
}

export interface AiEvidenceAsset {
  url: string;
  kind: "text" | "image" | "video" | "document";
  provider?: "twelve_labs" | "openai";
  summary?: string;
}

export interface AppUser {
  id: string;
  displayName: string;
  handle: string;
  sessionToken: string;
  joinedAt: string;
  identityStatus: IdentityStatus;
}

export interface CommitmentPool {
  id?: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  status: PoolStatus;
  lifecycleState: MarketLifecycleState;
  stakeRange: string;
  stakeFloor: string;
  stakeFloorCents?: number;
  stakeMaxCents?: number;
  stakeBand: string;
  participantCount: number;
  volumeLabel: string;
  targetGoal: string;
  preOpenDisplayState: PreOpenDisplayState;
  visiblePoolTotal: boolean;
  opensAt: string;
  joinOpensAt: string;
  joinClosesAt: string;
  opensAtLabel?: string;
  joinClosesAtLabel?: string;
  opensInLabel?: string | null;
  joinClosesInLabel?: string | null;
  timingSummaryLabel?: string;
  proofWindowOpensAt: string;
  proofWindowClosesAt: string;
  resolutionTargetAt: string;
  settlementFinalizedAt: string | null;
  joinStatusLabel: string;
  notifyMeAvailable: boolean;
  marketOpenReminderAvailable: boolean;
  preOpenStakeLive: boolean;
  closesAt: string;
  resolvesAt: string;
  proofWindow: string;
  challengeWindow: string;
  evidenceMode: string;
  payoutLabel: string;
  resultState: string;
  networkState: string;
  rulesPath: string;
  sparkCount: number;
  trendLabel: string;
  ruleHighlights: string[];
  tags: string[];
  ticketCount?: number;
  liveTotalCents?: number;
  categoryAnchor?: string;
  trendPoints?: MarketTrendPoint[];
}

export interface PoolPositionAggregate {
  poolSlug: string;
  poolTitle: string;
  category: string;
  ticketCount: number;
  totalStakeLabel: string;
  currentState: string;
  resultLabel: string;
  payoutLabel: string;
  deadlineLabel: string;
}

export interface EarlyReleaseQuote {
  originalStakeCents: number;
  originalStakeLabel: string;
  penaltyRate: number;
  penaltyCents: number;
  penaltyLabel: string;
  refundCents: number;
  refundLabel: string;
  confirmedAtLabel: string;
}

export interface IntegrityScoreImpactPreview {
  title: string;
  body: string;
  trend: "negative" | "neutral" | "positive";
}

export interface PoolTicket {
  id: string;
  poolId: string;
  poolSlug: string;
  poolTitle: string;
  poolCategory: string;
  stakeCents: number;
  stakeLabel: string;
  status: TicketResultStatus;
  proofStatus: string;
  joinedAt: string;
  lifecycleState: MarketLifecycleState;
  joinStatusLabel: string;
  joinClosesAt: string | null;
  proofWindowClosesAt: string | null;
  proofMode: string;
  earlyReleaseAvailable: boolean;
  earlyReleaseQuote: EarlyReleaseQuote | null;
  integrityImpactPreview: IntegrityScoreImpactPreview | null;
  noRejoinMessage: string | null;
  resultLabel: string;
  feeLabel: string;
  chainSlug?: string | null;
}

export interface WalletAccount {
  id: string;
  availableCents: number;
  pendingCents: number;
  lockedCents: number;
  availableLabel: string;
  pendingLabel: string;
  lockedLabel: string;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  amountCents: number;
  feeCents: number;
  netCents: number;
  amountLabel: string;
  feeLabel: string;
  netLabel: string;
  summary: string;
  createdAt: string;
  externalReference?: string | null;
}

export interface WalletTopUpPreview {
  amountCents: number;
  amountLabel: string;
  feeCents: number;
  feeLabel: string;
  netCents: number;
  netLabel: string;
}

export interface WalletState {
  viewer: AppUser | null;
  wallet: WalletAccount;
  transactions: WalletTransaction[];
  positions: PoolPositionAggregate[];
  tickets: PoolTicket[];
  chainTickets: ChainTicket[];
  rewardProgress: RewardProgress;
  contactSyncConsent: ContactSyncConsent;
  notifications: NotificationEvent[];
}

export interface SparkEvent {
  id: string;
  actor: string;
  handle: string;
  message: string;
  context: string;
  reactionCount: number;
  status: "streak" | "new_commitment" | "result";
  tenorGifUrl?: string | null;
}

export interface PoolMessage {
  id: string;
  poolId: string | null;
  poolSlug: string | null;
  poolTitle: string | null;
  authorName: string;
  authorHandle: string;
  body: string;
  tenorGifUrl?: string | null;
  hearts: number;
  replyCount: number;
  createdAt: string;
  unread: boolean;
  messageType?: SparkMessageType;
  reactionCounts?: Record<string, number>;
  viewerReactions?: SparkReactionName[];
  presenceStatus?: PresenceStatus;
  customActivity?: CustomActivityStatus | null;
  poll?: SparkPoll | null;
  originCredit?: MarketOriginCredit | null;
  replies?: MessageReply[];
}

export interface MessageReply {
  id: string;
  messageId: string;
  authorName: string;
  authorHandle: string;
  body: string;
  tenorGifUrl?: string | null;
  hearts: number;
  createdAt: string;
  viewerHearted?: boolean;
  reactionCounts?: Record<string, number>;
  viewerReactions?: SparkReactionName[];
}

export interface MessageReaction {
  id: string;
  targetType: MessageTargetType;
  targetId: string;
  reaction: SparkReactionName;
  count: number;
}

export interface MessageReadState {
  poolId: string;
  lastSeenAt: string;
}

export interface EnterpriseApiApplication {
  organizationName: string;
  contactName: string;
  businessEmail: string;
  website: string;
  teamSize: string;
  monthlyRequestBand: string;
  decisionType: string;
  needsLegalIdentityMatch: string;
  launchPath: string;
  useCase: string;
  workflowImpact: string;
  consentAcknowledged: boolean;
}

export interface QuickstartStep {
  id: string;
  label: string;
  title: string;
  description: string;
  status: "locked" | "current" | "completed";
  href: string;
  actionLabel: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  streakDays: number;
  verifiedPools: number;
  winRate: string;
  tier: string;
}

export interface NetworkLedgerEntry {
  id: string;
  poolTitle: string;
  event: string;
  timestamp: string;
  proofStatus: string;
  settlement: string;
  networkState?: string;
  amountLabel?: string;
}

export interface NotificationEvent {
  id: string;
  title: string;
  summary: string;
  time: string;
  tone: "live" | "upcoming" | "settling" | "settled";
}

export interface ApiEndpoint {
  name: string;
  method: string;
  path: string;
  summary: string;
}

export interface ReviewDecision {
  id: string;
  poolTitle: string;
  reviewer: string;
  evidenceStatus: string;
  disputeState: string;
  nextAction: string;
}

export interface PoolCategorySummary {
  category: string;
  anchor: string;
  totalCount: number;
  liveCount: number;
  upcomingCount: number;
  settlingCount: number;
  leadPoolSlug: string;
  leadPoolTitle: string;
}

export interface FeeLineItem {
  label: string;
  value: string;
  note: string;
}

export interface FeeSchedule {
  stakeFloor: string;
  depositFee: string;
  infrastructureFee: string;
  settlementCapture: string;
  zeroCompleteCapture: string;
  payoutRule: string;
  items: FeeLineItem[];
}

export interface RewardProgram {
  title: string;
  summary: string;
  referrerReward: string;
  invitedReward: string;
  unlockRule: string;
  coverageRule: string;
  steps: Array<{
    title: string;
    body: string;
  }>;
}

export interface RewardProgress {
  completedStakes: number;
  requiredStakes: number;
  generatedFees: string;
  unlockState: string;
  remaining: string;
  referrerReward: string;
  invitedReward: string;
  payoutState: ReferralPayoutState;
  inviteCountdown: InviteCountdownTimer | null;
  checklist: StepCompletionChecklist[];
}

export interface ChainLeg {
  poolSlug: string;
  poolTitle: string;
  deadlineLabel: string;
  proofMode: string;
}

export interface Chain {
  id?: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  status: PoolStatus;
  assemblyFeeLabel: string;
  stakeBand: string;
  totalStakedLabel: string;
  completionRule: string;
  payoutLabel: string;
  sparkCount: number;
  legA: ChainLeg;
  legB: ChainLeg;
}

export interface ChainTicket {
  id: string;
  chainSlug: string;
  title: string;
  stakeLabel: string;
  resultLabel: string;
  joinedAt: string;
}

export interface ChainSettlement {
  id: string;
  chainSlug: string;
  result: string;
  payoutLabel: string;
  settledAt: string;
}

export interface DocSection {
  id: string;
  title: string;
  body: string[];
}

export interface DocPage {
  slug: string[];
  group: string;
  title: string;
  eyebrow: string;
  summary: string;
  searchTerms: string[];
  sections: DocSection[];
  codeSample?: {
    title: string;
    language: string;
    code: string;
    note?: string;
  };
}

export interface DocsSearchResult {
  slug: string[];
  title: string;
  summary: string;
  group: string;
  match: string;
}

export interface HelpSection {
  id: string;
  title: string;
  summary: string;
  description: string;
}

export interface HelpArticle {
  slug: string;
  sectionId: string;
  title: string;
  summary: string;
  searchTerms: string[];
  body: string[];
}

export interface HelpSearchResult {
  slug: string;
  sectionId: string;
  title: string;
  summary: string;
  match: string;
}

export type PasswordRecoveryState = "idle" | "sending" | "sent" | "updating" | "updated" | "error";

export interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDocument {
  slug: string;
  title: string;
  summary: string;
  effectiveDate: string;
  updatedDate: string;
  sections: LegalSection[];
}

export interface PoolStats {
  poolId: string;
  participantCount: number;
  ticketCount: number;
  totalStakedCents: number;
  messageCount: number;
  liveTotalVisible: boolean;
  lastActivityAt: string | null;
}

export interface SiteState {
  livePoolCount: number;
  liveChannelCount: number;
  openingCount: number;
  settlingCount: number;
  categories: PoolCategorySummary[];
  topPools: CommitmentPool[];
  openingPools: CommitmentPool[];
  settlingPools: CommitmentPool[];
  marketHighway?: MarketFeedItem[];
  sparkHighlights?: PoolMessage[];
  chainSpotlight?: Chain[];
  account?: {
    cash: string;
    portfolio: string;
    alerts: number;
  };
}

export interface AiCitation {
  path: string;
  title: string;
  sectionId: string;
  sectionTitle: string;
  excerpt: string;
}

export interface AiDocsAnswer {
  question: string;
  answer: string;
  citations: AiCitation[];
  model: string;
  generatedAt: string;
  traces?: AiProviderTrace[];
}

export interface AiRuleset {
  summary: string;
  rules: string[];
  invalidationCases: string[];
  proofChecklist: string[];
  resultTiming: string;
}

export interface AiMarketDraft {
  id: string;
  prompt: string;
  title: string;
  category: string;
  summary: string;
  targetGoal: string;
  proofMode: string;
  stakeFloorCents: number;
  stakeMaxCents: number;
  stakeBand: string;
  closesAt: string;
  resolvesAt: string;
  proofWindow: string;
  challengeWindow: string;
  ruleset: AiRuleset;
  status: "drafted" | "confirmed" | "opened";
  tags: string[];
  draftingNotes?: string[];
  moderation?: AiModerationDecision;
  traces?: AiProviderTrace[];
  sourceMessageId?: string | null;
  originCredit?: MarketOriginCredit | null;
}

export interface AiVerificationJob {
  id: string;
  ticketId: string;
  poolSlug: string;
  proofSummary: string;
  proofLinks: string[];
  outcome: "completed" | "missed" | "needs_more_evidence";
  confidence: number;
  explanation: string;
  status: "queued" | "resolved" | "appealed";
  model: string;
  createdAt: string;
  resolvedAt?: string | null;
  evidenceAssets?: AiEvidenceAsset[];
  traces?: AiProviderTrace[];
}

export interface AiAppealJob {
  id: string;
  verificationJobId: string;
  ticketId: string;
  appealReason: string;
  outcome: "completed" | "missed" | "needs_more_evidence";
  confidence: number;
  explanation: string;
  status: "queued" | "resolved";
  model: string;
  createdAt: string;
  resolvedAt?: string | null;
  traces?: AiProviderTrace[];
}

export interface ResultCard {
  ticketId: string;
  type: "completed" | "missed";
  title: string;
  subtitle: string;
  summary: string;
  netResultLabel: string;
  downloadPath: string;
  createdAt: string;
  sparkShareText?: string;
  externalShareText?: string;
}

export type VictoryCard = ResultCard;
export type DefeatCard = ResultCard;

export interface RuzomiChannel {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  href: string;
  unreadCount: number;
  type: "global" | "market" | "direct" | "artifacts";
}

export interface PublicProfile {
  id: string;
  handle: string;
  displayName: string;
  headline: string;
  homeBase: string;
  joinedAt: string;
  presenceStatus: PresenceStatus;
  customActivity?: CustomActivityStatus | null;
  visibility: "public" | "private";
  shareProofArtifacts: boolean;
  netResultLabel: string;
  completedCount: number;
  missedCount: number;
  activeCount: number;
  streakLabel: string;
  currentMarkets: PoolTicket[];
  recentResults: PoolTicket[];
  sparkHighlights: PoolMessage[];
  resultCards: ResultCard[];
}

export interface MarketTrendPoint {
  label: string;
  value: number;
  volume: number;
  timestampLabel?: string;
  pulseLabel?: string;
  truthAnchorTitle?: string;
  truthAnchorDetail?: string;
  revealState?: "hidden" | "revealed";
}

export interface MarketQuestionOption {
  id: string;
  label: string;
  description?: string;
  recommended?: boolean;
}

export interface MarketQuestion {
  id: string;
  prompt: string;
  status: "awaiting_response" | "answered";
  options: MarketQuestionOption[];
  response?: string;
}

export interface MarketDraftPlan {
  summary: string;
  questions: MarketQuestion[];
  implementationSteps: string[];
}

export interface MarketDraftConversation {
  id: string;
  prompt: string;
  status: "planning" | "drafted" | "ready_to_open";
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    body: string;
  }>;
  plan?: MarketDraftPlan;
}

export interface CommitmentMarketGroup {
  id: string;
  title: string;
  category: string;
  markets: CommitmentPool[];
}

export interface FractalMarket {
  id: string;
  title: string;
  category: string;
  summary: string;
  parentPoolSlug: string;
  pools: CommitmentPool[];
}

export interface CommitmentBoard {
  heading: string;
  commandMode: CommandMode;
  generationEligibility: GenerationEligibility;
  groups: CommitmentMarketGroup[];
}

export interface SovereignSparkFee {
  rate: string;
  label: string;
  summary: string;
}

export interface MarketFeedItem {
  id: string;
  label: string;
  body: string;
  context: string;
  tone: "live" | "chain" | "proof" | "result";
  time: string;
  poolSlug?: string;
}

export interface NotificationPanelState {
  unreadCount: number;
  notifications: NotificationEvent[];
}

export type FundingMethod = "apple_pay" | "google_pay" | "debit_card" | "ach_wire";
export type ProofCaptureMode = "web" | "native_stp";

export interface StpChallenge {
  instruction: string;
  expiresAt: string;
}

export interface StpVerificationJob {
  id: string;
  status: "queued" | "capturing" | "processing" | "verified" | "failed";
  proofCaptureMode: ProofCaptureMode;
  challenge?: StpChallenge | null;
  failureReason?: string | null;
}
