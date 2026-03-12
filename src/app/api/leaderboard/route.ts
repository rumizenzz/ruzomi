import { getLeaderboard } from "@/lib/paytocommit-data";

export async function GET() {
  return Response.json({
    leaderboard: await getLeaderboard(),
  });
}
