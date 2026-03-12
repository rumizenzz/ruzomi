import Stripe from "stripe";

import { getServerEnv } from "@/lib/env";
import { buildStripeIdentityUpdate } from "@/lib/identity";
import { recordWalletTopUp } from "@/lib/paytocommit-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const env = getServerEnv();

  if (!stripe || !env.stripeWebhookSecret) {
    return new Response("Missing Stripe webhook configuration.", { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing Stripe signature.", { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.stripeWebhookSecret);
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Invalid Stripe webhook.", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const sessionToken = session.metadata?.session_token ?? null;
    const grossCents = Number(session.metadata?.top_up_amount_cents ?? 0);
    const feeCents = Number(session.metadata?.top_up_fee_cents ?? 0);

    if (sessionToken && grossCents > 0) {
      await recordWalletTopUp(sessionToken, {
        externalReference: session.id,
        grossCents,
        feeCents,
        summary: "Card top-up posted to wallet cash.",
      });
    }
  }

  if (
    event.type === "identity.verification_session.processing" ||
    event.type === "identity.verification_session.requires_input" ||
    event.type === "identity.verification_session.verified" ||
    event.type === "identity.verification_session.canceled"
  ) {
    const session = event.data.object as Stripe.Identity.VerificationSession;
    const admin = createSupabaseAdminClient();
    const userId = session.metadata?.user_id ?? session.client_reference_id ?? null;

    if (admin && userId) {
      const { data: profileRow } = await admin
        .from("profiles")
        .select(
          [
            "identity_verified_at",
            "identity_failed_reason",
            "identity_stripe_verification_id",
          ].join(", "),
        )
        .eq("user_id", userId)
        .maybeSingle();

      const payload = buildStripeIdentityUpdate(session, (profileRow as {
        identity_verified_at: string | null;
        identity_failed_reason: string | null;
        identity_stripe_verification_id: string | null;
      } | null) ?? null);

      await admin
        .from("profiles")
        .update({
          ...payload,
          identity_stripe_session_id: session.id,
        })
        .eq("user_id", userId);
    }
  }

  return new Response("ok", { status: 200 });
}
