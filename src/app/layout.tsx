import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Syne } from "next/font/google";
import Script from "next/script";
import { getPublicEnv } from "@/lib/env";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://paytocommit.com"),
  manifest: "/site.webmanifest?v=20260309c",
  title: {
    default: "PayToCommit - Get Paid To Do What You Said You'll Do",
    template: "%s - PayToCommit",
  },
  icons: {
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
  },
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
