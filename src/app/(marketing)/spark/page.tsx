import type { Metadata } from "next";

import { SparkSidePanel } from "@/components/spark-side-panel";
import { GlassPanel } from "@/components/surfaces";
import { SparkThread } from "@/components/spark-thread";

export const metadata: Metadata = {
  title: "Spark",
  description:
    "Follow commitment activity, streaks, and public momentum across live PayToCommit markets.",
};

export default function SparkPage() {
  return (
    <section className="split-grid spark-page-grid">
      <GlassPanel className="spark-page-main">
        <SparkThread
          body="Live market discussion, native GIF posts, market ideas, and visible momentum across every Commitment Market."
          title="Spark Global Feed"
        />
      </GlassPanel>
      <div className="spark-page-rail">
        <SparkSidePanel />
      </div>
    </section>
  );
}
