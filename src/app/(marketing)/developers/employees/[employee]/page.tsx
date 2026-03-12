import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ employee: string }>;
}) {
  const { employee } = await params;
  return getDeveloperPortalMetadata(["employees", employee]);
}

export default async function DeveloperEmployeeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ employee: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { employee } = await params;
  const { q } = await searchParams;
  return renderDeveloperPortalPage(["employees", employee], q);
}
