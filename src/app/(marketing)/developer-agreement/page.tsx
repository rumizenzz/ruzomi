import type { Metadata } from "next";

import { LegalDocumentView } from "@/components/legal-document-view";
import { getLegalDocument } from "@/lib/legal-content";

const document = getLegalDocument("developer-agreement");

export const metadata: Metadata = {
  title: "Developer Agreement",
  description: document?.summary,
};

export default function DeveloperAgreementPage() {
  if (!document) return null;
  return <LegalDocumentView document={document} />;
}
