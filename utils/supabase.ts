import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
}

if (!supabaseServiceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const supabaseBrowserConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey || "",
};

export const SUPABASE_PROMPT_IMAGES_BUCKET =
  process.env.SUPABASE_PROMPT_IMAGES_BUCKET || "prompt-template-images";

export const SUPABASE_GENERATED_IMAGES_BUCKET =
  process.env.SUPABASE_GENERATED_IMAGES_BUCKET || "generated-images";

export function ensureSupabaseBrowserEnv() {
  if (!supabaseBrowserConfig.url || !supabaseBrowserConfig.anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required");
  }
}
