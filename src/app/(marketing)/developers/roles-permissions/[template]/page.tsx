import type { Metadata } from "next";

import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

type RolesPermissionsDetailPageProps = {
  params: Promise<{
    template: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: RolesPermissionsDetailPageProps): Promise<Metadata> {
  const { template } = await params;
  return getDeveloperPortalMetadata(["roles-permissions", template]);
}

export default async function RolesPermissionsDetailPage({
  params,
  searchParams,
}: RolesPermissionsDetailPageProps) {
  const { template } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return renderDeveloperPortalPage(["roles-permissions", template], resolvedSearchParams?.q);
}
