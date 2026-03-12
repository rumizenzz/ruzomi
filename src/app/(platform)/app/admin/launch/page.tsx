import { GlassPanel, SectionIntro } from "@/components/surfaces";
import { launchModes } from "@/lib/mock-data";

export default function AdminLaunchPage() {
  return (
    <>
      <SectionIntro
        eyebrow="Access"
        title="Switch between open access, invite-only, and maintenance hold."
        body="Choose who can enter, who can create pools, and when new funding should pause."
      />
      <section className="split-grid">
        {launchModes.map((mode) => (
          <GlassPanel key={mode.title}>
            <div className="section-stack">
              <h2 className="section-title">{mode.title}</h2>
              <p className="section-copy">{mode.description}</p>
              <button className="action-primary" type="button">
                Activate {mode.title}
              </button>
            </div>
          </GlassPanel>
        ))}
      </section>
    </>
  );
}
