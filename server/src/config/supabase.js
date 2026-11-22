import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

// * Used only to verify login tokens. All data access goes through our own database pool.
export const supabaseAuthClient = createClient(env.supabaseUrl, env.supabasePublishableKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
