import type { Metadata } from "next";
import { ProfileSettingsPanel } from "@/components/profile-settings-panel";
import { GlassPanel, SectionIntro } from "@/components/surfaces";
import { getGenerationEligibilityStateForSession, getWalletState } from "@/lib/paytocommit-data";
import { getQuickstartState } from "@/lib/quickstart";
import { getAuthenticatedSupabaseUser, toAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your public profile, proof preferences, and account settings on PayToCommit.",
};

export default async function ProfilePage() {
  const authUser = await getAuthenticatedSupabaseUser();
  const sessionToken = authUser ? toAuthenticatedAppSessionToken(authUser.id) : null;
  const showQuickstart = Boolean(authUser?.email_confirmed_at);
  const [walletState, eligibilityState] = showQuickstart
    ? await Promise.all([getWalletState(sessionToken), getGenerationEligibilityStateForSession(sessionToken)])
    : [null, null];
  const quickstartState =
    walletState && eligibilityState ? getQuickstartState(walletState, eligibilityState, "/app/profile") : null;

  return (
    <>
      <SectionIntro
        eyebrow="Profile"
        title="Profile, Spark status, and public visibility."
        body="Your public identity, live Spark status, and visible activity all update here."
      />
      <ProfileSettingsPanel quickstartState={quickstartState} />
      <GlassPanel>
        <div className="timeline-list">
          <div className="timeline-item">
            <div className="timeline-index">1</div>
            <div className="section-stack">
              <strong>Presence shows in Spark</strong>
              <p className="detail-text">Your selected status appears next to your name in Spark and on your public profile.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-index">2</div>
            <div className="section-stack">
              <strong>Activity stays lightweight</strong>
              <p className="detail-text">Custom activity helps people understand what you are focused on without exposing proof artifacts.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-index">3</div>
            <div className="section-stack">
              <strong>Proof still stays private</strong>
              <p className="detail-text">Updating Spark status changes how you appear publicly, not what proof is shared.</p>
            </div>
          </div>
        </div>
      </GlassPanel>
    </>
  );
}
