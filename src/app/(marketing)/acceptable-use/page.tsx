import type { Metadata } from "next";

import { LegalDocumentView } from "@/components/legal-document-view";
import { getLegalDocument } from "@/lib/legal-content";

const document = getLegalDocument("acceptable-use");

export const metadata: Metadata = {
  title: "Acceptable Use",
  description: document?.summary,
};

export default function AcceptableUsePage() {
  if (!document) return null;
  return <LegalDocumentView document={document} />;
}
