const shareCampaignAllowlist = {
  artifact: true,
  ruzomi: true,
  profile: true,
} as const;

type ShareCampaignSurface = keyof typeof shareCampaignAllowlist;

function readConfiguredTags() {
  const raw = process.env.NEXT_PUBLIC_SHARE_CAMPAIGN_TAGS ?? "#DownloadPayToCommit";

  return raw
    .split(/[,\s]+/)
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index);
}

export function buildShareCampaignText(surface: ShareCampaignSurface, baseText: string) {
  const normalized = baseText.trim();
  if (!shareCampaignAllowlist[surface]) {
    return normalized;
  }

  const tags = readConfiguredTags();
  if (!tags.length) {
    return normalized;
  }

  return `${normalized} ${tags.join(" ")}`.trim();
}
