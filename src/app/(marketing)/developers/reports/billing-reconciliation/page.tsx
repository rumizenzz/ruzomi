import { renderDeveloperPortalPage } from "@/lib/developer-portal-page";

type BillingReconciliationPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BillingReconciliationPage({ searchParams }: BillingReconciliationPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return renderDeveloperPortalPage(["reports", "billing-reconciliation"], resolvedSearchParams?.q);
}
