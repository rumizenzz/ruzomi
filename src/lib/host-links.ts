const HOST_URLS = {
  paytocommit: "https://paytocommit.com",
  ruzomi: "https://ruzomi.com",
  docs: "https://docs.paytocommit.com",
  developers: "https://developers.paytocommit.com",
  platform: "https://platform.paytocommit.com",
  status: "https://status.paytocommit.com",
} as const;

type HostKey = keyof typeof HOST_URLS;

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
  return buildHostedHref("ruzomi", path);
}
