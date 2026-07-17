"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Admin sign-in for the assessment dashboard. Any Supabase user can sign in;
// /admin then gates on ADMIN_ALLOWLIST (see src/lib/assessment/admin.ts).
export async function signIn(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin") || "/admin";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect(next.startsWith("/") ? next : "/admin");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
