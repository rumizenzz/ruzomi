import type { Metadata } from "next";

import { LegalDocumentView } from "@/components/legal-document-view";
import { getLegalDocument } from "@/lib/legal-content";

const document = getLegalDocument("reward-terms");

export const metadata: Metadata = {
  title: "Reward Terms",
  description: document?.summary,
};

export default function RewardTermsPage() {
  if (!document) return null;
  return <LegalDocumentView document={document} />;
}
