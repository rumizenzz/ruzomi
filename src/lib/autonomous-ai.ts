import { docsPages, getDocPath } from "@/lib/docs-content";
import { getServerEnv, hasOpenAiServerEnv, hasTwelveLabsServerEnv } from "@/lib/env";
import type {
  AiCitation,
  AiDocsAnswer,
  AiEvidenceAsset,
  AiCostBudget,
  AiMarketDraft,
  AiModerationDecision,
  AiProviderTrace,
  AiRejectionReason,
  AiRuleset,
  AiVerificationJob,
  GalactusReasoningEffort,
} from "@/lib/types";

type JsonObject = Record<string, unknown>;

type GenerationResult<T extends JsonObject> = {
  data: T | null;
  traces: AiProviderTrace[];
};

type TwelveLabsIndex = {
  _id?: string;
  index_id?: string;
  id?: string;
  index_name?: string;
  name?: string;
};

type TwelveLabsTask = {
  _id?: string;
  task_id?: string;
  id?: string;
  status?: string;
  video_id?: string;
};

type ProofInput = {
  poolTitle: string;
  poolSlug: string;
  proofMode: string;
  proofSummary: string;
  proofLinks: string[];
  previousOutcome?: string;
  appealReason?: string;
};
let twelveLabsIndexCache: string | null = null;

function compactWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function tokenize(value: string) {
  return compactWhitespace(value)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

const DEFAULT_AI_COST_BUDGET: AiCostBudget = {
  maxInputTokens: 12000,
  maxOutputTokens: 1600,
  maxToolCalls: 4,
};

function normalizeReasoningEffort(value: string): GalactusReasoningEffort {
  if (value === "low" || value === "medium" || value === "high" || value === "xhigh") {
    return value;
  }

  return "medium";
}

function resolveReasoningEffort(
  stage: AiProviderTrace["stage"],
  preferFast: boolean | undefined,
  fallback: GalactusReasoningEffort,
): GalactusReasoningEffort {
  if (preferFast) {
    return "low";
  }

  switch (stage) {
    case "docs":
      return "low";
    case "draft":
      return "medium";
    case "verification":
      return "medium";
    case "appeal":
      return "high";
    case "moderation":
    default:
      return fallback;
  }
}

function resolveOutputTokenCap(requested: number) {
  if (Number.isFinite(requested) && requested > 0) {
    return Math.min(Math.trunc(requested), DEFAULT_AI_COST_BUDGET.maxOutputTokens);
  }

  return DEFAULT_AI_COST_BUDGET.maxOutputTokens;
}

async function twelveLabsRequest<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (!hasTwelveLabsServerEnv()) {
    return null;
  }

  const env = getServerEnv();

  try {
    const response = await fetch(`${env.twelveLabsBaseUrl.replace(/\/$/, "")}${path}`, {
      ...init,
      headers: {
        "x-api-key": env.twelveLabsApiKey,
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function getTwelveLabsIndexId(entry: TwelveLabsIndex) {
  return entry._id ?? entry.index_id ?? entry.id ?? null;
}

async function ensureTwelveLabsIndex() {
  if (twelveLabsIndexCache) {
    return twelveLabsIndexCache;
  }

  const env = getServerEnv();
  const listed = await twelveLabsRequest<{ data?: TwelveLabsIndex[]; indexes?: TwelveLabsIndex[] }>("/indexes");
  const existing = (listed?.data ?? listed?.indexes ?? []).find((entry) => {
    const name = entry.index_name ?? entry.name ?? "";
    return name === env.twelveLabsIndexName;
  });

  const existingId = existing ? getTwelveLabsIndexId(existing) : null;
  if (existingId) {
    twelveLabsIndexCache = existingId;
    return existingId;
  }

  const created = await twelveLabsRequest<TwelveLabsIndex>("/indexes", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      index_name: env.twelveLabsIndexName,
      models: [
        {
          model_name: "marengo2.7",
          model_options: ["visual", "audio"],
        },
        {
          model_name: "pegasus1.2",
          model_options: ["visual", "audio"],
        },
      ],
    }),
  });

  const createdId = created ? getTwelveLabsIndexId(created) : null;
  if (createdId) {
    twelveLabsIndexCache = createdId;
  }

  return createdId;
}

async function waitForTwelveLabsTask(taskId: string, maxAttempts = 30) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const task = await twelveLabsRequest<TwelveLabsTask>(`/tasks/${taskId}`);
    const status = task?.status?.toLowerCase();

    if (status === "ready" || status === "completed" || status === "indexed") {
      return task;
    }

    if (status === "failed" || status === "error") {
      return null;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return null;
}

async function summarizeVideoWithTwelveLabs(url: string) {
  const indexId = await ensureTwelveLabsIndex();
  if (!indexId) {
    return null;
  }

  const form = new FormData();
  form.set("index_id", indexId);
  form.set("video_url", url);

  const createdTask = await twelveLabsRequest<TwelveLabsTask>("/tasks", {
    method: "POST",
    body: form,
  });

  const taskId = createdTask?._id ?? createdTask?.task_id ?? createdTask?.id;
  if (!taskId) {
    return null;
  }

  const finishedTask = await waitForTwelveLabsTask(taskId);
  const videoId = finishedTask?.video_id;
  if (!videoId) {
    return null;
  }

  const analyzed = await twelveLabsRequest<{ data?: string; summary?: string }>("/analyze", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      video_id: videoId,
      prompt:
        "Summarize the proof-relevant actions, timestamps, and completed end state shown in this video in 2 concise sentences.",
      response_format: {
        type: "text",
      },
      stream: false,
    }),
  });

  return compactWhitespace(analyzed?.data ?? analyzed?.summary ?? "");
}

