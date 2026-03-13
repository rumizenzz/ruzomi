import type { HostMode } from "@/lib/host-mode";

const PROD_HOST_URLS = {
  paytocommit: "https://paytocommit.com",
  ruzomi: "https://ruzomi.com",
  docs: "https://docs.paytocommit.com",
  developers: "https://developers.paytocommit.com",
  platform: "https://platform.paytocommit.com",
  status: "https://status.paytocommit.com",
} as const;

const DEV_HOST_URLS = {
  paytocommit: "http://localhost:3000",
  ruzomi: "http://ruzomi.localhost:3000",
  docs: "http://docs.localhost:3000",
  developers: "http://developers.localhost:3000",
  platform: "http://platform.localhost:3000",
  status: "http://status.localhost:3000",
} as const;

type HostKey = keyof typeof PROD_HOST_URLS;

const HOST_URLS = process.env.NODE_ENV === "production" ? PROD_HOST_URLS : DEV_HOST_URLS;

export function buildHostedHref(host: HostKey, path = "/") {
  const base = HOST_URLS[host];

  if (!path || path === "/") {
    return `${base}/`;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildRuzomiHref(path = "/") {
  const normalizedPath = !path || path === "/" ? "/" : path;

  if (process.env.NODE_ENV !== "production") {
    if (normalizedPath === "/") {
      return "/ruzomi";
    }

    if (normalizedPath.startsWith("http://") || normalizedPath.startsWith("https://")) {
      return normalizedPath;
    }

    if (normalizedPath.startsWith("/ruzomi")) {
      return normalizedPath;
    }

    return `/ruzomi${normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`}`;
  }

  if (normalizedPath.startsWith("http://") || normalizedPath.startsWith("https://")) {
    return normalizedPath;
  }

  if (normalizedPath.startsWith("/ruzomi")) {
    return buildHostedHref("ruzomi", normalizedPath.slice("/ruzomi".length) || "/");
  }

  return buildHostedHref("ruzomi", normalizedPath);
}

function buildPayToCommitRuzomiPath(path = "/") {
  const normalizedPath = !path || path === "/" ? "/" : path;

  if (process.env.NODE_ENV === "production") {
    if (normalizedPath.startsWith("/ruzomi")) {
      return buildHostedHref("ruzomi", normalizedPath.slice("/ruzomi".length) || "/");
    }

    return buildHostedHref("ruzomi", normalizedPath);
  }

  if (normalizedPath === "/") {
    return "/ruzomi";
  }

  if (normalizedPath.startsWith("/ruzomi")) {
    return normalizedPath;
  }

  return `/ruzomi${normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`}`;
}

export function buildHostAwareRuzomiHref(hostMode: HostMode, path = "/") {
  const normalizedPath = !path || path === "/" ? "/" : path;

  if (normalizedPath.startsWith("http://") || normalizedPath.startsWith("https://")) {
    return normalizedPath;
  }

  if (hostMode === "paytocommit") {
    return buildPayToCommitRuzomiPath(normalizedPath);
  }

  if (hostMode === "ruzomi") {
    if (normalizedPath === "/") {
      return "/";
    }

    if (normalizedPath.startsWith("/ruzomi")) {
      const trimmed = normalizedPath.slice("/ruzomi".length);
      return trimmed || "/";
    }

    return normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
  }

  return buildRuzomiHref(normalizedPath);
}
