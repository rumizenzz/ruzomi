"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type {
  PoolMessage,
  SiteState,
  WalletState,
} from "@/lib/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const EMPTY_SITE_STATE: SiteState = {
  livePoolCount: 0,
  liveChannelCount: 0,
  openingCount: 0,
  settlingCount: 0,
  categories: [],
  topPools: [],
  openingPools: [],
  settlingPools: [],
  account: {
    cash: "$0",
    portfolio: "$0",
    alerts: 0,
  },
};

const EMPTY_WALLET_STATE: WalletState = {
  viewer: null,
  wallet: {
    id: "wallet",
    availableCents: 0,
    pendingCents: 0,
    lockedCents: 0,
    availableLabel: "$0",
    pendingLabel: "$0",
    lockedLabel: "$0",
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

export const SiteStateContext = createContext<SiteState | null>(null);
export const WalletStateContext = createContext<WalletState | null>(null);

function subscribeToTables(onChange: () => void, tables: string[]) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) {
    return () => {};
  }

  const channels = tables.map((table) =>
    supabase
      .channel(`ptc-${table}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, onChange)
      .subscribe(),
  );

  return () => {
    channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
  };
}

export function useLiveSiteState(initialState: SiteState = EMPTY_SITE_STATE) {
  const [state, setState] = useState<SiteState>(initialState);

  useEffect(() => {
    let cancelled = false;
    const supabase = createSupabaseBrowserClient();

    const load = async () => {
      const response = await fetch("/api/site-state", { cache: "no-store" });
      if (!response.ok) return;
      const json = (await response.json()) as SiteState;
      if (!cancelled) {
        setState(json);
      }
    };

    void load();
    const cleanupRealtime = subscribeToTables(load, [
      "commitment_pools",
      "pool_stats",
      "pool_messages",
      "wallet_accounts",
      "app_notifications",
    ]);
    const authListener = supabase?.auth.onAuthStateChange(() => {
      void load();
    });
    const authSubscription = authListener?.data.subscription;
    const intervalId = window.setInterval(load, 15000);

    return () => {
      cancelled = true;
      cleanupRealtime();
      authSubscription?.unsubscribe();
      window.clearInterval(intervalId);
    };
  }, []);

  return state;
}

export function useLiveWalletState(initialState: WalletState = EMPTY_WALLET_STATE) {
  const [state, setState] = useState<WalletState>(initialState);

  useEffect(() => {
    let cancelled = false;
    const supabase = createSupabaseBrowserClient();

    const load = async () => {
      const response = await fetch("/api/wallet", { cache: "no-store" });
      if (!response.ok) return;
      const json = (await response.json()) as WalletState;
      if (!cancelled) {
        setState(json);
      }
    };

    void load();
    const cleanupRealtime = subscribeToTables(load, [
      "wallet_accounts",
      "wallet_transactions",
      "pool_tickets",
      "chain_tickets",
      "app_notifications",
      "reliability_rewards",
    ]);
    const authListener = supabase?.auth.onAuthStateChange(() => {
      void load();
    });
    const authSubscription = authListener?.data.subscription;
    const intervalId = window.setInterval(load, 15000);

    return () => {
      cancelled = true;
      cleanupRealtime();
      authSubscription?.unsubscribe();
      window.clearInterval(intervalId);
    };
  }, []);

  return state;
}

export function useSharedSiteState() {
  const context = useContext(SiteStateContext);

  if (!context) {
    throw new Error("useSharedSiteState must be used within a SiteStateProvider.");
  }

  return context;
}

export function useSharedWalletState() {
  const context = useContext(WalletStateContext);

  if (!context) {
    throw new Error("useSharedWalletState must be used within a WalletStateProvider.");
  }

  return context;
}

export function useSparkFeed(poolSlug?: string) {
  const [messages, setMessages] = useState<PoolMessage[]>([]);

  const query = useMemo(() => {
    const search = new URLSearchParams();
    if (poolSlug) {
      search.set("poolSlug", poolSlug);
      search.set("markRead", "1");
    }
    return search.toString();
  }, [poolSlug]);

  useEffect(() => {
    let cancelled = false;
    const supabase = createSupabaseBrowserClient();

    const load = async () => {
      const response = await fetch(`/api/messages${query ? `?${query}` : ""}`, { cache: "no-store" });
      if (!response.ok) return;
      const json = (await response.json()) as { messages: PoolMessage[] };
      if (!cancelled) {
        setMessages(json.messages);
      }
    };

    void load();
    const cleanupRealtime = subscribeToTables(load, [
      "pool_messages",
      "pool_message_replies",
      "pool_message_reactions",
    ]);
    const authListener = supabase?.auth.onAuthStateChange(() => {
      void load();
    });
    const authSubscription = authListener?.data.subscription;

    return () => {
      cancelled = true;
      cleanupRealtime();
      authSubscription?.unsubscribe();
    };
  }, [query]);

  return {
    messages,
    setMessages,
  };
}
