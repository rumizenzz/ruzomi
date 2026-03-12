"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { buildAuthHref } from "@/lib/auth-flow";
import { useSparkFeed } from "@/components/live-data-hooks";
import { ProfilePeekLink } from "@/components/profile-peek-link";
import type { GifSearchResult } from "@/lib/gif-catalog";
import { getRenderableGifUrl } from "@/lib/media";
import { writePendingMarketDraft } from "@/lib/pending-market-draft";
import { formatVisiblePublicHandle, getVisiblePublicHandle } from "@/lib/public-identity";
import {
  defaultSparkReactions,
  getSparkReactionDisplay,
  normalizeSparkReaction,
  sparkReactionPickerEmojis,
} from "@/lib/spark-reactions";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { AiMarketDraft, SparkReactionName } from "@/lib/types";

type ComposerMode = "message" | "market_idea";
type FeedView = "all" | "ideas" | "gifs" | "unread";
type GifPickerTarget =
  | { type: "composer" }
  | { type: "reply"; messageId: string }
  | null;
type ReactionPickerTarget =
  | { type: "message"; targetId: string }
  | { type: "reply"; targetId: string }
  | null;

const gifQuickSearches = ["Locked in", "Celebrate", "Thinking", "Focus", "Fire", "Momentum"];

function sortVisibleReactions(reactionCounts?: Record<string, number>) {
  const visibleKeys = Object.entries(reactionCounts ?? {})
    .filter(([, count]) => count > 0)
    .map(([reaction]) => reaction);

  const defaultKeys = defaultSparkReactions.map((reaction) => reaction.name).filter((reaction) => visibleKeys.includes(reaction));
  const customKeys = visibleKeys.filter((reaction) => !defaultKeys.includes(reaction)).sort((left, right) => {
    const leftCount = reactionCounts?.[left] ?? 0;
    const rightCount = reactionCounts?.[right] ?? 0;
    return rightCount - leftCount;
  });

  return [...defaultKeys, ...customKeys];
}

