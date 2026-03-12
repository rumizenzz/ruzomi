import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  return getDeveloperPortalMetadata(["company-email-access", state]);
}

export default async function DeveloperCompanyEmailAccessStatePage({
  params,
  searchParams,
}: {
  params: Promise<{ state: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { state } = await params;
  const { q } = await searchParams;
  return renderDeveloperPortalPage(["company-email-access", state], q);
}
