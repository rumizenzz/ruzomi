import { NextResponse } from "next/server";

import { getPublicEnv } from "@/lib/env";
import { getIdentityValidationError } from "@/lib/identity-validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe";

type IdentityRow = {
  identity_status: "not_started" | "pending" | "verified" | "failed" | null;
  identity_full_name: string | null;
  identity_birth_date: string | null;
  identity_address_line_1: string | null;
  identity_city: string | null;
  identity_region: string | null;
  identity_postal_code: string | null;
  identity_country: string | null;
};

async function completeLocalPreviewVerification(userId: string) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return null;
  }

  const now = new Date().toISOString();
  const { error } = await admin
    .from("profiles")
    .update({
      identity_status: "verified",
      identity_failed_reason: null,
      identity_verified_at: now,
      identity_stripe_session_id: null,
      identity_last_checked_at: now,
    })
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return { url: "/app/verify?step=verified&localIdentityPreview=1" };
}

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is unavailable." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Log in or sign up to verify your identity." }, { status: 401 });
  }

  if (!admin) {
    return NextResponse.json({ error: "Identity admin access is unavailable right now." }, { status: 503 });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    if (process.env.NODE_ENV !== "production") {
      try {
        const fallback = await completeLocalPreviewVerification(user.id);
        if (fallback) {
          return NextResponse.json({ localPreview: true, url: fallback.url });
        }
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Unable to open local identity preview." },
          { status: 400 },
        );
      }
    }

    return NextResponse.json({ error: "Stripe Identity is unavailable right now." }, { status: 503 });
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
      ].join(", "),
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const identity = (data as IdentityRow | null) ?? null;

  if (identity?.identity_status === "verified") {
    return NextResponse.json({ error: "Identity is already verified." }, { status: 409 });
  }

  const validationError = getIdentityValidationError({
    fullName: identity?.identity_full_name ?? "",
    birthDate: identity?.identity_birth_date ?? "",
    addressLine1: identity?.identity_address_line_1 ?? "",
    city: identity?.identity_city ?? "",
    region: identity?.identity_region ?? "",
    postalCode: identity?.identity_postal_code ?? "",
    country: identity?.identity_country ?? "",
  });

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const env = getPublicEnv();
    const session = await stripe.identity.verificationSessions.create({
      type: "document",
      client_reference_id: user.id,
      return_url: `${env.appUrl}/app/verify?step=pending`,
      metadata: {
        user_id: user.id,
      },
      provided_details: {
        email: user.email ?? undefined,
      },
      options: {
        document: {
          require_live_capture: true,
          require_matching_selfie: true,
        },
      },
    });

    const { error: updateError } = await admin
      .from("profiles")
      .update({
        identity_status: "pending",
        identity_failed_reason: null,
        identity_stripe_session_id: session.id,
        identity_last_checked_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start verification.";

    if (
      process.env.NODE_ENV !== "production" &&
      typeof message === "string" &&
      message.toLowerCase().includes("invalid api key")
    ) {
      try {
        const fallback = await completeLocalPreviewVerification(user.id);
        if (fallback) {
          return NextResponse.json({ localPreview: true, url: fallback.url });
        }
      } catch (fallbackError) {
        return NextResponse.json(
          {
            error:
              fallbackError instanceof Error
                ? fallbackError.message
                : "Unable to open local identity preview.",
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { error: message },
      { status: 400 },
    );
  }
}
