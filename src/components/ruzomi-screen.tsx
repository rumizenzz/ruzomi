import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  Hash,
  LockKeyhole,
  MessageCircleMore,
  Radio,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { InviteLoopCard } from "@/components/invite-loop-card";
import { ProfilePeekLink } from "@/components/profile-peek-link";
import { QuickstartCompactCard } from "@/components/quickstart-compact-card";
import { ResultCardStack } from "@/components/result-card-stack";
import { buildShareCampaignText } from "@/lib/share-campaign";
import type { QuickstartState } from "@/lib/quickstart";
import type {
  GalactusAccessState,
  MarketFeedItem,
  PoolMessage,
  ResultCard,
  RuzomiChannel,
  SiteState,
  WalletState,
} from "@/lib/types";

type RuzomiLane = "feed" | "direct" | "artifacts";

type DirectSparkThread = {
  handle: string;
  authorName: string;
  preview: string;
  createdAt: string;
  unreadCount: number;
  presenceStatus: PoolMessage["presenceStatus"];
  messages: PoolMessage[];
};

function formatPresence(presence: PoolMessage["presenceStatus"]) {
  switch (presence) {
    case "away":
      return "Away";
    case "dnd":
      return "Do not disturb";
    case "invisible":
      return "Invisible";
    case "online":
    default:
      return "Online";
  }
}

function buildRuzomiHref({
  lane,
  channel,
  dm,
  shareTicketId,
}: {
  lane: RuzomiLane;
  channel?: string | null;
  dm?: string | null;
  shareTicketId?: string | null;
}) {
  const params = new URLSearchParams();

  if (lane !== "feed") {
    params.set("lane", lane);
  }

  if (channel && channel !== "global") {
    params.set("channel", channel);
  }

  if (dm) {
    params.set("dm", dm);
  }

  if (shareTicketId) {
    params.set("share", shareTicketId);
  }

  const query = params.toString();
  return query ? `/ruzomi?${query}` : "/ruzomi";
}

function buildDirectSparkThreads(messages: PoolMessage[]) {
  const threadMap = new Map<string, DirectSparkThread>();

  for (const message of messages) {
    const existing = threadMap.get(message.authorHandle);
    if (existing) {
      existing.unreadCount += message.unread ? 1 : 0;
      existing.messages.push(message);
      continue;
    }

    threadMap.set(message.authorHandle, {
      handle: message.authorHandle,
      authorName: message.authorName,
      preview: message.body,
      createdAt: message.createdAt,
      unreadCount: message.unread ? 1 : 0,
      presenceStatus: message.presenceStatus,
      messages: [message],
    });
  }

  return [...threadMap.values()].slice(0, 6);
}

function buildChannelSummary(channel: RuzomiChannel | null, lane: RuzomiLane) {
  if (!channel) {
    return {
      eyebrow: "Network view",
      title: "Global feed",
      body: "Follow the latest verified wins, joined-market updates, and spark activity across every live channel.",
    };
  }

  if (lane === "direct") {
    return {
      eyebrow: "Direct sparks",
      title: channel.title,
      body: channel.summary,
    };
  }

  if (lane === "artifacts") {
    return {
      eyebrow: "Artifacts",
      title: channel.title,
      body: channel.summary,
    };
  }

  return {
    eyebrow: channel.category,
    title: channel.title,
    body: channel.summary,
  };
}

