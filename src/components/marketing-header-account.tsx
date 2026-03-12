"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { buildAuthHref, buildFundingHref } from "@/lib/auth-flow";
import { AccountMenu } from "@/components/account-menu";
import { NotificationPopover } from "@/components/notification-popover";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { WalletState } from "@/lib/types";

const EMPTY_WALLET_STATE: WalletState = {
  viewer: null,
  wallet: {
    id: "wallet",
    availableCents: 0,
    pendingCents: 0,
    lockedCents: 0,
    availableLabel: "$0.00",
    pendingLabel: "$0.00",
    lockedLabel: "$0.00",
    currency: "USD",
  },
  transactions: [],
  positions: [],
  tickets: [],
  chainTickets: [],
  rewardProgress: {
    completedStakes: 0,
    requiredStakes: 3,
    generatedFees: "$0",
    unlockState: "No reward cycle in progress",
    remaining: "3 completed stakes remaining",
    referrerReward: "$10",
    invitedReward: "$10",
    payoutState: "locked",
    inviteCountdown: null,
    checklist: [],
  },
  contactSyncConsent: {
    status: "unknown",
  },
  notifications: [],
};

export function MarketingHeaderAccount() {
  const pathname = usePathname();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [authReady, setAuthReady] = useState(() => !supabase);
  const [walletState, setWalletState] = useState<WalletState>(EMPTY_WALLET_STATE);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const loginHref = buildAuthHref("login", pathname);
  const signupHref = buildAuthHref("signup", pathname);
  const addFundsHref = buildFundingHref({
    isAuthenticated,
    identityStatus: walletState.viewer?.identityStatus,
  });

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const browserClient = supabase;
    let mounted = true;

    async function loadWalletState() {
      const {
        data: { user },
      } = await browserClient.auth.getUser();

      if (!mounted) {
        return;
      }

      setIsAuthenticated(Boolean(user));
      setAuthReady(true);

      if (!user) {
        setWalletState(EMPTY_WALLET_STATE);
        return;
      }

      const response = await fetch("/api/wallet/me", { cache: "no-store" });
      if (!response.ok) {
        setWalletState(EMPTY_WALLET_STATE);
        return;
      }

      const json = (await response.json()) as WalletState;
      if (mounted) {
        setWalletState(json);
      }
    }

    void loadWalletState();

    const { data } = browserClient.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user));
      setAuthReady(true);

      if (!session?.user) {
        setWalletState(EMPTY_WALLET_STATE);
      } else {
        void loadWalletState();
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  if (!authReady || !isAuthenticated) {
    return (
      <>
        <div className="header-fund-stack">
          <Link className="action-primary header-fund-button" href={addFundsHref}>
            Add Funds
          </Link>
          <div className="header-cash-note">
            <span>Cash Available:</span>
            <strong>$0.00</strong>
          </div>
        </div>
        <div className="header-auth-row">
          <Link className="header-auth-link" href={loginHref}>
            Log in
          </Link>
          <Link className="header-desk-link" href={signupHref}>
            Sign up
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="header-fund-stack">
        <Link className="action-primary header-fund-button" href={buildFundingHref({ isAuthenticated: true, identityStatus: walletState.viewer?.identityStatus })}>
          Add Funds
        </Link>
        <div className="header-cash-note">
          <span>Cash Available:</span>
          <strong>{walletState.wallet.availableLabel}</strong>
        </div>
      </div>
      <NotificationPopover notifications={walletState.notifications} />
      <AccountMenu label="Account" />
    </>
  );
}