async function openAiGenerateJson<T extends JsonObject>(
  stage: AiProviderTrace["stage"],
  model: string,
  systemPrompt: string,
  userPrompt: string,
  options?: {
    preferFast?: boolean;
  },
): Promise<T | null> {
  if (!hasOpenAiServerEnv()) {
    return null;
  }

  const env = getServerEnv();
  const reasoningEffort = resolveReasoningEffort(
    stage,
    options?.preferFast,
    normalizeReasoningEffort(env.openAiReasoningEffort),
  );
  const maxOutputTokens = resolveOutputTokenCap(env.openAiMaxOutputTokens);

  try {
    const response = await fetch(`${env.openAiBaseUrl.replace(/\/$/, "")}/responses`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.openAiApiKey}`,
      },
      body: JSON.stringify({
        model,
        instructions: systemPrompt,
        input: userPrompt,
        max_output_tokens: maxOutputTokens,
        reasoning: {
          effort: reasoningEffort,
        },
        text: {
          format: {
            type: "json_schema",
            name: "galactus_structured_output",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: true,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as {
      output_text?: string;
      output?: Array<{
        content?: Array<{
          text?: string;
          type?: string;
        }>;
      }>;
    };

    const content =
      json.output_text?.trim() ||
      json.output
        ?.flatMap((item) => item.content ?? [])
        .map((part) => part.text ?? "")
        .join("")
        .trim();

    if (!content) {
      return null;
    }

    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

async function generateJson<T extends JsonObject>(
  stage: AiProviderTrace["stage"],
  systemPrompt: string,
  userPrompt: string,
  options?: {
    preferFast?: boolean;
  },
): Promise<GenerationResult<T>> {
  const env = getServerEnv();
  const traces: AiProviderTrace[] = [];

  if (hasOpenAiServerEnv()) {
    const openAiModel = env.openAiModelSnapshot || env.openAiModel;
    const reasoningEffort = resolveReasoningEffort(
      stage,
      options?.preferFast,
      normalizeReasoningEffort(env.openAiReasoningEffort),
    );
    const openAiResult = await openAiGenerateJson<T>(stage, openAiModel, systemPrompt, userPrompt, options);
    if (openAiResult) {
      traces.push({
        provider: "openai",
        model: openAiModel,
        stage,
        summary: `Galactus completed ${stage} through the OpenAI Responses runtime using ${reasoningEffort} reasoning effort.`,
      });
      return { data: openAiResult, traces };
    }

    traces.push({
      provider: "openai",
      model: openAiModel,
      stage,
      summary: "Galactus was configured for the OpenAI Responses runtime but no structured answer returned. Heuristic fallback applied.",
    });
  }

  traces.push({
    provider: "heuristic",
    model: "PayToCommit heuristic",
    stage,
    summary: "Heuristic fallback filled the remaining gaps.",
  });

  return {
    data: null,
    traces,
  };
}

function rankDocs(question: string) {
  const keywords = unique(tokenize(question));

  return docsPages
    .flatMap((page) =>
      page.sections.map((section) => {
        const haystack = [page.title, page.summary, ...page.searchTerms, section.title, ...section.body].join(" ");
        const score = keywords.reduce((total, keyword) => total + (haystack.toLowerCase().includes(keyword) ? 1 : 0), 0);

        return {
          page,
          section,
          score,
        };
      }),
    )
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 4);
}

const marketSafetyRules: Array<{
  code: AiRejectionReason["code"];
  title: string;
  body: string;
  rewritePrompt: (prompt: string) => string;
  pattern: RegExp;
}> = [
  {
    code: "unsafe_self_harm",
    title: "That request cannot open here.",
    body: "PayToCommit does not create markets around self-harm, starvation, self-injury, or other actions that put someone in immediate personal danger.",
    rewritePrompt: () => "Create a commitment market to complete 10 guided meditation sessions this month.",
    pattern: /\b(self harm|suicide|starve myself|stop eating|hurt myself|cut myself|overdose)\b/i,
  },
  {
    code: "unsafe_violence",
    title: "That request cannot open here.",
    body: "PayToCommit does not create markets around violence, threats, fights, weapons misuse, or harming another person.",
    rewritePrompt: () => "Create a commitment market to complete 20 conflict-free workout sessions this month.",
    pattern: /\b(kill|shoot|stab|beat up|assault|attack someone|fight someone)\b/i,
  },
  {
    code: "unsafe_illegal",
    title: "That request cannot open here.",
    body: "PayToCommit does not create markets for illegal acts, evasion, theft, fraud, trespassing, or behavior that depends on breaking the law.",
    rewritePrompt: () => "Create a commitment market to file every receipt into my bookkeeping folder by Friday.",
    pattern: /\b(steal|rob|fraud|scam|launder|hack|trespass|break into|illegal)\b/i,
  },
  {
    code: "unsafe_harassment",
    title: "That request cannot open here.",
    body: "PayToCommit does not create markets built on harassment, stalking, coercion, humiliation, or pressure against another person.",
    rewritePrompt: () => "Create a commitment market to send three respectful follow-up emails this week.",
    pattern: /\b(stalk|harass|dox|blackmail|coerce|humiliate|bully)\b/i,
  },
  {
    code: "unsafe_sexual",
    title: "That request cannot open here.",
    body: "PayToCommit does not create markets involving sexual exploitation, non-consensual activity, or sexualized content requests.",
    rewritePrompt: () => "Create a commitment market to schedule two date nights this month.",
    pattern: /\b(non-consensual|revenge porn|sexual exploit|explicit photos|force sex|sexual assault)\b/i,
  },
  {
    code: "unsafe_minor",
    title: "That request cannot open here.",
    body: "PayToCommit does not create markets involving minors in unsafe, exploitative, sexualized, or coercive situations.",
    rewritePrompt: () => "Create a commitment market to read with my family for 20 minutes every night this week.",
    pattern: /\b(minor|underage|child)\b.*\b(sex|exploit|fight|hurt|surveil)\b/i,
  },
  {
    code: "unsafe_extreme_risk",
    title: "That request cannot open here.",
    body: "PayToCommit does not create markets around extreme physical risk, dangerous dares, reckless substance use, or proof requests that depend on unsafe stunts.",
    rewritePrompt: () => "Create a commitment market to finish a beginner-safe 5K training plan in 30 days.",
    pattern: /\b(chug vodka|dangerous stunt|jump off|hang from|drive drunk|overdose|reckless)\b/i,
  },
  {
    code: "unsafe_fraud",
    title: "That request cannot open here.",
    body: "PayToCommit does not create markets around deception, forged evidence, fake receipts, or impersonation.",
    rewritePrompt: () => "Create a commitment market to submit my real invoice log every Friday afternoon.",
    pattern: /\b(fake receipt|forge|impersonat|fake proof|cheat|rig)\b/i,
  },
  {
    code: "unsafe_hate",
    title: "That request cannot open here.",
    body: "PayToCommit does not create markets around hate, slurs, targeted exclusion, or degrading protected groups.",
    rewritePrompt: () => "Create a commitment market to volunteer three hours with a local community group this month.",
    pattern: /\b(racist|hate group|slur|ethnic cleansing|lynch|nazi)\b/i,
  },
];

export class MarketPromptRejectedError extends Error {
  decision: AiModerationDecision;

  constructor(decision: AiModerationDecision) {
    super(decision.reason?.body ?? "That request cannot open here.");
    this.name = "MarketPromptRejectedError";
    this.decision = decision;
  }
}

export function reviewMarketPrompt(prompt: string): AiModerationDecision {
  const normalized = compactWhitespace(prompt);

  for (const rule of marketSafetyRules) {
    if (rule.pattern.test(normalized)) {
      return {
        allowed: false,
        reason: {
          code: rule.code,
          title: rule.title,
          body: rule.body,
          suggestedRewrite: rule.rewritePrompt(normalized),
        },
        traces: [
          {
            provider: "heuristic",
            model: "PayToCommit safety policy",
            stage: "moderation",
            summary: "The market request matched a blocked safety rule before drafting.",
          },
        ],
      };
    }
  }

  return {
    allowed: true,
    traces: [
      {
        provider: "heuristic",
        model: "PayToCommit safety policy",
        stage: "moderation",
        summary: "The market request cleared the baseline safety policy.",
      },
    ],
  };
}

export async function askDocsAi(question: string): Promise<AiDocsAnswer> {
  const ranked = rankDocs(question);
  const citations: AiCitation[] = ranked.map(({ page, section }) => ({
    path: getDocPath(page.slug, true),
    title: page.title,
    sectionId: section.id,
    sectionTitle: section.title,
    excerpt: section.body[0] ?? "",
  }));

  const fallbackAnswer = citations.length
    ? citations.map((citation) => `${citation.sectionTitle}: ${citation.excerpt}`).join(" ")
    : "No matching documentation was found yet. Ask about wallet funding, AI verification, Chains, Spark, or the Commitment Network.";

  const modelResult = await generateJson<{ answer?: string }>(
    "docs",
    "Answer only from the supplied PayToCommit documentation excerpts. Return JSON with one 'answer' field.",
    JSON.stringify({
      question,
      citations,
    }),
    { preferFast: true },
  );

  return {
    question,
    answer: compactWhitespace(modelResult.data?.answer ?? fallbackAnswer),
    citations,
    model: modelResult.traces[0]?.model ?? "PayToCommit Docs AI",
    generatedAt: new Date().toISOString(),
    traces: modelResult.traces,
  };
}

function pickCategory(prompt: string) {
  const normalized = prompt.toLowerCase();

  if (/(run|steps|gym|workout|lift|walk|fitness)/.test(normalized)) return "Fitness";
  if (/(write|ship|code|deploy|inbox|meeting|work|product)/.test(normalized)) return "Work";
  if (/(read|learn|study|course|practice|language)/.test(normalized)) return "Learning";
  if (/(sleep|sugar|water|meal|health|meditate)/.test(normalized)) return "Health";
  if (/(clean|dishes|kitchen|laundry|home|room)/.test(normalized)) return "Home";
  if (/(call|date|partner|friend|family|relationship)/.test(normalized)) return "Relationships";

  return "Lifestyle";
}

function inferProofMode(category: string, prompt: string) {
  const normalized = prompt.toLowerCase();

  if (category === "Fitness") {
    return /(steps|walk)/.test(normalized)
      ? "Device export or step app summary"
      : "GPS export, workout clip, or treadmill summary";
  }
  if (category === "Home") {
    return "Before-and-after photo or short finish video";
  }
  if (category === "Learning") {
    return "Timestamped screenshot, written artifact, or tracker export";
  }
  if (category === "Work") {
    return "Timestamped output, repo link, or delivery receipt";
  }
  if (category === "Health") {
    return "Tracker export, meal log, or timestamped proof clip";
  }

  return "Timestamped photo, short video, or platform-linked receipt";
}

function inferStakeBand(category: string) {
  switch (category) {
    case "Fitness":
      return { min: 1500, max: 25000 };
    case "Work":
      return { min: 2500, max: 40000 };
    case "Learning":
      return { min: 1000, max: 12000 };
    default:
      return { min: 1000, max: 15000 };
  }
}

function buildRuleset(title: string, proofMode: string): AiRuleset {
  return {
    summary: "The market closes only on completion-quality proof that matches the published window.",
    rules: [
      `${title} must be fully completed before the deadline closes.`,
      `Accepted proof must match this market's proof mode: ${proofMode}.`,
      "Late, edited, incomplete, or mismatched proof does not qualify.",
      "Appeals reopen only when new evidence or a timing mismatch changes the result.",
    ],
    invalidationCases: [
      "Proof timestamp falls outside the published window.",
      "The uploaded evidence does not match the commitment target.",
      "The proof artifact is edited, duplicated, or corrupted.",
    ],
    proofChecklist: [
      "Show the full finished state, not a cropped partial state.",
      "Include a visible time reference or export timestamp.",
      "Use one clear artifact rather than multiple conflicting uploads.",
    ],
    resultTiming: "Review starts at the deadline and closes as soon as the result is clear.",
  };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function draftAutonomousMarket(prompt: string): Promise<Omit<AiMarketDraft, "id" | "status">> {
  const moderation = reviewMarketPrompt(prompt);
  if (!moderation.allowed) {
    throw new MarketPromptRejectedError(moderation);
  }

  const category = pickCategory(prompt);
  const proofMode = inferProofMode(category, prompt);
  const stakeBand = inferStakeBand(category);
  const title = compactWhitespace(prompt)
    .replace(/^create a commitment (pool|market) to\s+/i, "")
    .replace(/^create\s+/i, "")
    .replace(/\.$/, "")
    .replace(/\bmy\b/gi, "")
    .trim()
    .replace(/\s{2,}/g, " ");
  const marketTitle = title
    ? title.charAt(0).toUpperCase() + title.slice(1)
    : "New Commitment Market";
  const safeTitle = marketTitle.length > 72 ? `${marketTitle.slice(0, 69)}...` : marketTitle;
  const summary = `Put cash behind ${safeTitle.toLowerCase()} and close it with proof that matches the market rules.`;
  const closesAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
  const resolvesAt = new Date(Date.now() + 1000 * 60 * 60 * 30).toISOString();
  const ruleset = buildRuleset(safeTitle, proofMode);

  const modelResult = await generateJson<{
    title?: string;
    summary?: string;
    targetGoal?: string;
    proofMode?: string;
    rules?: string[];
    invalidationCases?: string[];
    proofChecklist?: string[];
    tags?: string[];
    draftingNotes?: string[];
  }>(
    "draft",
    "Draft concise, literal PayToCommit commitment markets. Return JSON only.",
    JSON.stringify({
      prompt,
      category,
      proofMode,
      defaultRuleset: ruleset,
    }),
  );

  return {
    prompt,
    title: compactWhitespace(modelResult.data?.title ?? safeTitle),
    category,
    summary: compactWhitespace(modelResult.data?.summary ?? summary),
    targetGoal: compactWhitespace(modelResult.data?.targetGoal ?? `Complete ${safeTitle.toLowerCase()} before the deadline.`),
    proofMode: compactWhitespace(modelResult.data?.proofMode ?? proofMode),
    stakeFloorCents: stakeBand.min,
    stakeMaxCents: stakeBand.max,
    stakeBand: `$${Math.round(stakeBand.min / 100)} to $${Math.round(stakeBand.max / 100)}`,
    closesAt,
    resolvesAt,
    proofWindow: "90 minutes after deadline",
    challengeWindow: "4 hours after deadline",
    tags: unique([category.toLowerCase(), ...tokenize(prompt).slice(0, 4)]).slice(0, 5),
    draftingNotes:
      modelResult.data?.draftingNotes?.map(compactWhitespace).slice(0, 4) ?? [
        "Prompt received and screened.",
        "Rules aligned to the proof mode.",
        "Stake band set from comparable markets.",
      ],
    moderation,
    traces: [...moderation.traces, ...modelResult.traces],
    ruleset: {
      summary: ruleset.summary,
      rules: modelResult.data?.rules?.length ? modelResult.data.rules.map(compactWhitespace) : ruleset.rules,
      invalidationCases: modelResult.data?.invalidationCases?.length
        ? modelResult.data.invalidationCases.map(compactWhitespace)
        : ruleset.invalidationCases,
      proofChecklist: modelResult.data?.proofChecklist?.length
        ? modelResult.data.proofChecklist.map(compactWhitespace)
        : ruleset.proofChecklist,
      resultTiming: ruleset.resultTiming,
    },
  };
}