export function RuzomiScreen({
  siteState,
  walletState,
  sparkFeed,
  galactusAccess,
  quickstartState,
  shareTicketId = null,
  selectedLane = "feed",
  selectedChannel = "global",
  selectedDmHandle = null,
}: {
  siteState: SiteState;
  walletState: WalletState;
  sparkFeed: PoolMessage[];
  galactusAccess: GalactusAccessState;
  quickstartState: QuickstartState | null;
  shareTicketId?: string | null;
  selectedLane?: RuzomiLane;
  selectedChannel?: string;
  selectedDmHandle?: string | null;
}) {
  const joinedMarkets = walletState.positions.slice(0, 6);
  const pulseItems = siteState.marketHighway?.slice(0, 6) ?? [];
  const highlightedWins = sparkFeed
    .filter((message) => {
      const body = message.body.toLowerCase();
      return body.includes("completed") || body.includes("streak") || body.includes("verified");
    })
    .slice(0, 3);
  const resultCards: ResultCard[] = walletState.tickets
    .filter((ticket) => ticket.status !== "active")
    .slice(0, 4)
    .map((ticket) => ({
      ticketId: ticket.id,
      type: ticket.status === "completed" ? "completed" : "missed",
      title: ticket.status === "completed" ? "Victory artifact" : "Forfeiture artifact",
      subtitle: ticket.poolTitle,
      summary:
        ticket.status === "completed"
          ? "Proof closed cleanly and the result is ready to save or move into the network."
          : "The market missed the close and the recorded result is ready to save or share.",
      netResultLabel: ticket.stakeLabel,
      downloadPath: `/api/result-cards/${ticket.id}`,
      createdAt: ticket.joinedAt,
      sparkShareText:
        ticket.status === "completed"
          ? `${ticket.poolTitle} closed completed on PayToCommit.`
          : `${ticket.poolTitle} closed missed on PayToCommit.`,
      externalShareText: buildShareCampaignText(
        "artifact",
        ticket.status === "completed"
          ? `${ticket.poolTitle} closed completed on PayToCommit. STP hardware-signed proof attached.`
          : `${ticket.poolTitle} closed missed on PayToCommit. STP hardware-signed result attached.`,
      ),
    }));
  const spotlightCard = shareTicketId ? resultCards.find((card) => card.ticketId === shareTicketId) ?? null : null;
  const networkMarkets = joinedMarkets.length
    ? joinedMarkets
    : siteState.topPools.slice(0, 6).map((pool) => ({
        poolSlug: pool.slug,
        poolTitle: pool.title,
        category: pool.category,
        ticketCount: pool.ticketCount ?? pool.participantCount,
        totalStakeLabel: pool.visiblePoolTotal ? pool.volumeLabel : pool.stakeBand,
        currentState: pool.status,
        resultLabel: pool.resultState,
        payoutLabel: pool.payoutLabel,
        deadlineLabel: pool.closesAt,
      }));
  const directSparkThreads = buildDirectSparkThreads(sparkFeed);
  const activeDirectThread =
    directSparkThreads.find((thread) => thread.handle === selectedDmHandle) ?? directSparkThreads[0] ?? null;
  const artifactChannel: RuzomiChannel = {
    id: "artifacts",
    slug: "artifacts",
    title: "Saved artifacts",
    category: "Artifacts",
    summary: "Victory and forfeiture cards stay ready to save, post into Ruzomi, or move into external share.",
    href: buildRuzomiHref({ lane: "artifacts", shareTicketId }),
    unreadCount: spotlightCard ? 1 : 0,
    type: "artifacts",
  };
  const globalChannel: RuzomiChannel = {
    id: "global",
    slug: "global",
    title: "Global feed",
    category: "Ruzomi",
    summary: "Watch the latest commitment closes, stake pulses, and verified activity across the full network.",
    href: buildRuzomiHref({ lane: "feed" }),
    unreadCount: sparkFeed.filter((message) => message.unread).length,
    type: "global",
  };
  const directChannel: RuzomiChannel = {
    id: "direct",
    slug: "direct",
    title: activeDirectThread ? `Direct Sparks · ${activeDirectThread.authorName}` : "Direct Sparks",
    category: "Private lane",
    summary: activeDirectThread
      ? `Keep the thread with ${activeDirectThread.authorName} live without leaving your joined channels.`
      : "Open private follow-through threads once you are inside the network.",
    href: buildRuzomiHref({ lane: "direct", dm: activeDirectThread?.handle ?? null, shareTicketId }),
    unreadCount: directSparkThreads.reduce((sum, thread) => sum + thread.unreadCount, 0),
    type: "direct",
  };
  const marketChannels: RuzomiChannel[] = networkMarkets.map((market) => ({
    id: market.poolSlug,
    slug: market.poolSlug,
    title: market.poolTitle,
    category: market.category,
    summary: `${market.totalStakeLabel} · ${market.deadlineLabel} · ${market.resultLabel}`,
    href: buildRuzomiHref({ lane: "feed", channel: market.poolSlug, shareTicketId }),
    unreadCount: sparkFeed.filter((message) => message.poolSlug === market.poolSlug && message.unread).length,
    type: "market",
  }));
  const activeFeedChannel =
    selectedLane === "feed"
      ? selectedChannel === "global"
        ? globalChannel
        : marketChannels.find((channel) => channel.slug === selectedChannel) ?? globalChannel
      : selectedLane === "direct"
        ? directChannel
        : artifactChannel;
  const selectedMarket = marketChannels.find((channel) => channel.slug === selectedChannel) ?? null;
  const visibleFeed =
    selectedLane === "feed"
      ? selectedChannel === "global"
        ? sparkFeed.slice(0, 6)
        : sparkFeed.filter((message) => message.poolSlug === selectedChannel).slice(0, 6)
      : [];
  const visiblePulseItems =
    selectedLane === "feed" && selectedChannel !== "global"
      ? pulseItems.filter((item) => item.poolSlug === selectedChannel).slice(0, 4)
      : pulseItems.slice(0, 5);
  const activeSummary = buildChannelSummary(activeFeedChannel, selectedLane);

  return (
    <section className="auth-screen ruzomi-screen">
      <div className="ruzomi-shell">
        <aside className="ruzomi-left-rail">
          <Link aria-label="Ruzomi home" className="ruzomi-logo" href="/ruzomi">
            <span>RUZOMI</span>
          </Link>

          <div className="ruzomi-rail-block">
            <span className="mono-label">Network view</span>
            <div className="ruzomi-rail-links">
              <Link
                className={`ruzomi-rail-link ${selectedLane === "feed" && selectedChannel === "global" ? "is-active" : ""}`}
                href={globalChannel.href}
              >
                <Sparkles aria-hidden="true" size={16} />
                <span>Global feed</span>
                {globalChannel.unreadCount ? <small>{globalChannel.unreadCount}</small> : null}
              </Link>
              <Link
                className={`ruzomi-rail-link ${selectedLane === "direct" ? "is-active" : ""}`}
                href={directChannel.href}
              >
                <MessageCircleMore aria-hidden="true" size={16} />
                <span>Direct Sparks</span>
                {directChannel.unreadCount ? <small>{directChannel.unreadCount}</small> : null}
              </Link>
              <Link
                className={`ruzomi-rail-link ${selectedLane === "artifacts" ? "is-active" : ""}`}
                href={artifactChannel.href}
              >
                <ShieldCheck aria-hidden="true" size={16} />
                <span>Artifacts</span>
                {artifactChannel.unreadCount ? <small>{artifactChannel.unreadCount}</small> : null}
              </Link>
            </div>
          </div>

          <div className="ruzomi-rail-block">
            <span className="mono-label">Joined channels</span>
            <div className="ruzomi-rail-links">
              {marketChannels.map((channel) => (
                <Link
                  key={channel.id}
                  className={`ruzomi-rail-link ${selectedLane === "feed" && selectedChannel === channel.slug ? "is-active" : ""}`}
                  href={channel.href}
                >
                  <Hash aria-hidden="true" size={16} />
                  <span>{channel.title}</span>
                  {channel.unreadCount ? <small>{channel.unreadCount}</small> : null}
                </Link>
              ))}
            </div>
          </div>

          <div className="ruzomi-rail-footer">
            <BrandMark />
            <p>Joined commitment markets become your live channels inside Ruzomi.</p>
          </div>
        </aside>

        <main className="ruzomi-main">
          <div className="ruzomi-topbar">
            <label className="docs-experience-search ruzomi-search">
              <Sparkles aria-hidden="true" size={18} />
              <input aria-label="Search the Pulse of Potential" placeholder="Search the Pulse of Potential..." type="search" />
            </label>

            <div className="ruzomi-topbar-actions">
              <Link className="ruzomi-topbar-link" href={buildRuzomiHref({ lane: "feed" })}>
                <Radio aria-hidden="true" size={16} />
                Global
              </Link>
              <Link className="ruzomi-topbar-link" href={directChannel.href}>
                <MessageCircleMore aria-hidden="true" size={16} />
                Direct Sparks
              </Link>
              {walletState.viewer ? (
                <ProfilePeekLink
                  badges={["You"]}
                  className="ruzomi-profile-peek"
                  contextLabel="Ruzomi"
                  displayName={walletState.viewer.displayName}
                  handle={walletState.viewer.handle}
                  stats={[{ label: "Cash", value: walletState.wallet.availableLabel }]}
                  triggerClassName="ruzomi-profile-pill"
                  variant="pill"
                />
              ) : (
                <Link className="ruzomi-topbar-link" href="/login?next=%2Fruzomi">
                  <Bell aria-hidden="true" size={16} />
                  Log in to post
                </Link>
              )}
            </div>
          </div>

          <div className="ruzomi-layout">
            <section className="ruzomi-feed-column">
              <header className="section-stack section-stack-tight">
                <span className="mono-label">{activeSummary.eyebrow}</span>
                <h1 className="ruzomi-title">
                  {selectedLane === "feed"
                    ? selectedChannel === "global"
                      ? "YOUR SPARK FEED"
                      : activeSummary.title
                    : activeSummary.title}
                </h1>
                <p className="detail-text ruzomi-subtitle">{activeSummary.body}</p>
              </header>

              {!walletState.viewer ? (
                <div className="docs-ai-lock-card">
                  <div className="section-stack section-stack-tight">
                    <strong>
                      {selectedLane === "direct"
                        ? "Direct Sparks open after you create your account."
                        : "Read the network first. Posting unlocks after you create your account."}
                    </strong>
                    <p className="detail-text">
                      Guests can read public feed items and joined-market channels, but posting, reacting, replies,
                      polls, and direct Sparks stay behind account access.
                    </p>
                  </div>
                  <div className="button-row docs-ai-actions">
                    <Link className="action-primary" href="/login?next=%2Fruzomi">
                      Log in
                    </Link>
                    <Link className="action-secondary" href="/signup?next=%2Fruzomi">
                      Sign up
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {quickstartState && !quickstartState.isComplete ? (
                    <QuickstartCompactCard className="ruzomi-quickstart-card" state={quickstartState} />
                  ) : null}

                  {spotlightCard ? (
                    <div className="ruzomi-share-spotlight glass-panel">
                      <div className="section-stack section-stack-tight">
                        <span className="mono-label">Artifact ready</span>
                        <strong>{spotlightCard.title}</strong>
                        <p className="detail-text">
                          Save the artifact, move it into Ruzomi, or use the external payload with the hardware-signed
                          close already attached.
                        </p>
                      </div>
                      <div className="button-row">
                        <a className="action-primary" href={spotlightCard.downloadPath}>
                          Save Artifact
                        </a>
                        <a className="action-secondary" href={`#artifact-${spotlightCard.ticketId}`}>
                          Open in feed
                        </a>
                      </div>
                    </div>
                  ) : null}

                  <div className="ruzomi-composer-card">
                    <div className="ruzomi-composer-head">
                      <strong>
                        {selectedLane === "direct"
                          ? "Direct spark route"
                          : selectedLane === "artifacts"
                            ? "Artifact share route"
                            : selectedMarket
                              ? `Posting in ${selectedMarket.title}`
                              : "Share to Spark"}
                      </strong>
                      <span className="mono-label">
                        {selectedLane === "direct"
                          ? activeDirectThread
                            ? `Keep the thread with ${activeDirectThread.authorName} live without leaving the network.`
                            : "Open a direct thread once the next direct spark arrives."
                          : selectedLane === "artifacts"
                            ? "Artifacts stay ready to save, move into Ruzomi, or carry out through the external payload."
                            : selectedMarket
                              ? `This lane is scoped to ${selectedMarket.category} and the ${selectedMarket.title} channel.`
                              : "GIFs, reactions, replies, and market updates stay live here."}
                      </span>
                    </div>
                    <div className="ruzomi-composer-actions">
                      <Link
                        className="action-primary"
                        href={
                          selectedLane === "artifacts"
                            ? artifactChannel.href
                            : selectedLane === "direct"
                              ? directChannel.href
                              : buildRuzomiHref({ lane: "feed", channel: selectedMarket?.slug ?? "global", shareTicketId })
                        }
                      >
                        {selectedLane === "artifacts" ? "Open artifact shelf" : selectedLane === "direct" ? "Stay in direct sparks" : "Stay in this channel"}
                      </Link>
                      <Link className="action-secondary" href={directChannel.href}>
                        <SendHorizontal aria-hidden="true" size={14} />
                        Direct spark
                      </Link>
                    </div>
                  </div>
                </>
              )}

              {selectedLane === "direct" ? (
                walletState.viewer ? (
                  <div className="ruzomi-direct-grid">
                    <div className="ruzomi-direct-list">
                      {directSparkThreads.length ? (
                        directSparkThreads.map((thread) => (
                          <Link
                            key={thread.handle}
                            className={`ruzomi-direct-item ${activeDirectThread?.handle === thread.handle ? "is-active" : ""}`}
                            href={buildRuzomiHref({ lane: "direct", dm: thread.handle, shareTicketId })}
                          >
                            <div>
                              <ProfilePeekLink
                                badges={["Direct spark"]}
                                className="ruzomi-direct-profile"
                                contextLabel="Direct spark"
                                displayName={thread.authorName}
                                handle={thread.handle}
                                presenceStatus={thread.presenceStatus ?? "online"}
                                stats={[{ label: "Unread", value: String(thread.unreadCount) }]}
                                triggerClassName="ruzomi-direct-author"
                              />
                              <p>@{thread.handle} · {formatPresence(thread.presenceStatus)}</p>
                            </div>
                            <small>{thread.createdAt}</small>
                            <p>{thread.preview}</p>
                            {thread.unreadCount ? <span className="ruzomi-direct-unread">{thread.unreadCount} unread</span> : null}
                          </Link>
                        ))
                      ) : (
                        <div className="ruzomi-empty-card">
                          <strong>Direct sparks appear after the first private thread opens.</strong>
                          <p>Keep moving through joined channels and the next direct spark will land here.</p>
                        </div>
                      )}
                    </div>

                    <div className="ruzomi-active-card">
                      {activeDirectThread ? (
                        <>
                          <div className="section-stack section-stack-tight">
                            <span className="mono-label">Active thread</span>
                            <ProfilePeekLink
                              badges={["Direct spark"]}
                              className="ruzomi-active-profile"
                              contextLabel="Active thread"
                              displayName={activeDirectThread.authorName}
                              handle={activeDirectThread.handle}
                              presenceStatus={activeDirectThread.presenceStatus ?? "online"}
                              stats={[
                                { label: "Messages", value: String(activeDirectThread.messages.length) },
                                { label: "Unread", value: String(activeDirectThread.unreadCount) },
                              ]}
                              triggerClassName="ruzomi-active-author"
                            />
                            <p className="detail-text">@{activeDirectThread.handle} · {formatPresence(activeDirectThread.presenceStatus)}</p>
                          </div>
                          <div className="ruzomi-active-chip-row">
                            <span className="ruzomi-active-chip">{activeDirectThread.createdAt}</span>
                            <span className="ruzomi-active-chip">{activeDirectThread.messages.length} messages</span>
                            <span className="ruzomi-active-chip">
                              {activeDirectThread.unreadCount ? `${activeDirectThread.unreadCount} unread` : "Caught up"}
                            </span>
                          </div>
                          <div className="ruzomi-feed-list">
                            {activeDirectThread.messages.slice(0, 4).map((message) => (
                              <article key={message.id} className="ruzomi-feed-card">
                                <div className="ruzomi-feed-head">
                                  <div>
                                    <ProfilePeekLink
                                      className="ruzomi-feed-profile"
                                      contextLabel={message.poolTitle ?? "Direct spark"}
                                      displayName={message.authorName}
                                      handle={message.authorHandle}
                                      presenceStatus={message.presenceStatus ?? "online"}
                                      stats={[
                                        { label: "Replies", value: String(message.replyCount) },
                                        { label: "Hearts", value: String(message.hearts) },
                                      ]}
                                      triggerClassName="ruzomi-feed-author"
                                    />
                                    <p>{message.createdAt}</p>
                                  </div>
                                  <span className="mono-label">{message.poolTitle ?? "Direct spark"}</span>
                                </div>
                                <p className="ruzomi-feed-body">{message.body}</p>
                              </article>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="ruzomi-empty-card">
                          <strong>Choose a direct spark to open the thread.</strong>
                          <p>The right side of Ruzomi keeps the active conversation live while the left rail stays on your joined markets.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null
              ) : selectedLane === "artifacts" ? (
                resultCards.length ? (
                  <div className="ruzomi-artifact-card glass-panel" id="artifacts">
                    <div className="section-stack section-stack-tight">
                      <span className="mono-label">Artifacts</span>
                      <strong>Sovereign deeds</strong>
                      <p className="detail-text">
                        Save the close, move it into Ruzomi, or keep it ready for the next share.
                      </p>
                    </div>
                    <ResultCardStack
                      activeTicketId={shareTicketId}
                      cards={resultCards}
                      emptyMessage="Artifacts appear after your first close."
                    />
                  </div>
                ) : (
                  <div className="ruzomi-empty-card">
                    <strong>Your first artifact will appear after the first market close.</strong>
                    <p>Completed and missed-result cards will stack here once the next proof closes.</p>
                  </div>
                )
              ) : visibleFeed.length ? (
                <div className="ruzomi-feed-list">
                  {visibleFeed.map((message) => (
                    <article key={message.id} className="ruzomi-feed-card">
                      <div className="ruzomi-feed-head">
                        <div>
                          <ProfilePeekLink
                            activity={message.customActivity?.text}
                            className="ruzomi-feed-profile"
                            contextLabel={message.poolTitle ?? "Global feed"}
                            displayName={message.authorName}
                            handle={message.authorHandle}
                            presenceStatus={message.presenceStatus ?? "online"}
                            stats={[
                              { label: "Replies", value: String(message.replyCount) },
                              { label: "Hearts", value: String(message.hearts) },
                            ]}
                            triggerClassName="ruzomi-feed-author"
                          />
                          <p>
                            @{message.authorHandle} · {formatPresence(message.presenceStatus)}
                          </p>
                        </div>
                        <span className="mono-label">{message.createdAt}</span>
                      </div>
                      <p className="ruzomi-feed-body">{message.body}</p>
                      {message.tenorGifUrl ? (
                        <div className="ruzomi-gif-shell">
                          <Image
                            alt=""
                            fill
                            sizes="(max-width: 768px) 100vw, 360px"
                            src={message.tenorGifUrl}
                            unoptimized
                          />
                        </div>
                      ) : null}
                      <div className="ruzomi-feed-meta">
                        <span>{message.poolTitle ?? "Global feed"}</span>
                        <span>{message.replyCount} replies</span>
                        <span>{message.hearts} hearts</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="ruzomi-empty-card">
                  <strong>No messages have landed in this channel yet.</strong>
                  <p>Keep the lane open. The next joined-market update will appear here without leaving Ruzomi.</p>
                </div>
              )}

              {selectedLane !== "artifacts" && resultCards.length ? (
                <div className="ruzomi-artifact-card glass-panel" id="artifacts">
                  <div className="section-stack section-stack-tight">
                    <span className="mono-label">Artifacts</span>
                    <strong>Ready to move next</strong>
                    <p className="detail-text">
                      Save the close now or open the full artifact lane when you are ready to post it.
                    </p>
                  </div>
                  <ResultCardStack
                    activeTicketId={shareTicketId}
                    cards={resultCards.slice(0, 2)}
                    emptyMessage="Artifacts appear after your first close."
                  />
                </div>
              ) : null}
            </section>

            <aside className="ruzomi-side-column">
              <div className="ruzomi-side-card">
                <span className="mono-label">{activeSummary.eyebrow}</span>
                <strong>{activeSummary.title}</strong>
                <p>{activeSummary.body}</p>
                <div className="ruzomi-active-chip-row">
                  <span className="ruzomi-active-chip">
                    {selectedLane === "artifacts"
                      ? `${resultCards.length} saved`
                      : selectedLane === "direct"
                        ? `${directSparkThreads.length} threads`
                        : `${visibleFeed.length} live items`}
                  </span>
                  <span className="ruzomi-active-chip">
                    {selectedLane === "feed" && selectedMarket ? selectedMarket.category : "Network live"}
                  </span>
                </div>
              </div>

              <div className="ruzomi-side-card">
                <span className="mono-label">The Commitment Pulse</span>
                <strong>Live commitment highway</strong>
                <div className="ruzomi-pulse-list">
                  {visiblePulseItems.length ? (
                    visiblePulseItems.map((item: MarketFeedItem) => (
                      <div key={item.id} className="ruzomi-pulse-item">
                        <span>{item.body}</span>
                        <small>{item.time}</small>
                      </div>
                    ))
                  ) : (
                    <div className="ruzomi-empty-card">
                      <strong>The pulse is quiet in this lane right now.</strong>
                      <p>Switch back to the global feed to watch the next live commitment update land.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="ruzomi-side-card">
                <span className="mono-label">Hardware-signed wins</span>
                <strong>Latest verified artifacts</strong>
                <div className="ruzomi-win-list">
                  {highlightedWins.length ? (
                    highlightedWins.map((message) => (
                      <div key={message.id} className="ruzomi-win-item">
                        <ShieldCheck aria-hidden="true" size={16} />
                        <div>
                          <ProfilePeekLink
                            badges={["Verified close"]}
                            className="ruzomi-win-profile"
                            contextLabel={message.poolTitle ?? "Artifact lane"}
                            displayName={message.authorName}
                            handle={message.authorHandle}
                            presenceStatus={message.presenceStatus ?? "online"}
                            stats={[{ label: "Hearts", value: String(message.hearts) }]}
                            triggerClassName="ruzomi-win-author"
                          />
                          <p>{message.body}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="ruzomi-win-item">
                      <ShieldCheck aria-hidden="true" size={16} />
                      <div>
                        <strong>Victory artifacts appear here</strong>
                        <p>Completed and missed-result cards will surface in the next artifact pass.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="ruzomi-side-card">
                <span className="mono-label">Joined channels</span>
                <strong>Commitment markets on your rail</strong>
                <div className="ruzomi-channel-list">
                  {marketChannels.map((channel) => (
                    <Link
                      key={channel.id}
                      className={`ruzomi-channel-item ${selectedLane === "feed" && selectedChannel === channel.slug ? "is-active" : ""}`}
                      href={channel.href}
                    >
                      <div>
                        <strong>{channel.title}</strong>
                        <p>{channel.category}</p>
                      </div>
                      <span>{channel.summary.split(" · ")[0]}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <InviteLoopCard
                contactSyncConsent={walletState.contactSyncConsent}
                rewardProgress={walletState.rewardProgress}
                showHelpLink={false}
              />

              <div className="ruzomi-side-card">
                <span className="mono-label">Network counts</span>
                <strong>Live right now</strong>
                <div className="ruzomi-metric-grid">
                  <div className="ruzomi-metric-tile">
                    <span>Commitment Markets</span>
                    <strong>{siteState.livePoolCount.toLocaleString()}</strong>
                  </div>
                  <div className="ruzomi-metric-tile">
                    <span>Live channels</span>
                    <strong>{siteState.liveChannelCount.toLocaleString()}</strong>
                  </div>
                  <div className="ruzomi-metric-tile">
                    <span>Opening next</span>
                    <strong>{siteState.openingCount.toLocaleString()}</strong>
                  </div>
                  <div className="ruzomi-metric-tile">
                    <span>Settling</span>
                    <strong>{siteState.settlingCount.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="ruzomi-side-card">
                <span className="mono-label">Galactus access</span>
                <strong>{galactusAccess.title}</strong>
                <p>{galactusAccess.body}</p>
                {galactusAccess.countdownLabel ? <p className="detail-text">{galactusAccess.countdownLabel}</p> : null}
                <div className="button-row docs-ai-actions">
                  <Link className="action-primary" href={galactusAccess.ctaHref}>
                    {galactusAccess.ctaLabel}
                  </Link>
                  {!galactusAccess.allowed ? (
                    <Link className="action-secondary" href="/quickstart">
                      Open quickstart
                    </Link>
                  ) : (
                    <button className="action-secondary" type="button">
                      <LockKeyhole aria-hidden="true" size={14} />
                      Ask Galactus next
                    </button>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </section>
  );
}
