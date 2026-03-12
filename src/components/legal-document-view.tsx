import Link from "next/link";

import { GlassPanel } from "@/components/surfaces";
import { LEGAL_ADDRESS, LEGAL_OPERATOR, legalDocuments } from "@/lib/legal-content";
import type { LegalDocument } from "@/lib/types";

export function LegalDocumentView({ document }: { document: LegalDocument }) {
  return (
    <section className="split-grid legal-layout">
      <GlassPanel>
        <div className="section-stack">
          <span className="eyebrow">Legal</span>
          <h1 className="section-title docs-page-title">{document.title}</h1>
          <p className="section-copy">{document.summary}</p>
          <div className="surface-meta">
            <span>Operator: {LEGAL_OPERATOR}</span>
            <span>Effective: {document.effectiveDate}</span>
            <span>Updated: {document.updatedDate}</span>
          </div>
          <p className="detail-text">{LEGAL_ADDRESS}</p>
        </div>

        <div className="docs-section-list">
          {document.sections.map((section) => (
            <section key={section.id} className="docs-section" id={section.id}>
              <h2 className="card-title">{section.title}</h2>
              <div className="section-stack">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="section-copy">
                    {paragraph}
                  </p>
                ))}
                {section.bullets?.length ? (
                  <ul className="legal-bullet-list">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="detail-text">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="docs-toc">
        <div className="section-stack">
          <span className="mono-label">On this page</span>
          <div className="docs-toc-list">
            {document.sections.map((section) => (
              <Link key={section.id} className="docs-toc-link" href={`#${section.id}`}>
                {section.title}
              </Link>
            ))}
          </div>
          <div className="divider" />
          <span className="mono-label">Legal library</span>
          <div className="docs-toc-list">
            {legalDocuments.map((item) => (
              <Link key={item.slug} className="docs-toc-link" href={`/${item.slug}`}>
                {item.title}
              </Link>
            ))}
            <Link className="docs-toc-link" href="/legal">
              Legal index
            </Link>
          </div>
        </div>
      </GlassPanel>
    </section>
  );
}
