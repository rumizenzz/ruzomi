import { getChainBySlug, getPoolBySlug, listNetworkLedger, listSparkFeed } from "@/lib/paytocommit-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const pool = await getPoolBySlug(slug);

  if (!pool) {
    return Response.json({ error: "Pool not found" }, { status: 404 });
  }

  const [ledger, spark, chains] = await Promise.all([
    listNetworkLedger(slug),
    listSparkFeed(null, slug),
    Promise.all(["sunrise-fitness-chain", "workday-close-chain"].map((chainSlug) => getChainBySlug(chainSlug))),
  ]);

  return Response.json({
    pool,
    ledger,
    spark,
    chains: chains.filter(Boolean),
  });
}
