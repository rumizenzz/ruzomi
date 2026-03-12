import { listPools } from "@/lib/paytocommit-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const status = searchParams.get("status") as "live" | "upcoming" | "settling" | "settled" | null;
  const pools = await listPools({
    category,
    status: status ?? undefined,
  });

  return Response.json({
    pools,
    count: pools.length,
  });
}
