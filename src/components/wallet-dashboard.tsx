"use client";

import Link from "next/link";
import { startTransition, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useSharedWalletState } from "@/components/live-data-hooks";
import { buildAuthHref } from "@/lib/auth-flow";
import { getFeeSchedule } from "@/lib/fee-schedule";

type FundingMethodMeta = {
  label: string;
  summary: string;
  feeRate: number;
  flatFeeCents?: number;
  minimumAmount: number;
  quickAmounts: readonly number[];
  actionLabel: string;
};

const fundingMethodMeta: Record<string, FundingMethodMeta> = {
  apple_pay: {
    label: "Apple Pay",
    summary: "Instant funding through your Apple Wallet.",
    feeRate: 0.025,
    minimumAmount: 10,
    quickAmounts: [25, 50, 100, 250],
    actionLabel: "Continue with Apple Pay",
  },
  google_pay: {
    label: "Google Pay",
    summary: "Fast funding through Google Wallet.",
    feeRate: 0.025,
    minimumAmount: 10,
    quickAmounts: [25, 50, 100, 250],
    actionLabel: "Continue with Google Pay",
  },
  debit_card: {
    label: "Debit Card",
    summary: "Visa and Mastercard funding with instant wallet credit after confirmation.",
    feeRate: 0.025,
    minimumAmount: 10,
    quickAmounts: [25, 50, 100, 250],
    actionLabel: "Continue with debit card",
  },
  bank_account: {
    label: "Bank Account",
    summary: "Bank funding with slower settlement and lower friction for larger wallet loads.",
    feeRate: 0,
    minimumAmount: 10,
    quickAmounts: [25, 50, 100, 250],
    actionLabel: "Continue with bank account",
  },
  paypal_venmo: {
    label: "PayPal / Venmo",
    summary: "Digital wallet funding with provider timing and fee review before confirm.",
    feeRate: 0.025,
    minimumAmount: 10,
    quickAmounts: [25, 50, 100, 250],
    actionLabel: "Continue with PayPal / Venmo",
  },
  crypto_zenhash: {
    label: "Crypto via Zenhash",
    summary: "Network-specific crypto funding with QR, wallet address, and a clear timing/risk review.",
    feeRate: 0,
    minimumAmount: 5,
    quickAmounts: [25, 50, 100, 250],
    actionLabel: "Review crypto deposit",
  },
  wire_transfer: {
    label: "Wire Transfer",
    summary: "Bank wire funding. Minimum $1,000 with a flat $20 wire fee.",
    feeRate: 0,
    flatFeeCents: 2000,
    minimumAmount: 1000,
    quickAmounts: [1000, 2500, 5000, 10000],
    actionLabel: "Request wire instructions",
  },
} as const;

