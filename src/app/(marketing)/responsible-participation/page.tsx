import type { Metadata } from "next";

import { LegalDocumentView } from "@/components/legal-document-view";
import { getLegalDocument } from "@/lib/legal-content";

const document = getLegalDocument("responsible-participation");

export const metadata: Metadata = {
  title: "Responsible Participation",
  description: document?.summary,
};

export default function ResponsibleParticipationPage() {
  if (!document) return null;
  return <LegalDocumentView document={document} />;
}
