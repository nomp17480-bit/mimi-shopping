# Mimi Shopping — deployment and release status

## Active development

- GitHub repository: `nomp17480-bit/mimi-shopping`
- Active development branch: `mimi-upgrade`
- Keep `main` unchanged. Do not merge this branch without explicit approval.
- Latest branch commit after adding the shipping-rate setup script: `456524b658baac182f372942385d6203568173a3`
- The earlier Vercel Preview is not proof that this latest commit is deployed. No current Netlify deployment has been verified yet.
- Production must remain disabled until the release checks below are complete.

## Netlify deployment

This is a Next.js App Router project. Netlify supports Next.js 13.5+ with automatic framework detection and its managed Next.js runtime; do not add or pin a separate Next.js adapter unless Netlify build logs specifically require it.

Expected build command: `next build` (or Netlify's detected `npm run build`).
Connect the GitHub repository and select branch `mimi-upgrade` for the first Preview deployment.

Set these environment variables in Netlify for the deployment contexts that will be used:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public anon/publishable key only)

The same values are already described in `.env.example`. Never add a Supabase `service_role` key to GitHub, a `NEXT_PUBLIC_*` variable, or a client-side environment setting. Environment variable changes require a new deployment.

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

## Shipping prices

The owner-approved shipping rates are:
- Wilaya 16 (Algiers): 350 DZD.
- All other 68 wilayas: 700 DZD.
- The same price is currently assigned to home and desk delivery, as agreed.
- All 69 wilayas are activated in the rate setup.

The prepared script is `supabase/manual/006-configure-shipping-rates.sql`. It inserts or updates only `shipping_rates`; it does not change products, orders, stock, or users. It still needs to be run once in the correct Supabase project's SQL Editor, then verified in **لوحة الإدارة → أسعار التوصيل**. After that, prices remain editable from that admin page without code changes.

## Safe validation

Previously completed checks include admin sign-in, storefront/catalog display, cart interactions, admin product editing, image upload, inventory page, and the wilaya/commune and delivery-method controls.

Do not create a real or test COD order or decrement stock without explicit approval and an agreed test product. Until the shipping script is applied and verified, checkout must remain unavailable for any rate that is still zero/inactive.

## Release gates before Production

1. Run and verify the shipping-rate script.
2. Connect Netlify to `mimi-upgrade`, add the public Supabase environment variables, and confirm a successful deploy.
3. Verify the deployed storefront and admin login; check Netlify build/runtime logs.
4. Perform one controlled COD order only after explicit approval, then verify the saved order, total, and stock movement.
5. Connect a custom domain only after the domain is registered and DNS access is available.
6. Obtain explicit approval before Production promotion or changing `main`.

## Data safety

Do not delete, reset, or reseed live Supabase data. Do not rerun one-time SQL scripts to resolve application issues. Investigate the specific error and use a narrowly scoped, additive fix instead.
