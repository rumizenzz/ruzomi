"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, Smartphone, UserPlus2, Users } from "lucide-react";

import type { ContactSyncConsent, RewardProgress } from "@/lib/types";

function contactSyncCopy(consent: ContactSyncConsent) {
  switch (consent.status) {
    case "granted":
      return {
        label: "Contacts synced",
        body: "Your mobile invite path can spot friends already here and send direct invites faster.",
      };
    case "denied":
      return {
        label: "Contacts off",
        body: "Contact sync is optional. You can still invite by link or message from the mobile app.",
      };
    case "unknown":
    default:
      return {
        label: "Sync contacts on mobile",
        body: "Contact sync stays optional. Turn it on in the mobile app to spot friends already here and send one-tap invites.",
      };
  }
}

export function InviteLoopCard({
  rewardProgress,
  contactSyncConsent,
  className = "",
  showHelpLink = true,
}: {
  rewardProgress: RewardProgress;
  contactSyncConsent: ContactSyncConsent;
  className?: string;
  showHelpLink?: boolean;
}) {
  const contactState = contactSyncCopy(contactSyncConsent);

  return (
    <div className={`glass-panel invite-loop-card ${className}`.trim()}>
      <div className="section-stack section-stack-tight">
        <span className="mono-label">Invite loop</span>
        <strong>$20 referral tracker</strong>
        <p className="detail-text">
          Referrer {rewardProgress.referrerReward} · invited account {rewardProgress.invitedReward}
        </p>
      </div>

      <div className="invite-loop-status-row">
        <span className="status-pill" data-tone={rewardProgress.payoutState === "ready" ? "live" : "settling"}>
          {rewardProgress.payoutState === "ready" ? "Ready to release" : rewardProgress.unlockState}
        </span>
        {rewardProgress.inviteCountdown ? (
          <span className="metric-chip invite-loop-countdown">
            <Clock3 aria-hidden="true" size={14} />
            {rewardProgress.inviteCountdown.label}
          </span>
        ) : null}
      </div>

      <div className="invite-loop-metrics">
        <div className="invite-loop-metric">
          <span>Completed stakes</span>
          <strong>
            {rewardProgress.completedStakes}/{rewardProgress.requiredStakes}
          </strong>
        </div>
        <div className="invite-loop-metric">
          <span>Fees covered</span>
          <strong>{rewardProgress.generatedFees}</strong>
        </div>
      </div>

      <div className="invite-loop-step-list">
        {rewardProgress.checklist.map((step) => (
          <div key={step.id} className={`invite-loop-step ${step.completed ? "is-complete" : ""}`}>
            <span className="invite-loop-step-icon" aria-hidden="true">
              {step.completed ? <CheckCircle2 size={16} /> : <UserPlus2 size={16} />}
            </span>
            <div>
              <strong>{step.label}</strong>
              <p>{step.completed ? "Complete" : "Still waiting"}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="invite-loop-contact-card">
        <div className="invite-loop-contact-head">
          <span className="invite-loop-contact-icon" aria-hidden="true">
            {contactSyncConsent.status === "granted" ? <Users size={16} /> : <Smartphone size={16} />}
          </span>
          <div>
            <strong>{contactState.label}</strong>
            <p>{contactState.body}</p>
          </div>
        </div>
        <p className="detail-text">
          The reward releases only after the invited account signs up, funds the wallet, places the first live stake,
          and closes the first verified commitment.
        </p>
        {showHelpLink ? (
          <div className="button-row invite-loop-actions">
            <Link className="action-secondary" href="/help-center?query=invite">
              Read invite rules
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
