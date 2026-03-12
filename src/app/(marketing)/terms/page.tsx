import type { Metadata } from "next";

import { LegalDocumentView } from "@/components/legal-document-view";
import { getLegalDocument } from "@/lib/legal-content";

const document = getLegalDocument("terms");

export const metadata: Metadata = {
  title: "Terms",
  description: document?.summary,
};

export default function TermsPage() {
  if (!document) {
    return null;
  }

  return <LegalDocumentView document={document} />;
}
