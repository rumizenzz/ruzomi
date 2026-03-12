import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { getPublicEnv, hasSupabaseEnv } from "@/lib/env";

export async function createSupabaseServerClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const cookieStore = await cookies();
  const env = getPublicEnv();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(nextCookies) {
        // Server components can read cookies but cannot always mutate them during render.
        // Route handlers and server actions still perform the real auth-cookie writes.
        try {
          nextCookies.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignore render-time refresh attempts so normal page loads do not crash.
        }
      },
    },
  });
}
