import { createBrowserClient } from "@supabase/ssr";

// Client Component client — for the sign-in form only. Everything else in this app
// reads/writes data through lib/db (Drizzle over DATABASE_URL), not through Supabase's
// PostgREST layer, so this client's only job is auth.
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
