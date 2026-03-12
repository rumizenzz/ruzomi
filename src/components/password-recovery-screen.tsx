"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { BrandLockup, BrandMark } from "@/components/brand-mark";
import { buildAuthHref } from "@/lib/auth-flow";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { PasswordRecoveryState } from "@/lib/types";

const footerLinks = [
  { href: "/docs", label: "Docs AI" },
  { href: "/legal", label: "Legal" },
] as const;

export function PasswordRecoveryScreen() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [status, setStatus] = useState<PasswordRecoveryState>("idle");
  const [lastSentEmail, setLastSentEmail] = useState<string | null>(null);
  const nextPath = searchParams.get("next")?.startsWith("/") ? searchParams.get("next")! : "/app";
  const loginHref = buildAuthHref("login", nextPath);
  const signupHref = buildAuthHref("signup", nextPath);

  const maskedEmail = useMemo(() => {
    if (!lastSentEmail) {
      return null;
    }

    const [local, domain] = lastSentEmail.split("@");

    if (!local || !domain) {
      return lastSentEmail;
    }

    const visible = local.slice(0, 2);
    return `${visible}${"•".repeat(Math.max(local.length - 2, 2))}@${domain}`;
  }, [lastSentEmail]);

  async function submitRecovery(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setStatus("error");
      setNotice("Password recovery is unavailable right now.");
      return;
    }

    if (!email.trim()) {
      setStatus("error");
      setNotice("Enter the email address tied to your account.");
      return;
    }

    setStatus("sending");
    setNotice(null);

    const redirectTo = `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(nextPath)}`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });

    if (error) {
      setStatus("error");
      setNotice(error.message || "Unable to send a reset email right now.");
      return;
    }

    setLastSentEmail(email.trim());
    setStatus("sent");
    setNotice("Check your email for the reset link, then open the latest message to continue.");
  }

  return (
    <section className="auth-screen recovery-screen">
      <div className="auth-screen-grid recovery-screen-grid">
        <div className="auth-brand-hero">
          <Link aria-label="PayToCommit home" className="auth-brand-link" href="/">
            <BrandLockup />
          </Link>
        </div>

        <div className="auth-panel recovery-panel">
          <div className="auth-panel-glow" aria-hidden="true" />
          <div className="auth-panel-core recovery-panel-core">
            <div className="section-stack section-stack-tight auth-form-head">
              <span className="funding-state-chip">Password</span>
              <h1 className="auth-panel-heading">PASSWORD RECOVERY</h1>
              <p className="recovery-status-line">
                Enter the email tied to your account and send a new reset link to this inbox.
              </p>
            </div>

            {status === "sent" ? (
              <div className="section-stack recovery-unavailable">
                <div className="form-notice is-success">
                  {maskedEmail
                    ? `A reset link was sent to ${maskedEmail}. Open the latest message on this device to choose a new password.`
                    : "Check your email for the latest reset link, then open it on this device to choose a new password."}
                </div>
                <button className="action-primary auth-submit-stage" onClick={() => setStatus("idle")} type="button">
                  Send another link
                </button>
              </div>
            ) : (
              <form className="auth-form auth-form-stage" onSubmit={submitRecovery}>
                <label className="auth-input-shell">
                  <Mail aria-hidden="true" className="auth-input-icon" size={18} />
                  <input
                    autoComplete="email"
                    className="auth-input auth-input-stage"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email Address"
                    type="email"
                    value={email}
                  />
                </label>

                <button className="action-primary auth-submit auth-submit-stage" disabled={status === "sending"} type="submit">
                  {status === "sending" ? "Sending..." : "Send reset link"}
                </button>
              </form>
            )}

            {notice && status !== "sent" ? <div className="form-notice">{notice}</div> : null}

            <div className="auth-inline-links">
              <span>Remembered your password?</span>
              <Link className="auth-inline-link" href={loginHref}>
                Log in
              </Link>
              <span aria-hidden="true">•</span>
              <Link className="auth-inline-link" href={signupHref}>
                Sign up
              </Link>
            </div>
          </div>
        </div>

        <div className="funding-bottom-mark" aria-hidden="true">
          <BrandMark />
        </div>

        <div className="docs-experience-footer">
          {footerLinks.map((link) => (
            <Link key={link.href} className="auth-footer-link" href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
