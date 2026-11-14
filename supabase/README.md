# Mimi Shopping — Supabase database status

This file records the live Supabase setup. It is a status guide, not an instruction to rerun completed SQL.

## Completed setup — do not rerun

The live project has successfully completed:

1. `supabase/bootstrap.sql` — initial schema.
2. `supabase/activate_store.sql` — one-time store activation, checkout RPC foundation, product image storage, and store settings.
3. `supabase/migrations/202611140004_role_scoped_policies.sql` — least-privilege RLS policies.
4. Checkout hardening migration 005 — applied through the split scripts in `supabase/manual/`.

The user confirmed successful execution of each manual step. Read-only verification returned:
- `public.store_communes`: **1,541** rows.
- `public.place_public_order`: **1** function.

**Do not rerun bootstrap, activation, migration 004, or any migration 005 step.** In particular, do not run `202611140003_product_image_storage.sql` after activation: it duplicates the storage bucket/policies created by the activation script.

## What migration 005 protects

The checkout RPC is public-callable so the storefront can submit COD orders without a service-role key. The hardening migration adds database-level validation that cannot be bypassed by skipping the Next.js form:

- Confirms that a commune belongs to the selected wilaya using a private reference table seeded with 1,541 commune rows.
- Validates phone and address constraints inside PostgreSQL.
- Requires a valid variant when a product has variants.
- Rejects a delivery choice unless its configured rate is active and greater than zero.
- Keeps stock changes inside the order transaction so failed orders do not partially decrement stock.

The original combined migration is retained at `supabase/migrations/202611140005_harden_public_checkout.sql`. The mobile-friendly scripts are retained under `supabase/manual/` as an execution record. They are not pending work.

## Current shipping setup

Shipping rows are prepared with zero prices and inactive status. This is intentional until verified courier prices are available.

From **لوحة الإدارة → أسعار التوصيل**:
- Enter the real home-delivery fee.
- Enter the real desk-delivery fee.
- Activate only the wilayas and delivery methods the store can actually serve.

Do not use estimated prices. The storefront may display both delivery choices, but the database must block checkout when the selected fee is unavailable or zero.

## Roles and access

The applied role-scoped policy update limits access by role:
- `owner` / `admin`: administrative management.
- `catalog`: catalog, variants, categories, shipping configuration, and product image operations.
- `orders`: order management and permitted order-item reads.
- `support`: read-only order and order-item access.
- Reviews, coupons, and team administration remain restricted as defined by the policies.

Admin UI checks are not the only security boundary; database RLS remains essential.

## Payment

Cash on delivery is the only enabled payment method. Online payment is not configured and must not be represented as available. Never mark an order paid based solely on a browser redirect.

## Remaining release work

The database hardening itself is complete. Before Production:
1. Enter verified delivery rates.
2. Run one controlled COD order after explicit approval, then verify the saved order and stock update.
3. Keep the current Preview deployment until the application and domain are approved for release.

Do not delete or rewrite existing products, orders, variants, stock, or settings as part of routine validation.
