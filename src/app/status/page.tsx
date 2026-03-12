import type { Metadata } from "next";

import { StatusScreen } from "@/components/status-screen";
import { getStatusSnapshot } from "@/lib/status-data";

export const metadata: Metadata = {
  title: "Status",
  description: "Live operational status, maintenance windows, and incident history for PayToCommit.",
};

export default function StatusPage() {
  const snapshot = getStatusSnapshot();

  return <StatusScreen snapshot={snapshot} />;
}
