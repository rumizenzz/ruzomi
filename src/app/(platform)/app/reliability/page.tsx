import type { Metadata } from "next";
import Link from "next/link";

import { InviteLoopCard } from "@/components/invite-loop-card";
import { QuickstartCompactCard } from "@/components/quickstart-compact-card";
import { GlassPanel, SectionIntro } from "@/components/surfaces";
import { getGenerationEligibilityStateForSession, getWalletState } from "@/lib/paytocommit-data";
import { getQuickstartState } from "@/lib/quickstart";
import { getAuthenticatedSupabaseUser, toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

export const metadata: Metadata = {
  title: "Rewards & Access",
  description: "Track invite reward progress, consent-backed access, and Human Reliability API readiness on PayToCommit.",
};

export default async function ReliabilityPage() {
  const authUser = await getAuthenticatedSupabaseUser();
  const sessionToken = authUser ? toAuthenticatedAppSessionToken(authUser.id) : null;
  const showQuickstart = Boolean(authUser?.email_confirmed_at);
  const [walletState, eligibilityState] = await Promise.all([
    getWalletState(sessionToken),
    getGenerationEligibilityStateForSession(sessionToken),
  ]);
  const quickstartState =
    showQuickstart && walletState.viewer ? getQuickstartState(walletState, eligibilityState, "/app/reliability") : null;

  return (
    <>
      <SectionIntro
        eyebrow="Rewards & access"
        title="Invite rewards, consent scope, and private access."
        body="Track the live invite path, review what contact sync changes on mobile, and keep Human Reliability access scoped to explicit consent."
      />

      <section className="split-grid">
        <div className="section-stack">
          {quickstartState ? <QuickstartCompactCard state={quickstartState} variant="inline" /> : null}
          <InviteLoopCard contactSyncConsent={walletState.contactSyncConsent} rewardProgress={walletState.rewardProgress} />
        </div>

        <GlassPanel>
          <div className="section-stack">
            <span className="mono-label">Human Reliability access</span>
            <h2 className="section-title">Consent keeps the record usable and scoped.</h2>
            <p className="section-copy">
              Human Reliability lookups can return legal-name-backed matching only when the person granted that exact
              consent scope to the named integration. Without that scope, the same API path cannot run a protected
              identity match.
            </p>

            <div className="timeline-list">
              <div className="timeline-item">
                <div className="timeline-index">1</div>
                <div className="section-stack">
                  <strong>No open people search</strong>
                  <p className="detail-text">
                    Enterprise teams do not get broad search access. Requests stay tied to explicit consent, a named
                    integration, and a logged usage trail.
                  </p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-index">2</div>
                <div className="section-stack">
                  <strong>Consent can open opportunity, not inflate the score</strong>
                  <p className="detail-text">
                    The score still reflects verified follow-through over time. Consent makes the earned record usable
                    for approved decisions. It does not manufacture a stronger standing on its own.
                  </p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-index">3</div>
                <div className="section-stack">
                  <strong>Usage stays metered and auditable</strong>
                  <p className="detail-text">
                    Enterprise and small-business integrations pay for protected usage, keep a scoped key set, and can
                    review request history before the next production rollout.
                  </p>
                </div>
              </div>
            </div>

            <div className="button-row">
              <Link className="action-primary" href="/sales">
                Open sales
              </Link>
              <Link className="action-secondary" href="/docs/knowledge-base/referrals-and-contact-sync">
                Review the knowledge base
              </Link>
            </div>
          </div>
        </GlassPanel>
      </section>
    </>
  );
}
