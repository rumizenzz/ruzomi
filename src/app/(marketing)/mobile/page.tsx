import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";

import { MobileProofHandoff } from "@/components/mobile-proof-handoff";
import { GlassPanel, SectionIntro } from "@/components/surfaces";
import type { CrossPlatformHandoffSession } from "@/lib/types";

export const metadata: Metadata = {
  title: "Continue on mobile",
  description:
    "Open the mobile handoff for proof submission, device capture, and native commitment flows.",
};

function getStoreHref(platform: "ios" | "android") {
  if (platform === "ios") {
    return process.env.NEXT_PUBLIC_IOS_APP_STORE_URL ?? "/mobile";
  }

  return process.env.NEXT_PUBLIC_ANDROID_APP_STORE_URL ?? "/mobile";
}

function inferPlatformHint(userAgent: string): CrossPlatformHandoffSession["platformHint"] {
  if (/(iphone|ipad|ipod)/i.test(userAgent)) {
    return "ios";
  }

  if (/android/i.test(userAgent)) {
    return "android";
  }

  return "desktop";
}

export default async function MobilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const requestHeaders = await headers();
  const resolvedSearchParams = await searchParams;
  const poolSlug = typeof resolvedSearchParams.pool === "string" ? resolvedSearchParams.pool : null;
  const stakeCents =
    typeof resolvedSearchParams.stake === "string" && Number.isFinite(Number(resolvedSearchParams.stake))
      ? Number(resolvedSearchParams.stake)
      : null;
  const handoffId = typeof resolvedSearchParams.handoff === "string" ? resolvedSearchParams.handoff : null;
  const forwardedProto = requestHeaders.get("x-forwarded-proto") ?? "https";
  const forwardedHost =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "paytocommit.com";
  const baseOrigin = `${forwardedProto}://${forwardedHost}`;
  const userAgent = requestHeaders.get("user-agent") ?? "";
  const platformHint = inferPlatformHint(userAgent);
  const poolTitle = poolSlug ? poolSlug.replace(/-/g, " ") : "this commitment";
  const smartLink = `${baseOrigin}/mobile?handoff=${encodeURIComponent(handoffId ?? "proof-handoff")}&pool=${encodeURIComponent(poolSlug ?? "commitment-proof")}&stake=${stakeCents ?? 1000}`;
  const handoffSession: CrossPlatformHandoffSession = {
    id: handoffId ?? "proof-handoff",
    poolSlug: poolSlug ?? "commitment-proof",
    poolTitle,
    stakeCents: stakeCents ?? 1000,
    smartLink,
    qrValue: smartLink,
    platformHint,
    createdAt: new Date().toISOString(),
  };

  return (
    <>
      <SectionIntro
        eyebrow="Mobile handoff"
        title={handoffId ? "Continue this commitment on mobile." : "Proof submission continues on mobile."}
        body={
          handoffId
            ? "Your desktop stake is already locked under the market rules shown below. Use the native handoff to submit proof, complete STP-sensitive capture, and finish the commitment from your phone."
            : "Discovery, funding, and stake locking stay available on the live web board. Mobile is where proof capture and native follow-through continue."
        }
      />
      <section className="split-grid">
        <GlassPanel>
          <div className="section-stack">
            <h2 className="section-title">Continue this market</h2>
            <p className="section-copy">
              {poolSlug && stakeCents
                ? `${poolSlug.replace(/-/g, " ")} is locked with $${(stakeCents / 100).toFixed(0)}. Open the mobile app before the proof window closes to submit proof and complete the commitment.`
                : "Open the mobile app to submit proof, run device-based checks, and finish the commitment cleanly."}
            </p>
            <div className="button-row">
              <Link className="action-primary" href={getStoreHref("ios")}>
                Download for iPhone
              </Link>
              <Link className="action-secondary" href={getStoreHref("android")}>
                Download for Android
              </Link>
            </div>
          </div>
        </GlassPanel>
        <GlassPanel>
          <div className="section-stack">
            <h2 className="section-title">What the app completes</h2>
            <p className="section-copy">
              Native notifications, device-based proof collection, STP-sensitive capture, and the final proof
              submission flow that desktop does not complete on its own.
            </p>
          </div>
        </GlassPanel>
      </section>
      <section className="page-stack">
        <MobileProofHandoff handoff={handoffSession} />
        <GlassPanel>
          <div className="section-stack">
            <h2 className="section-title">How the handoff works</h2>
            <div className="board-lane-list board-lane-list-compact">
              <div className="board-lane-item board-lane-item-tight">
                <div>
                  <p className="data-title">1. Stake is already locked</p>
                  <strong>Your desktop session captured the market and amount.</strong>
                </div>
                <span>{stakeCents ? `$${(stakeCents / 100).toFixed(0)}` : "$10"} held</span>
              </div>
              <div className="board-lane-item board-lane-item-tight">
                <div>
                  <p className="data-title">2. Mobile proves the result</p>
                  <strong>Proof capture, STP checks, and final submission continue in the app.</strong>
                </div>
                <span>mobile-only proof</span>
              </div>
              <div className="board-lane-item board-lane-item-tight">
                <div>
                  <p className="data-title">3. Cashout waits for a clean close</p>
                  <strong>Early Release keeps the 5% forfeiture clear before you confirm.</strong>
                </div>
                <span>settlement stays explicit</span>
              </div>
            </div>
          </div>
        </GlassPanel>
      </section>
    </>
  );
}
