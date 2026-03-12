export type HostMode = "paytocommit" | "ruzomi";

const RUZOMI_HOSTS = new Set(["ruzomi.com", "www.ruzomi.com"]);

export function getHostModeFromHost(host: string | null | undefined): HostMode {
  if (!host) {
    return "paytocommit";
  }

  return RUZOMI_HOSTS.has(host) ? "ruzomi" : "paytocommit";
}
