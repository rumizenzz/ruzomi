import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Syne } from "next/font/google";
import { headers } from "next/headers";
import Script from "next/script";
import { getPublicEnv } from "@/lib/env";
import { getHostModeFromHost } from "@/lib/host-mode";
import "./globals.css";

const displayFont = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const bodyFont = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const payToCommitIcons: Metadata["icons"] = {
  icon: [
    {
      url: "/paytocommit-tab.ico?v=20260309c",
      type: "image/x-icon",
      sizes: "any",
    },
    {
      url: "/paytocommit-tab-32x32.png?v=20260309c",
      type: "image/png",
      sizes: "32x32",
    },
    {
      url: "/paytocommit-tab-16x16.png?v=20260309c",
      type: "image/png",
      sizes: "16x16",
    },
    { url: "/favicon.ico?v=20260309c", sizes: "any" },
  ],
  shortcut: ["/paytocommit-tab.ico?v=20260309c"],
  apple: [
    {
      url: "/apple-touch-icon.png?v=20260309c",
      type: "image/png",
      sizes: "180x180",
    },
  ],
};

const ruzomiIcons: Metadata["icons"] = {
  icon: [
    {
      url: "/ruzomi-tab.svg?v=20260312a",
      type: "image/svg+xml",
      sizes: "any",
    },
    {
      url: "/ruzomi-tab-32x32.png?v=20260312a",
      type: "image/png",
      sizes: "32x32",
    },
  ],
  shortcut: ["/ruzomi-tab.svg?v=20260312a"],
  apple: [
    {
      url: "/ruzomi-apple-touch-icon.png?v=20260312a",
      type: "image/png",
      sizes: "180x180",
    },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const host = (await headers()).get("host");
  const hostMode = getHostModeFromHost(host);

  if (hostMode === "ruzomi") {
    return {
      metadataBase: new URL("https://ruzomi.com"),
      manifest: "/ruzomi.webmanifest?v=20260312a",
      title: {
        default: "Ruzomi - The Network Around Every Commitment Market",
        template: "%s - Ruzomi",
      },
      icons: ruzomiIcons,
      description:
        "Ruzomi is the network around every commitment market, with joined channels, direct sparks, result artifacts, and live follow-through across the markets you care about.",
      keywords: [
        "ruzomi",
        "commitment network",
        "social accountability",
        "commitment channels",
        "direct sparks",
        "result artifacts",
        "follow-through network",
      ],
      openGraph: {
        title: "Ruzomi - The Network Around Every Commitment Market",
        description:
          "Open the live network around commitment markets, follow direct sparks, track result artifacts, and stay inside the channels tied to what you joined.",
        url: "https://ruzomi.com",
        siteName: "Ruzomi",
        type: "website",
        images: [
          {
            url: "/ruzomi-og.png?v=20260312a",
            width: 1200,
            height: 630,
            alt: "Ruzomi social preview",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Ruzomi - The Network Around Every Commitment Market",
        description:
          "The social network for joined markets, direct sparks, result artifacts, and follow-through that stays visible after the stake.",
        images: ["/ruzomi-og.png?v=20260312a"],
      },
    };
  }

  if (hostMode === "platform") {
    return {
      metadataBase: new URL("https://platform.paytocommit.com"),
      title: {
        default: "PayToCommit Platform for Developers",
        template: "%s - PayToCommit Platform",
      },
      icons: payToCommitIcons,
      description:
        "Open the authenticated API workspace for PayToCommit organizations, projects, API keys, usage, workforce rollout, and developer operations.",
      openGraph: {
        title: "PayToCommit Platform for Developers",
        description:
          "The authenticated workspace for projects, API keys, billing, reporting, and enterprise rollout inside PayToCommit.",
        url: "https://platform.paytocommit.com",
        siteName: "PayToCommit Platform",
        type: "website",
        images: [
          {
            url: "/PayToCommit-OpenGraph2.png?v=20260311a",
            width: 2750,
            height: 1536,
            alt: "PayToCommit Platform",
          },
        ],
      },
    };
  }

  if (hostMode === "developers") {
    return {
      metadataBase: new URL("https://developers.paytocommit.com"),
      title: {
        default: "PayToCommit Developers",
        template: "%s - PayToCommit Developers",
      },
      icons: payToCommitIcons,
      description:
        "Reference docs, quickstarts, webhooks, HRS API guidance, and integration patterns for PayToCommit developers.",
      openGraph: {
        title: "PayToCommit Developers",
        description:
          "Docs, quickstarts, API reference, and integration guidance for the PayToCommit developer platform.",
        url: "https://developers.paytocommit.com",
        siteName: "PayToCommit Developers",
        type: "website",
        images: [
          {
            url: "/PayToCommit-OpenGraph2.png?v=20260311a",
            width: 2750,
            height: 1536,
            alt: "PayToCommit Developers",
          },
        ],
      },
    };
  }

  if (hostMode === "status") {
    return {
      metadataBase: new URL("https://status.paytocommit.com"),
      title: {
        default: "PayToCommit Status",
        template: "%s - PayToCommit Status",
      },
      icons: payToCommitIcons,
      description:
        "Track system health, incident history, deployment state, and service performance across PayToCommit.",
      openGraph: {
        title: "PayToCommit Status",
        description:
          "System health and incident visibility across PayToCommit services.",
        url: "https://status.paytocommit.com",
        siteName: "PayToCommit Status",
        type: "website",
        images: [
          {
            url: "/PayToCommit-OpenGraph2.png?v=20260311a",
            width: 2750,
            height: 1536,
            alt: "PayToCommit Status",
          },
        ],
      },
    };
  }

  return {
    metadataBase: new URL("https://paytocommit.com"),
    manifest: "/site.webmanifest?v=20260309c",
    title: {
      default: "PayToCommit - Get Paid To Do What You Said You'll Do",
      template: "%s - PayToCommit",
    },
    icons: payToCommitIcons,
    description:
      "PayToCommit is the commitment market where people put money behind what they said they would do, submit proof by the deadline, and close the loop with a visible result.",
    keywords: [
      "commitment markets",
      "accountability app",
      "habit commitment",
      "daily commitment pools",
      "proof-based commitments",
      "get paid to do what you said you'll do",
      "personal accountability",
      "commitment pool",
    ],
    openGraph: {
      title: "PayToCommit - Get Paid To Do What You Said You'll Do",
      description:
        "Open commitment pools across fitness, work, home, learning, money, and daily life. Join before the deadline, submit proof, and close with a visible result.",
      url: "https://paytocommit.com",
      siteName: "PayToCommit",
      type: "website",
      images: [
        {
          url: "/PayToCommit-OpenGraph2.png?v=20260311a",
          width: 2750,
          height: 1536,
          alt: "PayToCommit social preview",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "PayToCommit - Get Paid To Do What You Said You'll Do",
      description:
        "The commitment market for daily habits, serious goals, proof review, and visible results.",
      images: ["/PayToCommit-OpenGraph2.png?v=20260311a"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const runtimePublicEnv = getPublicEnv();
  const serializedPublicEnv = JSON.stringify(runtimePublicEnv).replace(/</g, "\\u003c");

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
      >
        <Script id="public-env-init" strategy="beforeInteractive">
          {`window.__PAYTOCOMMIT_PUBLIC_ENV__ = ${serializedPublicEnv};`}
        </Script>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (() => {
              const storageKey = "paytocommit-theme";
              const storedTheme = window.localStorage.getItem(storageKey);
              const theme = storedTheme === "dark" || storedTheme === "light"
                ? storedTheme
                : "dark";
              document.documentElement.dataset.theme = theme;
              document.documentElement.style.colorScheme = theme;
            })();
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
