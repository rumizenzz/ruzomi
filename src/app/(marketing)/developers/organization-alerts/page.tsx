import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata() {
  return getDeveloperPortalMetadata(["organization-alerts"]);
}

export default function DeveloperOrganizationAlertsPage() {
  return renderDeveloperPortalPage(["organization-alerts"]);
}
