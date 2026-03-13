"use client";

import Link from "next/link";
import { Bell, ChevronDown, Settings2, ShieldCheck, UserRound, Wallet } from "lucide-react";

import { LogoutButton } from "@/components/logout-button";

export function AccountMenu({
  label = "Account",
  profileHref = "/app/profile",
  settingsHref = "/settings",
}: {
  label?: string;
  profileHref?: string;
  settingsHref?: string;
}) {
  return (
    <details className="market-console market-console-right account-menu-console">
      <summary className="account-menu-trigger shell-icon-button-dark shell-icon-button-with-label" aria-label="Open account menu">
        <UserRound size={17} />
        <span>{label}</span>
        <ChevronDown size={15} />
      </summary>
      <div className="market-console-panel market-console-panel-right shell-menu-panel account-menu-panel">
        <div className="market-console-header">
          <strong className="market-console-title">Account</strong>
          <span className="mono-label">Profile, wallet rules, and session controls.</span>
        </div>

        <div className="account-menu-grid">
          <Link className="account-menu-link" href={profileHref}>
            <div className="account-menu-link-copy">
              <strong>Profile</strong>
              <span>Public identity, presence, and joined-market context.</span>
            </div>
            <UserRound size={16} />
          </Link>

          <Link className="account-menu-link" href={settingsHref}>
            <div className="account-menu-link-copy">
              <strong>Settings</strong>
              <span>Notifications, privacy, consent, and session controls.</span>
            </div>
            <Settings2 size={16} />
          </Link>

          <Link className="account-menu-link" href="/app/notifications">
            <div className="account-menu-link-copy">
              <strong>Notifications</strong>
              <span>Reminders, result updates, and market-open alerts.</span>
            </div>
            <Bell size={16} />
          </Link>

          <Link className="account-menu-link" href="/app/wallet">
            <div className="account-menu-link-copy">
              <strong>Wallet</strong>
              <span>Available balance, funding methods, and payout setup.</span>
            </div>
            <Wallet size={16} />
          </Link>

          <Link className="account-menu-link" href="/app/reliability">
            <div className="account-menu-link-copy">
              <strong>Rewards & access</strong>
              <span>Invite progress, consent scope, and reliability access.</span>
            </div>
            <ShieldCheck size={16} />
          </Link>
        </div>

        <div className="account-menu-footer">
          <p className="detail-text">
            Support can explain wallet policy, but it cannot recover a lost 12-Word Continuity Key or reset a local wallet password.
          </p>
          <div className="account-menu-actions">
            <Link className="action-secondary account-menu-secondary" href={settingsHref}>
              Open settings
            </Link>
            <LogoutButton className="action-secondary account-menu-logout" label="Log out" />
          </div>
        </div>
      </div>
    </details>
  );
}
