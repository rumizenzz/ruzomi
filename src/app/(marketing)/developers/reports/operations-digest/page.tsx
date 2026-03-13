import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata() {
  return getDeveloperPortalMetadata(["reports", "operations-digest"]);
}

export default async function DeveloperOperationsDigestReportPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return renderDeveloperPortalPage(["reports", "operations-digest"], q);
}
