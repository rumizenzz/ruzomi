import type { Metadata } from "next";

import { LegalDocumentView } from "@/components/legal-document-view";
import { getLegalDocument } from "@/lib/legal-content";

const document = getLegalDocument("community-guidelines");

export const metadata: Metadata = {
  title: "Community Guidelines",
  description: document?.summary,
};

export default function CommunityGuidelinesPage() {
  if (!document) return null;
  return <LegalDocumentView document={document} />;
}
