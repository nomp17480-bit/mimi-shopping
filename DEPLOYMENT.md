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

## Not implemented yet
Checkout, cart persistence, WhatsApp order submission, customer reviews, variant-level inventory, admin authentication/roles, coupons, shipping-rate management, and online payment are not enabled by this scaffold. Implement and test these with database migrations and Row Level Security before accepting real orders.

## Data safety
The local Acode file and its localStorage key `mimiData` are separate from this repository and from the deployed site's origin. Keep `index-backup.html` and export the local data before any migration. Do not overwrite the local app as part of this branch.
