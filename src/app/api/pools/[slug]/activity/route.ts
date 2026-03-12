import { getPoolBySlug, sparkFeed } from "@/lib/mock-data";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const pool = getPoolBySlug(slug);

  if (!pool) {
    return Response.json({ error: "Pool not found" }, { status: 404 });
  }

  return Response.json({
    pool: pool.title,
    activity: sparkFeed.map((item) => ({
      id: item.id,
      actor: item.actor,
      message: item.message,
      context: item.context,
      reactions: item.reactionCount,
    })),
  });
}
