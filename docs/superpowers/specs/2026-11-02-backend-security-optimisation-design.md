# Backend security and optimisation

Date: 2026-11-02. Status: awaiting review.
Companion spec: `2026-11-02-storefront-redesign-design.md`. The admin dashboard redesign gets its own spec later.

## Why this ships first

The storefront redesign is cosmetic and can wait a day. The access-control and payment gaps in `beaded-backend/server.js` are live now, so this work merges first as its own milestone, then the redesign continues from that base.

## Goals

1. Close the access-control, authentication and payment-integrity gaps in the API.
2. Keep every current flow working, including the ₱1 test checkout and the existing admin dashboard.
3. Make the API faster for the storefront, especially after a Render cold start.
4. Give the backend tests, so each fix is proven and stays fixed.

## Non-goals

- Redesigning the admin dashboard.
- Moving sessions from `localStorage` JWTs to httpOnly cookies. That needs Vercel and Render on one domain, so it is a later job. The content security policy below reduces the risk in the meantime.
- Changing hosts or the database.

## Constraints

- `node server.js` stays the entry point, so Render's start command does not change.
- The `admin_secret` request header stays, so the dashboard keeps working.
- Dashboard edits are limited to three: send the key on two requests that omit it today (custom order list, availability toggle), and load the theme from settings.
- ₱1 checkout stays the default until the owner deliberately turns it off.

## Structure

`server.js` is 1,148 lines, calls `listen` on import and cannot be tested. It splits into small modules with no change to public URLs except those listed under "API changes".

```text
beaded-backend/
  server.js              connects to MongoDB and calls listen
  app.js                 builds and exports the Express app
  config/env.js          reads and validates environment variables at startup
  middleware/            requireUser, requireAdmin, rate limits, validate, errors
  routes/                auth, user, products, orders, webhooks, admin, content, custom-orders
  services/              email, otp, pricing, payments, cache, firebase
  data/beads.js          server copy of the bead, string and charm price tables
  models/                existing Mongoose models
  scripts/               one-time catalogue script (see "Catalogue data")
  test/                  node:test suites
```

## Security changes

