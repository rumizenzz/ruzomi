"use client";

import Link from "next/link";
import { useState } from "react";

import type { AiDocsAnswer, GalactusAccessState } from "@/lib/types";

const suggestedQuestions = [
  "How does AI proof verification close a market?",
  "How do Chains settle when one leg misses?",
  "When does wallet cash become available after funding?",
];

export function DocsAiAssistant({ access }: { access: GalactusAccessState }) {
  const [question, setQuestion] = useState(suggestedQuestions[0]);
  const [answer, setAnswer] = useState<AiDocsAnswer | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function askQuestion(nextQuestion?: string) {
    const prompt = (nextQuestion ?? question).trim();
    if (!prompt) return;

    setPending(true);
    setNotice(null);

    const response = await fetch("/api/ai/docs", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ question: prompt }),
    });
    const json = (await response.json()) as AiDocsAnswer & { error?: string };

    if (!response.ok) {
      setPending(false);
      setNotice(json.error ?? "Unable to answer that docs question.");
      return;
    }

    setPending(false);
    setQuestion(prompt);
    setAnswer(json);
  }

  return (
    <div className="glass-panel docs-ai-card">
      <div className="section-stack">
        <span className="mono-label">Galactus</span>
        <div className="section-stack docs-ai-head">
          <strong>{access.title}</strong>
          <p className="detail-text">
            Funding, verification, Chains, Spark, API access, and Commitment Network questions route through the published docs corpus.
          </p>
        </div>
      </div>

      {!access.allowed ? (
        <div className="docs-ai-lock-card">
          <div className="section-stack section-stack-tight">
            <strong>{access.body}</strong>
            {access.countdownLabel ? <p className="detail-text">{access.countdownLabel}</p> : null}
          </div>
          <div className="button-row docs-ai-actions">
            <Link className="action-primary" href={access.ctaHref}>
              {access.ctaLabel}
            </Link>
            <Link className="action-secondary" href="/quickstart">
              See quickstart
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="field-stack">
            <label className="sr-only" htmlFor="docs-ai-question">
              Ask Galactus
            </label>
            <textarea
              id="docs-ai-question"
              className="spark-composer docs-ai-input"
              onChange={(event) => setQuestion(event.target.value)}
              rows={4}
              value={question}
            />
          </div>

          <div className="button-row docs-ai-actions">
            <button className="action-primary" disabled={pending} onClick={() => void askQuestion()} type="button">
              {pending ? "Thinking..." : "Ask Galactus"}
            </button>
            {suggestedQuestions.map((item) => (
              <button
                key={item}
                className="action-secondary"
                disabled={pending}
                onClick={() => void askQuestion(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </>
      )}

      {notice ? <div className="form-notice">{notice}</div> : null}

      {answer ? (
        <div className="section-stack docs-ai-answer">
          <div className="summary-card">
            <span className="mono-label">{answer.model}</span>
            <strong>{answer.answer}</strong>
          </div>
          <div className="docs-ai-citations">
            {answer.citations.map((citation) => (
              <a key={`${citation.path}-${citation.sectionId}`} className="docs-ai-citation" href={citation.path}>
                <span>{citation.title}</span>
                <strong>{citation.sectionTitle}</strong>
                <p>{citation.excerpt}</p>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
