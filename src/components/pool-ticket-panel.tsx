"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import { FrictionLightAuthModal } from "@/components/friction-light-auth-modal";
import { MobileProofHandoff } from "@/components/mobile-proof-handoff";
import { NotifyMeButton } from "@/components/notify-me-button";
import { getSovereignSparkFeeCents } from "@/lib/fee-schedule";
import type { Chain, CommitmentPool, CrossPlatformHandoffSession, PostStakeNotifyPromptState } from "@/lib/types";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function buildStakePresets(stakeFloorCents: number, stakeMaxCents: number) {
  const floor = Math.max(Math.ceil(stakeFloorCents / 100), 10);
  const ceiling = Math.max(Math.floor(stakeMaxCents / 100), floor);
  const candidates = [floor, 25, 50, 100, 250, ceiling];

  return Array.from(new Set(candidates.filter((amount) => amount >= floor && amount <= ceiling))).sort(
    (left, right) => left - right,
  );
}

export function PoolTicketPanel({
  poolSlug,
  poolTitle,
  isAuthenticated,
  isIdentityVerified,
  availableBalanceCents,
  availableBalanceLabel,
  stakeFloorCents,
  stakeMaxCents,
  stakeFloorLabel,
  stakeBand,
  proofMode,
  challengeWindow,
  resultState,
  lifecycleState,
  joinStatusLabel,
  opensAtLabel,
  opensInLabel,
  joinClosesAtLabel,
  joinClosesInLabel,
  timingSummaryLabel,
  notifyMeAvailable,
  marketOpenReminderAvailable,
  preOpenStakeLive,
  chains,
  relatedPools,
}: {
  poolSlug: string;
  poolTitle: string;
  isAuthenticated: boolean;
  isIdentityVerified: boolean;
  availableBalanceCents: number;
  availableBalanceLabel: string;
  stakeFloorCents: number;
  stakeMaxCents: number;
  stakeFloorLabel: string;
  stakeBand: string;
  proofMode: string;
  challengeWindow: string;
  resultState: string;
  lifecycleState: CommitmentPool["lifecycleState"];
  joinStatusLabel: string;
  opensAtLabel: string;
  joinClosesAtLabel: string;
  opensInLabel?: string | null;
  joinClosesInLabel?: string | null;
  timingSummaryLabel?: string;
  notifyMeAvailable: boolean;
  marketOpenReminderAvailable: boolean;
  preOpenStakeLive: boolean;
  chains: Chain[];
  relatedPools: CommitmentPool[];
}) {
  const router = useRouter();
  const [stakeDollars, setStakeDollars] = useState(Math.max(Math.round(stakeFloorCents / 100), 10));
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showMomentum, setShowMomentum] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [handoffSession, setHandoffSession] = useState<CrossPlatformHandoffSession | null>(null);
  const [postStakeNotifyPrompt, setPostStakeNotifyPrompt] = useState<PostStakeNotifyPromptState | null>(null);
  const canJoin = lifecycleState === "join_open" || lifecycleState === "join_closing_soon";
  const presetStakeDollars = buildStakePresets(stakeFloorCents, stakeMaxCents);
  const stakeCents = Math.round(stakeDollars * 100);
  const sovereignSparkFeeCents = getSovereignSparkFeeCents(stakeCents);
  const totalCommitmentCents = stakeCents + sovereignSparkFeeCents;
  const shortfallCents = Math.max(totalCommitmentCents - availableBalanceCents, 0);
  const recommendedTopUpDollars = shortfallCents > 0 ? Math.ceil(shortfallCents / 100) : 0;
  const stakeTooLow = stakeCents < stakeFloorCents;
  const stakeTooHigh = stakeCents > stakeMaxCents;
  const invalidStake = !Number.isFinite(stakeDollars) || stakeDollars <= 0 || stakeTooLow || stakeTooHigh;
  const primaryActionLabel = !canJoin
    ? marketOpenReminderAvailable
      ? "Notify me when this opens"
      : "Join closed"
    : preOpenStakeLive
      ? "Stake before open"
    : !isAuthenticated
      ? "Create account to stake"
      : !isIdentityVerified
        ? "Verify to continue"
        : shortfallCents > 0
          ? "Add funds to continue"
          : pending
            ? "Placing..."
            : "Commit to this pool";
  const validationMessage = invalidStake
    ? stakeTooLow
      ? `Minimum stake is ${formatCurrency(stakeFloorCents)}.`
      : stakeTooHigh
        ? `Maximum stake is ${formatCurrency(stakeMaxCents)} for this market.`
        : `Enter a stake amount between ${formatCurrency(stakeFloorCents)} and ${formatCurrency(stakeMaxCents)}.`
    : null;

  function buildHandoffSession(handoffId: string, createdAt: string) {
    const platformHint =
      typeof navigator === "undefined"
        ? "desktop"
        : /(iphone|ipad|ipod)/i.test(navigator.userAgent)
          ? "ios"
          : /android/i.test(navigator.userAgent)
            ? "android"
            : "desktop";
    const baseOrigin = typeof window === "undefined" ? "https://paytocommit.com" : window.location.origin;
    const smartLink = `${baseOrigin}/mobile?handoff=${encodeURIComponent(handoffId)}&pool=${encodeURIComponent(poolSlug)}&stake=${Math.round(stakeDollars * 100)}`;

    return {
      id: handoffId,
      poolSlug,
      poolTitle,
      stakeCents: Math.round(stakeDollars * 100),
      smartLink,
      qrValue: smartLink,
      platformHint,
      createdAt,
    } as const;
  }

  async function commitToPool() {
    if (!canJoin) {
      setNotice(
        notifyMeAvailable
          ? "This market is not open for joins yet. Turn on notifications and come back when the join window opens."
          : "This market is no longer accepting new joins. Existing members continue under the posted rules.",
      );
      return;
    }

    if (invalidStake) {
      setNotice(validationMessage ?? "Enter a valid stake amount before continuing.");
      return;
    }

    if (!isAuthenticated) {
      setShowAuthModal(true);
      setNotice("Create your account to lock this stake.");
      return;
    }

    if (!isIdentityVerified) {
      setNotice("Verify your identity before staking real funds into this market.");
      router.push(
        `/app/verify?poolSlug=${encodeURIComponent(poolSlug)}&poolTitle=${encodeURIComponent(poolTitle)}&stakeDollars=${encodeURIComponent(
          String(stakeDollars),
        )}&returnTo=${encodeURIComponent(`/pools/${poolSlug}`)}`,
      );
      return;
    }

    if (shortfallCents > 0) {
      setNotice(`Add ${formatCurrency(shortfallCents)} to cover this stake and the Sovereign Spark fee.`);
      router.push(
        `/app/wallet/fund?poolSlug=${encodeURIComponent(poolSlug)}&poolTitle=${encodeURIComponent(poolTitle)}&stakeDollars=${encodeURIComponent(
          String(stakeDollars),
        )}&topUpDollars=${encodeURIComponent(String(recommendedTopUpDollars))}&returnTo=${encodeURIComponent(
          `/pools/${poolSlug}`,
        )}`,
      );
      return;
    }

    setPending(true);
    setNotice(null);

    const response = await fetch("/api/tickets", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        poolSlug,
        stakeCents: Math.round(stakeDollars * 100),
      }),
    });
    const json = (await response.json()) as {
      error?: string;
      postStakeNotifyPrompt?: PostStakeNotifyPromptState | null;
    };

    if (!response.ok) {
      if (response.status === 401) {
        setPending(false);
        setShowAuthModal(true);
        setNotice(json.error ?? "Create your account to lock this stake.");
        return;
      }

      if ((json.error ?? "").toLowerCase().includes("verify your identity")) {
        setPending(false);
        setNotice(json.error ?? "Verify your identity before placing a live stake.");
        router.push("/app/verify");
        return;
      }

      if ((json.error ?? "").toLowerCase().includes("not enough wallet cash")) {
        setPending(false);
        setNotice("Add funds to continue with this commitment.");
        router.push(
          `/app/wallet/fund?poolSlug=${encodeURIComponent(poolSlug)}&poolTitle=${encodeURIComponent(poolTitle)}&stakeDollars=${encodeURIComponent(
            String(stakeDollars),
          )}&returnTo=${encodeURIComponent(`/pools/${poolSlug}`)}`,
        );
        return;
      }

      setPending(false);
      setNotice(json.error ?? "Unable to place ticket.");
      return;
    }

    setPending(false);
    setNotice(
      preOpenStakeLive
        ? "Stake locked before the official open. Continue in the mobile app when it is time to submit proof."
        : "Commitment locked on desktop. Proof submission continues in the mobile app.",
    );
    const handoffId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${poolSlug}-${Math.round(stakeDollars * 100)}-handoff`;
    setHandoffSession(buildHandoffSession(handoffId, new Date().toISOString()));
    setPostStakeNotifyPrompt(json.postStakeNotifyPrompt ?? null);
    setShowMomentum(true);
    startTransition(() => {
      router.refresh();
    });
  }

  async function joinChain(chainSlug: string) {
    if (!canJoin) {
      setNotice("This market is not accepting new joins right now, so linked Chains stay closed as well.");
      return;
    }

    if (invalidStake) {
      setNotice(validationMessage ?? "Enter a valid stake amount before continuing.");
      return;
    }

    if (!isAuthenticated) {
      setShowAuthModal(true);
      setNotice("Create your account to lock this Chain.");
      return;
    }

    if (!isIdentityVerified) {
      setNotice("Verify your identity before joining a live Chain.");
      router.push(
        `/app/verify?poolSlug=${encodeURIComponent(poolSlug)}&poolTitle=${encodeURIComponent(poolTitle)}&stakeDollars=${encodeURIComponent(
          String(stakeDollars),
        )}&returnTo=${encodeURIComponent(`/pools/${poolSlug}`)}`,
      );
      return;
    }

    if (shortfallCents > 0) {
      setNotice(`Add ${formatCurrency(shortfallCents)} to cover this Chain and the Sovereign Spark fee.`);
      router.push(
        `/app/wallet/fund?poolSlug=${encodeURIComponent(poolSlug)}&poolTitle=${encodeURIComponent(poolTitle)}&stakeDollars=${encodeURIComponent(
          String(stakeDollars),
        )}&topUpDollars=${encodeURIComponent(String(recommendedTopUpDollars))}&returnTo=${encodeURIComponent(
          `/pools/${poolSlug}`,
        )}`,
      );
      return;
    }

    setPending(true);
    setNotice(null);

    const response = await fetch("/api/chains", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        chainSlug,
        stakeCents: Math.round(stakeDollars * 100),
      }),
    });
    const json = (await response.json()) as { error?: string };

    if (!response.ok) {
      if (response.status === 401) {
        setPending(false);
        setShowAuthModal(true);
        setNotice(json.error ?? "Create your account to lock this Chain.");
        return;
      }

      if ((json.error ?? "").toLowerCase().includes("verify your identity")) {
        setPending(false);
        setNotice(json.error ?? "Verify your identity before joining a live Chain.");
        router.push("/app/verify");
        return;
      }

      if ((json.error ?? "").toLowerCase().includes("not enough wallet cash")) {
        setPending(false);
        setNotice("Add funds to continue with this Chain.");
        router.push(
          `/app/wallet/fund?poolSlug=${encodeURIComponent(poolSlug)}&poolTitle=${encodeURIComponent(poolTitle)}&stakeDollars=${encodeURIComponent(
            String(stakeDollars),
          )}&returnTo=${encodeURIComponent(`/pools/${poolSlug}`)}`,
        );
        return;
      }

      setPending(false);
      setNotice(json.error ?? "Unable to join Chain.");
      return;
    }

    setPending(false);
    setNotice("Chain locked on desktop. Proof submission continues in the mobile app.");
    const handoffId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${poolSlug}-${Math.round(stakeDollars * 100)}-handoff`;
    setHandoffSession(buildHandoffSession(handoffId, new Date().toISOString()));
    setShowMomentum(true);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="section-stack">
      <span className="eyebrow">Commit</span>
      <div className="ticket-stat-grid">
        <div className="ticket-stat">
          <span className="mono-label">Stake</span>
          <strong>{stakeBand}</strong>
          <span>{stakeFloorLabel} floor</span>
        </div>
        <div className="ticket-stat">
          <span className="mono-label">Proof</span>
          <strong>{proofMode}</strong>
          <span>{challengeWindow}</span>
        </div>
        <div className="ticket-stat">
          <span className="mono-label">Result</span>
          <strong>{resultState}</strong>
          <span>Completed entrants recover stake and split the forfeited side.</span>
        </div>
      </div>

      <label className="field-stack" htmlFor={`stake-${poolSlug}`}>
        <span className="mono-label">Stake amount</span>
        <input
          id={`stake-${poolSlug}`}
          className="shell-search-input"
          disabled={!canJoin}
          max={Math.round(stakeMaxCents / 100)}
          min={Math.round(stakeFloorCents / 100)}
          onChange={(event) => setStakeDollars(Number(event.target.value))}
          step={5}
          type="number"
          value={stakeDollars}
        />
      </label>

      <div className="stake-preset-row" aria-label="Quick stake amounts">
        {presetStakeDollars.map((amount) => (
          <button
            key={amount}
            className={`stake-preset-chip ${stakeDollars === amount ? "is-active" : ""}`}
            disabled={!canJoin}
            onClick={() => setStakeDollars(amount)}
            type="button"
          >
            ${amount}
          </button>
        ))}
      </div>

      <div className="ticket-balance-card">
        <div className="ticket-balance-row">
          <span className="mono-label">Available balance</span>
          <strong>{isAuthenticated ? availableBalanceLabel : "Sign in to view"}</strong>
        </div>
        <div className="ticket-balance-grid">
          <div>
            <span className="mono-label">Stake</span>
            <strong>{formatCurrency(stakeCents)}</strong>
          </div>
          <div>
            <span className="mono-label">Sovereign Spark</span>
            <strong>{formatCurrency(sovereignSparkFeeCents)}</strong>
          </div>
          <div>
            <span className="mono-label">Total locked now</span>
            <strong>{formatCurrency(totalCommitmentCents)}</strong>
          </div>
        </div>
        {isAuthenticated && shortfallCents > 0 ? (
          <p className="detail-text ticket-balance-note">
            This stake needs {formatCurrency(shortfallCents)} more before it can be locked. Funding returns you to this
            exact market and amount.
          </p>
        ) : null}
      </div>

      {validationMessage ? <div className="form-notice">{validationMessage}</div> : null}

      <div className="action-row">
        {canJoin ? (
          <button className="action-primary" disabled={pending || invalidStake} onClick={commitToPool} type="button">
            {primaryActionLabel}
          </button>
        ) : marketOpenReminderAvailable ? (
          <NotifyMeButton
            joinClosesAtLabel={joinClosesAtLabel}
            joinClosesInLabel={joinClosesInLabel}
            opensAtLabel={opensAtLabel}
            opensInLabel={opensInLabel}
            poolSlug={poolSlug}
            timingSummaryLabel={timingSummaryLabel}
          />
        ) : (
          <button className="action-primary" disabled type="button">
            Join closed
          </button>
        )}
      </div>

      <div className="summary-card">
        <span className="mono-label">Join window</span>
        <strong>{joinStatusLabel}</strong>
        <p className="detail-text">
          {timingSummaryLabel ??
            (preOpenStakeLive
              ? `${opensInLabel ?? `Official open ${opensAtLabel}`}. ${joinClosesInLabel ?? `Join closes ${joinClosesAtLabel}`}.`
              : notifyMeAvailable
                ? `${opensInLabel ?? `Opens ${opensAtLabel}`}. ${joinClosesInLabel ?? `Join closes ${joinClosesAtLabel}`}.`
                : `${joinClosesInLabel ?? "Join closed"}. Official cutoff: ${joinClosesAtLabel}.`)}
        </p>
      </div>

      <div className="ticket-desktop-proof-note">
        <span className="mono-label">Proof submission</span>
        <strong>Stake on desktop. Submit proof on mobile.</strong>
        <p className="detail-text">
          Discovery, funding, and stake locking stay live here. Final proof capture and STP-sensitive submission
          continue in the mobile app.
        </p>
      </div>

      {chains.length ? (
        <div className="section-stack">
          <span className="mono-label">Chains</span>
          <div className="board-lane-list board-lane-list-compact">
            {chains.map((chain) => (
              <button
                key={chain.slug}
                className="board-lane-item board-lane-item-tight button-reset"
                disabled={pending}
                onClick={() => joinChain(chain.slug)}
                type="button"
              >
                <div>
                  <p className="data-title">{chain.category}</p>
                  <strong>{chain.title}</strong>
                </div>
                <div className="board-lane-meta">
                  <span>{chain.stakeBand}</span>
                  <span>{chain.payoutLabel}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {notice ? <div className="form-notice">{notice}</div> : null}

      {handoffSession ? <MobileProofHandoff handoff={handoffSession} /> : null}

      {postStakeNotifyPrompt ? (
        <div className="summary-card post-stake-reminder-card">
          <span className="mono-label">Official open reminder</span>
          <strong>Want a reminder when this market officially opens?</strong>
          <p className="detail-text">
            {timingSummaryLabel
              ? `You are already in. ${timingSummaryLabel}.`
              : `You are already in. The market opens ${opensAtLabel}, and the join window closes ${joinClosesAtLabel}.`}
          </p>
          <div className="post-stake-reminder-actions">
            <NotifyMeButton
              className="post-stake-reminder-button"
              joinClosesAtLabel={joinClosesAtLabel}
              joinClosesInLabel={joinClosesInLabel}
              opensAtLabel={opensAtLabel}
              opensInLabel={opensInLabel}
              poolSlug={postStakeNotifyPrompt.poolSlug}
              timingSummaryLabel={timingSummaryLabel}
            />
            <button className="action-secondary" onClick={() => setPostStakeNotifyPrompt(null)} type="button">
              Not now
            </button>
          </div>
        </div>
      ) : null}

      {showMomentum && relatedPools.length ? (
        <div className="section-stack momentum-follow-on">
          <span className="mono-label">Keep momentum going</span>
          <div className="board-lane-list board-lane-list-compact">
            {relatedPools.slice(0, 3).map((candidate) => (
              <button
                key={candidate.slug}
                className="board-lane-item board-lane-item-tight button-reset"
                onClick={() => router.push(`/pools/${candidate.slug}`)}
                type="button"
              >
                <div>
                  <p className="data-title">{candidate.category}</p>
                  <strong>{candidate.title}</strong>
                </div>
                <div className="board-lane-meta">
                  <span>{candidate.visiblePoolTotal ? candidate.volumeLabel : candidate.stakeBand}</span>
                  <span>{candidate.sparkCount} Spark</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <FrictionLightAuthModal
        onClose={() => setShowAuthModal(false)}
        open={showAuthModal}
        poolSlug={poolSlug}
        poolTitle={poolTitle}
        stakeCents={Math.round(stakeDollars * 100)}
      />
    </div>
  );
}
