# Mimi Shopping database activation

The initial schema bootstrap has already been installed in the Supabase project.

## One-time activation

Run `supabase/activate_store.sql` once in the Supabase SQL Editor. It enables:

- Atomic cash-on-delivery order creation with server-side price, shipping and stock checks.
- A public product-image bucket with upload/change/delete restricted to authenticated store administrators.
- Public store contact settings (WhatsApp and Instagram) editable by the owner or an administrator.

Do not run the activation file repeatedly. It creates named RLS policies and is intended as a one-time migration.

**Important:** `supabase/migrations/202611140003_product_image_storage.sql` contains the same bucket and storage policies as the activation file. It is an alternative migration record, not an additional script to run after `activate_store.sql`. Running both can fail because the named storage policies already exist. Do not run it separately in the already-activated project.

## Least-privilege role policy update

The initial bootstrap used a broad `is_store_admin()` check for several tables and image uploads. The admin UI already checks individual roles, but direct authenticated Supabase requests could bypass UI-only restrictions.

The migration `supabase/migrations/202611140004_role_scoped_policies.sql` replaces those broad policies with role-scoped access:

- `owner` / `admin`: full management access.
- `catalog`: categories, products, variants, shipping rates, and product-image uploads.
- `orders`: read and update orders; read order items.
- `support`: read orders and order items only.
- Reviews and coupons: `owner` / `admin` only.
- Admin team: each admin can read their own role; only the owner can read/manage the team.

**Live project status:** this migration has already been applied successfully to the Supabase project. Do not run it again. It changes policies only and does not modify store data. Do not rerun the bootstrap or activation scripts.

## Public checkout hardening (required before accepting real orders)

The checkout RPC is callable by the public browser role so the website can submit cash-on-delivery orders without exposing a service-role key. Migration `202611140005_harden_public_checkout.sql` closes validation gaps that could otherwise be bypassed by calling that RPC directly:

- Validates that the selected commune belongs to the selected wilaya using a private reference table seeded from the repository's 69-wilaya location dataset (1,541 commune entries).
- Enforces address and phone format limits inside PostgreSQL, not only in the Next.js route.
- Requires a selected active color/size variant whenever a product has variants.
- Rejects delivery methods whose configured fee is zero or unavailable.

**Action required:** run `supabase/migrations/202611140005_harden_public_checkout.sql` once in the Supabase SQL Editor before accepting real customer orders. It creates the private location reference table and replaces the checkout function; it does not delete or rewrite existing orders, products, variants, or stock. Do not run it more than once unless a later migration explicitly instructs you to do so. The migration is committed to GitHub but has not yet been applied to the live Supabase database.

## After activation

1. Sign in to `/admin`.
2. Add any missing wilayas in **أسعار التوصيل**. All rates start at zero and remain inactive until actual home and desk prices are entered; this can be completed later.
3. **إعدادات التواصل** is optional during setup. WhatsApp and Instagram can remain blank and be added later.
4. Add products and upload their images whenever the catalog is ready. Color/size variants and per-variant stock are optional until those details are known.
5. After at least one real delivery rate is entered and activated, run a controlled end-to-end COD test with an agreed test item and verify the order and stock update.

## Payment

Cash on delivery is the only active payment method in this release. Online payment is deliberately rejected by the checkout RPC until a payment provider and merchant credentials are configured and verified. Never mark an online order paid based only on a browser redirect.

## Production readiness

The site remains a Vercel Preview until migration 005 is applied, delivery rates are configured, the custom domain is connected, and an end-to-end COD order has been safely tested. Product catalog details and contact links are intentionally editable later. Online payment is not part of this COD-only launch. Keep the GitHub `main` branch unchanged while validating `mimi-upgrade`.
