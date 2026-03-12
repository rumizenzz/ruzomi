import type { Metadata } from "next";

import { SectionIntro, TimelineItem } from "@/components/surfaces";

const steps = [
  {
    title: "Choose or create a pool",
    body: "Choose a live market or describe a new commitment once. Creation Forge drafts the rules, deadline, proof requirement, and stake band before the market opens.",
  },
  {
    title: "Join before the close",
    body: "Enter the pool, lock the stake, and hold the completed side through the deadline.",
  },
  {
    title: "Submit proof on time",
    body: "Upload the required evidence before submissions close. The verification engine checks timing, clarity, and rule fit before the ticket closes completed or missed.",
  },
  {
    title: "Close the result",
    body: "Completed entrants recover their own stake and split the forfeited side after PayToCommit capture. If nobody completes, the market closes to PayToCommit.",
  },
];

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Understand the full PayToCommit flow: join a pool, submit proof on time, and close with a clear result.",
};

export default function HowItWorksPage() {
  return (
    <>
      <SectionIntro
        eyebrow="How it works"
        title="Pool, join, proof, result."
        body="Every pool follows the same order so the money path and result rule are clear before the deadline arrives."
      />
      <section className="glass-panel">
        <div className="timeline-list">
          {steps.map((step, index) => (
            <TimelineItem key={step.title} body={step.body} index={index} title={step.title} />
          ))}
        </div>
      </section>
    </>
  );
}
