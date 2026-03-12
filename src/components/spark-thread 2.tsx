"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

import { useSparkFeed } from "@/components/live-data-hooks";
import { getRenderableGifUrl } from "@/lib/media";

export function SparkThread({
  poolSlug,
  title,
  body,
}: {
  poolSlug?: string;
  title: string;
  body: string;
}) {
  const { messages, setMessages } = useSparkFeed(poolSlug);
  const [draft, setDraft] = useState("");
  const [gifUrl, setGifUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function publishMessage() {
    if (!draft.trim()) {
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
        body: draft.trim(),
        tenorGifUrl: gifUrl.trim() || null,
      }),
    });
    const json = (await response.json()) as { error?: string; messages?: typeof messages };

    if (!response.ok) {
      setPending(false);
      setNotice(json.error ?? "Unable to publish message.");
      return;
    }

    setPending(false);
    setDraft("");
    setGifUrl("");
    setNotice("Message published.");
    if (json.messages) {
      setMessages(json.messages);
    }
  }

  async function toggleHeart(targetId: string) {
    await fetch("/api/messages/reactions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        targetType: "message",
        targetId,
      }),
    });
  }

  return (
    <div className="section-stack">
      <div className="section-stack">
        <span className="eyebrow">Spark</span>
        <h2 className="section-title">{title}</h2>
        <p className="section-copy">{body}</p>
      </div>

      <div className="field-stack">
        <label className="sr-only" htmlFor={`spark-message-${poolSlug ?? "global"}`}>
          Message
        </label>
        <textarea
          id={`spark-message-${poolSlug ?? "global"}`}
          className="spark-composer"
          onChange={(event) => setDraft(event.target.value)}
          placeholder={poolSlug ? "Post an update for this pool" : "Post to Spark"}
          rows={4}
          value={draft}
        />
      </div>
      <div className="field-stack">
        <label className="sr-only" htmlFor={`spark-gif-${poolSlug ?? "global"}`}>
          Tenor GIF URL
        </label>
        <input
          id={`spark-gif-${poolSlug ?? "global"}`}
          className="shell-search-input"
          onChange={(event) => setGifUrl(event.target.value)}
          placeholder="Optional Tenor GIF URL"
          type="url"
          value={gifUrl}
        />
      </div>
      <div className="action-row">
        <button className="action-primary" disabled={pending} onClick={publishMessage} type="button">
          {pending ? "Posting..." : "Post to Spark"}
        </button>
      </div>

      {notice ? <div className="form-notice">{notice}</div> : null}

      <div className="feed-list">
        {messages.map((message) => {
          const gifUrl = getRenderableGifUrl(message.tenorGifUrl);

          return (
            <div key={message.id} className="feed-item">
              <div className="section-stack">
                <div className="row-between">
                  <strong>{message.authorName}</strong>
                  <span className="muted-text">@{message.authorHandle}</span>
                </div>
                <p className="detail-text">{message.body}</p>
                {gifUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="" className="spark-gif" src={gifUrl} />
                ) : null}
                <div className="surface-meta surface-meta-wrap">
                  <span>{message.poolTitle ?? "Spark"}</span>
                  <span>{message.createdAt}</span>
                  <button className="inline-icon-button" onClick={() => void toggleHeart(message.id)} type="button">
                    <Heart size={14} />
                    {message.hearts}
                  </button>
                  <span>{message.replyCount} replies</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
