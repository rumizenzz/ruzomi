import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace } = await params;
  return getDeveloperPortalMetadata(["organization-workspace", workspace]);
}

export default async function DeveloperOrganizationWorkspaceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspace: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { workspace } = await params;
  const { q } = await searchParams;
  return renderDeveloperPortalPage(["organization-workspace", workspace], q);
}
