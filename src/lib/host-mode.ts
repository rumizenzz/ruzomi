export type HostMode = "paytocommit" | "ruzomi" | "docs" | "developers" | "platform" | "status";

const RUZOMI_HOSTS = new Set(["ruzomi.com", "www.ruzomi.com"]);
const DOCS_HOSTS = new Set(["docs.paytocommit.com", "www.docs.paytocommit.com"]);
const DEVELOPERS_HOSTS = new Set(["developers.paytocommit.com", "www.developers.paytocommit.com"]);
const PLATFORM_HOSTS = new Set(["platform.paytocommit.com", "www.platform.paytocommit.com"]);
const STATUS_HOSTS = new Set(["status.paytocommit.com", "www.status.paytocommit.com"]);
const RUZOMI_NETLIFY_SUFFIX = "ruzomi.netlify.app";

function normalizeHost(host: string | null | undefined) {
  return (host ?? "")
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "");
}

function isRuzomiHost(host: string) {
  return host === "ruzomi.localhost" || RUZOMI_HOSTS.has(host) || host === RUZOMI_NETLIFY_SUFFIX || host.endsWith(`--${RUZOMI_NETLIFY_SUFFIX}`);
}

export function getHostModeFromHost(host: string | null | undefined): HostMode {
  const normalizedHost = normalizeHost(host);

  if (!normalizedHost) {
    return "paytocommit";
  }

  if (isRuzomiHost(normalizedHost)) {
    return "ruzomi";
  }

  if (DOCS_HOSTS.has(normalizedHost) || normalizedHost === "docs.localhost") {
    return "docs";
  }

  if (DEVELOPERS_HOSTS.has(normalizedHost) || normalizedHost === "developers.localhost") {
    return "developers";
  }

  if (PLATFORM_HOSTS.has(normalizedHost) || normalizedHost === "platform.localhost") {
    return "platform";
  }

  if (STATUS_HOSTS.has(normalizedHost) || normalizedHost === "status.localhost") {
    return "status";
  }

  return "paytocommit";
}
