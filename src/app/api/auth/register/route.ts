import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type RegisterBody = {
  email?: string;
  password?: string;
  username?: string;
};

function normalizeUsername(value: string) {
  return value
    .trim()
    .replace(/^@+/, "")
    .replace(/[^a-zA-Z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
}

export async function POST(request: Request) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      {
        error: "Server-backed signup is unavailable right now.",
        fallbackToEmailSignup: true,
      },
      { status: 503 },
    );
  }

  const body = (await request.json()) as RegisterBody;
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const username = normalizeUsername(body.username ?? "");

  if (!email || !password || !username) {
    return NextResponse.json({ error: "Email, username, and password are required." }, { status: 400 });
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      preferred_username: username,
      username,
      display_name: username,
    },
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("already been registered") || message.includes("already registered") || message.includes("already exists")) {
      return NextResponse.json({ error: "That email already has an account. Log in instead." }, { status: 409 });
    }

    return NextResponse.json({ error: error.message || "Unable to create your account right now." }, { status: 400 });
  }

  return NextResponse.json({
    userId: data.user?.id ?? null,
    emailConfirmed: true,
  });
}
