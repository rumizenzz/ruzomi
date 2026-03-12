import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  const { project } = await params;
  return getDeveloperPortalMetadata(["billing-usage", project]);
}

export default async function DeveloperBillingProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ project: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { project } = await params;
  const { q } = await searchParams;
  return renderDeveloperPortalPage(["billing-usage", project], q);
}
