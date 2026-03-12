import type { Metadata } from "next";

import { FaqScreen } from "@/components/faq-screen";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Search PayToCommit questions about commitment markets, funding, proof, payouts, and enterprise reliability access.",
};

export default async function FaqsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return <FaqScreen initialQuery={q ?? ""} />;
}
