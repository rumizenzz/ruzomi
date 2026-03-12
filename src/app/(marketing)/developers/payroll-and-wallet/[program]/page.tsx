import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ program: string }>;
}) {
  const { program } = await params;
  return getDeveloperPortalMetadata(["payroll-and-wallet", program]);
}

export default async function DeveloperPayrollAndWalletDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ program: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { program } = await params;
  const { q } = await searchParams;
  return renderDeveloperPortalPage(["payroll-and-wallet", program], q);
}
