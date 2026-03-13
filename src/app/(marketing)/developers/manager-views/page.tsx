import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata() {
  return getDeveloperPortalMetadata(["manager-views"]);
}

export default async function DeveloperManagerViewsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return renderDeveloperPortalPage(["manager-views"], q);
}