function isLikelyVideoUrl(value: string) {
  return /\.(mp4|mov|m4v|webm)(\?|$)/i.test(value) || /youtube\.com|youtu\.be|loom\.com|vimeo\.com/i.test(value);
}

async function buildEvidenceAssets(proofLinks: string[]): Promise<{
  assets: AiEvidenceAsset[];
  traces: AiProviderTrace[];
}> {
  const assets = proofLinks.map((url) => ({
    url,
    kind: isLikelyVideoUrl(url) ? "video" : /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url) ? "image" : "document",
    provider: isLikelyVideoUrl(url) && hasTwelveLabsServerEnv() ? "twelve_labs" : undefined,
  })) satisfies AiEvidenceAsset[];

  const traces: AiProviderTrace[] = [];

  const summarizedAssets = await Promise.all(
    assets.map(async (asset) => {
      if (asset.kind !== "video" || !hasTwelveLabsServerEnv()) {
        return asset;
      }

      const summary = await summarizeVideoWithTwelveLabs(asset.url);
      return {
        ...asset,
        summary: summary || undefined,
      };
    }),
  );

  if (assets.some((asset) => asset.kind === "video")) {
    traces.push({
      provider: hasTwelveLabsServerEnv() ? "twelve_labs" : "heuristic",
      model: hasTwelveLabsServerEnv() ? "Twelve Labs Pegasus lane" : "Video heuristic lane",
      stage: "verification",
      summary: hasTwelveLabsServerEnv()
        ? "Video proof was routed into Twelve Labs for proof-specific summarization before result closure."
        : "Video proof was detected and marked for the video-specialist lane when credentials are supplied.",
    });
  }

  return { assets: summarizedAssets, traces };
}

