import { NextResponse } from "next/server";

import type { IdentityStatus } from "@/lib/types";
import {
  buildStripeIdentityUpdate,
  normalizeIdentityProfile,
  type IdentityProfileRow,
} from "@/lib/identity";
import { getIdentityValidationError } from "@/lib/identity-validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe";

async function getAuthenticatedUserId() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { error: "Supabase is unavailable.", status: 500, userId: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Log in or sign up to view identity status.", status: 401, userId: null };
  }

  return { error: null, status: 200, userId: user.id };
}

async function readIdentityRow(userId: string) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    throw new Error("Supabase admin access is unavailable.");
  }

  const { data, error } = await admin
    .from("profiles")
    .select(
      [
        "identity_status",
        "identity_full_name",
        "identity_birth_date",
        "identity_address_line_1",
        "identity_city",
        "identity_region",
        "identity_postal_code",
        "identity_country",
        "identity_verified_at",
        "identity_failed_reason",
        "identity_stripe_session_id",
        "identity_stripe_verification_id",
        "identity_last_checked_at",
      ].join(", "),
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as IdentityProfileRow | null) ?? null;
}

async function syncIdentityFromStripe(userId: string, row: IdentityProfileRow | null) {
  if (!row?.identity_stripe_session_id || row.identity_status !== "pending") {
    return normalizeIdentityProfile(row);
  }

  const stripe = getStripeClient();
  const admin = createSupabaseAdminClient();

  if (!stripe || !admin) {
    return normalizeIdentityProfile(row);
  }

  try {
    const session = await stripe.identity.verificationSessions.retrieve(row.identity_stripe_session_id);
    const payload = buildStripeIdentityUpdate(session, row);

    const { error } = await admin.from("profiles").update(payload).eq("user_id", userId);
    if (error) {
      throw new Error(error.message);
    }

    return normalizeIdentityProfile({
      ...row,
      ...payload,
    });
  } catch {
    return normalizeIdentityProfile(row);
  }
}

export async function GET() {
  const auth = await getAuthenticatedUserId();
  if (!auth.userId) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const row = await readIdentityRow(auth.userId);
    const identity = await syncIdentityFromStripe(auth.userId, row);
    return NextResponse.json({ identity });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to read identity profile." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUserId();
  if (!auth.userId) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = (await request.json()) as Partial<{
    fullName: string;
    birthDate: string;
    addressLine1: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  }>;

  const fullName = body.fullName?.trim() ?? "";
  const birthDate = body.birthDate?.trim() ?? "";
  const addressLine1 = body.addressLine1?.trim() ?? "";
  const city = body.city?.trim() ?? "";
  const region = body.region?.trim() ?? "";
  const postalCode = body.postalCode?.trim() ?? "";
  const country = body.country?.trim() ?? "United States";

  const validationError = getIdentityValidationError({
    fullName,
    birthDate,
    addressLine1,
    city,
    region,
    postalCode,
    country,
  });

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin access is unavailable." }, { status: 503 });
  }

  try {
    const existing = await readIdentityRow(auth.userId);
    const nextStatus: IdentityStatus =
      existing?.identity_status === "verified"
        ? "verified"
        : existing?.identity_status === "pending"
          ? "pending"
          : existing?.identity_status === "failed"
            ? "failed"
            : "not_started";

    const payload = {
      user_id: auth.userId,
      identity_status: nextStatus,
      identity_full_name: fullName,
      identity_birth_date: birthDate,
      identity_address_line_1: addressLine1,
      identity_city: city,
      identity_region: region,
      identity_postal_code: postalCode,
      identity_country: country,
      identity_failed_reason: nextStatus === "verified" ? null : existing?.identity_failed_reason ?? null,
      identity_verified_at: existing?.identity_verified_at ?? null,
      identity_last_checked_at: new Date().toISOString(),
    };

    const { error } = await admin.from("profiles").upsert(payload, { onConflict: "user_id" });
    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      identity: normalizeIdentityProfile({
        ...existing,
        ...payload,
        identity_stripe_session_id: existing?.identity_stripe_session_id ?? null,
        identity_stripe_verification_id: existing?.identity_stripe_verification_id ?? null,
      }),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save identity profile." },
      { status: 500 },
    );
  }
}
