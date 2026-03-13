import type { Metadata } from "next";

import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

type OrganizationAlertDetailPageProps = {
  params: Promise<{
    alert: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: OrganizationAlertDetailPageProps): Promise<Metadata> {
  const { alert } = await params;
  return getDeveloperPortalMetadata(["organization-alerts", alert]);
}

export default async function OrganizationAlertDetailPage({
  params,
  searchParams,
}: OrganizationAlertDetailPageProps) {
  const { alert } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return renderDeveloperPortalPage(["organization-alerts", alert], resolvedSearchParams?.q);
}