| Area | Change |
| --- | --- |
| Google sign-in | The browser sends its Firebase ID token. The server verifies signature, issuer, audience and expiry, then takes the email from the verified token. The request body is never trusted for identity. |
| Input handling | Every route validates its body with a `zod` schema. Identity and code fields must be plain strings. Mongoose `sanitizeFilter` is switched on globally as a second layer. |
| Password reset | Resetting a password requires a valid, unexpired code for that purpose. The code is consumed by the reset. |
| Admin access | One `requireAdmin` middleware guards every admin route using a constant-time comparison. It fails closed if `ADMIN_SECRET` is unset. |
| Product writes | Creating, editing and toggling products all require admin access, and writes accept only listed fields. |
| Custom order list | Reading the list requires admin access. |
| Orders | The browser can no longer create a paid order. See "Order and payment flow". |
| Webhook | PayMongo webhooks are verified against the `Paymongo-Signature` header using the raw body and `PAYMONGO_WEBHOOK_SECRET`, with a timestamp tolerance. Without the secret, the route rejects the event and logs a warning. |
| Prices | The server prices every cart line from its own data. Client-sent prices and totals are ignored. |
| One-time codes | Generated with `crypto.randomInt`, stored hashed, tagged with a purpose (login, reset, delete), limited to 5 attempts and single-use. A code issued for one purpose cannot be used for another. |
| Rate limits | `express-rate-limit` on auth, code, email-sending, checkout, custom order and admin routes, with `trust proxy` set for Render. The existing limiter is defined but never attached. |
| Account discovery | Forgot-password and resend-code return the same response whether or not the account exists. |
| Sessions | `requireUser` returns 401 for a bad token and for a deleted user. |
| Email | All user-supplied values are HTML-escaped in templates. Orders send one receipt only. Customer emails and addresses leave the logs. |
| Errors | One error handler logs the detail and returns a generic message. Internal error text is no longer sent to clients. |
| Uploads | Admin only, images only, 5 MB limit. Replaces `multer-storage-cloudinary` with a direct `cloudinary` v2 upload stream, which also fixes editing a product image: that path references an undefined variable today and silently keeps the old image. |
| Headers | `helmet` on the API. Vercel adds CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy`. The CSP allows Google Analytics, Firebase sign-in, Cloudinary images and the API. The inline analytics script moves to a bundled file so no inline script is needed. |
| CORS | Explicit allowlist from `CLIENT_URL` plus local dev origins. An unset value fails at startup instead of allowing every origin. |
| Startup | The server refuses to start if `JWT_SECRET`, `ADMIN_SECRET`, `MONGODB_URI` or `CLIENT_URL` is missing. |
| Dependencies | Updated until `npm audit --omit=dev` is clean on both packages. Baseline today: 10 in the backend (1 critical, 6 high, 3 moderate) and 6 in the frontend (2 critical, 3 high, 1 moderate). Unused `stripe` and `nodemailer` are removed. |

## Order and payment flow

Today two paths can record a sale: the browser posts a self-declared paid order after returning from PayMongo, and the webhook records another. The new flow has one path.

1. The browser posts the cart, address and region to `POST /api/create-checkout-session`.
2. The server validates the form and prices each line. Catalogue lines come from `Product`. Custom lines come from the `CustomOrder` referenced by the cart line. Shipping comes from settings, free over the threshold.
3. The server creates the PayMongo session and saves an `Order` with status `Pending Payment`, a random public `ref`, the priced items and the order total.
4. PayMongo returns the customer to `CLIENT_URL` with the `ref`.
5. Either of two triggers calls one idempotent `markOrderPaid(sessionId)`:
   - the verified webhook, or
   - `POST /api/orders/confirm { ref }`, where the server asks PayMongo for the session status.
6. The order becomes `Paid` once and sends one receipt. Pending orders never count in stats, bestsellers or a customer's order list.

The storefront stops writing the address and cart to `localStorage` as `pending_order`.

## Showcase mode

A single setting replaces the hard-coded test block.

- `CHECKOUT_MODE=showcase` is the default when the variable is unset. PayMongo receives one ₱1 line item.
- `CHECKOUT_MODE=live` sends the real line items and shipping.
- `GET /api/settings` includes `showcase: true|false`, which drives the storefront's portfolio notice and checkout note.
- In showcase mode `amountPaid` keeps the order total, so the dashboard stays realistic, and a new `chargedAmount` records the ₱1 actually charged.

## API changes

| Route | Change |
| --- | --- |
| `POST /api/orders` | Removed. Replaced by `POST /api/orders/confirm`. |
| `POST /api/google-login` | Body is now `{ idToken }`. |
| `POST /api/reset-password` | Body now includes the code. |
| `GET /api/custom-orders` | Requires `admin_secret`. |
| `POST /api/custom-orders` | Validated and priced on the server. Returns `_id`, which the cart line keeps as `customOrderId`. |
| `POST`/`PUT /api/products`, `PUT /api/products/:id/status` | Require `admin_secret`. |
| `GET /api/settings` | Adds `theme`, `shippingRates`, `freeShippingOver`, `showcase`. |
| `PUT /api/admin/settings` | Accepts the same new fields. |
| `GET /api/health` | New. Returns process and database status for uptime checks. |

The small storefront edits these require land in the same milestone, against the current `App.jsx`, so `main` keeps working.

## Data model

- `Settings`: add `theme` (`brown` or `pink`, default `brown`), `shippingRates` (default Metro Manila 85, Luzon 100, Visayas 120, Mindanao 130) and `freeShippingOver` (default 500). The dashboard already sends `theme`, but the schema has no such field, so the value is dropped today.
- `Product`: add optional `desc`.
- `Order`: add `ref` (unique) and `chargedAmount`; make `checkoutSessionId` unique; add the `Pending Payment` status.
- `User`: remove the duplicated `resetOtp` fields; add `otpHash`, `otpPurpose`, `otpExpire`, `otpAttempts`.
- Indexes: `Order.customerEmail`, `Order.createdAt`, `Order.status`, `CustomOrder.email`, `CustomOrder.createdAt`, `Blog.createdAt`, `Review.createdAt`.

## Optimisation

- `compression` on API responses.
- `.lean()` and field selection on public reads.
- A small in-memory cache with invalidation on admin writes: products, settings, blogs and reviews for 60 seconds, bestsellers for 5 minutes.
- `Cache-Control: public, max-age=30, stale-while-revalidate=120` on those GET routes.
- `/api/admin/stats` becomes an aggregation instead of loading every order.
- `/api/bestsellers` counts paid orders only, and the fixed flow gives it real item names. In test mode the webhook path only sees "Test Order (1 Peso)".
- `/api/health` gives the owner a target for an optional uptime monitor, which reduces Render free-tier cold starts.

## Catalogue data

Products are test data. The owner chose realistic prices while checkout still charges ₱1. Proposed values, anchored to the builder's own maths (a 16.5 cm seed bead bracelet comes to about ₱61):

| Product | Now | Proposed | Category | Material |
| --- | --- | --- | --- | --- |
| Basic Beads Bracelet | ₱1, Plastic | ₱65 | Bracelet | Seed beads |
| Glossy Beads Bracelet | ₱2, Plastic | ₱85 | Bracelet | Glass seed beads |
| November Necklace | ₱55, Plastic | ₱185 | Necklace | Glass, acrylic and imitation stone beads, flower pendant |

A one-time script, `scripts/showcase-catalog.js`, sets these by product ID and prints what it changed. It runs only when the owner says so, with their own `MONGODB_URI`. The category fix also makes the Shop filters work. Glossy stays sold out, because it demonstrates that state.

## Testing

`node:test`, `supertest` and `mongodb-memory-server`, run with `npm test`. Each security row above gets at least one test that fails before its fix. Nothing is tested against production. PayMongo, Firebase verification and Resend are stubbed at the service boundary.

## Rollout

1. Owner adds `PAYMONGO_WEBHOOK_SECRET` on Render from the PayMongo dashboard.
2. Owner confirms `CLIENT_URL` on Render, and leaves `CHECKOUT_MODE` unset to stay at ₱1.
3. Owner rotates `JWT_SECRET` and `ADMIN_SECRET` on Render at merge time. Everyone is signed out once and the new admin key goes into the dashboard.
4. Merge to `main`. This assumes Vercel and Render both deploy from `main`, so frontend and backend change together.
5. Verify in production: anonymous admin calls return 403, a signed-out custom order read returns 403, Google sign-in and email login work, and one ₱1 test order records exactly one paid order and one receipt.

The repository is public, so this branch stays local until the fixes are ready. Specs and fixes go up together at the merge in step 4.

## Self-review notes

- Existing `Pending Studio Review` custom orders are unaffected.
- Cart lines saved before this change have no `customOrderId`. The checkout returns a clear message asking the customer to rebuild that custom item.
- A unique index on `checkoutSessionId` could fail to build if duplicates already exist. The migration step reports duplicates rather than deleting anything.
