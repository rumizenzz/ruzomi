import type { Metadata } from "next";

import { LegalDocumentView } from "@/components/legal-document-view";
import { getLegalDocument } from "@/lib/legal-content";

const document = getLegalDocument("privacy");

export const metadata: Metadata = {
  title: "Privacy",
  description: document?.summary,
};

export default function PrivacyPage() {
  if (!document) {
    return null;
  }

  return <LegalDocumentView document={document} />;
}
