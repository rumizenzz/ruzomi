"use client";

import Link from "next/link";
import { CreditCard, Landmark, Smartphone } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { BrandLockup, BrandMark } from "@/components/brand-mark";
import { useSharedWalletState } from "@/components/live-data-hooks";
import { buildAuthHref } from "@/lib/auth-flow";

const methods = [
  {
    id: "apple_pay",
    title: "APPLE PAY.",
    summary: "Instant transfer, fast and secure.",
    detail: "Available when this device and browser support Apple Pay through Stripe.",
    feeLabel: "2.5% funding fee",
    timingLabel: "Fastest wallet credit",
    minimumLabel: "$10 minimum",
    accent: "apple",
  },
  {
    id: "google_pay",
    title: "GOOGLE PAY.",
    summary: "Link your existing Google Wallet.",
    detail: "Available when this device and browser support Google Pay through Stripe.",
    feeLabel: "2.5% funding fee",
    timingLabel: "Fastest wallet credit",
    minimumLabel: "$10 minimum",
    accent: "google",
  },
  {
    id: "bank_account",
    title: "BANK ACCOUNT.",
    summary: "Lower-friction bank funding with slower settlement.",
    detail: "Best when you want wallet cash without card fees.",
    feeLabel: "$0 funding fee",
    timingLabel: "Slower settlement",
    minimumLabel: "$10 minimum",
    accent: "ach",
  },
  {
    id: "debit_card",
    title: "DEBIT CARD.",
    summary: "Visa and Mastercard with a 2.50% funding fee.",
    detail: "Cards post fastest and are available on every supported device.",
    feeLabel: "2.5% funding fee",
    timingLabel: "Fastest wallet credit",
    minimumLabel: "$10 minimum",
    accent: "card",
  },
  {
    id: "paypal_venmo",
    title: "PAYPAL / VENMO.",
    summary: "Digital wallet funding with provider timing and fee review before confirm.",
    detail: "Best when you want wallet funding without re-entering card details.",
    feeLabel: "2.5% funding fee",
    timingLabel: "Provider timing applies",
    minimumLabel: "$10 minimum",
    accent: "google",
  },
  {
    id: "crypto_zenhash",
    title: "CRYPTO VIA ZENHASH.",
    summary: "Network-specific funding with QR, wallet address, timing, and risk review.",
    detail: "Best when you already hold supported assets and want an external-wallet route.",
    feeLabel: "Network fees vary",
    timingLabel: "Chain timing applies",
    minimumLabel: "$5 minimum",
    accent: "card",
  },
  {
    id: "wire_transfer",
    title: "WIRE TRANSFER.",
    summary: "Secure bank transfer, $1,000 minimum, flat $20 wire fee.",
    detail: "Best for larger deposits that do not need instant card rails.",
    feeLabel: "$20 flat wire fee",
    timingLabel: "Reviewed before posting",
    minimumLabel: "$1,000 minimum",
    accent: "ach",
  },
] as const;
const footerLinks = [
  { href: "/docs", label: "Docs AI" },
  { href: "/legal", label: "Legal" },
] as const;

