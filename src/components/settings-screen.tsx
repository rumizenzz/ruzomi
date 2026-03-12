import Link from "next/link";
import { Bell, CircleCheckBig, Eye, KeyRound, ShieldCheck, Smartphone, Wallet } from "lucide-react";

import { InviteLoopCard } from "@/components/invite-loop-card";
import { LogoutButton } from "@/components/logout-button";
import { ProfileSettingsPanel } from "@/components/profile-settings-panel";
import { GlassPanel, SectionIntro } from "@/components/surfaces";
import type { QuickstartState } from "@/lib/quickstart";
import type { WalletState } from "@/lib/types";

function statusLabelFromContactSync(status: WalletState["contactSyncConsent"]["status"]) {
  if (status === "granted") {
    return "Granted on mobile";
  }
  if (status === "denied") {
    return "Not enabled";
  }
  return "Not set yet";
}

export function SettingsScreen({
  quickstartState,
  walletState,
  viewerEmail,
}: {
  quickstartState: QuickstartState | null;
  walletState: WalletState;
  viewerEmail: string | null;
}) {
  const viewer = walletState.viewer;

  return (
    <div className="section-stack settings-screen">
      <SectionIntro
        eyebrow="Settings"
        title="Account, privacy, notifications, and wallet access."
        body="Keep session controls, contact-sync choices, wallet responsibilities, and public profile settings in one calmer place."
      />

      <div className="settings-layout">
        <GlassPanel className="settings-sidebar">
          <div className="section-stack section-stack-tight">
            <span className="mono-label">Jump to</span>
            <strong className="settings-sidebar-title">Settings</strong>
          </div>

          <nav aria-label="Settings sections" className="settings-anchor-list">
            <a className="settings-anchor-link" href="#settings-overview">
              Overview
            </a>
            <a className="settings-anchor-link" href="#settings-profile">
              Profile
            </a>
            <a className="settings-anchor-link" href="#settings-notifications">
              Notifications
            </a>
            <a className="settings-anchor-link" href="#settings-privacy">
              Privacy & consent
            </a>
            <a className="settings-anchor-link" href="#settings-wallet">
              Wallet & security
            </a>
            <a className="settings-anchor-link" href="#settings-session">
              Session
            </a>
          </nav>

          <div className="settings-sidebar-card">
            <span className="mono-label">Signed in as</span>
            <strong>{viewer?.displayName ?? "PayToCommit member"}</strong>
            <span className="detail-text">{viewerEmail ?? viewer?.handle ?? "No active account"}</span>
          </div>

          <div className="settings-sidebar-card">
            <span className="mono-label">Available balance</span>
            <strong>{walletState.wallet.availableLabel}</strong>
            <span className="detail-text">Funding, payout, and active stake controls stay in sync with this balance.</span>
          </div>
        </GlassPanel>

        <div className="settings-content">
          <div id="settings-profile">
            <ProfileSettingsPanel quickstartState={quickstartState} />
          </div>

          <div id="settings-overview">
            <GlassPanel className="settings-card">
            <div className="section-stack section-stack-tight">
              <span className="mono-label">Overview</span>
              <h2 className="section-title">Keep the next control obvious.</h2>
              <p className="section-copy">
                Settings stays compact on purpose. The next move should be clear whether you are managing profile visibility, wallet access, or reminders.
              </p>
            </div>

            <div className="settings-summary-grid">
              <div className="settings-summary-item">
                <Bell size={16} />
                <div>
                  <strong>{walletState.notifications.length} notifications</strong>
                  <p className="detail-text">Open reminders, result updates, and market-open alerts.</p>
                </div>
              </div>
              <div className="settings-summary-item">
                <Smartphone size={16} />
                <div>
                  <strong>{statusLabelFromContactSync(walletState.contactSyncConsent.status)}</strong>
                  <p className="detail-text">Contact sync can be managed later without changing the rest of the product.</p>
                </div>
              </div>
              <div className="settings-summary-item">
                <Wallet size={16} />
                <div>
                  <strong>{walletState.wallet.pendingLabel} pending</strong>
                  <p className="detail-text">Pending money stays separate from available balance until it settles.</p>
                </div>
              </div>
              <div className="settings-summary-item">
                <CircleCheckBig size={16} />
                <div>
                  <strong>{walletState.rewardProgress.remaining}</strong>
                  <p className="detail-text">Invite progress, reward state, and revive paths stay visible here.</p>
                </div>
              </div>
            </div>

            <div className="button-row settings-inline-actions">
              <Link className="action-secondary" href="/app/notifications">
                Open notifications
              </Link>
              <Link className="action-secondary" href="/app/wallet">
                Open wallet
              </Link>
              <Link className="action-secondary" href="/app/reliability">
                Open rewards & access
              </Link>
            </div>
            </GlassPanel>
          </div>

          <div id="settings-notifications">
            <GlassPanel className="settings-card">
            <div className="section-stack section-stack-tight">
              <span className="mono-label">Notifications</span>
              <h2 className="section-title">Deadlines, result updates, and market-open reminders.</h2>
              <p className="section-copy">
                Keep reminder traffic light. Notification history stays in the inbox, while settings keeps the channels and the current queue in view.
              </p>
            </div>

            <div className="settings-notification-list">
              {walletState.notifications.length ? (
                walletState.notifications.slice(0, 4).map((note) => (
                  <div key={note.id} className={`settings-notification-row settings-notification-row-${note.tone}`}>
                    <div>
                      <strong>{note.title}</strong>
                      <p className="detail-text">{note.summary}</p>
                    </div>
                    <span className="mono-label">{note.time}</span>
                  </div>
                ))
              ) : (
                <div className="empty-state settings-empty-state">No notifications are waiting right now.</div>
              )}
            </div>

            <div className="button-row settings-inline-actions">
              <Link className="action-primary" href="/app/notifications">
                Open inbox
              </Link>
            </div>
            </GlassPanel>
          </div>

          <div id="settings-privacy">
            <GlassPanel className="settings-card">
            <div className="section-stack section-stack-tight">
              <span className="mono-label">Privacy & consent</span>
              <h2 className="section-title">Keep contact sync and identity-backed visibility explicit.</h2>
              <p className="section-copy">
                Public surfaces stay pseudonymous by default. Identity-backed access, contact sync, and enterprise visibility remain scoped and auditable.
              </p>
            </div>

            <div className="settings-policy-grid">
              <div className="settings-policy-item">
                <Eye size={16} />
                <div>
                  <strong>Public identity</strong>
                  <p className="detail-text">Markets, Spark, and public profiles show your chosen public identity, not your legal name.</p>
                </div>
              </div>
              <div className="settings-policy-item">
                <ShieldCheck size={16} />
                <div>
                  <strong>Enterprise access</strong>
                  <p className="detail-text">Protected HRS access only works within documented consent scope and audit rules.</p>
                </div>
              </div>
              <div className="settings-policy-item">
                <Smartphone size={16} />
                <div>
                  <strong>Contact sync</strong>
                  <p className="detail-text">Mobile contact sync stays optional, revocable, and separate from normal account use.</p>
                </div>
              </div>
            </div>

            <InviteLoopCard
              className="settings-invite-card"
              contactSyncConsent={walletState.contactSyncConsent}
              rewardProgress={walletState.rewardProgress}
              showHelpLink={false}
            />
            </GlassPanel>
          </div>

          <div id="settings-wallet">
            <GlassPanel className="settings-card">
            <div className="section-stack section-stack-tight">
              <span className="mono-label">Wallet & security</span>
              <h2 className="section-title">Wallet-sensitive access is separate from support help.</h2>
              <p className="section-copy">
                PayToCommit can explain wallet policy and continuity rules, but it cannot recover protected wallet access if your Continuity Key or local wallet password is lost.
              </p>
            </div>

            <div className="settings-policy-grid">
              <div className="settings-policy-item">
                <KeyRound size={16} />
                <div>
                  <strong>12-Word Continuity Key</strong>
                  <p className="detail-text">Store it safely. It protects wallet continuity on new devices and in high-risk recovery flows.</p>
                </div>
              </div>
              <div className="settings-policy-item">
                <ShieldCheck size={16} />
                <div>
                  <strong>Local wallet password</strong>
                  <p className="detail-text">Wallet-sensitive access can require a local password or approved biometric unlock on supported devices.</p>
                </div>
              </div>
              <div className="settings-policy-item">
                <Wallet size={16} />
                <div>
                  <strong>Support boundary</strong>
                  <p className="detail-text">Support will never ask for your Continuity Key or local wallet password, and it cannot bypass them for you.</p>
                </div>
              </div>
            </div>

            <div className="button-row settings-inline-actions">
              <Link className="action-secondary" href="/app/wallet">
                Open wallet
              </Link>
              <Link className="action-secondary" href="/help-center?query=continuity">
                Read recovery rules
              </Link>
            </div>
            </GlassPanel>
          </div>

          <div id="settings-session">
            <GlassPanel className="settings-card">
            <div className="section-stack section-stack-tight">
              <span className="mono-label">Session</span>
              <h2 className="section-title">Keep account access easy to leave and easy to find.</h2>
              <p className="section-copy">
                Logging out removes the active session from this device. Wallet recovery material and account access remain separate responsibilities.
              </p>
            </div>

            <div className="button-row settings-inline-actions">
              <LogoutButton className="action-secondary settings-logout-button" label="Log out" />
            </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
