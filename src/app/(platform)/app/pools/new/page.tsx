import type { Metadata } from "next";

import { CreationForge } from "@/components/creation-forge";

export const metadata: Metadata = {
  title: "Creation Forge",
  description: "Draft and open autonomous commitment markets on PayToCommit.",
};

export default function NewPoolPage() {
  return <CreationForge />;
}
