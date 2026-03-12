import type { Metadata } from "next";

import { GlassPanel, LeaderboardCard, SectionIntro } from "@/components/surfaces";
import { leaderboard } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "See which members keep closing on the completed side with clean proof and strong result history.",
};

export default function LeaderboardPage() {
  return (
    <>
      <SectionIntro
        eyebrow="Leaderboard"
        title="Completed stakes move the board."
        body="The board rewards verified results, clean proof, and closed challenge history."
      />
      <section className="split-grid">
        <GlassPanel>
          <div className="timeline-list">
            {leaderboard.map((entry, index) => (
              <LeaderboardCard key={entry.id} entry={entry} index={index} />
            ))}
          </div>
        </GlassPanel>
        <GlassPanel>
          <div className="section-stack">
            <h2 className="section-title">What moves the board</h2>
            <p className="section-copy">
              Verified results, successful proof, resolved challenges, and time spent closing on the completed side. Missing proof or losing a challenge lowers the score.
            </p>
            <div className="metric-strip">
              <div className="summary-card">
                <span className="mono-label">Verified pools</span>
                <strong>Weighted</strong>
                <span className="muted-text">More difficult pools carry more score.</span>
              </div>
              <div className="summary-card">
                <span className="mono-label">Challenges won</span>
                <strong>Protected</strong>
                <span className="muted-text">Strong proof preserves reputation.</span>
              </div>
              <div className="summary-card">
                <span className="mono-label">Missed windows</span>
                <strong>Penalized</strong>
                <span className="muted-text">Scores fall when proof arrives late or does not qualify.</span>
              </div>
            </div>
          </div>
        </GlassPanel>
      </section>
    </>
  );
}