export async function verifyProofAutonomously(
  input: ProofInput,
): Promise<Omit<AiVerificationJob, "id" | "ticketId" | "createdAt">> {
  const normalized = `${input.proofSummary} ${input.proofLinks.join(" ")}`.toLowerCase();
  const evidenceSignals = [
    /photo|image|before|after|timestamp/,
    /video|clip|recording|mp4|mov/,
    /gps|garmin|fitbit|apple health|export|screenshot|receipt/,
  ].filter((pattern) => pattern.test(normalized)).length;
  const negativeSignals = /(late|missed|forgot|couldn't|could not|did not|didn't|failed|unfinished)/.test(normalized);
  const appealSignals = /(timezone|timestamp|upload|visible|attached|export|camera|evidence)/.test(
    `${input.appealReason ?? ""} ${input.proofSummary}`.toLowerCase(),
  );
  const evidenceAssets = await buildEvidenceAssets(input.proofLinks);

  const fallbackOutcome: AiVerificationJob["outcome"] = negativeSignals
    ? "missed"
    : evidenceSignals >= 2
      ? "completed"
      : appealSignals
        ? "needs_more_evidence"
        : "needs_more_evidence";
  const fallbackConfidence = negativeSignals ? 0.91 : evidenceSignals >= 2 ? 0.82 : 0.61;
  const fallbackExplanation =
    fallbackOutcome === "completed"
      ? `The proof package matches the published mode for ${input.poolTitle} and includes enough evidence to clear the completion threshold.`
      : fallbackOutcome === "missed"
        ? `The proof summary signals that ${input.poolTitle} was not completed inside the published window.`
        : `The current proof package for ${input.poolTitle} needs a clearer timestamp, full-state capture, or stronger export evidence before the result can close.`;

  const modelResult = await generateJson<{
    outcome?: AiVerificationJob["outcome"];
    confidence?: number;
    explanation?: string;
  }>(
    input.appealReason ? "appeal" : "verification",
    "You are PayToCommit's autonomous verification engine. Decide only from the supplied proof context. Return JSON with outcome, confidence, and explanation. Outcomes must be completed, missed, or needs_more_evidence.",
    JSON.stringify({
      ...input,
      evidenceAssets: evidenceAssets.assets,
    }),
    { preferFast: !input.appealReason },
  );

  const traces = [...modelResult.traces, ...evidenceAssets.traces];

  return {
    poolSlug: input.poolSlug,
    proofSummary: input.proofSummary,
    proofLinks: input.proofLinks,
    outcome: modelResult.data?.outcome ?? fallbackOutcome,
    confidence: Math.max(0.5, Math.min(0.99, Number(modelResult.data?.confidence ?? fallbackConfidence))),
    explanation: compactWhitespace(modelResult.data?.explanation ?? fallbackExplanation),
    status: "resolved",
    model: modelResult.traces[0]?.model ?? "PayToCommit Verify",
    resolvedAt: new Date().toISOString(),
    evidenceAssets: evidenceAssets.assets,
    traces,
  };
}

export function buildDraftSlug(title: string) {
  return slugify(title).slice(0, 72);
}
