import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Supabase now recommends the publishable-key name; keep anon-key compatibility.
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// The storefront remains renderable before Supabase environment variables are configured.
export const supabase = url && publicKey ? createClient(url, publicKey) : null;
