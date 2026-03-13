import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { getDeveloperHostMode, getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

type HostedDevelopersPageProps = {
  params: Promise<{ hostedDeveloperSlug?: string[] }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ params }: HostedDevelopersPageProps) {
  const host = (await headers()).get("host") ?? "";

  if (getDeveloperHostMode(host) !== "developers") {
    return {};
  }

  const { hostedDeveloperSlug = [] } = await params;
  return getDeveloperPortalMetadata(hostedDeveloperSlug);
}

export default async function HostedDevelopersPage({ params, searchParams }: HostedDevelopersPageProps) {
  const host = (await headers()).get("host") ?? "";

  if (getDeveloperHostMode(host) !== "developers") {
    notFound();
  }

  const { hostedDeveloperSlug = [] } = await params;
  const { q } = await searchParams;

  return renderDeveloperPortalPage(hostedDeveloperSlug, q);
}
