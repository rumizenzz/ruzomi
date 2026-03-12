import type { Metadata } from "next";

import { LegalDocumentView } from "@/components/legal-document-view";
import { getLegalDocument } from "@/lib/legal-content";

const document = getLegalDocument("cookies");

export const metadata: Metadata = {
  title: "Cookies",
  description: document?.summary,
};

export default function CookiesPage() {
  if (!document) return null;
  return <LegalDocumentView document={document} />;
}
