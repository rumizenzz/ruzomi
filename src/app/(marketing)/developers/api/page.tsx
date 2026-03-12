import { redirect } from "next/navigation";

export default function DeveloperApiRedirectPage() {
  redirect("/docs/api");
}
