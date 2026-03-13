import type { Metadata } from "next";
import { headers } from "next/headers";

import { AuthEntry } from "@/components/auth-entry";
import { PlatformAuthGate } from "@/components/platform-auth-gate";
import { getHostModeFromHost } from "@/lib/host-mode";

export async function generateMetadata(): Promise<Metadata> {
  const hostMode = getHostModeFromHost((await headers()).get("host"));

  if (hostMode === "platform") {
    return {
      title: "Log in | Platform",
      description:
        "Log in to PayToCommit Platform for Developers to open organizations, projects, API keys, usage, and workforce controls.",
    };
  }

  return {
    title: "Log in",
    description: "Log in to PayToCommit to open My Portfolio, review wallet cash, and manage active markets.",
  };
}

export default async function LoginPage() {
  const hostMode = getHostModeFromHost((await headers()).get("host"));

  if (hostMode === "platform") {
    return <PlatformAuthGate initialMode="login" />;
  }

  return <AuthEntry mode="login" />;
}