export function DepositMethodScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const walletState = useSharedWalletState();
  const viewer = walletState.viewer;
  const [selectedMethod, setSelectedMethod] = useState<(typeof methods)[number]["id"]>("apple_pay");
  const selectedMethodRecord = methods.find((method) => method.id === selectedMethod) ?? methods[0];
  const poolTitle = searchParams.get("poolTitle");
  const stakeDollars = searchParams.get("stakeDollars");
  const returnTo = searchParams.get("returnTo");
  const stakeTargetDollars = Number(stakeDollars ?? "0");
  const stakeTargetCents = stakeTargetDollars > 0 ? Math.round(stakeTargetDollars * 100) : 0;
  const stakeFeeCents = stakeTargetCents > 0 ? Math.round(stakeTargetCents * 0.05) : 0;
  const totalStakeNeedCents = stakeTargetCents + stakeFeeCents;
  const stakeShortfallCents = Math.max(totalStakeNeedCents - walletState.wallet.availableCents, 0);
  const recommendedTopUpDollars =
    stakeShortfallCents > 0 ? Math.ceil(stakeShortfallCents / 100) : selectedMethod === "wire_transfer" ? 1000 : 25;
  const progressSteps = [
    { label: "Account", state: "complete" },
    { label: "Verify", state: "complete" },
    { label: "Fund", state: "active" },
  ] as const;
  const guestProgressSteps = [
    { label: "Account", state: "active" },
    { label: "Verify", state: "upcoming" },
    { label: "Fund", state: "upcoming" },
  ] as const;
  const verifyProgressSteps = [
    { label: "Account", state: "complete" },
    { label: "Verify", state: "active" },
    { label: "Fund", state: "upcoming" },
  ] as const;

  if (!viewer) {
    return (
      <section className="auth-screen funding-screen funding-screen-methods">
        <div className="auth-screen-grid funding-screen-grid">
          <div className="auth-brand-hero">
            <Link aria-label="PayToCommit home" className="auth-brand-link" href="/">
              <BrandLockup />
            </Link>
          </div>

          <div className="funding-panel">
            <div className="auth-panel-glow" aria-hidden="true" />
            <div className="funding-panel-core funding-panel-core-center">
              <div className="auth-progress-strip funding-progress-strip" aria-label="Funding flow progress">
                {guestProgressSteps.map((step) => (
                  <span
                    key={step.label}
                    className={`auth-progress-chip ${step.state === "active" ? "is-active" : ""}`}
                  >
                    {step.label}
                  </span>
                ))}
              </div>
              <span className="funding-screen-heading">Select your deposit method</span>
              <p className="detail-text funding-copy funding-copy-compact">
                Create your account first, then come back to choose how cash moves into your wallet.
              </p>
              <div className="button-row funding-button-row funding-button-row-narrow">
                <Link className="action-primary auth-submit-stage" href={buildAuthHref("login", "/app/wallet/fund")}>
                  Log In
                </Link>
                <Link
                  className="action-secondary funding-secondary-button"
                  href={buildAuthHref("signup", "/app/wallet/fund")}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>

          <div className="funding-bottom-mark" aria-hidden="true">
            <BrandMark />
          </div>

          <div className="funding-footer">
            <div className="auth-footer-links">
              {footerLinks.map((link) => (
                <Link key={link.href} className="auth-footer-link" href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (viewer.identityStatus !== "verified") {
    return (
      <section className="auth-screen funding-screen funding-screen-methods">
        <div className="auth-screen-grid funding-screen-grid">
          <div className="auth-brand-hero">
            <Link aria-label="PayToCommit home" className="auth-brand-link" href="/">
              <BrandLockup />
            </Link>
          </div>

          <div className="funding-panel">
            <div className="auth-panel-glow" aria-hidden="true" />
            <div className="funding-panel-core funding-panel-core-center">
              <div className="auth-progress-strip funding-progress-strip" aria-label="Funding flow progress">
                {verifyProgressSteps.map((step) => (
                  <span
                    key={step.label}
                    className={`auth-progress-chip ${step.state === "active" ? "is-active" : step.state === "complete" ? "is-complete" : ""}`}
                  >
                    {step.label}
                  </span>
                ))}
              </div>
              <span className="funding-state-chip">Verify your identity</span>
              <h1 className="funding-title funding-title-prompt">Secure funding opens after identity verification.</h1>
              <p className="detail-text funding-copy funding-copy-compact">
                Finish identity verification first, then choose how to fund your wallet.
              </p>
              <div className="button-row funding-button-row funding-button-row-narrow">
                <Link className="action-primary auth-submit-stage" href="/app/verify">
                  Begin verification
                </Link>
                <Link className="action-secondary funding-secondary-button" href="/app">
                  No, later
                </Link>
              </div>
            </div>
          </div>

          <div className="funding-bottom-mark" aria-hidden="true">
            <BrandMark />
          </div>

          <div className="funding-footer">
            <div className="auth-footer-links">
              {footerLinks.map((link) => (
                <Link key={link.href} className="auth-footer-link" href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-screen funding-screen funding-screen-methods">
      <div className="auth-screen-grid funding-screen-grid">
        <div className="auth-brand-hero">
          <Link aria-label="PayToCommit home" className="auth-brand-link" href="/">
            <BrandLockup />
          </Link>
        </div>

        <div className="funding-panel">
          <div className="auth-panel-glow" aria-hidden="true" />
          <div className="funding-panel-core">
            <div className="auth-progress-strip funding-progress-strip" aria-label="Funding flow progress">
              {progressSteps.map((step) => (
                <span
                  key={step.label}
                  className={`auth-progress-chip ${step.state === "active" ? "is-active" : "is-complete"}`}
                >
                  {step.label}
                </span>
              ))}
            </div>

            <span className="funding-state-chip">Funding methods</span>
            <h1 className="funding-title funding-title-form funding-screen-heading-wide">Select your deposit method</h1>
            <p className="funding-copy funding-copy-compact">
              Pick how cash moves into your wallet. Every method keeps the market context intact and shows timing and fee
              expectations before you continue.
            </p>

            {poolTitle && stakeDollars ? (
              <div className="funding-method-selection-note">
                <span className="mono-label">Continue this stake</span>
                <strong>{poolTitle}</strong>
                <p>
                  Stake target ${stakeTargetDollars.toFixed(0)} · shortfall ${(stakeShortfallCents / 100).toFixed(2)} ·
                  recommended top-up ${recommendedTopUpDollars.toFixed(0)}
                </p>
              </div>
            ) : null}

            <div className="funding-method-grid">
              {methods.map((method) => (
                <button
                  key={method.id}
                  className={`funding-method-card ${selectedMethod === method.id ? "is-selected" : ""}`}
                  onClick={() => setSelectedMethod(method.id)}
                  type="button"
                >
                  <span className={`funding-method-icon funding-method-icon-${method.accent}`} aria-hidden="true">
                    {method.accent === "apple" ? (
                      <Smartphone size={30} />
                    ) : method.accent === "google" ? (
                      <Smartphone size={30} />
                    ) : method.accent === "card" ? (
                      <CreditCard size={30} />
                    ) : (
                      <Landmark size={30} />
                    )}
                  </span>
                  <span className="section-stack section-stack-tight funding-method-copy">
                    <strong>{method.title}</strong>
                    <span className="detail-text">{method.summary}</span>
                    <span className="funding-method-detail">{method.detail}</span>
                    <span className="funding-method-meta">
                      <span>{method.feeLabel}</span>
                      <span>{method.timingLabel}</span>
                      <span>{method.minimumLabel}</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div className="funding-method-selection-note">
              <span className="mono-label">Selected now</span>
              <strong>{selectedMethodRecord.title.replace(/\.$/, "")}</strong>
              <p>{selectedMethodRecord.detail}</p>
              <div className="funding-method-stat-grid">
                <div className="funding-method-stat">
                  <span>Fee</span>
                  <strong>{selectedMethodRecord.feeLabel}</strong>
                </div>
                <div className="funding-method-stat">
                  <span>Timing</span>
                  <strong>{selectedMethodRecord.timingLabel}</strong>
                </div>
                <div className="funding-method-stat">
                  <span>Minimum</span>
                  <strong>{selectedMethodRecord.minimumLabel}</strong>
                </div>
              </div>
              {selectedMethod === "wire_transfer" ? (
                <p className="detail-text">Wire transfer stays available for larger deposits with a dedicated review step.</p>
              ) : null}
              {selectedMethod === "crypto_zenhash" ? (
                <p className="detail-text">
                  Crypto funding will show a QR code, destination address, timing estimate, and a wrong-network warning
                  before any transfer starts.
                </p>
              ) : null}
            </div>

            <div className="funding-button-split">
              <button
                className="action-primary auth-submit-stage"
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set("method", selectedMethod);
                  if (poolTitle) params.set("poolTitle", poolTitle);
                  if (stakeDollars) params.set("stakeDollars", stakeDollars);
                  if (recommendedTopUpDollars > 0) params.set("topUpDollars", String(recommendedTopUpDollars));
                  if (returnTo) params.set("returnTo", returnTo);
                  router.push(`/app/wallet?${params.toString()}`);
                }}
                type="button"
              >
                Continue with {selectedMethodRecord.title.replace(/\.$/, "")}
              </button>
              <Link className="action-secondary funding-secondary-button" href="/app">
                No, later
              </Link>
            </div>
          </div>
        </div>

        <div className="funding-bottom-mark" aria-hidden="true">
          <BrandMark />
        </div>

        <div className="funding-footer">
          <div className="auth-footer-links">
            {footerLinks.map((link) => (
              <Link key={link.href} className="auth-footer-link" href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
