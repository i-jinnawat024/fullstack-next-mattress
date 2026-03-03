/**
 * Supabase client — 100% data source (catalog + sales/targets)
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./schema";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let _client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them in .env.local");
  }
  if (!_client) _client = createClient<Database>(supabaseUrl, supabaseAnonKey);
  return _client;
}

/** For server-side (API routes, RSC) */
export function getSupabaseServer() {
  return getSupabase();
}
