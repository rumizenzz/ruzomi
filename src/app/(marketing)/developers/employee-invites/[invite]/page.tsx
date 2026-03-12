import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ invite: string }>;
}) {
  const { invite } = await params;
  return getDeveloperPortalMetadata(["employee-invites", invite]);
}

export default async function DeveloperEmployeeInviteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ invite: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { invite } = await params;
  const { q } = await searchParams;
  return renderDeveloperPortalPage(["employee-invites", invite], q);
}
