"use client";

import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";

import { BrandLockup, BrandMark } from "@/components/brand-mark";
import { buildAuthHref } from "@/lib/auth-flow";
import { readPendingMarketDraft, readPendingMarketDraftRaw } from "@/lib/pending-market-draft";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthMode = "login" | "signup";
type OAuthProvider = "google" | "apple" | "discord";

const authCopy: Record<
  AuthMode,
  {
    heading: string;
    helper?: string;
    submitLabel: string;
    submittingLabel: string;
    switchPrompt: string;
    switchLabel: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    providerLabel: string;
  }
> = {
  login: {
    heading: "WELCOME BACK",
    submitLabel: "Log in",
    submittingLabel: "Logging in...",
    switchPrompt: "New here?",
    switchLabel: "Sign up",
    emailPlaceholder: "Email Address",
    passwordPlaceholder: "Password",
    providerLabel: "Or continue with",
  },
  signup: {
    heading: "CREATE YOUR ACCOUNT",
    helper: "Create the account first. Identity starts only when you add funds or place a live stake.",
    submitLabel: "Create account",
    submittingLabel: "Creating account...",
    switchPrompt: "Already have an account?",
    switchLabel: "Log in",
    emailPlaceholder: "Email Address",
    passwordPlaceholder: "Create Password",
    providerLabel: "Or continue with",
  },
};

const footerLinks = [
  { href: "/docs", label: "Docs AI" },
  { href: "/legal", label: "Legal" },
];

function getProviderLabel(provider: OAuthProvider) {
  if (provider === "google") {
    return "Google";
  }

  if (provider === "apple") {
    return "Apple";
  }

  return "Discord";
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M21.6 12.23c0-.72-.06-1.25-.2-1.8H12v3.47h5.52c-.11.86-.72 2.15-2.07 3.02l-.02.12 2.77 2.1.19.02c1.75-1.58 3.21-3.9 3.21-6.93Z"
        fill="#4285F4"
      />
      <path
        d="M12 21.75c2.7 0 4.97-.87 6.63-2.37l-3.16-2.42c-.85.57-1.99.97-3.47.97-2.64 0-4.88-1.72-5.68-4.1l-.11.01-2.88 2.18-.04.1A10.03 10.03 0 0 0 12 21.75Z"
        fill="#34A853"
      />
      <path
        d="M6.32 13.83A6 6 0 0 1 6 12c0-.64.12-1.25.31-1.83l-.01-.12-2.92-2.21-.1.05A9.7 9.7 0 0 0 2.25 12c0 1.48.36 2.87 1.03 4.1l3.04-2.27Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.07c1.87 0 3.13.79 3.85 1.45l2.81-2.68C16.96 3.36 14.7 2.25 12 2.25a10.03 10.03 0 0 0-8.72 4.64L6.31 9.2C7.12 6.82 9.36 6.07 12 6.07Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16.69 12.62c.03 2.94 2.58 3.92 2.61 3.93-.02.07-.4 1.36-1.32 2.69-.8 1.15-1.64 2.3-2.95 2.32-1.29.03-1.71-.74-3.19-.74-1.48 0-1.95.72-3.17.77-1.27.05-2.24-1.26-3.05-2.4-1.64-2.33-2.89-6.58-1.21-9.45.83-1.43 2.31-2.33 3.92-2.36 1.23-.03 2.39.81 3.19.81.8 0 2.29-.99 3.86-.84.66.03 2.53.26 3.72 1.95-.1.06-2.22 1.28-2.21 3.82ZM14.52 5.86c.67-.8 1.12-1.91.99-3.02-.97.04-2.14.64-2.83 1.43-.62.71-1.17 1.84-1.02 2.92 1.08.08 2.19-.55 2.86-1.33Z" />
    </svg>
  );
}

