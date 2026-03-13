import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { getDeveloperHostMode, getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

type HostedPlatformPageProps = {
  params: Promise<{ hostedPlatformSlug?: string[] }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ params }: HostedPlatformPageProps) {
  const host = (await headers()).get("host") ?? "";

  if (getDeveloperHostMode(host) !== "platform") {
    return {};
  }

  const { hostedPlatformSlug = [] } = await params;
  return getDeveloperPortalMetadata(hostedPlatformSlug);
}

export default async function HostedPlatformPage({ params, searchParams }: HostedPlatformPageProps) {
  const host = (await headers()).get("host") ?? "";

  if (getDeveloperHostMode(host) !== "platform") {
    notFound();
  }

  const { hostedPlatformSlug = [] } = await params;
  const { q } = await searchParams;

  return renderDeveloperPortalPage(hostedPlatformSlug, q);
}
