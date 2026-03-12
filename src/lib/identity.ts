import type Stripe from "stripe";

import type { IdentityProfile, IdentityStatus } from "@/lib/types";

type IdentityRow = {
  identity_status: IdentityStatus | null;
  identity_full_name: string | null;
  identity_birth_date: string | null;
  identity_address_line_1: string | null;
  identity_city: string | null;
  identity_region: string | null;
  identity_postal_code: string | null;
  identity_country: string | null;
  identity_verified_at: string | null;
  identity_failed_reason: string | null;
  identity_stripe_session_id: string | null;
  identity_stripe_verification_id: string | null;
  identity_last_checked_at: string | null;
};

export type IdentityProfileRow = IdentityRow;

export function normalizeIdentityProfile(row: IdentityRow | null): IdentityProfile {
  return {
    status: row?.identity_status ?? "not_started",
    fullName: row?.identity_full_name ?? "",
    birthDate: row?.identity_birth_date ?? "",
    addressLine1: row?.identity_address_line_1 ?? "",
    city: row?.identity_city ?? "",
    region: row?.identity_region ?? "",
    postalCode: row?.identity_postal_code ?? "",
    country: row?.identity_country ?? "United States",
    verifiedAt: row?.identity_verified_at ?? null,
    failedReason: row?.identity_failed_reason ?? null,
    stripeSessionId: row?.identity_stripe_session_id ?? null,
  };
}

export function mapStripeIdentityStatus(
  session: Stripe.Identity.VerificationSession,
): IdentityStatus {
  switch (session.status) {
    case "verified":
      return "verified";
    case "requires_input":
    case "canceled":
      return "failed";
    case "processing":
      return "pending";
    default:
      return "pending";
  }
}

export function buildStripeIdentityUpdate(
  session: Stripe.Identity.VerificationSession,
  existing:
    | Pick<
        IdentityRow,
        "identity_verified_at" | "identity_failed_reason" | "identity_stripe_verification_id"
      >
    | null,
) {
  const nextStatus = mapStripeIdentityStatus(session);
  const verificationId =
    session.last_verification_report &&
    (typeof session.last_verification_report === "string"
      ? session.last_verification_report
      : session.last_verification_report.id);

  return {
    identity_status: nextStatus,
    identity_failed_reason:
      nextStatus === "failed"
        ? session.last_error?.reason ?? "Verification requires another attempt."
        : null,
    identity_verified_at:
      nextStatus === "verified"
        ? new Date().toISOString()
        : existing?.identity_verified_at ?? null,
    identity_stripe_verification_id:
      verificationId ?? existing?.identity_stripe_verification_id ?? null,
    identity_last_checked_at: new Date().toISOString(),
  };
}
