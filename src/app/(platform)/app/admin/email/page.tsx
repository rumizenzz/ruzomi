import { GlassPanel, SectionIntro } from "@/components/surfaces";

export default function AdminEmailPage() {
  return (
    <>
      <SectionIntro
        eyebrow="Email operations"
        title="Preview the sender system for support, billing, and account notices."
        body="Transactional mail is split by purpose so alerts, support replies, and billing receipts stay organized from the start."
      />
      <GlassPanel>
        <div className="timeline-list">
          <div className="timeline-item">
            <div className="timeline-index">1</div>
            <div className="section-stack">
              <strong>no-reply@paytocommit.com</strong>
              <p className="detail-text">Pool opens, proof receipts, result notices, and consent receipts.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-index">2</div>
            <div className="section-stack">
              <strong>billing@paytocommit.com</strong>
              <p className="detail-text">Funding states, payout notices, and invoice delivery.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-index">3</div>
            <div className="section-stack">
              <strong>support@paytocommit.com</strong>
              <p className="detail-text">Support replies, escalation notes, and account help.</p>
            </div>
          </div>
        </div>
      </GlassPanel>
    </>
  );
}
