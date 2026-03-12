import { GlassPanel, SectionIntro } from "@/components/surfaces";
import { reviewQueue } from "@/lib/mock-data";

export default function AdminReviewPage() {
  return (
    <>
      <SectionIntro
        eyebrow="Settlement review"
        title="Resolve disputed proof and release clean results."
        body="Staff review decides the outcome when proof is incomplete, challenged, or unclear against the published rules."
      />
      <GlassPanel>
        <div className="timeline-list">
          {reviewQueue.map((item) => (
            <div key={item.id} className="timeline-item">
              <div className="timeline-index">{item.id.slice(-1)}</div>
              <div className="section-stack">
                <strong>{item.poolTitle}</strong>
                <p className="detail-text">{item.disputeState}</p>
                <span className="muted-text">{item.nextAction}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>
    </>
  );
}
