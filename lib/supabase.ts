import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// The storefront remains renderable before Supabase environment variables are configured.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
