import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await params;
  return getDeveloperPortalMetadata(["customers", subject]);
}

export default async function DeveloperCustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ subject: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { subject } = await params;
  const { q } = await searchParams;
  return renderDeveloperPortalPage(["customers", subject], q);
}
