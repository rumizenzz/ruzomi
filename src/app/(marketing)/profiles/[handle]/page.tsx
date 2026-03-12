import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicProfileView } from "@/components/public-profile-view";
import { getPublicProfile } from "@/lib/paytocommit-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getPublicProfile(handle);

  if (!profile) {
    return {
      title: "Profile not found",
    };
  }

  return {
    title: `${profile.displayName}`,
    description: `${profile.displayName}'s public commitment history, active markets, and result cards on PayToCommit.`,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = await getPublicProfile(handle);

  if (!profile || profile.visibility !== "public") {
    notFound();
  }

  return <PublicProfileView profile={profile} />;
}
