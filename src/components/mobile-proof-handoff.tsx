"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";
import { ArrowRight, QrCode, Smartphone } from "lucide-react";

import type { CrossPlatformHandoffSession } from "@/lib/types";

function getStoreHref(handoff: CrossPlatformHandoffSession) {
  const fallback = handoff.smartLink;
  const iosStore = process.env.NEXT_PUBLIC_IOS_APP_STORE_URL;
  const androidStore = process.env.NEXT_PUBLIC_ANDROID_APP_STORE_URL;

  if (handoff.platformHint === "ios") {
    return iosStore || fallback;
  }

  if (handoff.platformHint === "android") {
    return androidStore || fallback;
  }

  return fallback;
}

export function MobileProofHandoff({
  handoff,
}: {
  handoff: CrossPlatformHandoffSession;
}) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const storeHref = useMemo(() => getStoreHref(handoff), [handoff]);

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(handoff.qrValue, {
      margin: 0,
      width: 256,
      color: {
        dark: "#d4feff",
        light: "#00000000",
      },
    })
      .then((value: string) => {
        if (!cancelled) {
          setQrCodeDataUrl(value);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrCodeDataUrl(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [handoff.qrValue]);

  return (
    <div className="mobile-proof-handoff glass-panel">
      <div className="section-stack section-stack-tight">
        <span className="mono-label">Mobile-only proof</span>
        <strong>Proof submission is mobile-only. Your stake is locked under the market rules shown below.</strong>
        <p className="detail-text">
          {handoff.poolTitle} is locked with ${(handoff.stakeCents / 100).toFixed(0)}. Scan the code or open the smart
          link to continue in the PayToCommit mobile app when it is time to submit proof and complete the commitment.
        </p>
      </div>

      <div className="mobile-proof-handoff-grid">
        <div className="mobile-proof-handoff-qr-shell">
          {qrCodeDataUrl ? (
            <Image
              alt="QR code for mobile proof handoff"
              className="mobile-proof-handoff-qr"
              height={256}
              src={qrCodeDataUrl}
              unoptimized
              width={256}
            />
          ) : (
            <div className="mobile-proof-handoff-qr-fallback">
              <QrCode size={42} />
            </div>
          )}
        </div>

        <div className="section-stack section-stack-tight">
          <div className="mobile-proof-handoff-chip-row">
            <span className="status-pill" data-tone="live">
              <span className="live-dot" />
              desktop locked
            </span>
            <span className="metric-chip">{handoff.platformHint === "desktop" ? "scan to continue" : "open the app"}</span>
          </div>

          <div className="mobile-proof-handoff-actions">
            <a className="action-primary" href={storeHref}>
              <Smartphone aria-hidden="true" size={16} />
              <span>Continue on mobile</span>
            </a>
            <Link className="action-secondary" href={handoff.smartLink}>
              <ArrowRight aria-hidden="true" size={16} />
              <span>Open handoff page</span>
            </Link>
          </div>

          <p className="detail-text mobile-proof-handoff-footnote">
            Discovery, funding, and staking stay on desktop. Proof capture, STP-sensitive checks, and final submission
            continue through the mobile handoff.
          </p>
        </div>
      </div>
    </div>
  );
}
