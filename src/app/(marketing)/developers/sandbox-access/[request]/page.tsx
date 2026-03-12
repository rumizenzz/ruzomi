import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ request: string }>;
}) {
  const { request } = await params;
  return getDeveloperPortalMetadata(["sandbox-access", request]);
}

export default async function DeveloperSandboxAccessDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ request: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { request } = await params;
  const { q } = await searchParams;
  return renderDeveloperPortalPage(["sandbox-access", request], q);
}