function DiscordMark() {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.32 4.37A16.9 16.9 0 0 0 16.19 3c-.18.31-.39.73-.53 1.06a15.7 15.7 0 0 0-4.72 0A10.7 10.7 0 0 0 10.4 3a16.75 16.75 0 0 0-4.14 1.37C3.64 8.34 2.93 12.21 3.28 16.03a16.65 16.65 0 0 0 5.07 2.56c.41-.55.77-1.14 1.08-1.76-.59-.22-1.15-.5-1.68-.83.14-.1.27-.2.4-.31 3.24 1.49 6.76 1.49 9.96 0 .13.11.26.21.4.31-.53.33-1.09.61-1.68.83.31.62.67 1.21 1.08 1.76a16.56 16.56 0 0 0 5.08-2.56c.41-4.43-.7-8.26-2.67-11.66ZM9.68 13.68c-.97 0-1.76-.87-1.76-1.95 0-1.08.78-1.95 1.76-1.95.99 0 1.78.88 1.76 1.95 0 1.08-.78 1.95-1.76 1.95Zm4.64 0c-.97 0-1.76-.87-1.76-1.95 0-1.08.78-1.95 1.76-1.95.99 0 1.78.88 1.76 1.95 0 1.08-.77 1.95-1.76 1.95Z" />
    </svg>
  );
}

function getProviderBadge(provider: OAuthProvider) {
  if (provider === "google") {
    return <GoogleMark />;
  }

  if (provider === "apple") {
    return <AppleMark />;
  }

  return <DiscordMark />;
}

