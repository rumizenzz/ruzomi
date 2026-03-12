import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ report: string }>;
}) {
  const { report } = await params;
  return getDeveloperPortalMetadata(["reports", report]);
}

export default async function DeveloperReportDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ report: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { report } = await params;
  const { q } = await searchParams;
  return renderDeveloperPortalPage(["reports", report], q);
}
