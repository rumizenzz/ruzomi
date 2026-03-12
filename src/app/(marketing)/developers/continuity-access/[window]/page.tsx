import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ window: string }>;
}) {
  const { window } = await params;
  return getDeveloperPortalMetadata(["continuity-access", window]);
}

export default async function DeveloperContinuityAccessDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ window: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { window } = await params;
  const { q } = await searchParams;
  return renderDeveloperPortalPage(["continuity-access", window], q);
}
