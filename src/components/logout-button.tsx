"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LogoutButton({
  className = "action-secondary",
  label = "Log out",
}: {
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (!supabase || isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button className={className} disabled={isLoggingOut} onClick={() => void handleLogout()} type="button">
      {isLoggingOut ? "Logging out..." : label}
    </button>
  );
}
