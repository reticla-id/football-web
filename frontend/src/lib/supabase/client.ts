import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase = supabaseUrl && supabaseKey
  ? createBrowserClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        flowType: "pkce",
      },
    })
  : null;

export const supabaseRestUrl = supabaseUrl?.replace(/\/$/, "") ?? null;
export const supabaseAnonKey = supabaseKey ?? null;
