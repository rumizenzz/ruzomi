import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { DocsShell } from "@/components/docs-shell";
import { docsPages, getDocPageBySlug, getDocPath } from "@/lib/docs-content";
import { getGalactusAccessState } from "@/lib/galactus-access";
import { getGenerationEligibilityStateForSession } from "@/lib/paytocommit-data";
import { getAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug = [] } = await params;
  const page = getDocPageBySlug(slug);

  return {
    title: page.title,
    description: page.summary,
    alternates: {
      canonical: `https://docs.paytocommit.com${getDocPath(slug, true)}`,
    },
    openGraph: {
      title: page.title,
      description: page.summary,
      url: `https://docs.paytocommit.com${getDocPath(slug, true)}`,
    },
  };
}

export default async function DocsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { slug = [] } = await params;
  const { q } = await searchParams;
  const host = (await headers()).get("host") ?? "";
  const docsHost = host === "docs.paytocommit.com" || host === "www.docs.paytocommit.com";
  const mainHost = host === "paytocommit.com" || host === "www.paytocommit.com";
  const currentPage = docsPages.find((page) => page.slug.join("/") === slug.join("/"));

  if (slug.length && !currentPage) {
    notFound();
  }

  if (mainHost) {
    const nextQuery = q ? `?q=${encodeURIComponent(q)}` : "";
    redirect(`https://docs.paytocommit.com${getDocPath(slug, true)}${nextQuery}`);
  }

  const page = currentPage ?? docsPages[0];
  const sessionToken = await getAuthenticatedAppSessionToken();
  const eligibilityState = await getGenerationEligibilityStateForSession(sessionToken);
  const galactusAccess = getGalactusAccessState(eligibilityState, "docs", "/docs");

  return (
    <DocsShell
      currentPage={page}
      docsHost={docsHost}
      docsPages={docsPages}
      galactusAccess={galactusAccess}
      searchQuery={q}
    />
  );
}
