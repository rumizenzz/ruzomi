import type { Metadata } from "next";
import Link from "next/link";

import { GlassPanel, SectionIntro } from "@/components/surfaces";
import { launchModes, reviewQueue } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Admin",
  description: "Operational controls, access settings, and email operations for PayToCommit.",
};

export default function AdminPage() {
  return (
    <>
      <div className="app-topbar">
        <SectionIntro
          eyebrow="Admin desk"
          title="Pool approvals, settlement review, launch state, and email operations."
          body="Approval, settlement, funding holds, and email operations all route through this desk."
        />
        <div className="button-row">
          <Link className="action-primary" href="/app/admin/review">
            Review queue
          </Link>
          <Link className="action-secondary" href="/app/admin/launch">
            Access settings
          </Link>
        </div>
      </div>
      <section className="split-grid">
        <GlassPanel>
          <div className="section-stack">
            <h2 className="section-title">Active review desk</h2>
            <div className="timeline-list">
              {reviewQueue.map((item) => (
                <div key={item.id} className="timeline-item">
                  <div className="timeline-index">{item.reviewer.split(" ").pop()}</div>
                  <div className="section-stack">
                    <strong>{item.poolTitle}</strong>
                    <p className="detail-text">{item.evidenceStatus}</p>
                    <span className="muted-text">{item.nextAction}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>
        <GlassPanel>
          <div className="section-stack">
            <h2 className="section-title">Access settings</h2>
            <div className="timeline-list">
              {launchModes.map((mode, index) => (
                <div key={mode.title} className="launch-mode">
                  <div className="timeline-index">{index + 1}</div>
                  <div className="section-stack">
                    <strong>{mode.title}</strong>
                    <p className="detail-text">{mode.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>
      </section>
    </>
  );
}
