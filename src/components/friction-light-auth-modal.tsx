"use client";

import Link from "next/link";
import { LockKeyhole, Sparkles, X } from "lucide-react";

import { buildAuthHref } from "@/lib/auth-flow";

export function FrictionLightAuthModal({
  open,
  poolSlug,
  poolTitle,
  stakeCents,
  onClose,
}: {
  open: boolean;
  poolSlug: string;
  poolTitle: string;
  stakeCents: number;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  const stakeDollars = (stakeCents / 100).toFixed(0);
  const nextHref = `/pools/${poolSlug}?stake=${stakeDollars}&intent=commit`;
  const signupHref = buildAuthHref("signup", nextHref);
  const loginHref = buildAuthHref("login", nextHref);

  return (
    <div
      aria-labelledby="friction-light-auth-title"
      aria-modal="true"
      className="ticket-auth-modal-backdrop"
      onClick={onClose}
      role="dialog"
    >
      <div className="ticket-auth-modal glass-panel" onClick={(event) => event.stopPropagation()}>
        <div className="ticket-auth-modal-head">
          <div className="section-stack section-stack-tight">
            <span className="mono-label">Lock this stake</span>
            <strong id="friction-light-auth-title">Create your account to keep this commitment.</strong>
            <p className="detail-text">
              You are about to lock ${stakeDollars} on {poolTitle}. Identity does not start during signup. It only
              begins when you fund the wallet or place the live stake.
            </p>
          </div>
          <button
            aria-label="Close sign up modal"
            className="button-reset ticket-auth-modal-close"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="ticket-auth-modal-strip">
          <span className="funding-state-chip">No ID check now</span>
          <div className="ticket-auth-provider-row" aria-label="Available sign up paths">
            <span className="ticket-auth-provider-pill">Email</span>
            <span className="ticket-auth-provider-pill">Apple</span>
            <span className="ticket-auth-provider-pill">Google</span>
          </div>
        </div>

        <div className="ticket-auth-modal-actions">
          <Link className="action-primary" href={signupHref}>
            Create account
          </Link>
          <Link className="action-secondary" href={loginHref}>
            Log in
          </Link>
        </div>

        <div className="ticket-auth-modal-note">
          <LockKeyhole aria-hidden="true" size={16} />
          <span>Guests can browse every market first. The sign-in wall appears only when you try to lock the stake.</span>
        </div>

        <div className="ticket-auth-modal-foot">
          <Sparkles aria-hidden="true" size={16} />
          <span>After the stake is locked on desktop, proof submission continues in the mobile app.</span>
        </div>
      </div>
    </div>
  );
}
