import type { Metadata } from "next";

import { SectionIntro } from "@/components/surfaces";

const entries = [
  {
    version: "0.1.0",
    title: "Live board foundation",
    body: "Core market board, pool surfaces, developer docs, admin operations, and account pathways shipped.",
  },
  {
    version: "0.1.1",
    title: "Consent-based developer access",
    body: "Developer key issuance, lookup audit logs, and private access controls are now available directly inside the account.",
  },
  {
    version: "0.1.2",
    title: "Commitment Network ledger",
    body: "Public ledger page, timeline copy, and result-state language aligned around proof, review, and settlement.",
  },
];

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Track PayToCommit releases, product updates, and service changes across the board.",
};

export default function ChangelogPage() {
  return (
    <>
      <SectionIntro
        eyebrow="Changelog"
        title="Track what shipped and what changed next."
        body="The changelog stays direct: what was added, what moved, and what changed after the update landed."
      />
      <section className="glass-panel">
        <div className="timeline-list">
          {entries.map((entry) => (
            <div key={entry.version} className="timeline-item">
              <div className="timeline-index">{entry.version}</div>
              <div className="section-stack">
                <strong>{entry.title}</strong>
                <p className="detail-text">{entry.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
