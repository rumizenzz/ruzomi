"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";

import { useSharedWalletState } from "@/components/live-data-hooks";
import { buildAuthHref } from "@/lib/auth-flow";
import { clearPendingMarketDraft, readPendingMarketDraft, writePendingMarketDraft } from "@/lib/pending-market-draft";
import type { AiMarketDraft, GenerationEligibility } from "@/lib/types";

const promptExamples = [
  "create a commitment market to write 10 pages of my novel every day for 40 days",
  "create a commitment market to wash every dish before 8:00 PM for the next 21 days",
  "create a commitment market to run 5k before sunrise every weekday for a month",
];

export function CreationForge({
  compact = false,
}: {
  compact?: boolean;
}) {
  const router = useRouter();
  const walletState = useSharedWalletState();
  const viewer = walletState.viewer;
  const [prompt, setPrompt] = useState(promptExamples[0]);
  const [drafts, setDrafts] = useState<AiMarketDraft[]>([]);
  const [activeDraft, setActiveDraft] = useState<AiMarketDraft | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [generationEligibility, setGenerationEligibility] = useState<GenerationEligibility>("locked");
  const resumeDraftHref = buildAuthHref("signup", "/app/pools/new?resumeDraft=1");

  useEffect(() => {
    let cancelled = false;

    const loadDrafts = async () => {
      const response = await fetch("/api/ai/market-draft", { cache: "no-store" });
      if (!response.ok) return;
      const json = (await response.json()) as {
        drafts?: AiMarketDraft[];
        generationEligibility?: GenerationEligibility;
      };
      const serverDrafts = json.drafts ?? [];
      const pendingDraftRecord = readPendingMarketDraft();
      const nextEligibility = json.generationEligibility ?? "locked";

      if (!cancelled) {
        setGenerationEligibility(nextEligibility);
      }

      if (pendingDraftRecord?.draft) {
        setPrompt(pendingDraftRecord.draft.prompt);
      }

      if (!pendingDraftRecord?.draft) {
        if (!cancelled) {
          setDrafts(serverDrafts);
        }
        return;
      }

      const pendingDraft = pendingDraftRecord.draft;

      if (!pendingDraft.id.startsWith("public-")) {
        if (!cancelled) {
          setActiveDraft(pendingDraft);
          setDrafts([pendingDraft, ...serverDrafts.filter((draft) => draft.id !== pendingDraft.id)].slice(0, 5));
          setNotice("Your saved draft is ready to open.");
        }
        return;
      }

      const resumeResponse = await fetch("/api/ai/market-draft/import", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ draft: pendingDraft }),
      });
      const resumeJson = (await resumeResponse.json()) as { error?: string; draft?: AiMarketDraft };

      if (!resumeResponse.ok || !resumeJson.draft) {
        if (!cancelled) {
          setActiveDraft(pendingDraft);
          setDrafts([pendingDraft, ...serverDrafts].slice(0, 5));
          setNotice(resumeJson.error ?? "Your draft is still saved here and ready to resume.");
        }
        return;
      }

      if (!cancelled) {
        writePendingMarketDraft(resumeJson.draft, pendingDraftRecord.source);
        setActiveDraft(resumeJson.draft);
        setDrafts([resumeJson.draft, ...serverDrafts.filter((draft) => draft.id !== resumeJson.draft!.id)].slice(0, 5));
        setNotice("Your draft is ready. Open it when you want.");
      }
    };

    void loadDrafts();

    return () => {
      cancelled = true;
    };
  }, []);

  async function draftMarket(nextPrompt?: string) {
    const draftPrompt = (nextPrompt ?? prompt).trim();
    if (!draftPrompt) return;

    if (!viewer) {
      setNotice("Log in and complete a verified commitment before you draft a new market.");
      startTransition(() => {
        router.push(buildAuthHref("signup", "/app/pools/new"));
      });
      return;
    }

    if (generationEligibility !== "unlocked") {
      setNotice("Complete one verified commitment in the last 30 days to draft a new market.");
      return;
    }

    setPending(true);
    setNotice(null);

    const response = await fetch("/api/ai/market-draft", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ prompt: draftPrompt }),
    });
    const json = (await response.json()) as { error?: string; draft?: AiMarketDraft };

    if (!response.ok || !json.draft) {
      setPending(false);
      setNotice(
        json.error === "Creation session unavailable."
          ? "Log in or sign up to draft a market."
          : (json.error ?? "Unable to draft that market."),
      );
      return;
    }

    setPending(false);
    setActiveDraft(json.draft);
    setDrafts((current) => [json.draft!, ...current.filter((draft) => draft.id !== json.draft!.id)].slice(0, 5));
    writePendingMarketDraft(json.draft, "forge");
  }

  async function openMarket(draftId: string) {
    if (!viewer) {
      setNotice("Log in to open this market.");
      startTransition(() => {
        router.push(resumeDraftHref);
      });
      return;
    }

    if (generationEligibility !== "unlocked") {
      setNotice("Complete one verified commitment in the last 30 days to open a new market.");
      return;
    }

    setPending(true);
    setNotice(null);

    const response = await fetch("/api/ai/market-create", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ draftId }),
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
    setNotice("Market opened.");
    startTransition(() => {
      router.push(`/pools/${json.pool?.slug}`);
      router.refresh();
    });
  }

  return (
    <div className={`section-stack ${compact ? "creation-forge-compact" : ""}`}>
      <div className="section-stack">
        <span className="eyebrow">New market</span>
        <h2 className="section-title">{compact ? "Draft a new market" : "Open a new commitment market."}</h2>
        <p className="section-copy">
          Describe the commitment once. PayToCommit writes the market title, rules, proof mode, and close timing before you open it.
        </p>
      </div>

      <div className="field-stack">
        <label className="sr-only" htmlFor="creation-forge-prompt">
          Market prompt
        </label>
        <textarea
          id="creation-forge-prompt"
          className="spark-composer forge-input"
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Create a commitment market..."
          rows={4}
          value={prompt}
        />
      </div>

      <div className="button-row docs-ai-actions">
        <button className="action-primary" disabled={pending} onClick={() => void draftMarket()} type="button">
          {pending ? "Drafting..." : "Draft market"}
        </button>
        {promptExamples.map((example) => (
          <button
            key={example}
            className="action-secondary"
            disabled={pending}
            onClick={() => {
              setPrompt(example);
              void draftMarket(example);
            }}
            type="button"
          >
            Example
          </button>
        ))}
      </div>

      {notice ? <div className="form-notice">{notice}</div> : null}

      {!viewer ? (
        <div className="forge-neutral-notice">
          <strong>Market drafting is locked.</strong>
          <p>Log in and complete one verified commitment before you open a new market.</p>
        </div>
      ) : generationEligibility !== "unlocked" ? (
        <div className="forge-neutral-notice">
          <strong>Market drafting is locked.</strong>
          <p>Complete one verified commitment in the last 30 days to unlock it.</p>
        </div>
      ) : null}

      {activeDraft ? (
        <div className="glass-panel forge-draft-card">
          <div className="section-stack">
            <div className="row-between">
              <div className="section-stack">
                <span className="mono-label">{activeDraft.category}</span>
                <strong>{activeDraft.title}</strong>
              </div>
              <span className="status-pill" data-tone="live">
                ready
              </span>
            </div>
            {activeDraft.originCredit ? (
              <div className="spark-origin-credit">
                <span>{activeDraft.originCredit.label}</span>
                <strong>{activeDraft.originCredit.displayName}</strong>
              </div>
            ) : null}
            <p className="detail-text">{activeDraft.summary}</p>
            <div className="timeline-list">
              <div className="summary-card">
                <span className="mono-label">Stake band</span>
                <strong>{activeDraft.stakeBand}</strong>
              </div>
              <div className="summary-card">
                <span className="mono-label">Proof mode</span>
                <strong>{activeDraft.proofMode}</strong>
              </div>
              <div className="summary-card">
                <span className="mono-label">Result timing</span>
                <strong>{activeDraft.ruleset.resultTiming}</strong>
              </div>
            </div>
            <div className="timeline-list">
              {activeDraft.ruleset.rules.map((rule, index) => (
                <div key={rule} className="timeline-item">
                  <div className="timeline-index">{index + 1}</div>
                  <div className="section-stack">
                    <strong>Rule {index + 1}</strong>
                    <p className="detail-text">{rule}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="button-row">
              <button className="action-primary" disabled={pending} onClick={() => void openMarket(activeDraft.id)} type="button">
                {pending ? "Opening..." : "Open this market"}
              </button>
              <Link className="action-secondary" href="/docs/rules">
                Rule guide
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {drafts.length ? (
        <div className="board-lane-list board-lane-list-compact">
          {drafts.map((draft) => (
            <button
              key={draft.id}
              className="board-lane-item board-lane-item-tight button-reset"
              onClick={() => setActiveDraft(draft)}
              type="button"
            >
              <div>
                <p className="data-title">{draft.category}</p>
                <strong>{draft.title}</strong>
              </div>
              <div className="board-lane-meta">
                <span>{draft.stakeBand}</span>
                <span>{draft.status}</span>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
