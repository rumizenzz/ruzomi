import type { Metadata } from "next";

import { LegalDocumentView } from "@/components/legal-document-view";
import { getLegalDocument } from "@/lib/legal-content";

const document = getLegalDocument("security");

export const metadata: Metadata = {
  title: "Security",
  description: document?.summary,
};

export default function SecurityPage() {
  if (!document) {
    return null;
  }

  return <LegalDocumentView document={document} />;
}