export function WalletDashboard() {
  const walletState = useSharedWalletState();
  const feeSchedule = getFeeSchedule();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedMethodKey =
    (searchParams.get("method") as keyof typeof fundingMethodMeta | null) ?? "debit_card";
  const selectedMethod = fundingMethodMeta[selectedMethodKey] ?? fundingMethodMeta.debit_card;
  const topUpDollarsFromQuery = Number(searchParams.get("topUpDollars") ?? "0");
  const [manualTopUpAmount, setManualTopUpAmount] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [previewTicketId, setPreviewTicketId] = useState<string | null>(null);
  const [releasingTicketId, setReleasingTicketId] = useState<string | null>(null);
  const fundingState = searchParams.get("funding");
  const poolTitle = searchParams.get("poolTitle");
  const poolSlug = searchParams.get("poolSlug");
  const stakeDollars = Number(searchParams.get("stakeDollars") ?? "0");
  const returnTo = searchParams.get("returnTo") ?? (poolSlug ? `/pools/${poolSlug}` : null);
  const desiredStakeCents = stakeDollars > 0 ? Math.round(stakeDollars * 100) : 0;
  const desiredStakeFeeCents = desiredStakeCents > 0 ? Math.round(desiredStakeCents * 0.05) : 0;
  const totalNeededForStakeCents = desiredStakeCents + desiredStakeFeeCents;
  const shortfallCents = Math.max(totalNeededForStakeCents - walletState.wallet.availableCents, 0);
  const recommendedTopUpDollars =
    shortfallCents > 0
      ? Math.max(Math.ceil(shortfallCents / 100), selectedMethod.minimumAmount)
      : selectedMethod.minimumAmount;
  const topUpAmount =
    manualTopUpAmount ??
    (Number.isFinite(topUpDollarsFromQuery) && topUpDollarsFromQuery > 0
      ? topUpDollarsFromQuery
      : recommendedTopUpDollars);
  const normalizedAmountCents = Math.max(
    Math.round((Number.isFinite(topUpAmount) ? topUpAmount : selectedMethod.minimumAmount) * 100),
    selectedMethod.minimumAmount * 100,
  );
  const feeCents =
    selectedMethod.flatFeeCents ?? Math.round(normalizedAmountCents * selectedMethod.feeRate);
  const netCents = Math.max(normalizedAmountCents - feeCents, 0);
  const totalAvailableAfterFundingCents = walletState.wallet.availableCents + netCents;
  const stakeCoveredAfterFunding = desiredStakeCents === 0 || totalAvailableAfterFundingCents >= totalNeededForStakeCents;
  const redirectNotice = useMemo(() => {
    if (searchParams.get("released") === "1") {
      return "Early Release posted. The 95% refund has been returned to available balance and that market instance is now closed to rejoin.";
    }

    if (fundingState === "success") {
      return "Funding confirmation is in flight. Wallet cash updates as soon as the card payment clears.";
    }

    if (fundingState === "cancelled") {
      return "No wallet cash was added. The balance stays unchanged until a payment is completed.";
    }

    return null;
  }, [fundingState, searchParams]);
  const loginHref = buildAuthHref("login", "/app/wallet/fund");
  const signupHref = buildAuthHref("signup", "/app/wallet/fund");

  if (!walletState.viewer) {
    return (
      <div className="section-stack">
        <section className="split-grid">
          <div className="glass-panel">
            <div className="section-stack">
              <span className="eyebrow">Wallet</span>
              <h2 className="section-title">Log in to add funds</h2>
              <p className="section-copy">
                Wallet cash, ticket funding, and settlement credits only unlock after your account is live.
              </p>
            </div>
            <div className="button-row">
              <Link className="action-primary" href={loginHref}>
                Log in
              </Link>
              <Link className="action-secondary" href={signupHref}>
                Sign up
              </Link>
            </div>
          </div>

          <div className="glass-panel">
            <div className="timeline-list">
              <div className="summary-card">
                <span className="mono-label">Card funding</span>
                <strong>{feeSchedule.depositFee}</strong>
              </div>
              <div className="summary-card">
                <span className="mono-label">Sovereign Spark</span>
                <strong>{feeSchedule.infrastructureFee}</strong>
              </div>
              <div className="summary-card">
                <span className="mono-label">Wallet unlocks</span>
                <strong>After login</strong>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (walletState.viewer.identityStatus !== "verified") {
    return (
      <div className="section-stack">
        <section className="split-grid">
          <div className="glass-panel">
            <div className="section-stack">
              <span className="eyebrow">Identity</span>
              <h2 className="section-title">Verify before funding</h2>
              <p className="section-copy">
                Funding methods unlock after identity verification is complete.
              </p>
            </div>
            <div className="button-row">
              <Link className="action-primary" href="/app/verify">
                Begin verification
              </Link>
              <Link className="action-secondary" href="/app">
                No, later
              </Link>
            </div>
          </div>

          <div className="glass-panel">
            <div className="timeline-list">
              <div className="summary-card">
                <span className="mono-label">Identity check</span>
                <strong>Required</strong>
              </div>
              <div className="summary-card">
                <span className="mono-label">Funding methods</span>
                <strong>Apple Pay, Google Pay, Debit Card, ACH</strong>
              </div>
              <div className="summary-card">
                <span className="mono-label">Wire minimum</span>
                <strong>$1,000 + $20 flat fee</strong>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  async function startTopUp() {
    if (selectedMethodKey === "wire_transfer") {
      setNotice("Wire instructions will open after the transfer request is reviewed. Minimum $1,000, flat $20.");
      return;
    }
    if (selectedMethodKey === "crypto_zenhash") {
      setNotice(
        "Crypto funding opens with a network-specific address, QR, timing estimate, and a clear warning that wrong-network or wrong-address transfers may be irreversible.",
      );
      return;
    }
    if (selectedMethodKey === "paypal_venmo") {
      setNotice("PayPal and Venmo funding are being staged next. Use card, Apple Pay, Google Pay, or bank funding right now.");
      return;
    }

    setPending(true);
    setNotice(null);

    const response = await fetch("/api/wallet/top-up", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        amountCents: normalizedAmountCents,
        method: selectedMethodKey,
        returnTo,
        poolSlug,
        poolTitle,
        desiredStakeCents: desiredStakeCents || null,
      }),
    });
    const json = (await response.json()) as { error?: string; url?: string };

    if (!response.ok || !json.url) {
      if (response.status === 401) {
        window.location.assign("/login?next=/app/wallet/fund");
        return;
      }

      setPending(false);
      setNotice(json.error ?? "Unable to start wallet top-up.");
      return;
    }

    window.location.assign(json.url);
  }

  async function confirmEarlyRelease(ticketId: string) {
    setReleasingTicketId(ticketId);
    setNotice(null);

    const response = await fetch(`/api/tickets/${ticketId}/early-release`, {
      method: "POST",
    });
    const json = (await response.json()) as { error?: string };

    if (!response.ok) {
      setReleasingTicketId(null);
      setNotice(json.error ?? "Unable to record Early Release.");
      return;
    }

    setPreviewTicketId(null);
    setReleasingTicketId(null);
    startTransition(() => {
      router.replace("/app/wallet?released=1");
      router.refresh();
    });
  }

  return (
    <div className="section-stack">
      <section className="split-grid">
        <div className="glass-panel">
          <div className="section-stack">
            <span className="mono-label">Available balance</span>
            <h2 className="section-title">{walletState.wallet.availableLabel}</h2>
            <p className="section-copy">{selectedMethod.summary}</p>
            {redirectNotice ? <div className="form-notice">{redirectNotice}</div> : null}
            {poolTitle && desiredStakeCents > 0 ? (
              <div className="summary-card wallet-context-card">
                <span className="mono-label">Return to stake</span>
                <strong>{poolTitle}</strong>
                <p className="detail-text">
                  Stake target ${stakeDollars.toFixed(0)} · shortfall ${Math.max(shortfallCents / 100, 0).toFixed(2)}
                </p>
              </div>
            ) : null}
            <div className="wallet-funding-review-grid">
              <div className="summary-card wallet-funding-review-card">
                <span className="mono-label">Selected method</span>
                <strong>{selectedMethod.label}</strong>
                <p className="detail-text">{selectedMethod.summary}</p>
              </div>
              <div className="summary-card wallet-funding-review-card">
                <span className="mono-label">Amount entered</span>
                <strong>${(normalizedAmountCents / 100).toFixed(2)}</strong>
                <p className="detail-text">This is the total charge before any funding fee is removed.</p>
              </div>
              <div className="summary-card wallet-funding-review-card">
                <span className="mono-label">Net wallet credit</span>
                <strong>${(netCents / 100).toFixed(2)}</strong>
                <p className="detail-text">Funding fees are removed before the balance becomes available.</p>
              </div>
              {poolTitle && desiredStakeCents > 0 ? (
                <div className="summary-card wallet-funding-review-card">
                  <span className="mono-label">Stake readiness</span>
                  <strong>{stakeCoveredAfterFunding ? "Ready to lock" : "Still short"}</strong>
                  <p className="detail-text">
                    Post-funding balance ${(totalAvailableAfterFundingCents / 100).toFixed(2)} · required ${(totalNeededForStakeCents / 100).toFixed(2)}
                  </p>
                </div>
              ) : null}
            </div>
            <div className="field-stack">
              <label className="mono-label" htmlFor="wallet-top-up">
                Deposit amount
              </label>
              <input
                id="wallet-top-up"
                className="shell-search-input"
                min={selectedMethod.minimumAmount}
                onChange={(event) => setManualTopUpAmount(Number(event.target.value))}
                step={selectedMethodKey === "wire_transfer" ? 100 : 5}
                type="number"
                value={topUpAmount}
              />
            </div>
            <div className="button-row">
              {selectedMethod.quickAmounts.map((amount) => (
                <button
                  key={amount}
                  className="action-secondary"
                  onClick={() => setManualTopUpAmount(amount)}
                  type="button"
                >
                  ${amount}
                </button>
              ))}
            </div>
            <div className="timeline-list">
              <div className="summary-card">
                <span className="mono-label">Funding amount</span>
                <strong>${(normalizedAmountCents / 100).toFixed(2)}</strong>
              </div>
              <div className="summary-card">
                <span className="mono-label">Funding fee</span>
                <strong>${(feeCents / 100).toFixed(2)}</strong>
              </div>
              <div className="summary-card">
                <span className="mono-label">Wallet cash after fee</span>
                <strong>${(netCents / 100).toFixed(2)}</strong>
              </div>
              {poolTitle && desiredStakeCents > 0 ? (
                <div className="summary-card">
                  <span className="mono-label">Stake coverage after funding</span>
                  <strong>{stakeCoveredAfterFunding ? "Ready to stake" : "Still short"}</strong>
                  <p className="detail-text">
                    Available after funding ${(
                      totalAvailableAfterFundingCents / 100
                    ).toFixed(2)} · required ${(totalNeededForStakeCents / 100).toFixed(2)}
                  </p>
                </div>
              ) : null}
              {selectedMethodKey === "wire_transfer" ? (
                <div className="summary-card">
                  <span className="mono-label">Wire rules</span>
                  <strong>$1,000 minimum · $20 flat fee</strong>
                  <p className="detail-text">Reviewed before instructions are issued.</p>
                </div>
              ) : null}
              {selectedMethodKey === "crypto_zenhash" ? (
                <div className="summary-card">
                  <span className="mono-label">Crypto review</span>
                  <strong>Network fees vary</strong>
                  <p className="detail-text">
                    You will see the destination address, QR, timing estimate, and a risk notice before sending funds.
                  </p>
                </div>
              ) : null}
            </div>
            <div className="button-row">
              <button className="action-primary" disabled={pending} onClick={startTopUp} type="button">
                {pending ? "Opening..." : selectedMethod.actionLabel}
              </button>
              <Link className="action-secondary" href="/app/wallet/fund">
                Change method
              </Link>
              {returnTo ? (
                <Link className="action-secondary" href={returnTo}>
                  Return to stake
                </Link>
              ) : null}
            </div>
            {notice ? <div className="form-notice">{notice}</div> : null}
          </div>
        </div>

        <div className="glass-panel">
          <div className="section-stack">
            <span className="eyebrow">Vault state</span>
            <h2 className="section-title">Funding and payout rails</h2>
            <p className="section-copy">
              Available, pending, and locked cash stay separate so funding review and payout setup stay easy to trust.
            </p>
            <div className="wallet-funding-side-grid">
              <div className="summary-card wallet-funding-side-card">
                <span className="mono-label">Available now</span>
                <strong>{walletState.wallet.availableLabel}</strong>
              </div>
              <div className="summary-card wallet-funding-side-card">
                <span className="mono-label">Pending cash</span>
                <strong>{walletState.wallet.pendingLabel}</strong>
              </div>
              <div className="summary-card wallet-funding-side-card">
                <span className="mono-label">Locked in tickets</span>
                <strong>{walletState.wallet.lockedLabel}</strong>
              </div>
              <div className="summary-card wallet-funding-side-card">
                <span className="mono-label">Funding fee</span>
                <strong>
                  {selectedMethodKey === "wire_transfer"
                    ? "$20 flat"
                    : selectedMethodKey === "crypto_zenhash"
                      ? "Network + platform fees vary"
                      : selectedMethodKey === "bank_account"
                        ? "$0 to fund"
                        : feeSchedule.depositFee}
                </strong>
              </div>
              <div className="summary-card wallet-funding-side-card">
                <span className="mono-label">Instant payout</span>
                <strong>2.5% where supported</strong>
                <p className="detail-text">Review card payout setup and verification before anything is released.</p>
              </div>
              <div className="summary-card wallet-funding-side-card">
                <span className="mono-label">Sovereign Spark</span>
                <strong>{feeSchedule.infrastructureFee}</strong>
                <p className="detail-text">This stays in market economics and does not behave like a deposit fee.</p>
              </div>
            </div>
            <div className="button-row">
              <Link className="action-secondary" href="/app/wallet/fund">
                Funding methods
              </Link>
              <Link className="action-secondary" href="/settings#wallet-payments">
                Payout setup
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="split-grid">
        <div className="glass-panel">
          <div className="section-stack">
            <span className="eyebrow">Positions</span>
            <h2 className="section-title">Open and recent tickets</h2>
          </div>
          <div className="timeline-list">
            {walletState.tickets.map((ticket) => (
              <div key={ticket.id} className="timeline-item">
                <div className="timeline-index">{ticket.stakeLabel}</div>
                <div className="section-stack">
                  <strong>{ticket.poolTitle}</strong>
                  <p className="detail-text">{ticket.resultLabel}</p>
                  <span className="muted-text">
                    {ticket.joinedAt} · {ticket.feeLabel} fee
                  </span>
                  <span className="muted-text">
                    {ticket.joinStatusLabel} · {ticket.proofMode}
                  </span>
                  {ticket.earlyReleaseAvailable && ticket.earlyReleaseQuote ? (
                    <div className="section-stack">
                      {previewTicketId === ticket.id ? (
                        <div className="summary-card">
                          <span className="mono-label">Early Release review</span>
                          <strong>{ticket.earlyReleaseQuote.refundLabel} returns to wallet cash</strong>
                          <p className="detail-text">
                            Original stake {ticket.earlyReleaseQuote.originalStakeLabel} · 5% penalty{" "}
                            {ticket.earlyReleaseQuote.penaltyLabel}
                          </p>
                          <p className="detail-text">
                            Confirming Early Release records an abandoned commitment and permanently closes this market
                            instance to your account.
                          </p>
                          {ticket.integrityImpactPreview ? (
                            <p className="detail-text">
                              {ticket.integrityImpactPreview.title}: {ticket.integrityImpactPreview.body}
                            </p>
                          ) : null}
                          {ticket.noRejoinMessage ? <p className="detail-text">{ticket.noRejoinMessage}</p> : null}
                          <div className="button-row">
                            <button
                              className="action-primary"
                              disabled={releasingTicketId === ticket.id}
                              onClick={() => void confirmEarlyRelease(ticket.id)}
                              type="button"
                            >
                              {releasingTicketId === ticket.id ? "Confirming..." : "Confirm Early Release"}
                            </button>
                            <button
                              className="action-secondary"
                              onClick={() => setPreviewTicketId(null)}
                              type="button"
                            >
                              Keep this ticket
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="button-row">
                          <button
                            className="action-secondary"
                            onClick={() => setPreviewTicketId(ticket.id)}
                            type="button"
                          >
                            Review Early Release
                          </button>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel">
          <div className="section-stack">
            <span className="eyebrow">Wallet ledger</span>
            <h2 className="section-title">Recent cash events</h2>
          </div>
          <div className="timeline-list">
            {walletState.transactions.map((item) => (
              <div key={item.id} className="timeline-item">
                <div className="timeline-index">{item.amountLabel}</div>
                <div className="section-stack">
                  <strong>{item.summary}</strong>
                  <p className="detail-text">{item.createdAt}</p>
                  <span className="muted-text">
                    {item.status} · net {item.netLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
