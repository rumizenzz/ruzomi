"use client";

import Link from "next/link";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { BrandLockup, BrandMark } from "@/components/brand-mark";
import { buildAuthHref } from "@/lib/auth-flow";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { PasswordRecoveryState } from "@/lib/types";

const footerLinks = [
  { href: "/docs", label: "Docs AI" },
  { href: "/legal", label: "Legal" },
] as const;

export function PasswordResetScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<PasswordRecoveryState>("idle");
  const [notice, setNotice] = useState<string | null>(null);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const nextPath = searchParams.get("next")?.startsWith("/") ? searchParams.get("next")! : "/app";
  const linkExpired = searchParams.get("status") === "expired";
  const loginHref = buildAuthHref("login", nextPath) + "&reset=1";

  useEffect(() => {
    let active = true;

    async function checkSession() {
      if (!supabase || linkExpired) {
        if (active) {
          setCheckingSession(false);
          setHasRecoverySession(false);
        }
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      setHasRecoverySession(Boolean(data.session));
      setCheckingSession(false);
    }

    void checkSession();

    return () => {
      active = false;
    };
  }, [linkExpired, supabase]);

  async function updatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setStatus("error");
      setNotice("Password reset is unavailable right now.");
      return;
    }

    if (password.length < 8) {
      setStatus("error");
      setNotice("Use at least 8 characters for your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setNotice("The passwords do not match.");
      return;
    }

    setStatus("updating");
    setNotice(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("error");
      setNotice(error.message || "Unable to update your password right now.");
      return;
    }

    setStatus("updated");
    setNotice("Password updated. Log in with your new password to continue.");
  }

  const unavailable = linkExpired || (!checkingSession && !hasRecoverySession);

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
              <h1 className="auth-panel-heading">SET NEW PASSWORD</h1>
              <p className="recovery-status-line">
                Choose a new password for the account tied to this recovery link. Use at least eight characters.
              </p>
            </div>

            {status === "updated" ? (
              <div className="section-stack recovery-unavailable">
                <div className="form-notice is-success">
                  Your password is updated. Continue with the same account and pick up where you left off.
                </div>
                <button className="action-primary auth-submit-stage" onClick={() => router.push(loginHref)} type="button">
                  Continue to login
                </button>
              </div>
            ) : unavailable ? (
              <div className="section-stack section-stack-tight recovery-unavailable">
                <div className="form-notice">
                  This recovery link is no longer available. Request a fresh reset email and open the latest message.
                </div>
                <Link className="action-primary auth-submit-stage" href="/forgot-password">
                  Request a new reset link
                </Link>
              </div>
            ) : (
              <form className="auth-form auth-form-stage" onSubmit={updatePassword}>
                <label className="auth-input-shell">
                  <LockKeyhole aria-hidden="true" className="auth-input-icon" size={18} />
                  <input
                    autoComplete="new-password"
                    className="auth-input auth-input-stage"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="New Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                  />
                </label>

                <label className="auth-input-shell">
                  <LockKeyhole aria-hidden="true" className="auth-input-icon" size={18} />
                  <input
                    autoComplete="new-password"
                    className="auth-input auth-input-stage"
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirm New Password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                  />
                  <button
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    type="button"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </label>

                <button className="action-primary auth-submit auth-submit-stage" disabled={status === "updating"} type="submit">
                  {status === "updating" ? "Updating..." : "Update password"}
                </button>
              </form>
            )}

            {notice && status !== "updated" ? <div className="form-notice">{notice}</div> : null}

            <div className="auth-inline-links">
              <span>Need a different link?</span>
              <Link className="auth-inline-link" href="/forgot-password">
                Send another reset email
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
