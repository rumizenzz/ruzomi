import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata() {
  return getDeveloperPortalMetadata(["organization-hrs"]);
}

export default function DeveloperOrganizationHrsPage() {
  return renderDeveloperPortalPage(["organization-hrs"]);
}
