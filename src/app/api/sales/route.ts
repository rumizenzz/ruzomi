import { NextResponse } from "next/server";

import { GALACTUS_UNLOCK_RULE, getGalactusAccessState } from "@/lib/galactus-access";
import { getGenerationEligibilityStateForSession } from "@/lib/paytocommit-data";
import { getAuthenticatedAppSessionToken } from "@/lib/supabase/authenticated-user";
import type { EnterpriseApiApplication } from "@/lib/types";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getLaunchPathMessage(launchPath: string, allowed: boolean) {
  switch (launchPath) {
    case "Strategic partner / flagship contract":
      return allowed
        ? "The strategic partner request is queued now. Use the developer portal to review flagship rollout requirements, then open the platform workspace to prepare projects, billing, customer views, and audit coverage while the partner path is reviewed."
        : `The strategic partner request is in the queue. Public docs, the developer portal, and the standard enterprise setup path stay available while the direct Galactus sales conversation remains protected. ${GALACTUS_UNLOCK_RULE}`;
    case "Not sure yet":
      return allowed
        ? "The enterprise request is queued now. Use sandbox access, production review, and the platform workspace to decide whether the standard rollout or the strategic partner path fits the team."
        : `The enterprise request is in the queue. Public docs, sandbox access, and the platform workspace remain available while the direct Galactus sales conversation stays protected. ${GALACTUS_UNLOCK_RULE}`;
    default:
      return allowed
        ? "The standard enterprise rollout request is queued now. Use the developer portal and the platform workspace to prepare consent scope, legal-name matching, usage billing, sandbox setup, and production review."
        : `The enterprise request is in the queue. Public docs, the developer portal, and the standard enterprise setup path stay available while the direct Galactus sales conversation remains protected. ${GALACTUS_UNLOCK_RULE}`;
  }
}

export async function POST(request: Request) {
  const sessionToken = await getAuthenticatedAppSessionToken();
  const eligibilityState = await getGenerationEligibilityStateForSession(sessionToken);
  const access = getGalactusAccessState(eligibilityState, "sales", "/sales");

  const payload = (await request.json()) as Partial<EnterpriseApiApplication>;
  const application: EnterpriseApiApplication = {
    organizationName: payload.organizationName?.trim() ?? "",
    contactName: payload.contactName?.trim() ?? "",
    businessEmail: payload.businessEmail?.trim() ?? "",
    website: payload.website?.trim() ?? "",
    teamSize: payload.teamSize?.trim() ?? "",
    monthlyRequestBand: payload.monthlyRequestBand?.trim() ?? "",
    decisionType: payload.decisionType?.trim() ?? "",
    needsLegalIdentityMatch: payload.needsLegalIdentityMatch?.trim() ?? "",
    launchPath: payload.launchPath?.trim() ?? "",
    useCase: payload.useCase?.trim() ?? "",
    workflowImpact: payload.workflowImpact?.trim() ?? "",
    consentAcknowledged: Boolean(payload.consentAcknowledged),
  };

  if (
    !application.organizationName ||
    !application.contactName ||
    !application.businessEmail ||
    !application.decisionType ||
    !application.needsLegalIdentityMatch ||
    !application.useCase ||
    !application.workflowImpact ||
    !application.monthlyRequestBand
  ) {
    return NextResponse.json({ error: "Complete every required field before submitting the request." }, { status: 400 });
  }

  if (!application.launchPath) {
    return NextResponse.json({ error: "Choose how you want to launch the enterprise integration." }, { status: 400 });
  }

  if (!isValidEmail(application.businessEmail)) {
    return NextResponse.json({ error: "Use a valid business email address." }, { status: 400 });
  }

  if (!application.consentAcknowledged) {
    return NextResponse.json(
      { error: "Acknowledge consent, scoped API access, and usage-based billing before continuing." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: getLaunchPathMessage(application.launchPath, access.allowed),
    application,
  });
}
