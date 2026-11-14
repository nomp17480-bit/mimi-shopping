# Mimi Shopping — development branch

This branch adds the Next.js App Router foundation while preserving the original root-level files.

## Environment
Set these variables in Vercel (Preview environment first):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Use only the Supabase public anon/publishable key. Never expose a service_role key in browser or public environment variables.

## Current scope
- Responsive Arabic storefront shell.
- Public category and active-product reads when Supabase is configured.
- Graceful preview state when environment variables are absent.

## Database migration — NOT APPLIED
The file `supabase/migrations/202611140001_store_expansion.sql` is a proposed additive migration for product variants, order line items, admin roles, reviews, and coupons. It has only been committed to this Git branch. It has NOT been run against Supabase.

Before applying it:
1. Export a full database backup.
2. Test the migration on a separate Supabase staging project.
3. Inspect existing RLS policies on categories, products, orders, and shipping_rates. This migration adds named policies but does not automatically remove unknown pre-existing policies.
4. Verify table grants, role bootstrap, and admin access with test accounts.
5. Keep order creation disabled for anonymous clients until a validated server-side endpoint exists.

The first owner account must be bootstrapped deliberately after creating its Supabase Auth user. Do not expose a service_role key in the browser.

## Not implemented yet
Checkout, cart persistence, WhatsApp order submission, public review submission, admin screens, coupons UI, shipping-rate management, and online payment are not enabled by this scaffold. Do not accept real orders through this preview yet.

## Data safety
The local Acode file and its localStorage key `mimiData` are separate from this repository and from the deployed site's origin. Keep `index-backup.html` and export the local data before any migration. Do not overwrite the local app as part of this branch.
