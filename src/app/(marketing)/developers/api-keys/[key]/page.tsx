import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  return getDeveloperPortalMetadata(["api-keys", key]);
}

export default async function DeveloperApiKeyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { key } = await params;
  const { q } = await searchParams;
  return renderDeveloperPortalPage(["api-keys", key], q);
}
