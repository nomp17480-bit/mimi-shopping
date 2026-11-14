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

**Run this migration once in the Supabase SQL Editor after the existing activation.** It changes policies only and does not modify store data. Do not rerun the bootstrap or activation scripts. The migration has been added to GitHub but has **not** been applied to the live Supabase database yet.

## After activation

1. Sign in to `/admin`.
2. Open **أسعار التوصيل** and initialize the 69 wilayas. All rates start at zero intentionally; enter actual carrier prices before enabling checkout.
3. Open **إعدادات التواصل** and enter the business WhatsApp number and Instagram URL.
4. Add products and upload their images. Add color/size variants and set stock for each combination.
5. Place a controlled test order with a test product and verify it appears in **إدارة الطلبات** and the stock is reduced.

## Payment

Cash on delivery is the only active payment method in this release. Online payment is deliberately rejected by the checkout RPC until a payment provider and merchant credentials are configured and verified. Never mark an online order paid based only on a browser redirect.

## Production readiness

The site is a preview until the complete checkout, delivery rates, product data, payment provider, contact details, domain, and end-to-end tests are finished. Keep the GitHub `main` branch unchanged while validating `mimi-upgrade`.
