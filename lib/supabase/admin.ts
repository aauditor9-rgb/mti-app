import { createClient } from "@supabase/supabase-js";

// Service-role client. Per design/TECH_STACK.md "Multi-tenancy": never query with the
// service-role key from a request handler — this file is imported only by one-off admin
// scripts (lib/db/create-login.ts), never by anything under app/.
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set — see .env.example");
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