export function SparkThread({
  poolSlug,
  title,
  body,
}: {
  poolSlug?: string;
  title: string;
  body: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { messages, setMessages } = useSparkFeed(poolSlug);
  const [feedView, setFeedView] = useState<FeedView>("all");
  const [mode, setMode] = useState<ComposerMode>("message");
  const [draft, setDraft] = useState("");
  const [selectedGifUrl, setSelectedGifUrl] = useState("");
  const [gifPickerTarget, setGifPickerTarget] = useState<GifPickerTarget>(null);
  const [gifSearch, setGifSearch] = useState("");
  const [gifResults, setGifResults] = useState<GifSearchResult[]>([]);
  const [gifLoading, setGifLoading] = useState(false);
  const [gifError, setGifError] = useState<string | null>(null);
  const [pollQuestion, setPollQuestion] = useState("Should this market open?");
  const [pollOptionA, setPollOptionA] = useState("Open it");
  const [pollOptionB, setPollOptionB] = useState("Not yet");
  const [pending, setPending] = useState(false);
  const [ideaPendingId, setIdeaPendingId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replySelectedGifUrls, setReplySelectedGifUrls] = useState<Record<string, string>>({});
  const [replyPendingId, setReplyPendingId] = useState<string | null>(null);
  const [reactionPickerTarget, setReactionPickerTarget] = useState<ReactionPickerTarget>(null);
  const [customReactionInput, setCustomReactionInput] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(() => !supabase);
  const previewGifUrl = useMemo(() => getRenderableGifUrl(selectedGifUrl), [selectedGifUrl]);
  const loginHref = buildAuthHref("login", pathname);
  const signupHref = buildAuthHref("signup", pathname);
  const composerGifPickerOpen = gifPickerTarget?.type === "composer";
  const visibleMessages = useMemo(() => {
    if (feedView === "ideas") {
      return messages.filter((message) => message.messageType === "market_idea");
    }

    if (feedView === "gifs") {
      return messages.filter((message) => Boolean(getRenderableGifUrl(message.tenorGifUrl)));
    }

    if (feedView === "unread") {
      return messages.filter((message) => message.unread);
    }

    return messages;
  }, [feedView, messages]);
  const feedSummary = useMemo(() => {
    const visibleAuthors = new Set(
      messages
        .filter((message) => (message.presenceStatus ?? "online") !== "invisible")
        .map((message) => getVisiblePublicHandle(message.authorHandle) ?? message.authorHandle),
    );

    return {
      onlineNow: visibleAuthors.size,
      liveGifs: messages.filter((message) => Boolean(getRenderableGifUrl(message.tenorGifUrl))).length,
      ideaPolls: messages.filter((message) => message.messageType === "market_idea" || Boolean(message.poll)).length,
      unread: messages.filter((message) => message.unread).length,
    };
  }, [messages]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!mounted) {
        return;
      }

      setIsAuthenticated(Boolean(data.user));
      setAuthReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user));
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!gifPickerTarget) {
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setGifLoading(true);
      setGifError(null);

      try {
        const response = await fetch(`/api/gifs/search?q=${encodeURIComponent(gifSearch)}`, {
          cache: "no-store",
        });
        const json = (await response.json()) as { gifs?: GifSearchResult[] };
        if (!cancelled) {
          setGifResults(json.gifs ?? []);
          setGifLoading(false);
        }
      } catch {
        if (!cancelled) {
          setGifLoading(false);
          setGifError("GIF search is unavailable right now.");
        }
      }
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [gifPickerTarget, gifSearch]);

  function toggleGifPicker(target: Exclude<GifPickerTarget, null>) {
    setGifError(null);
    setGifSearch("");
    setGifPickerTarget((current) => {
      if (!current) {
        return target;
      }

      const currentId = current.type === "reply" ? current.messageId : null;
      const nextId = target.type === "reply" ? target.messageId : null;
      if (current.type === target.type && currentId === nextId) {
        return null;
      }

      return target;
    });
  }

  function chooseGif(url: string) {
    if (!gifPickerTarget) {
      return;
    }

    if (gifPickerTarget.type === "composer") {
      setSelectedGifUrl(url);
    } else {
      setReplySelectedGifUrls((current) => ({
        ...current,
        [gifPickerTarget.messageId]: url,
      }));
    }

    setGifPickerTarget(null);
  }

  function toggleReactionPicker(target: Exclude<ReactionPickerTarget, null>) {
    setCustomReactionInput("");
    setReactionPickerTarget((current) => {
      if (!current) {
        return target;
      }

      if (current.type === target.type && current.targetId === target.targetId) {
        return null;
      }

      return target;
    });
  }

  async function reloadMessages() {
    const query = poolSlug ? `?poolSlug=${encodeURIComponent(poolSlug)}&markRead=1` : "";
    const response = await fetch(`/api/messages${query}`, { cache: "no-store" });
    if (!response.ok) {
      return;
    }

    const json = (await response.json()) as { messages?: typeof messages };
    if (json.messages) {
      setMessages(json.messages);
    }
  }

  function promptSparkLogin(message: string) {
    setNotice(message);
    router.push(loginHref);
  }

  async function publishMessage() {
    if (!isAuthenticated) {
      promptSparkLogin("Log in or sign up to post in Spark.");
      return;
    }

    const bodyText = draft.trim();
    if (!bodyText && !selectedGifUrl) {
      return;
    }

    setPending(true);
    setNotice(null);

    const response = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        poolSlug: poolSlug ?? null,
        body: bodyText,
        tenorGifUrl: selectedGifUrl || null,
        messageType: mode,
        pollQuestion: mode === "market_idea" ? pollQuestion.trim() : null,
        pollOptions: mode === "market_idea" ? [pollOptionA.trim(), pollOptionB.trim()] : [],
      }),
    });
    const json = (await response.json()) as { error?: string; messages?: typeof messages };

    if (!response.ok) {
      if (response.status === 401) {
        setPending(false);
        promptSparkLogin(json.error ?? "Log in or sign up to post in Spark.");
        return;
      }

      setPending(false);
      setNotice(json.error ?? "Unable to publish message.");
      return;
    }

    setPending(false);
    setDraft("");
    setSelectedGifUrl("");
    setGifPickerTarget(null);
    setGifSearch("");
    setNotice(mode === "market_idea" ? "Market idea posted." : "Message published.");
    if (json.messages) {
      setMessages(json.messages);
    }
  }

  async function toggleReaction(targetId: string, reaction: SparkReactionName, targetType: "message" | "reply" = "message") {
    if (!isAuthenticated) {
      promptSparkLogin("Log in or sign up to react in Spark.");
      return;
    }

    const response = await fetch("/api/messages/reactions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        targetType,
        targetId,
        reaction,
      }),
    });

    if (response.status === 401) {
      const json = (await response.json()) as { error?: string };
      promptSparkLogin(json.error ?? "Log in or sign up to react in Spark.");
      return;
    }

    void reloadMessages();
  }

  async function submitCustomReaction(targetId: string, targetType: "message" | "reply") {
    const reaction = normalizeSparkReaction(customReactionInput);
    if (!reaction) {
      setNotice("Choose an emoji reaction to post.");
      return;
    }

    setNotice(null);
    await toggleReaction(targetId, reaction, targetType);
    setCustomReactionInput("");
    setReactionPickerTarget(null);
  }

  async function voteOnPoll(messageId: string, optionId: string) {
    if (!isAuthenticated) {
      promptSparkLogin("Log in or sign up to vote in Spark.");
      return;
    }

    setNotice(null);

    const response = await fetch("/api/messages/polls", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        messageId,
        optionId,
      }),
    });

    const json = (await response.json()) as { error?: string };
    if (!response.ok) {
      if (response.status === 401) {
        promptSparkLogin(json.error ?? "Log in or sign up to vote in Spark.");
        return;
      }

      setNotice(json.error ?? "Unable to record that vote.");
      return;
    }

    void reloadMessages();
  }

  async function publishReply(messageId: string) {
    if (!isAuthenticated) {
      promptSparkLogin("Log in or sign up to reply in Spark.");
      return;
    }

    const body = replyDrafts[messageId]?.trim();
    const tenorGifUrl = replySelectedGifUrls[messageId] ?? "";
    if (!body && !tenorGifUrl) {
      return;
    }

    setReplyPendingId(messageId);
    setNotice(null);

    const response = await fetch("/api/messages/replies", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        messageId,
        body: body ?? "",
        tenorGifUrl: tenorGifUrl || null,
      }),
    });

    const json = (await response.json()) as { error?: string; messages?: typeof messages };

    if (!response.ok) {
      if (response.status === 401) {
        setReplyPendingId(null);
        promptSparkLogin(json.error ?? "Log in or sign up to reply in Spark.");
        return;
      }

      setReplyPendingId(null);
      setNotice(json.error ?? "Unable to post reply.");
      return;
    }

    setReplyPendingId(null);
    setReplyDrafts((current) => ({ ...current, [messageId]: "" }));
    setReplySelectedGifUrls((current) => ({ ...current, [messageId]: "" }));
    setGifPickerTarget((current) => (current?.type === "reply" && current.messageId === messageId ? null : current));
    setReplyingTo(null);
    setNotice("Reply posted.");
    if (json.messages) {
      setMessages(json.messages);
    }
  }

  async function draftFromIdea(message: (typeof messages)[number]) {
    if (!isAuthenticated) {
      promptSparkLogin("Log in or sign up to draft a market from Spark.");
      return;
    }

    setIdeaPendingId(message.id);
    setNotice(null);

    const response = await fetch("/api/ai/market-draft", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        prompt: message.body,
      }),
    });

    const json = (await response.json()) as { error?: string; draft?: AiMarketDraft };

    if (!response.ok || !json.draft) {
      setIdeaPendingId(null);
      setNotice(json.error ?? "Unable to draft that market.");
      return;
    }

    const draft = {
      ...json.draft,
      sourceMessageId: message.id,
      originCredit: message.originCredit ?? {
        handle: message.authorHandle,
        displayName: message.authorName,
        label: "Started by",
      },
    } satisfies AiMarketDraft;

    writePendingMarketDraft(draft, "forge");
    setIdeaPendingId(null);

    if (draft.id.startsWith("public-")) {
      router.push(buildAuthHref("signup", "/app/pools/new?resumeDraft=1"));
      return;
    }

    router.push("/app/pools/new");
  }

  return (
    <div className="section-stack spark-thread-shell">
      <div className="section-stack">
        <span className="eyebrow">Spark</span>
        <h2 className="section-title">{title}</h2>
        <p className="section-copy">{body}</p>
        <div className="spark-feed-summary">
          <div className="spark-feed-stat">
            <span>Online now</span>
            <strong>{feedSummary.onlineNow}</strong>
          </div>
          <div className="spark-feed-stat">
            <span>Live GIFs</span>
            <strong>{feedSummary.liveGifs}</strong>
          </div>
          <div className="spark-feed-stat">
            <span>Idea polls</span>
            <strong>{feedSummary.ideaPolls}</strong>
          </div>
          {isAuthenticated ? (
            <div className="spark-feed-stat">
              <span>Unread</span>
              <strong>{feedSummary.unread}</strong>
            </div>
          ) : null}
        </div>
        <div className="spark-filter-row">
          <button
            className={`spark-filter-chip ${feedView === "all" ? "is-active" : ""}`}
            onClick={() => setFeedView("all")}
            type="button"
          >
            All
            <strong>{messages.length}</strong>
          </button>
          <button
            className={`spark-filter-chip ${feedView === "ideas" ? "is-active" : ""}`}
            onClick={() => setFeedView("ideas")}
            type="button"
          >
            Ideas
            <strong>{messages.filter((message) => message.messageType === "market_idea").length}</strong>
          </button>
          <button
            className={`spark-filter-chip ${feedView === "gifs" ? "is-active" : ""}`}
            onClick={() => setFeedView("gifs")}
            type="button"
          >
            GIFs
            <strong>{messages.filter((message) => Boolean(getRenderableGifUrl(message.tenorGifUrl))).length}</strong>
          </button>
          {isAuthenticated ? (
            <button
              className={`spark-filter-chip ${feedView === "unread" ? "is-active" : ""}`}
              onClick={() => setFeedView("unread")}
              type="button"
            >
              Unread
              <strong>{messages.filter((message) => message.unread).length}</strong>
            </button>
          ) : null}
        </div>
      </div>

      <div className="spark-composer-shell">
        {!isAuthenticated && authReady ? (
          <div className="spark-access-banner">
            <div className="section-stack section-stack-tight">
              <strong>Log in to join Spark</strong>
              <p className="detail-text">
                Posting, replies, reactions, votes, and GIF uploads stay locked until your account is live.
              </p>
            </div>
            <div className="button-row button-row-tight">
              <Link className="action-primary" href={loginHref}>
                Log in
              </Link>
              <Link className="action-secondary" href={signupHref}>
                Sign up
              </Link>
            </div>
          </div>
        ) : null}

        {isAuthenticated ? (
          <>
            <div className="spark-composer-modes">
              <button
                className={`spark-mode-button ${mode === "message" ? "is-active" : ""}`}
                onClick={() => setMode("message")}
                type="button"
              >
                Update
              </button>
              <button
                className={`spark-mode-button ${mode === "market_idea" ? "is-active" : ""}`}
                onClick={() => setMode("market_idea")}
                type="button"
              >
                Market idea
              </button>
            </div>

            <div className="field-stack">
              <label className="sr-only" htmlFor={`spark-message-${poolSlug ?? "global"}`}>
                Message
              </label>
              <textarea
                id={`spark-message-${poolSlug ?? "global"}`}
                className="spark-composer"
                onChange={(event) => setDraft(event.target.value)}
                placeholder={
                  mode === "market_idea"
                    ? "Post the market you want PayToCommit to draft."
                    : poolSlug
                      ? "Post an update for this market"
                      : "Post an update to Spark"
                }
                rows={4}
                value={draft}
              />
            </div>

            <div className="spark-composer-row">
              <div className="spark-gif-toolbar">
                <button
                  className={`spark-mode-button ${composerGifPickerOpen ? "is-active" : ""}`}
                  onClick={() => toggleGifPicker({ type: "composer" })}
                  type="button"
                >
                  {composerGifPickerOpen ? "Close GIFs" : "Add GIF"}
                </button>
                {selectedGifUrl ? (
                  <button className="spark-mode-button" onClick={() => setSelectedGifUrl("")} type="button">
                    Remove GIF
                  </button>
                ) : null}
              </div>

              {mode === "market_idea" ? (
                <div className="spark-poll-builder">
                  <input
                    className="shell-search-input spark-inline-input"
                    onChange={(event) => setPollQuestion(event.target.value)}
                    placeholder="Poll question"
                    type="text"
                    value={pollQuestion}
                  />
                  <div className="spark-poll-option-row">
                    <input
                      className="shell-search-input spark-inline-input"
                      onChange={(event) => setPollOptionA(event.target.value)}
                      placeholder="Option one"
                      type="text"
                      value={pollOptionA}
                    />
                    <input
                      className="shell-search-input spark-inline-input"
                      onChange={(event) => setPollOptionB(event.target.value)}
                      placeholder="Option two"
                      type="text"
                      value={pollOptionB}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {composerGifPickerOpen ? (
              <div className="spark-gif-picker">
                <div className="field-stack spark-inline-field">
                  <label className="sr-only" htmlFor={`spark-gif-search-${poolSlug ?? "global"}`}>
                    Search GIFs
                  </label>
                  <input
                    id={`spark-gif-search-${poolSlug ?? "global"}`}
                    className="shell-search-input spark-inline-input"
                    onChange={(event) => setGifSearch(event.target.value)}
                    placeholder="Search GIFs"
                    type="search"
                    value={gifSearch}
                  />
                </div>

                <div className="spark-gif-picker-meta">
                  <span>{gifLoading ? "Searching GIFs..." : gifSearch ? `${gifResults.length} results` : "Search or pick a live GIF"}</span>
                  {gifError ? <span>{gifError}</span> : null}
                </div>

                <div className="spark-gif-chip-row">
                  {gifQuickSearches.map((query) => (
                    <button
                      key={query}
                      className={`spark-gif-chip ${gifSearch === query ? "is-active" : ""}`}
                      onClick={() => setGifSearch(query)}
                      type="button"
                    >
                      {query}
                    </button>
                  ))}
                </div>

                <div className="spark-gif-results">
                  {gifResults.map((gif) => (
                    <button
                      key={gif.id}
                      className={`spark-gif-choice ${selectedGifUrl === gif.previewUrl ? "is-active" : ""}`}
                      onClick={() => chooseGif(gif.previewUrl)}
                      type="button"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt={gif.title} src={gif.previewUrl} />
                      <span>{gif.title}</span>
                    </button>
                  ))}
                </div>

                {!gifLoading && !gifResults.length ? (
                  <div className="spark-gif-empty">No GIFs found. Try another search.</div>
                ) : null}
              </div>
            ) : null}

            {previewGifUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="spark-composer-gif-preview" src={previewGifUrl} />
            ) : null}

            <div className="action-row">
              <button className="action-primary" disabled={pending} onClick={publishMessage} type="button">
                {pending ? "Posting..." : mode === "market_idea" ? "Post market idea" : "Post to Spark"}
              </button>
            </div>
          </>
        ) : null}

        {notice ? <div className="form-notice">{notice}</div> : null}
      </div>

      <div className="feed-list spark-feed-list">
        {visibleMessages.length ? visibleMessages.map((message) => {
          const gif = getRenderableGifUrl(message.tenorGifUrl);
          const visibleHandle = getVisiblePublicHandle(message.authorHandle);
          const handle = formatVisiblePublicHandle(message.authorHandle);
          const visibleReactionKeys = sortVisibleReactions(message.reactionCounts);
          const messageReactionPickerOpen =
            reactionPickerTarget?.type === "message" && reactionPickerTarget.targetId === message.id;

          return (
            <div key={message.id} className={`feed-item spark-feed-item ${message.messageType === "market_idea" ? "spark-feed-item-idea" : ""}`}>
              <div className="section-stack">
                <div className="row-between spark-feed-head">
                  <div className="spark-author-row">
                    <span className={`spark-presence spark-presence-${message.presenceStatus ?? "online"}`} />
                    <div className="section-stack section-stack-tight">
                      {visibleHandle ? (
                        <ProfilePeekLink
                          activity={message.customActivity?.text}
                          badges={message.messageType === "market_idea" ? ["Market idea"] : undefined}
                          className="spark-author-peek"
                          contextLabel={message.poolTitle ?? "Spark"}
                          displayName={message.authorName}
                          handle={visibleHandle}
                          presenceStatus={message.presenceStatus ?? "online"}
                          stats={[
                            { label: "Replies", value: String(message.replyCount) },
                            { label: "Hearts", value: String(message.hearts) },
                          ]}
                          triggerClassName="spark-author-link"
                        />
                      ) : (
                        <span className="spark-author-name">{message.authorName}</span>
                      )}
                      <div className="surface-meta surface-meta-wrap">
                        {handle ? <span>{handle}</span> : null}
                        <span className={`spark-presence-label spark-presence-${message.presenceStatus ?? "online"} spark-presence-chip`}>
                          {message.presenceStatus === "dnd" ? "Do Not Disturb" : message.presenceStatus ?? "online"}
                        </span>
                      </div>
                      {message.customActivity?.text ? (
                        <div className="spark-activity-chip">
                          <span className="spark-activity-chip-label">Now</span>
                          <strong>{message.customActivity.text}</strong>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="surface-meta surface-meta-wrap">
                    {message.messageType === "market_idea" ? <span className="metric-chip">Idea</span> : null}
                    <span>{message.createdAt}</span>
                  </div>
                </div>

                {message.body ? <p className="detail-text spark-feed-body">{message.body}</p> : null}

                {message.originCredit ? (
                  <div className="spark-origin-credit">
                    <span>{message.originCredit.label}</span>
                    <strong>{message.originCredit.displayName}</strong>
                  </div>
                ) : null}

                {gif ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="" className="spark-gif spark-gif-native" src={gif} />
                ) : null}

                {message.poll ? (
                  <div className="spark-poll-card">
                    <div className="section-stack section-stack-tight">
                      <strong>{message.poll.question}</strong>
                      <span className="muted-text">{message.poll.totalVotes} votes</span>
                    </div>
                    <div className="spark-poll-options">
                      {message.poll.options.map((option) =>
                        isAuthenticated ? (
                          <button
                            key={option.id}
                            className={`spark-poll-option ${option.viewerSelected ? "is-active" : ""}`}
                            onClick={() => void voteOnPoll(message.id, option.id)}
                            disabled={Boolean(message.poll?.viewerHasVoted)}
                            aria-pressed={option.viewerSelected ?? false}
                            type="button"
                          >
                            <span>{option.label}</span>
                            <div className="spark-poll-option-meta">
                              {option.viewerSelected ? <em>Voted</em> : null}
                              <strong>{option.votes}</strong>
                            </div>
                          </button>
                        ) : (
                          <div key={option.id} className="spark-poll-option spark-poll-option-static">
                            <span>{option.label}</span>
                            <div className="spark-poll-option-meta">
                              <strong>{option.votes}</strong>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                    {!isAuthenticated ? (
                      <div className="spark-inline-auth-callout">
                        <Link className="inline-link" href={loginHref}>
                          Log in to vote
                        </Link>
                        <span className="muted-text">or</span>
                        <Link className="inline-link" href={signupHref}>
                          create your account
                        </Link>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="surface-meta surface-meta-wrap spark-reaction-row">
                  {message.poolTitle ? <span>{message.poolTitle}</span> : <span>Spark</span>}
                  <span>{message.replyCount} replies</span>
                  {isAuthenticated ? (
                    <>
                      <div className="spark-inline-actions">
                        <button
                          className="spark-secondary-action"
                          onClick={() => {
                            setReplyingTo((current) => (current === message.id ? null : message.id));
                          }}
                          type="button"
                        >
                          {replyingTo === message.id ? "Close reply" : "Reply"}
                        </button>
                      {message.messageType === "market_idea" ? (
                          <button
                            className="spark-secondary-action"
                            disabled={ideaPendingId === message.id}
                            onClick={() => void draftFromIdea(message)}
                            type="button"
                          >
                            {ideaPendingId === message.id ? "Drafting..." : "Draft this idea"}
                          </button>
                        ) : null}
                        <button
                          className="spark-secondary-action"
                          disabled={!isAuthenticated}
                          onClick={() => toggleReactionPicker({ type: "message", targetId: message.id })}
                          type="button"
                        >
                          {messageReactionPickerOpen ? "Close reactions" : "Add reaction"}
                        </button>
                      </div>
                      {visibleReactionKeys.map((reaction) => {
                        const count = message.reactionCounts?.[reaction] ?? 0;
                        const isActive = message.viewerReactions?.includes(reaction) ?? false;
                        const display = getSparkReactionDisplay(reaction);

                        return (
                          <button
                            key={reaction}
                            className={`spark-reaction-button spark-reaction-pill ${isActive ? "is-active" : ""}`}
                            onClick={() => void toggleReaction(message.id, reaction)}
                            aria-pressed={isActive}
                            title={`${display.label} · ${count}`}
                            type="button"
                          >
                            <span className="spark-reaction-glyph" aria-hidden="true">
                              {display.glyph}
                            </span>
                            <span>{count}</span>
                          </button>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      <div className="spark-inline-auth-callout">
                        <Link className="inline-link" href={loginHref}>
                          Log in to join Spark
                        </Link>
                        <span className="muted-text">or</span>
                        <Link className="inline-link" href={signupHref}>
                          sign up
                        </Link>
                      </div>
                      {visibleReactionKeys.map((reaction) => {
                        const count = message.reactionCounts?.[reaction] ?? 0;
                        const display = getSparkReactionDisplay(reaction);

                        return (
                          <span
                            key={reaction}
                            className="spark-reaction-button spark-reaction-pill spark-reaction-static"
                            title={`${display.label} · ${count}`}
                          >
                            <span className="spark-reaction-glyph" aria-hidden="true">
                              {display.glyph}
                            </span>
                            <span>{count}</span>
                          </span>
                        );
                      })}
                    </>
                  )}
                </div>

                {isAuthenticated && messageReactionPickerOpen ? (
                  <div className="spark-reaction-picker">
                    <div className="spark-reaction-picker-grid">
                      {sparkReactionPickerEmojis.map((reaction) => (
                        <button
                          key={`${message.id}-${reaction}`}
                          className="spark-reaction-picker-button"
                          onClick={() => void toggleReaction(message.id, reaction)}
                          type="button"
                        >
                          {reaction}
                        </button>
                      ))}
                    </div>
                    <div className="spark-reaction-custom-row">
                      <input
                        className="shell-search-input spark-inline-input spark-emoji-input"
                        maxLength={12}
                        onChange={(event) => setCustomReactionInput(event.target.value)}
                        placeholder="Add any emoji"
                        type="text"
                        value={customReactionInput}
                      />
                      <button
                        className="spark-secondary-action spark-reaction-add-button"
                        onClick={() => void submitCustomReaction(message.id, "message")}
                        type="button"
                      >
                        <Plus size={14} />
                        Add
                      </button>
                    </div>
                  </div>
                ) : null}

                {replyingTo === message.id ? (
                  <div className="spark-reply-composer">
                    <input
                      className="shell-search-input spark-inline-input"
                      onChange={(event) =>
                        setReplyDrafts((current) => ({
                          ...current,
                          [message.id]: event.target.value,
                        }))
                      }
                      placeholder={`Reply to ${message.authorName}`}
                      type="text"
                      value={replyDrafts[message.id] ?? ""}
                    />
                    <div className="spark-reply-toolbar">
                      <div className="spark-gif-toolbar">
                        <button
                          className={`spark-mode-button ${gifPickerTarget?.type === "reply" && gifPickerTarget.messageId === message.id ? "is-active" : ""}`}
                          disabled={!isAuthenticated}
                          onClick={() => toggleGifPicker({ type: "reply", messageId: message.id })}
                          type="button"
                        >
                          {gifPickerTarget?.type === "reply" && gifPickerTarget.messageId === message.id ? "Close GIFs" : "Add GIF"}
                        </button>
                        {replySelectedGifUrls[message.id] ? (
                          <button
                            className="spark-mode-button"
                            disabled={!isAuthenticated}
                            onClick={() =>
                              setReplySelectedGifUrls((current) => ({
                                ...current,
                                [message.id]: "",
                              }))
                            }
                            type="button"
                          >
                            Remove GIF
                          </button>
                        ) : null}
                      </div>
                    </div>
                    {gifPickerTarget?.type === "reply" && gifPickerTarget.messageId === message.id ? (
                      <div className="spark-gif-picker">
                        <div className="field-stack spark-inline-field">
                          <label className="sr-only" htmlFor={`spark-reply-gif-search-${message.id}`}>
                            Search GIFs
                          </label>
                          <input
                            id={`spark-reply-gif-search-${message.id}`}
                            className="shell-search-input spark-inline-input"
                            onChange={(event) => setGifSearch(event.target.value)}
                            placeholder="Search GIFs"
                            type="search"
                            value={gifSearch}
                          />
                        </div>
                        <div className="spark-gif-picker-meta">
                          <span>{gifLoading ? "Searching GIFs..." : gifSearch ? `${gifResults.length} results` : "Search or pick a live GIF"}</span>
                          {gifError ? <span>{gifError}</span> : null}
                        </div>
                        <div className="spark-gif-chip-row">
                          {gifQuickSearches.map((query) => (
                            <button
                              key={`${message.id}-${query}`}
                              className={`spark-gif-chip ${gifSearch === query ? "is-active" : ""}`}
                              onClick={() => setGifSearch(query)}
                              type="button"
                            >
                              {query}
                            </button>
                          ))}
                        </div>
                        <div className="spark-gif-results">
                          {gifResults.map((gif) => (
                            <button
                              key={`${message.id}-${gif.id}`}
                              className={`spark-gif-choice ${replySelectedGifUrls[message.id] === gif.previewUrl ? "is-active" : ""}`}
                              onClick={() => chooseGif(gif.previewUrl)}
                              type="button"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img alt={gif.title} src={gif.previewUrl} />
                              <span>{gif.title}</span>
                            </button>
                          ))}
                        </div>
                        {!gifLoading && !gifResults.length ? (
                          <div className="spark-gif-empty">No GIFs found. Try another search.</div>
                        ) : null}
                      </div>
                    ) : null}
                    {replySelectedGifUrls[message.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt=""
                        className="spark-composer-gif-preview spark-reply-gif-preview"
                        src={getRenderableGifUrl(replySelectedGifUrls[message.id]) ?? replySelectedGifUrls[message.id]}
                      />
                    ) : null}
                    <div className="button-row button-row-tight">
                      <button
                        className="action-secondary"
                        onClick={() => setReplyingTo(null)}
                        type="button"
                      >
                        Cancel
                      </button>
                      <button
                        className="action-primary"
                        disabled={!isAuthenticated || replyPendingId === message.id}
                        onClick={() => void publishReply(message.id)}
                        type="button"
                      >
                        {replyPendingId === message.id ? "Posting..." : "Post reply"}
                      </button>
                    </div>
                  </div>
                ) : null}

                {message.replies?.length ? (
                  <div className="spark-replies">
                    {message.replies.slice(0, 2).map((reply) => (
                      <div key={reply.id} className="spark-reply">
                        <div className="row-between">
                          <strong>{reply.authorName}</strong>
                          <div className="spark-reply-meta">
                            <span className="muted-text">{reply.createdAt}</span>
                          </div>
                        </div>
                        {reply.body ? <p className="detail-text">{reply.body}</p> : null}
                        {reply.tenorGifUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt=""
                            className="spark-gif spark-gif-native"
                            src={getRenderableGifUrl(reply.tenorGifUrl) ?? reply.tenorGifUrl}
                          />
                        ) : null}
                        <div className="surface-meta surface-meta-wrap spark-reaction-row spark-reply-reactions">
                          {sortVisibleReactions(reply.reactionCounts).map((reaction) => {
                            const count = reply.reactionCounts?.[reaction] ?? 0;
                            const display = getSparkReactionDisplay(reaction);
                            const isActive = reply.viewerReactions?.includes(reaction) ?? false;

                            return isAuthenticated ? (
                              <button
                                key={`${reply.id}-${reaction}`}
                                className={`spark-reaction-button spark-reaction-pill ${isActive ? "is-active" : ""}`}
                                onClick={() => void toggleReaction(reply.id, reaction, "reply")}
                                aria-pressed={isActive}
                                type="button"
                              >
                                <span className="spark-reaction-glyph" aria-hidden="true">
                                  {display.glyph}
                                </span>
                                <span>{count}</span>
                              </button>
                            ) : (
                              <span key={`${reply.id}-${reaction}`} className="spark-reaction-button spark-reaction-pill spark-reaction-static">
                                <span className="spark-reaction-glyph" aria-hidden="true">
                                  {display.glyph}
                                </span>
                                <span>{count}</span>
                              </span>
                            );
                          })}
                          {isAuthenticated ? (
                            <button
                              className="spark-secondary-action spark-reply-add-reaction"
                              onClick={() => toggleReactionPicker({ type: "reply", targetId: reply.id })}
                              type="button"
                            >
                              {reactionPickerTarget?.type === "reply" && reactionPickerTarget.targetId === reply.id
                                ? "Close reactions"
                                : "Add reaction"}
                            </button>
                          ) : null}
                        </div>
                        {isAuthenticated && reactionPickerTarget?.type === "reply" && reactionPickerTarget.targetId === reply.id ? (
                          <div className="spark-reaction-picker spark-reaction-picker-reply">
                            <div className="spark-reaction-picker-grid">
                              {sparkReactionPickerEmojis.map((reaction) => (
                                <button
                                  key={`${reply.id}-${reaction}`}
                                  className="spark-reaction-picker-button"
                                  onClick={() => void toggleReaction(reply.id, reaction, "reply")}
                                  type="button"
                                >
                                  {reaction}
                                </button>
                              ))}
                            </div>
                            <div className="spark-reaction-custom-row">
                              <input
                                className="shell-search-input spark-inline-input spark-emoji-input"
                                maxLength={12}
                                onChange={(event) => setCustomReactionInput(event.target.value)}
                                placeholder="Add any emoji"
                                type="text"
                                value={customReactionInput}
                              />
                              <button
                                className="spark-secondary-action spark-reaction-add-button"
                                onClick={() => void submitCustomReaction(reply.id, "reply")}
                                type="button"
                              >
                                <Plus size={14} />
                                Add
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          );
        }) : (
          <div className="feed-item spark-feed-item spark-feed-empty">
            <div className="section-stack">
              <strong>
                {feedView === "ideas"
                  ? "No market ideas yet."
                  : feedView === "gifs"
                    ? "No GIF posts yet."
                    : "No unread posts right now."}
              </strong>
              <p className="detail-text">
                {feedView === "unread"
                  ? "You are caught up across this feed."
                  : "Switch views or post the next update to move the feed forward."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
