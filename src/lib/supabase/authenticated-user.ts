import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAuthenticatedSupabaseUser() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}

export async function getAuthenticatedAppSessionToken() {
  const user = await getAuthenticatedSupabaseUser();
  return user ? toAuthenticatedAppSessionToken(user.id) : null;
}

export function toAuthenticatedAppSessionToken(userId: string) {
  return `auth:${userId}`;
}
