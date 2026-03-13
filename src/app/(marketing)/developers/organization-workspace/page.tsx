import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata() {
  return getDeveloperPortalMetadata(["organization-workspace"]);
}

export default async function DeveloperOrganizationWorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return renderDeveloperPortalPage(["organization-workspace"], q);
}
