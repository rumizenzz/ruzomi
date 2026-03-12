import type { Metadata } from "next";

import { LegalDocumentView } from "@/components/legal-document-view";
import { getLegalDocument } from "@/lib/legal-content";

const document = getLegalDocument("dispute-policy");

export const metadata: Metadata = {
  title: "Dispute Policy",
  description: document?.summary,
};

export default function DisputePolicyPage() {
  if (!document) return null;
  return <LegalDocumentView document={document} />;
}
