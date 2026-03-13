import type { Metadata } from "next";

import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

type AuditLogDetailPageProps = {
  params: Promise<{
    log: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: AuditLogDetailPageProps): Promise<Metadata> {
  const { log } = await params;
  return getDeveloperPortalMetadata(["audit-logs", log]);
}

export default async function AuditLogDetailPage({ params, searchParams }: AuditLogDetailPageProps) {
  const { log } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return renderDeveloperPortalPage(["audit-logs", log], resolvedSearchParams?.q);
}
