import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ team: string }>;
}) {
  const { team } = await params;
  return getDeveloperPortalMetadata(["manager-views", team]);
}

export default async function DeveloperManagerViewDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ team: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { team } = await params;
  const { q } = await searchParams;
  return renderDeveloperPortalPage(["manager-views", team], q);
}
