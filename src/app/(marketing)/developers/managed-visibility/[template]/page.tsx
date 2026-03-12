import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ template: string }>;
}) {
  const { template } = await params;
  return getDeveloperPortalMetadata(["managed-visibility", template]);
}

export default async function DeveloperManagedVisibilityDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ template: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { template } = await params;
  const { q } = await searchParams;
  return renderDeveloperPortalPage(["managed-visibility", template], q);
}
