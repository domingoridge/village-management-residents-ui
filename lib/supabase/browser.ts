import { createBrowserClient } from "@supabase/ssr";

/**
 * Create a Supabase client for use in browser/client components
 * Uses cookies for session management with automatic refresh
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
