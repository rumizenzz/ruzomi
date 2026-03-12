"use client";

import { useState } from "react";
import { startTransition } from "react";
import { useRouter } from "next/navigation";

import { buildAuthHref } from "@/lib/auth-flow";
import { useSharedWalletState } from "@/components/live-data-hooks";
import { ResultCardStack } from "@/components/result-card-stack";
import type { AiAppealJob, AiVerificationJob, ResultCard } from "@/lib/types";

export function AutonomousProofConsole() {
  const router = useRouter();
  const walletState = useSharedWalletState();
  const loginHref = buildAuthHref("login", "/app/history");
  const signupHref = buildAuthHref("signup", "/app/history");
  const [selectedTicketId, setSelectedTicketId] = useState(walletState.tickets[0]?.id ?? "");
  const [proofSummary, setProofSummary] = useState("");
  const [proofLinks, setProofLinks] = useState("");
  const [appealReason, setAppealReason] = useState("");
  const [verification, setVerification] = useState<AiVerificationJob | null>(null);
  const [appeal, setAppeal] = useState<AiAppealJob | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const cards: ResultCard[] = walletState.tickets
    .filter((ticket) => ticket.status !== "active")
    .slice(0, 6)
    .map((ticket) => ({
      ticketId: ticket.id,
      type: ticket.status === "completed" ? "completed" : "missed",
      title: ticket.status === "completed" ? "Commitment closed" : "Reset and reload",
      subtitle: ticket.poolTitle,
      summary:
        ticket.status === "completed"
          ? "The autonomous verification engine closed this ticket to completed."
          : "The autonomous verification engine closed this ticket to missed.",
      netResultLabel: ticket.stakeLabel,
      downloadPath: `/api/result-cards/${ticket.id}`,
      createdAt: ticket.joinedAt,
    }));

  if (!walletState.viewer) {
    return (
      <div className="section-stack">
        <section className="split-grid dashboard-secondary-grid">
          <div className="glass-panel">
            <div className="section-stack">
              <span className="eyebrow">AI verify</span>
              <h2 className="section-title">Log in to review proof</h2>
              <p className="section-copy">
                Proof review, second-pass appeals, and closed result cards only unlock after your account is live.
              </p>
            </div>
            <div className="button-row">
              <a className="action-primary" href={loginHref}>
                Log in
              </a>
              <a className="action-secondary" href={signupHref}>
                Sign up
              </a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  async function verifyProof() {
    if (!selectedTicketId || !proofSummary.trim()) {
      setNotice("Select a ticket and describe the proof first.");
      return;
    }

    setPending(true);
    setNotice(null);

    const response = await fetch("/api/ai/verify", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        ticketId: selectedTicketId,
        proofSummary: proofSummary.trim(),
        proofLinks: proofLinks
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      }),
    });
    const json = (await response.json()) as { error?: string; verification?: AiVerificationJob };

    if (!response.ok || !json.verification) {
      if (response.status === 401) {
        setPending(false);
        setNotice(json.error ?? "Log in or sign up to verify proof.");
        router.push("/login?next=/app/history");
        return;
      }

      setPending(false);
      setNotice(json.error ?? "Unable to verify proof.");
      return;
    }

    setPending(false);
    setVerification(json.verification);
    setNotice("Proof routed into the autonomous verification engine.");
    startTransition(() => {
      router.refresh();
    });
  }

  async function submitAppeal() {
    if (!selectedTicketId || !appealReason.trim()) {
      setNotice("Select a ticket and describe the appeal.");
      return;
    }

    setPending(true);
    setNotice(null);

    const response = await fetch("/api/ai/appeal", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        ticketId: selectedTicketId,
        appealReason: appealReason.trim(),
      }),
    });
    const json = (await response.json()) as { error?: string; appeal?: AiAppealJob };

    if (!response.ok || !json.appeal) {
      if (response.status === 401) {
        setPending(false);
        setNotice(json.error ?? "Log in or sign up to rerun an appeal.");
        router.push("/login?next=/app/history");
        return;
      }

      setPending(false);
      setNotice(json.error ?? "Unable to rerun the appeal.");
      return;
    }

    setPending(false);
    setAppeal(json.appeal);
    setNotice("Appeal rerun completed.");
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="section-stack">
      <section className="split-grid dashboard-secondary-grid">
        <div className="glass-panel">
          <div className="section-stack">
            <span className="eyebrow">AI verify</span>
            <h2 className="section-title">Proof review</h2>
            <p className="section-copy">Submit proof text, image links, or video links. The autonomous engine closes the ticket or asks for a clearer packet.</p>
          </div>
          <div className="form-grid">
            <label className="field-stack">
              <span className="field-label">Ticket</span>
              <select className="form-select" onChange={(event) => setSelectedTicketId(event.target.value)} value={selectedTicketId}>
                {walletState.tickets.map((ticket) => (
                  <option key={ticket.id} value={ticket.id}>
                    {ticket.poolTitle} · {ticket.stakeLabel}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="field-stack">
            <span className="field-label">Proof summary</span>
            <textarea
              className="form-textarea"
              onChange={(event) => setProofSummary(event.target.value)}
              placeholder="Describe the proof clearly, including timing and what the evidence shows."
              rows={5}
              value={proofSummary}
            />
          </label>
          <label className="field-stack">
            <span className="field-label">Evidence links</span>
            <textarea
              className="form-textarea"
              onChange={(event) => setProofLinks(event.target.value)}
              placeholder="One image, video, or export URL per line"
              rows={3}
              value={proofLinks}
            />
          </label>
          <div className="button-row">
            <button className="action-primary" disabled={pending} onClick={verifyProof} type="button">
              {pending ? "Verifying..." : "Verify proof"}
            </button>
          </div>
          {notice ? <div className="form-notice">{notice}</div> : null}
          {verification ? (
            <div className="summary-card">
              <span className="mono-label">{verification.model}</span>
              <strong>{verification.outcome}</strong>
              <p className="detail-text">{verification.explanation}</p>
            </div>
          ) : null}
        </div>

        <div className="glass-panel">
          <div className="section-stack">
            <span className="eyebrow">AI appeal</span>
            <h2 className="section-title">Second-pass review</h2>
            <p className="section-copy">Appeals reroute the same ticket through a second verification pass with the new evidence context.</p>
          </div>
          <label className="field-stack">
            <span className="field-label">Appeal reason</span>
            <textarea
              className="form-textarea"
              onChange={(event) => setAppealReason(event.target.value)}
              placeholder="Explain what the first pass missed."
              rows={5}
              value={appealReason}
            />
          </label>
          <div className="button-row">
            <button className="action-primary" disabled={pending} onClick={submitAppeal} type="button">
              {pending ? "Rerunning..." : "Rerun appeal"}
            </button>
          </div>
          {appeal ? (
            <div className="summary-card">
              <span className="mono-label">{appeal.model}</span>
              <strong>{appeal.outcome}</strong>
              <p className="detail-text">{appeal.explanation}</p>
            </div>
          ) : null}
        </div>
      </section>

      <div className="glass-panel">
        <div className="section-stack">
          <span className="eyebrow">Result cards</span>
          <h2 className="section-title">Recent closes</h2>
        </div>
        <ResultCardStack cards={cards} />
      </div>
    </div>
  );
}
