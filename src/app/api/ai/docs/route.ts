import { getGalactusAccessState, getGalactusLockedPayload } from "@/lib/galactus-access";
import { askDocsQuestion } from "@/lib/paytocommit-data";
import { getAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";
import { getGenerationEligibilityStateForSession } from "@/lib/paytocommit-data";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { question?: string };

    if (!body.question?.trim()) {
      return Response.json({ error: "question is required." }, { status: 400 });
    }

    const sessionToken = await getAuthenticatedAppSessionToken();
    const eligibilityState = await getGenerationEligibilityStateForSession(sessionToken);
    const accessState = getGalactusAccessState(eligibilityState, "docs", "/docs");

    if (!accessState.allowed) {
      const locked = getGalactusLockedPayload(eligibilityState, "docs", "/docs");
      return Response.json(locked.payload, { status: locked.status });
    }

    return Response.json(await askDocsQuestion(body.question.trim()));
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to answer docs question." },
      { status: 400 },
    );
  }
}
