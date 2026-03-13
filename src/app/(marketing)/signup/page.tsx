import type { Metadata } from "next";
import { headers } from "next/headers";

import { AuthEntry } from "@/components/auth-entry";
import { PlatformAuthGate } from "@/components/platform-auth-gate";
import { getHostModeFromHost } from "@/lib/host-mode";

export async function generateMetadata(): Promise<Metadata> {
  const hostMode = getHostModeFromHost((await headers()).get("host"));

  if (hostMode === "platform") {
    return {
      title: "Create account | Platform",
      description:
        "Create your PayToCommit Platform for Developers account to open workspaces, issue API keys, review usage, and manage enterprise rollout.",
    };
  }

  return {
    title: "Sign up",
    description: "Create a PayToCommit account and continue into wallet funding, market entry, and proof tracking.",
  };
}

export default async function SignupPage() {
  const hostMode = getHostModeFromHost((await headers()).get("host"));

  if (hostMode === "platform") {
    return <PlatformAuthGate initialMode="signup" />;
  }

  return <AuthEntry mode="signup" />;
}
