import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ guide: string }>;
}) {
  const { guide } = await params;
  return getDeveloperPortalMetadata(["account-access", guide]);
}

export default async function DeveloperAccountAccessDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ guide: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { guide } = await params;
  const { q } = await searchParams;
  return renderDeveloperPortalPage(["account-access", guide], q);
}
