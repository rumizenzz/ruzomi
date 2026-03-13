import { notFound } from "next/navigation";

import { getDeveloperPortalMetadata, getDeveloperHostMode, renderDeveloperPortalPage } from "@/lib/developer-portal-page";
import { headers } from "next/headers";

type HostedDeveloperPageProps = {
  params: Promise<{ hostedDeveloperSlug?: string[] }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ params }: HostedDeveloperPageProps) {
  const host = (await headers()).get("host") ?? "";
  const hostMode = getDeveloperHostMode(host);

  if (hostMode === "path") {
    return {};
  }

  const { hostedDeveloperSlug = [] } = await params;
  return getDeveloperPortalMetadata(hostedDeveloperSlug);
}

export default async function HostedDeveloperPage({ params, searchParams }: HostedDeveloperPageProps) {
  const host = (await headers()).get("host") ?? "";
  const hostMode = getDeveloperHostMode(host);

  if (hostMode === "path") {
    notFound();
  }

  const { hostedDeveloperSlug = [] } = await params;
  const { q } = await searchParams;

  return renderDeveloperPortalPage(hostedDeveloperSlug, q);
}
