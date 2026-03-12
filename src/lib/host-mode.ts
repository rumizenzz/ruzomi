export type HostMode = "paytocommit" | "ruzomi" | "docs" | "developers" | "platform" | "status";

const RUZOMI_HOSTS = new Set(["ruzomi.com", "www.ruzomi.com"]);
const DOCS_HOSTS = new Set(["docs.paytocommit.com"]);
const DEVELOPER_HOSTS = new Set(["developers.paytocommit.com"]);
const PLATFORM_HOSTS = new Set(["platform.paytocommit.com"]);
const STATUS_HOSTS = new Set(["status.paytocommit.com"]);

export function getHostModeFromHost(host: string | null | undefined): HostMode {
  if (!host) {
    return "paytocommit";
  }

  if (RUZOMI_HOSTS.has(host)) {
    return "ruzomi";
  }

  if (DOCS_HOSTS.has(host)) {
    return "docs";
  }

  if (DEVELOPER_HOSTS.has(host)) {
    return "developers";
  }

  if (PLATFORM_HOSTS.has(host)) {
    return "platform";
  }

  if (STATUS_HOSTS.has(host)) {
    return "status";
  }

  return "paytocommit";
}
