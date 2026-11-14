# Mimi Shopping — deployment and release status

## Active development and deployment

- GitHub repository: `nomp17480-bit/mimi-shopping`
- Active development branch: `mimi-upgrade`
- Keep `main` unchanged. Do not merge this branch without explicit approval.
- Vercel project: `mimi-shopping`
- Current delivery-method fix is deployed to Preview and READY:
  - URL: https://mimi-shopping-j9hh3ia0u-nomp17480-7979.vercel.app/
  - Commit: `bfc6f803fbf113ab09388bd9189dd7d7f5854d13`
- Do not treat an older deployment as the current build.
- Production deployment is intentionally not enabled as part of this work.

## Environment variables

Configure in Vercel Preview:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The application also accepts `NEXT_PUBLIC_SUPABASE_ANON_KEY` as a compatibility fallback. Use only the public/publishable key. Never expose a Supabase `service_role` key in browser code or a `NEXT_PUBLIC_*` variable.

## Application scope

The current Next.js application includes:
- Arabic storefront, categories, active products, search/filter, and cart.
- Checkout form with customer details, wilaya, commune, home/desk delivery choice, and COD payment.
- Server-side checkout route and database RPC.
- Admin pages for catalog, inventory, orders, shipping rates, contact settings, and team roles.
- Product image upload to the `mimi-products` Supabase Storage bucket.
- Role-aware authorization in admin actions and database RLS policies.

Online payment is not enabled. WhatsApp and Instagram settings may remain blank until the store owner is ready to add them.

## Supabase status — already applied

The live project has already completed:
- Initial database bootstrap.
- One-time store activation.
- Role-scoped RLS policy update `202611140004_role_scoped_policies.sql`.
- Public checkout hardening migration 005, applied through the mobile-friendly scripts in `supabase/manual/`.

The migration 005 verification query returned:
- `store_communes`: 1,541 rows.
- `place_public_order`: exactly one function.

**Do not rerun** the bootstrap, activation, role policy migration, or any of the completed 005 steps. See [supabase/README.md](./supabase/README.md) for the recorded live status.

## Shipping configuration

Shipping rates are deliberately stored as zero and inactive until real courier prices are known. Both delivery choices can be selected in the storefront, but checkout must reject an order when the selected delivery method has no active positive fee. Enter verified home and desk prices in **لوحة الإدارة → أسعار التوصيل** before accepting orders. Do not invent or prefill courier prices.

## Safe validation

Previously completed checks include admin sign-in, storefront/catalog display, cart interactions, admin product editing, image upload, inventory page, and the wilaya/commune and delivery-method controls.

A real COD checkout has not been marked complete because delivery rates are not configured. Do not create a test order or decrement stock without explicit approval and an agreed test product.

## Release gates before Production

1. Configure verified shipping rates and activate only the supported wilayas.
2. Connect and verify the intended custom domain.
3. Perform one controlled COD order and verify order details, totals, and stock movement.
4. Recheck access roles, public checkout validation, and deployment logs.
5. Obtain explicit approval before deploying Production or changing `main`.

## Data safety

Do not delete, reset, or reseed live Supabase data. Do not rerun one-time SQL scripts to resolve application issues. Investigate the specific error and use a narrowly scoped, additive fix instead.
