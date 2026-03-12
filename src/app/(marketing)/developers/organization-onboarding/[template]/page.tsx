import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ template: string }>;
}) {
  const { template } = await params;
  return getDeveloperPortalMetadata(["organization-onboarding", template]);
}

export default async function DeveloperOrganizationOnboardingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ template: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { template } = await params;
  const { q } = await searchParams;
  return renderDeveloperPortalPage(["organization-onboarding", template], q);
}
