import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getPublicEnv, getServerEnv, hasSupabaseAdminEnv } from "@/lib/env";

let cachedClient: SupabaseClient | null | undefined;

export function createSupabaseAdminClient() {
  if (!hasSupabaseAdminEnv()) {
    return null;
  }

  if (cachedClient) {
    return cachedClient;
  }

  const publicEnv = getPublicEnv();
  const serverEnv = getServerEnv();

  cachedClient = createClient(publicEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
}
