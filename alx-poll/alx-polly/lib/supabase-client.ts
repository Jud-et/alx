import { createBrowserClient } from "@supabase/ssr";

// IMPORTANT: use static env references so Next.js can inline at build-time in the client bundle
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createClient() {
  if (!SUPABASE_URL) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!SUPABASE_ANON_KEY) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}