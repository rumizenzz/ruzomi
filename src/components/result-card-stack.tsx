"use client";

import { CheckCircle2, Copy, Download, Sparkles, TriangleAlert } from "lucide-react";
import { useState } from "react";

import { buildShareCampaignText } from "@/lib/share-campaign";
import type { ResultCard } from "@/lib/types";

export function ResultCardStack({
  cards,
  emptyMessage = "Result cards will appear after the first market closes.",
  activeTicketId = null,
}: {
  cards: ResultCard[];
  emptyMessage?: string;
  activeTicketId?: string | null;
}) {
  const [notice, setNotice] = useState<string | null>(null);

  if (!cards.length) {
    return <div className="empty-state">{emptyMessage}</div>;
  }

  async function copyShareText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice("Share line copied.");
    } catch {
      setNotice("Copy is unavailable in this browser.");
    }
  }

  async function shareExternally(card: ResultCard) {
    const payload =
      card.externalShareText ??
      buildShareCampaignText(
        "artifact",
        `${card.sparkShareText ?? `${card.title} · ${card.netResultLabel}`} STP hardware-signed proof attached.`,
      );

    try {
      if (navigator.share) {
        await navigator.share({
          title: card.title,
          text: payload,
          url: typeof window !== "undefined" ? `${window.location.origin}${card.downloadPath}` : undefined,
        });
        setNotice("External share opened.");
        return;
      }

      await navigator.clipboard.writeText(payload);
      setNotice("External share payload copied.");
    } catch {
      setNotice("External share is unavailable in this browser.");
    }
  }

  return (
    <div className="section-stack">
      {notice ? <p className="micro-copy">{notice}</p> : null}
      <div className="result-card-grid">
        {cards.map((card) => (
          <article
            id={`artifact-${card.ticketId}`}
            key={card.ticketId}
            className={`result-card result-card-${card.type} ${activeTicketId === card.ticketId ? "is-spotlight" : ""}`.trim()}
          >
            <div className="result-card-chrome">
              <span className="mono-label result-card-state">
                {card.type === "completed" ? "Closed" : "Missed"}
              </span>
              <span className="result-card-icon" aria-hidden="true">
                {card.type === "completed" ? <CheckCircle2 size={18} /> : <TriangleAlert size={18} />}
              </span>
            </div>

            {activeTicketId === card.ticketId ? <span className="result-card-spotlight-pill">Ready to move into Ruzomi</span> : null}

            <div className="section-stack">
              <strong className="result-card-title">{card.title}</strong>
              <p className="detail-text">{card.subtitle}</p>
            </div>

            <div className="result-card-score">
              <div className="section-stack">
                <span className="mono-label">Net result</span>
                <h3>{card.netResultLabel}</h3>
              </div>
              <p className="detail-text">{card.summary}</p>
            </div>

            <div className="surface-meta surface-meta-wrap">
              <span>{card.createdAt}</span>
              <span>STP hardware-signed</span>
              <span>{card.type === "completed" ? "Ready to share" : "Saved to close history"}</span>
            </div>

            <div className="result-card-actions">
              <a className="inline-link result-card-action" href={card.downloadPath}>
                <Download size={16} />
                Save Artifact
              </a>
              <button
                className="result-card-action ghost"
                type="button"
                onClick={() => copyShareText(card.sparkShareText ?? `${card.title} · ${card.netResultLabel}`)}
              >
                <Copy size={16} />
                Copy share line
              </button>
              <a className="result-card-action ghost" href={`/ruzomi?lane=artifacts&share=${card.ticketId}`}>
                <Sparkles size={16} />
                Share to Ruzomi
              </a>
              <button className="result-card-action ghost" onClick={() => shareExternally(card)} type="button">
                <Sparkles size={16} />
                External Share
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