export function AuthEntry({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(null);
  const [pendingPasswordSubmit, setPendingPasswordSubmit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const resumeDraftRaw = useSyncExternalStore(
    () => () => {},
    () => readPendingMarketDraftRaw(),
    () => null,
  );
  const resumeDraftRecord = resumeDraftRaw ? readPendingMarketDraft() : null;
  const resumeDraft = Boolean(resumeDraftRecord?.draft);
  const copy = authCopy[mode];
  const resetComplete = searchParams.get("reset") === "1";

  const requestedNext = searchParams.get("next");
  const nextPath =
    requestedNext && requestedNext.startsWith("/")
      ? requestedNext
      : resumeDraft
        ? "/app/pools/new?resumeDraft=1"
        : mode === "signup"
          ? "/app/onboarding"
          : "/app";
  const alternateHref = buildAuthHref(mode === "login" ? "signup" : "login", nextPath);
  const forgotPasswordHref = `/forgot-password?next=${encodeURIComponent(nextPath)}`;
  const authIntent = useMemo(() => {
    if (resumeDraft) {
      return {
        chip: "Saved draft",
        title: "Finish this step and pick up your draft.",
        detail: mode === "signup" ? "Create the account, then reopen the draft." : "Log in, then reopen the draft.",
      };
    }

    if (nextPath.startsWith("/app/wallet/fund")) {
      return {
        chip: "Secure funding",
        title: "Finish this step to continue into funding.",
        detail: "You can choose the deposit method after identity verification starts.",
      };
    }

    if (nextPath.startsWith("/app/verify")) {
      return {
        chip: "Identity check",
        title: "Finish this step to start identity verification.",
        detail: "Legal details and ID capture come next.",
      };
    }

    return {
      chip: mode === "signup" ? "New account" : "Account access",
      title: mode === "signup" ? "Create your account and start exploring." : "Log in and continue where you left off.",
      detail:
        mode === "signup"
          ? "After sign up, you can set interests and discovery preferences first. Identity still waits until funding or a live stake begins."
          : "Your wallet, markets, and results stay tied to this login.",
    };
  }, [mode, nextPath, resumeDraft]);
  const progressSteps = useMemo(() => {
    if (nextPath.startsWith("/app/wallet/fund")) {
      return [
        { label: "Account", state: "complete" },
        { label: "Verify", state: "complete" },
        { label: "Fund", state: "active" },
      ] as const;
    }

    if (nextPath.startsWith("/app/verify")) {
      return [
        { label: "Account", state: "complete" },
        { label: "Verify", state: "active" },
        { label: "Fund", state: "upcoming" },
      ] as const;
    }

    if (mode === "signup") {
      return [
        { label: "Account", state: "active" },
        { label: "Explore", state: "upcoming" },
        { label: "Fund later", state: "upcoming" },
      ] as const;
    }

    return [
      { label: "Account", state: "active" },
      { label: "Explore", state: "upcoming" },
      { label: "Commit", state: "upcoming" },
    ] as const;
  }, [mode, nextPath]);

  async function continueWith(provider: OAuthProvider) {
    if (!supabase) {
      setNotice("Sign-in is unavailable right now.");
      return;
    }

    setPendingProvider(provider);
    setNotice(null);

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams: provider === "google" ? { prompt: "select_account" } : undefined,
      },
    });

    if (error || !data.url) {
      setPendingProvider(null);
      setNotice(`Unable to open ${getProviderLabel(provider)} right now.`);
      return;
    }

    window.location.assign(data.url);
  }

  async function submitPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setNotice("Sign-in is unavailable right now.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setNotice("Enter your email and password to continue.");
      return;
    }

    if (mode === "signup" && !username.trim()) {
      setNotice("Choose a username to continue.");
      return;
    }

    setPendingPasswordSubmit(true);
    setNotice(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      setPendingPasswordSubmit(false);

      if (error) {
        setNotice(error.message || "Unable to log in right now.");
        return;
      }

      router.push(nextPath);
      router.refresh();
      return;
    }

    const normalizedEmail = email.trim();
    const normalizedUsername = username.trim();
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    try {
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          username: normalizedUsername,
        }),
      });

      if (registerResponse.ok) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        setPendingPasswordSubmit(false);

        if (loginError) {
          setNotice(loginError.message || "Account created, but login needs another try.");
          return;
        }

        router.push(nextPath);
        router.refresh();
        return;
      }

      const registerJson = (await registerResponse.json().catch(() => null)) as { error?: string; fallbackToEmailSignup?: boolean } | null;
      if (!registerJson?.fallbackToEmailSignup) {
        setPendingPasswordSubmit(false);
        setNotice(registerJson?.error || "Unable to create your account right now.");
        return;
      }
    } catch {
      // Fall back to email-based signup below when the server-backed path is unavailable.
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo,
        data: {
          preferred_username: normalizedUsername,
          username: normalizedUsername,
          display_name: normalizedUsername,
        },
      },
    });

    setPendingPasswordSubmit(false);

    if (error) {
      setNotice(error.message || "Unable to create your account right now.");
      return;
    }

    if (data.session) {
      router.push(nextPath);
      router.refresh();
      return;
    }

    setNotice("Check your email, confirm the account, then come back here to continue.");
  }

  return (
    <section className={`auth-screen auth-screen-${mode}`}>
      <div className="auth-screen-grid">
        <div className="auth-brand-hero">
          <Link aria-label="PayToCommit home" className="auth-brand-link" href="/">
            <BrandLockup />
          </Link>
        </div>

        <div className="auth-panel">
          <div className="auth-panel-glow" aria-hidden="true" />
          <div className="auth-panel-core">
            <div className="auth-progress-strip" aria-label="Funding flow progress">
              {progressSteps.map((step) => (
                <span
                  key={step.label}
                  className={`auth-progress-chip ${step.state === "active" ? "is-active" : ""} ${step.state === "complete" ? "is-complete" : ""} ${step.state === "upcoming" ? "is-pending" : ""}`}
                >
                  {step.label}
                </span>
              ))}
            </div>

            {resumeDraft ? (
              <div className="auth-resume-strip auth-resume-strip-panel">
                <div className="section-stack section-stack-tight">
                  <span className="mono-label">Saved draft</span>
                  <strong>{resumeDraftRecord?.draft.title ?? "Market draft ready"}</strong>
                  <p className="detail-text">Finish this step and come back to the draft where you left it.</p>
                </div>
                <span className="auth-resume-next">{mode === "signup" ? "Create account to continue" : "Log in to continue"}</span>
              </div>
            ) : null}

            {!resumeDraft ? (
              <div className="auth-intent-strip">
                <span className="funding-state-chip">{authIntent.chip}</span>
                <div className="section-stack section-stack-tight">
                  <strong>{authIntent.title}</strong>
                  <p className="detail-text">{authIntent.detail}</p>
                </div>
              </div>
            ) : null}

            <form className="auth-form auth-form-stage" onSubmit={submitPassword}>
              <div className="section-stack section-stack-tight auth-form-head">
                <h1 className="auth-panel-heading">{copy.heading}</h1>
                {copy.helper ? <p className="detail-text funding-copy funding-copy-compact">{copy.helper}</p> : null}
              </div>

              <label className="auth-input-shell">
                <Mail aria-hidden="true" className="auth-input-icon" size={18} />
                <input
                  autoComplete="email"
                  className="auth-input auth-input-stage"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={copy.emailPlaceholder}
                  type="email"
                  value={email}
                />
              </label>

              {mode === "signup" ? (
                <label className="auth-input-shell">
                  <UserRound aria-hidden="true" className="auth-input-icon" size={18} />
                  <input
                    autoComplete="username"
                    className="auth-input auth-input-stage"
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Unique Username"
                    type="text"
                    value={username}
                  />
                </label>
              ) : null}

              <label className="auth-input-shell">
                <LockKeyhole aria-hidden="true" className="auth-input-icon" size={18} />
                <input
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="auth-input auth-input-stage"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={copy.passwordPlaceholder}
                  type={showPassword ? "text" : "password"}
                  value={password}
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

              <button className="action-primary auth-submit auth-submit-stage" disabled={pendingPasswordSubmit || pendingProvider !== null} type="submit">
                {pendingPasswordSubmit ? copy.submittingLabel : copy.submitLabel}
              </button>

              <p className="auth-inline-note">
                {nextPath.startsWith("/app/wallet/fund")
                  ? "Identity verification unlocks funding and live staking."
                  : nextPath.startsWith("/app/verify")
                    ? "Use the same legal details that appear on your ID."
                    : mode === "signup"
                      ? "You can explore first. Identity starts only when you fund the wallet or place a live stake."
                      : "Use the account tied to your wallet and active markets."}
              </p>
            </form>

            <div className="auth-divider auth-divider-stage">
              <span>{copy.providerLabel}</span>
            </div>

            <div className="auth-provider-grid">
              {(["google", "apple", "discord"] as OAuthProvider[]).map((provider) => (
                <button
                  key={provider}
                  className={`provider-button provider-button-stage provider-button-${provider}`}
                  disabled={pendingPasswordSubmit || pendingProvider !== null}
                  onClick={() => continueWith(provider)}
                  type="button"
                >
                  <span className="provider-badge provider-badge-stage" aria-hidden="true">
                    {getProviderBadge(provider)}
                  </span>
                  <span className="provider-button-label">
                    {pendingProvider === provider ? `Opening ${getProviderLabel(provider)}...` : `Continue with ${getProviderLabel(provider)}`}
                  </span>
                </button>
              ))}
            </div>

            {resetComplete ? <div className="form-notice auth-notice">Password updated. Log in with your new password.</div> : null}
            {notice ? <div className="form-notice auth-notice">{notice}</div> : null}

            <div className="auth-panel-footer">
              <div className="auth-link-row auth-link-row-panel">
                <span>{copy.switchPrompt}</span>
                <Link className="auth-switch-link" href={alternateHref}>
                  {copy.switchLabel}
                </Link>
                {mode === "login" ? (
                  <>
                    <span className="auth-link-separator">|</span>
                    <Link className="auth-switch-link" href={forgotPasswordHref}>
                      Forgot password?
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="auth-screen-footer">
          <div className="auth-bottom-mark" aria-hidden="true">
            <BrandMark />
          </div>

          <div className="auth-footer-links" aria-label="Auth footer links">
            {footerLinks.map((link) => (
              <Link key={link.href} className="auth-footer-link" href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
