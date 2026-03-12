import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ organization: string }>;
}) {
  const { organization } = await params;
  return getDeveloperPortalMetadata(["organizations", organization]);
}

export default async function DeveloperOrganizationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ organization: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { organization } = await params;
  const { q } = await searchParams;
  return renderDeveloperPortalPage(["organizations", organization], q);
}
