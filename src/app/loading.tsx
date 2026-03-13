import { headers } from "next/headers";

import { BrandLockup } from "@/components/brand-mark";
import { getHostModeFromHost } from "@/lib/host-mode";

const loadingCopy = {
  paytocommit: {
    product: "paytocommit" as const,
    eyebrow: "Commitment Board",
    title: "Loading the next surface",
    detail: "Preparing markets, balances, notifications, and the next lane.",
  },
  ruzomi: {
    product: "ruzomi" as const,
    eyebrow: "Ruzomi",
    title: "Opening the network",
    detail: "Waking up joined channels, direct sparks, artifacts, and the live feed.",
  },
  docs: {
    product: "paytocommit" as const,
    eyebrow: "Docs",
    title: "Loading documentation",
    detail: "Preparing the next guide, reference page, and support lane.",
  },
  developers: {
    product: "paytocommit" as const,
    eyebrow: "Developers",
    title: "Opening the developer hub",
    detail: "Preparing quickstarts, reference docs, billing guides, and platform paths.",
  },
  platform: {
    product: "paytocommit" as const,
    eyebrow: "Platform",
    title: "Opening the workspace",
    detail: "Preparing organizations, customers, reports, billing, and operator alerts.",
  },
  status: {
    product: "paytocommit" as const,
    eyebrow: "Status",
    title: "Loading service health",
    detail: "Preparing live service states, incidents, and maintenance windows.",
  },
};

export default async function Loading() {
  const host = (await headers()).get("host");
  const hostMode = getHostModeFromHost(host);
  const copy = loadingCopy[hostMode];

  return (
    <div className="surface-loading-shell">
      <div className="surface-loading-panel">
        <BrandLockup compact product={copy.product} subtitle={copy.eyebrow} />
        <div className="surface-loading-copy">
          <span className="surface-loading-eyebrow">{copy.eyebrow}</span>
          <strong>{copy.title}</strong>
          <p>{copy.detail}</p>
        </div>
        <div aria-hidden="true" className="surface-loading-grid">
          <span className="surface-loading-block surface-loading-block-hero" />
          <span className="surface-loading-block" />
          <span className="surface-loading-block" />
          <span className="surface-loading-block" />
        </div>
      </div>
    </div>
  );
}
