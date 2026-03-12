import type { Metadata } from "next";
import Link from "next/link";

import { GlassPanel } from "@/components/surfaces";
import { legalDocuments } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Legal",
  description: "Terms, privacy, fees, security, dispute, cookies, acceptable use, and developer policy documents for PayToCommit.",
};

export default function LegalIndexPage() {
  return (
    <section className="section-stack">
      <div className="section-stack">
        <span className="eyebrow">Legal</span>
        <h1 className="section-title">Policies and agreements</h1>
        <p className="section-copy">
          The documents below govern wallets, tickets, Chains, Spark, developers, moderation, privacy, disputes, and product use across PayToCommit.
        </p>
      </div>

      <section className="three-up">
        {legalDocuments.map((document) => (
          <GlassPanel key={document.slug}>
            <div className="section-stack">
              <h2 className="card-title">{document.title}</h2>
              <p className="supporting-copy">{document.summary}</p>
              <div className="surface-meta">
                <span>Effective {document.effectiveDate}</span>
                <span>Updated {document.updatedDate}</span>
              </div>
              <Link className="action-primary" href={`/${document.slug}`}>
                Open document
              </Link>
            </div>
          </GlassPanel>
        ))}
      </section>
    </section>
  );
}
