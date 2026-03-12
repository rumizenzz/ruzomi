import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";

import { RuzomiScreen } from "@/components/ruzomi-screen";
import { HeroMarketForge } from "@/components/hero-market-forge";
import { MarketTrendChart } from "@/components/market-trend-chart";
import { PoolBoard } from "@/components/pool-board";
import { QuickstartCompactCard } from "@/components/quickstart-compact-card";
import { GlassPanel, LedgerTable } from "@/components/surfaces";
import { getGalactusAccessState } from "@/lib/galactus-access";
import { getHostModeFromHost } from "@/lib/host-mode";
import { getRenderableGifUrl } from "@/lib/media";
import { sparkFeed as fallbackSparkFeed } from "@/lib/mock-data";
import {
  getGenerationEligibilityStateForSession,
  getSiteState,
  getWalletState,
  listChains,
  listNetworkLedger,
  listPools,
  listSparkFeed,
} from "@/lib/paytocommit-data";
import { formatVisiblePublicHandle, getVisiblePublicHandle } from "@/lib/public-identity";
import { getQuickstartState } from "@/lib/quickstart";
import { getAuthenticatedSupabaseUser, toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";
import type { CommitmentPool, PoolMessage } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const hostMode = getHostModeFromHost((await headers()).get("host"));

  if (hostMode === "ruzomi") {
    return {
      title: {
        absolute: "Ruzomi - The Network Around Every Commitment Market",
      },
      description:
        "Open the live Ruzomi network for direct sparks, joined-market channels, result artifacts, and verified follow-through tied to every commitment market.",
      alternates: {
        canonical: "/",
      },
      openGraph: {
        title: "Ruzomi - The Network Around Every Commitment Market",
        description:
          "Follow joined-market channels, direct sparks, result artifacts, and the live network around every commitment market.",
        url: "https://ruzomi.com",
      },
      twitter: {
        title: "Ruzomi - The Network Around Every Commitment Market",
        description:
          "The live network around every commitment market, with joined channels, direct sparks, and result artifacts.",
      },
    };
  }

  return {
    title: {
      absolute: "PayToCommit - Get Paid To Do What You Said You'll Do",
    },
    description:
      "Search live Commitment Markets, lock in a stake, submit proof from the mobile app, and follow every result in public.",
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: "PayToCommit - Get Paid To Do What You Said You'll Do",
      description: "Live Commitment Markets with proof, payout, Spark discussion, and public result history.",
      url: "https://paytocommit.com",
    },
    twitter: {
      title: "PayToCommit - Get Paid To Do What You Said You'll Do",
      description: "Search live markets, lock in a stake, submit proof, and follow every close.",
    },
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

function marketHighwayLabel(tone: PoolMessage["messageType"] | "live" | "chain" | "proof" | "result") {
  switch (tone) {
    case "chain":
      return "Chain";
    case "proof":
      return "Proof";
    case "result":
      return "Close";
    default:
      return "Live";
  }
}

function getLifecycleToneLabel(pool: CommitmentPool) {
  if (pool.lifecycleState === "join_closing_soon") {
    return "join closing";
  }

  return "live";
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "PT";
}

export default async function HomePage() {
  const hostMode = getHostModeFromHost((await headers()).get("host"));
  const authUser = await getAuthenticatedSupabaseUser();
  const shouldShowQuickstart = Boolean(authUser?.email_confirmed_at);
  const sessionToken = authUser ? toAuthenticatedAppSessionToken(authUser.id) : null;

  if (hostMode === "ruzomi") {
    const [siteState, walletState, sparkFeed, eligibilityState] = await Promise.all([
      getSiteState(sessionToken),
      getWalletState(sessionToken),
      listSparkFeed(sessionToken),
      getGenerationEligibilityStateForSession(sessionToken),
    ]);

    const galactusAccess = getGalactusAccessState(eligibilityState, "support", "/");
    const quickstartState =
      walletState.viewer && authUser?.email_confirmed_at
        ? getQuickstartState(walletState, eligibilityState, "/")
        : null;

    return (
      <RuzomiScreen
        galactusAccess={galactusAccess}
        quickstartState={quickstartState}
        selectedChannel="global"
        selectedDmHandle={null}
        selectedLane="feed"
        shareTicketId={null}
        siteState={siteState}
        sparkFeed={sparkFeed}
        walletState={walletState}
      />
    );
  }

  const [siteState, pools, sparkFeed, networkLedger, chains] = await Promise.all([
    getSiteState(null),
    listPools(),
    listSparkFeed(null),
    listNetworkLedger(),
    listChains(),
  ]);
  const [walletState, eligibilityState] = shouldShowQuickstart
    ? await Promise.all([getWalletState(sessionToken), getGenerationEligibilityStateForSession(sessionToken)])
    : [null, null];
  const quickstartState = walletState && eligibilityState ? getQuickstartState(walletState, eligibilityState, "/") : null;

  const livePools = pools
    .filter((pool) => pool.lifecycleState === "join_open" || pool.lifecycleState === "join_closing_soon")
    .slice(0, 3);
  const upcomingPools = pools.filter((pool) => pool.status === "upcoming").slice(0, 4);
  const marketHighway = siteState.marketHighway?.slice(0, 3) ?? [];
  const fallbackSparkHighlights: PoolMessage[] = fallbackSparkFeed.map((item) => ({
    id: item.id,
    poolId: null,
    poolSlug: null,
    poolTitle: item.context,
    authorName: item.actor,
    authorHandle: item.handle,
    body: item.message,
    tenorGifUrl: item.tenorGifUrl ?? null,
    hearts: item.reactionCount,
    replyCount: 0,
    createdAt: "Spark",
    unread: false,
    messageType: "message",
    reactionCounts: { heart: item.reactionCount },
    viewerReactions: [],
    replies: [],
  }));

  const liveSparkHighlights = [...sparkFeed]
    .sort(
      (left, right) =>
        Number(Boolean(getRenderableGifUrl(right.tenorGifUrl))) -
        Number(Boolean(getRenderableGifUrl(left.tenorGifUrl))),
    )
    .slice(0, 2) as PoolMessage[];

  const sparkHighlights =
    liveSparkHighlights.length >= 2
      ? liveSparkHighlights
      : [
          ...liveSparkHighlights,
          ...fallbackSparkHighlights
            .filter((message) => !liveSparkHighlights.some((candidate) => candidate.id === message.id))
            .slice(0, Math.max(0, 2 - liveSparkHighlights.length)),
        ];

  return (
    <>
      <section className="hero-dashboard hero-dashboard-foundry">
        <div className="hero-dashboard-intro">
          <div className="section-stack section-stack-tight">
            <span className="mono-label">Commitment Markets</span>
            <h1 className="hero-dashboard-title">Commitment Board</h1>
            <p className="detail-text hero-dashboard-copy">
              Search the markets that are live now, save the ones opening next, and come back here when it is time to draft your own.
            </p>
          </div>
        </div>

        <HeroMarketForge />

        {quickstartState && !quickstartState.isComplete ? (
          <QuickstartCompactCard className="hero-quickstart-card" state={quickstartState} variant="inline" />
        ) : null}

        <section className="dashboard-signal-grid dashboard-signal-grid-hero" id="highway">
          <GlassPanel className="dashboard-feed-panel dashboard-feed-panel-highway">
            <div className="market-shelf-head compact">
              <div className="market-shelf-title">
                <span className="mono-label">Live</span>
                <h2 className="market-shelf-heading market-shelf-heading-small">Live Commitment Highway</h2>
              </div>
              <span className="market-filter-chip">Recent updates</span>
            </div>
            <p className="detail-text dashboard-feed-copy">Fresh stakes, opening markets, and closes worth watching.</p>
            <div className="feed-list dashboard-feed-list">
              {marketHighway.map((item) => (
                <Link key={item.id} className="feed-item feed-item-ticker dashboard-live-item" href={item.poolSlug ? `/pools/${item.poolSlug}` : "/pools"}>
                  <div className="section-stack">
                    <div className="row-between dashboard-live-head">
                      <div className="dashboard-live-pill-row">
                        <span className={`dashboard-live-pill dashboard-live-pill-${item.tone}`}>
                          {marketHighwayLabel(item.tone)}
                        </span>
                        <strong>{item.label}</strong>
                      </div>
                      <span className="muted-text">{item.time}</span>
                    </div>
                    <p className="detail-text dashboard-live-copy">{item.body}</p>
                    <div className="surface-meta dashboard-live-meta">
                      <span>{item.context}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="dashboard-feed-panel dashboard-feed-panel-spark">
            <div className="market-shelf-head compact">
              <div className="market-shelf-title">
                <span className="mono-label">Spark</span>
                <h2 className="market-shelf-heading market-shelf-heading-small">Spark Global Feed</h2>
              </div>
            </div>
            <p className="detail-text dashboard-feed-copy">Conversation from the people already in the market.</p>
            <div className="feed-list dashboard-feed-list">
              {sparkHighlights.map((item) => {
                const authorHandle = getVisiblePublicHandle(item.authorHandle);
                const handleLabel = formatVisiblePublicHandle(item.authorHandle);
                const gifUrl = getRenderableGifUrl(item.tenorGifUrl);
                const content = (
                  <div className="section-stack dashboard-spark-card">
                    <div className="row-between dashboard-spark-head">
                      <div className="dashboard-spark-author">
                        <span className="dashboard-spark-avatar" aria-hidden="true">
                          {initialsFromName(item.authorName)}
                        </span>
                        <div className="section-stack section-stack-tight">
                          <strong>{handleLabel ?? item.authorName}</strong>
                          <span className="dashboard-spark-context">{item.poolTitle ?? "Spark"}</span>
                        </div>
                      </div>
                      <span className="muted-text">{item.createdAt}</span>
                    </div>
                    <p className="detail-text dashboard-spark-copy">{item.body}</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {gifUrl ? <img alt="" className="dashboard-spark-gif" src={gifUrl} /> : null}
                    <div className="surface-meta surface-meta-wrap dashboard-spark-meta">
                      <span>{handleLabel ?? item.authorName}</span>
                      <span>{item.hearts} hearts</span>
                    </div>
                  </div>
                );

                return authorHandle ? (
                  <Link key={item.id} className="feed-item feed-item-spark" href={`/profiles/${authorHandle}`}>
                    {content}
                  </Link>
                ) : (
                  <div key={item.id} className="feed-item feed-item-spark">
                    {content}
                  </div>
                );
              })}
            </div>
          </GlassPanel>
        </section>

        <div className="hero-home-bottom-rail">
          <div className="hero-home-footer">
            <div className="hero-home-footer-links">
              <Link className="hero-home-footer-link" href="/docs">
                Docs AI
              </Link>
              <Link className="hero-home-footer-link" href="/legal">
                Legal
              </Link>
            </div>
          </div>

          <GlassPanel className="dashboard-counter-strip dashboard-counter-strip-hero">
            <div className="dashboard-counter dashboard-counter-hero">
              <span>Active Commitment Markets</span>
              <strong>{siteState.livePoolCount.toLocaleString()}</strong>
            </div>
            <div className="dashboard-counter dashboard-counter-hero">
              <span>Live channels</span>
              <strong>{siteState.liveChannelCount.toLocaleString()}</strong>
            </div>
          </GlassPanel>
        </div>
      </section>

      <section className="section-stack dashboard-market-section dashboard-market-section-tight">
        <div className="market-shelf-head">
          <div className="market-shelf-title">
            <span className="mono-label">Discover</span>
            <h2 className="market-shelf-heading market-shelf-heading-small">Markets open now</h2>
          </div>
          <Link className="inline-link" href="/pools">
            View all
          </Link>
        </div>
        <div className="market-module-grid market-module-grid-home">
          {livePools.map((pool) => (
            <Link key={pool.slug} className="market-module-card" href={`/pools/${pool.slug}`}>
              <div className="section-stack">
                <div className="row-between">
                  <span className="status-pill" data-tone={pool.status}>
                    <span className="live-dot" />
                    {getLifecycleToneLabel(pool)}
                  </span>
                  <span className="metric-chip">{pool.visiblePoolTotal ? pool.volumeLabel : pool.stakeBand}</span>
                </div>
                <div className="section-stack">
                  <span className="mono-label">{pool.category}</span>
                  <strong>{pool.title}</strong>
                  <p className="detail-text">{pool.summary}</p>
                </div>
                <div className="surface-meta surface-meta-wrap">
                  <span>{pool.joinStatusLabel}</span>
                  <span>{pool.evidenceMode}</span>
                  <span>{pool.sparkCount} Spark</span>
                </div>
              </div>
              <MarketTrendChart compact points={pool.trendPoints ?? []} />
            </Link>
          ))}
        </div>
      </section>

      {upcomingPools.length ? (
        <section className="section-stack dashboard-market-section dashboard-market-section-tight">
          <div className="market-shelf-head">
            <div className="market-shelf-title">
              <span className="mono-label">Upcoming</span>
              <h2 className="market-shelf-heading market-shelf-heading-small">Opening next</h2>
            </div>
            <Link className="inline-link" href="/pools">
              Browse all
            </Link>
          </div>
          <p className="detail-text dashboard-upcoming-copy">
            Read the rules early, save an opening reminder, and come back when the join window goes live.
          </p>
          <GlassPanel>
            <PoolBoard
              emptyMessage="No upcoming markets are posted right now."
              pools={upcomingPools}
              showHeader={false}
            />
          </GlassPanel>
        </section>
      ) : null}

      <section className="split-grid dashboard-secondary-grid dashboard-secondary-grid-home">
        <GlassPanel>
            <div className="market-shelf-head compact">
              <div className="market-shelf-title">
                <span className="mono-label">Chains</span>
                <h2 className="market-shelf-heading market-shelf-heading-small">Linked commitments</h2>
              </div>
            <Link className="inline-link" href="/chains">
              View all
            </Link>
          </div>
          <div className="board-lane-list">
            {chains.slice(0, 3).map((chain) => (
              <Link key={chain.slug} className="board-lane-item" href={`/chains#${chain.slug}`}>
                <div>
                  <p className="data-title">{chain.category}</p>
                  <strong>{chain.title}</strong>
                </div>
                <div className="board-lane-meta">
                  <span>{chain.stakeBand}</span>
                  <span>{chain.payoutLabel}</span>
                </div>
              </Link>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel>
            <div className="market-shelf-head compact">
              <div className="market-shelf-title">
                <span className="mono-label">Network</span>
                <h2 className="market-shelf-heading market-shelf-heading-small">Commitment Network</h2>
              </div>
            <Link className="inline-link" href="/network">
              View network
            </Link>
          </div>
          <LedgerTable entries={networkLedger.slice(0, 6)} />
        </GlassPanel>
      </section>
    </>
  );
}
