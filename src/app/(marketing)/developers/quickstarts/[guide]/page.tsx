import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ guide: string }>;
}) {
  const { guide } = await params;
  return getDeveloperPortalMetadata(["quickstarts", guide]);
}

export default async function DeveloperQuickstartDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ guide: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { guide } = await params;
  const { q } = await searchParams;
  return renderDeveloperPortalPage(["quickstarts", guide], q);
}
