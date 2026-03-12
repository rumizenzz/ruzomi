import type { Metadata } from "next";

import { GlassPanel, SectionIntro } from "@/components/surfaces";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach the PayToCommit team about enterprise launches, team rollouts, creator programs, and custom commitment operations.",
};

export default function ContactPage() {
  return (
    <>
      <SectionIntro
        eyebrow="Contact"
        title="Tell the team what you want to launch on PayToCommit."
        body="Use this path for enterprise pilots, creator programs, team rollouts, and large commitment programs."
      />
      <GlassPanel>
        <form className="form-stack">
          <div className="form-grid">
            <label className="field-stack">
              <span className="field-label">Name</span>
              <input className="form-input" placeholder="Your name" />
            </label>
            <label className="field-stack">
              <span className="field-label">Work email</span>
              <input className="form-input" placeholder="you@company.com" type="email" />
            </label>
            <label className="field-stack">
              <span className="field-label">Company</span>
              <input className="form-input" placeholder="Company or team" />
            </label>
            <label className="field-stack">
              <span className="field-label">Timeline</span>
              <select className="form-select" defaultValue="30-days">
                <option value="14-days">Within 14 days</option>
                <option value="30-days">Within 30 days</option>
                <option value="quarter">This quarter</option>
              </select>
            </label>
          </div>
          <label className="field-stack">
            <span className="field-label">What are you launching?</span>
            <textarea
              className="form-textarea"
              placeholder="Describe who is joining, what they are committing to, and how a result should be confirmed."
            />
          </label>
          <div className="button-row">
            <button className="action-primary" type="button">
              Send inquiry
            </button>
            <span className="action-secondary">Sent to the launch team</span>
          </div>
        </form>
      </GlassPanel>
    </>
  );
}
