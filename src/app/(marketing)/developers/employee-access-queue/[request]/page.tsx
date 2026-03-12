import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ request: string }>;
}) {
  const { request } = await params;
  return getDeveloperPortalMetadata(["employee-access-queue", request]);
}

export default async function DeveloperEmployeeAccessQueueDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ request: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { request } = await params;
  const { q } = await searchParams;
  return renderDeveloperPortalPage(["employee-access-queue", request], q);
}
