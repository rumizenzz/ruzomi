"use client";

import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useMemo, useState } from "react";

import { buildHostedHref } from "@/lib/host-links";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type PlatformAuthMode = "login" | "signup";
type PlatformOAuthProvider = "google" | "apple" | "discord";

function normalizeUsernameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "platform_user";
  return localPart
    .trim()
    .replace(/^@+/, "")
    .replace(/[^a-zA-Z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
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

function getProviderIcon(provider: PlatformOAuthProvider) {
  if (provider === "google") {
    return <GoogleMark />;
  }

  if (provider === "apple") {
    return <AppleMark />;
  }

  return <DiscordMark />;
}

function getProviderLabel(provider: PlatformOAuthProvider) {
  if (provider === "google") {
    return "Google";
  }
  if (provider === "apple") {
    return "Apple";
  }
  return "Discord";
}

export function PlatformAuthGate({
  initialMode = "login",
}: {
  initialMode?: PlatformAuthMode;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<PlatformAuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingPasswordSubmit, setPendingPasswordSubmit] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<PlatformOAuthProvider | null>(null);

  async function continueWith(provider: PlatformOAuthProvider) {
    if (!supabase) {
      setNotice("Platform sign-in is unavailable right now.");
      return;
    }

    setPendingProvider(provider);
    setNotice(null);

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/")}`;
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
      setNotice("Platform sign-in is unavailable right now.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setNotice("Enter your email address and password to continue.");
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

      window.location.assign(buildHostedHref("platform"));
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = normalizeUsernameFromEmail(normalizedEmail);
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/")}`;

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
          setNotice(loginError.message || "Account created, but sign-in needs another try.");
          return;
        }

        window.location.assign(buildHostedHref("platform"));
        return;
      }

      const registerJson = (await registerResponse.json().catch(() => null)) as { error?: string; fallbackToEmailSignup?: boolean } | null;
      if (!registerJson?.fallbackToEmailSignup) {
        setPendingPasswordSubmit(false);
        setNotice(registerJson?.error || "Unable to create your platform account right now.");
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
      setNotice(error.message || "Unable to create your platform account right now.");
      return;
    }

    if (data.session) {
      window.location.assign(buildHostedHref("platform"));
      return;
    }

    setNotice("Check your email, confirm the account, then come back to open your platform workspace.");
  }

  const heading = mode === "login" ? "Welcome back" : "Create your platform account";
  const bodyCopy =
    mode === "login"
      ? "Open your API dashboard, organizations, projects, billing, and reporting workspace."
      : "Create a dedicated platform account for projects, keys, usage, billing, and enterprise rollout.";
  const buttonLabel = pendingPasswordSubmit
    ? mode === "login"
      ? "Continuing..."
      : "Creating account..."
    : mode === "login"
      ? "Continue"
      : "Create account";

  return (
    <div className="platform-auth-shell">
      <header className="platform-auth-header platform-auth-header-minimal">
        <Link className="platform-auth-brand" href={buildHostedHref("platform")}>
          <span className="platform-auth-brand-mark">P</span>
          <span className="platform-auth-brand-copy">
            <strong>PayToCommit Platform</strong>
            <small>for Developers</small>
          </span>
        </Link>
      </header>

      <main className="platform-auth-center">
        <section className="platform-auth-card platform-auth-card-compact">
          <div className="platform-auth-chip-row">
            <span className="platform-auth-chip">Platform access</span>
            <Link className="platform-auth-docs-link" href={buildHostedHref("developers")} target="_blank">
              API docs
            </Link>
          </div>

          <div className="platform-auth-copy platform-auth-copy-centered">
            <h1>{heading}</h1>
            <p>{bodyCopy}</p>
          </div>

          <form className="platform-auth-form" onSubmit={(event) => void submitPassword(event)}>
            <label className="platform-auth-field">
              <span>Email address</span>
              <div className="platform-auth-input">
                <Mail size={16} />
                <input
                  autoComplete="email"
                  inputMode="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email address"
                  type="email"
                  value={email}
                />
              </div>
            </label>

            <label className="platform-auth-field">
              <span>Password</span>
              <div className="platform-auth-input">
                <LockKeyhole size={16} />
                <input
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={mode === "login" ? "Password" : "Create password"}
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="platform-auth-visibility"
                  onClick={() => setShowPassword((value) => !value)}
                  type="button"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <button className="platform-auth-primary platform-auth-submit" disabled={pendingPasswordSubmit} type="submit">
              {buttonLabel}
            </button>
          </form>

          <div className="platform-auth-switch">
            <span>{mode === "login" ? "Don't have an account?" : "Already have an account?"}</span>
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")} type="button">
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </div>

          <div className="platform-auth-divider">
            <span>OR</span>
          </div>

          <div className="platform-auth-provider-stack">
            {(["google", "apple", "discord"] as PlatformOAuthProvider[]).map((provider) => (
              <button
                key={provider}
                className="platform-auth-provider"
                disabled={pendingProvider !== null}
                onClick={() => void continueWith(provider)}
                type="button"
              >
                <span className="platform-auth-provider-icon">{getProviderIcon(provider)}</span>
                <span>Continue with {getProviderLabel(provider)}</span>
              </button>
            ))}
          </div>

          {notice ? <p className="platform-auth-notice">{notice}</p> : null}

          <div className="platform-auth-mini-links">
            <Link href={buildHostedHref("developers", "/quickstarts")} target="_blank">
              Quickstarts
            </Link>
            <Link href={buildHostedHref("paytocommit", "/help-center")}>Help</Link>
          </div>

          <div className="platform-auth-footer">
            <Link href={buildHostedHref("paytocommit", "/terms")}>Terms of Use</Link>
            <span>|</span>
            <Link href={buildHostedHref("paytocommit", "/privacy")}>Privacy Policy</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
