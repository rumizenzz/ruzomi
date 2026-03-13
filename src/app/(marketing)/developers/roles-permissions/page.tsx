import { getDeveloperPortalMetadata, renderDeveloperPortalPage } from "@/lib/developer-portal-page";

export async function generateMetadata() {
  return getDeveloperPortalMetadata(["roles-permissions"]);
}

export default function DeveloperRolesPermissionsPage() {
  return renderDeveloperPortalPage(["roles-permissions"]);
}
