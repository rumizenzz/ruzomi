import { GALACTUS_UNLOCK_RULE, getGalactusAccessState } from "@/lib/galactus-access";
import { getGenerationEligibilityStateForSession } from "@/lib/paytocommit-data";
import { getAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";

export async function POST(request: Request) {
  const sessionToken = await getAuthenticatedAppSessionToken();
  const eligibilityState = await getGenerationEligibilityStateForSession(sessionToken);
  const access = getGalactusAccessState(eligibilityState, "support", "/help-center");

  const body = (await request.json().catch(() => null)) as
    | {
        name?: string;
        email?: string;
        message?: string;
      }
    | null;

  if (!body?.name || !body.email || !body.message) {
    return Response.json(
      { error: "name, email, and message are required" },
      { status: 400 },
    );
  }

  return Response.json({
    message: access.allowed
      ? "Galactus received the support request and routed it into the active queue."
      : `Support received the request and opened a tracked case. ${GALACTUS_UNLOCK_RULE}`,
    ticket: {
      id: crypto.randomUUID(),
      status: "received",
      route: access.allowed ? "galactus_support" : "support_intake",
      accessState: access.allowed ? "active" : "intake_only",
      receivedAt: new Date().toISOString(),
    },
  });
}
