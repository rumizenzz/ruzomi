import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ review: string }>;
}) {
  const { review } = await params;
  return getDeveloperPortalMetadata(["production-review", review]);
}

export default async function DeveloperProductionReviewDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ review: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { review } = await params;
  const { q } = await searchParams;
  return renderDeveloperPortalPage(["production-review", review], q);
}
