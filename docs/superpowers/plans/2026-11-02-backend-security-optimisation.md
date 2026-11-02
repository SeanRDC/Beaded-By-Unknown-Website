# Backend Security and Optimisation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the API's access, auth and payment gaps, make it faster, and put tests behind every fix, without breaking the current storefront or dashboard.

**Architecture:** `server.js` becomes a thin entry over an exported Express app. Routes, middleware and services move into focused files. External calls (PayMongo, Google certificates, Resend, Cloudinary) sit behind service modules that tests replace.

**Tech Stack:** Express 5, Mongoose 9, zod, helmet, compression, express-rate-limit, node:test, supertest, mongodb-memory-server.

**Spec:** `docs/superpowers/specs/2026-11-02-backend-security-optimisation-design.md`

## Global Constraints

- `node server.js` stays the entry point.
- The `admin_secret` header stays.
- Dashboard edits are limited to: send the key on the custom order list and availability toggle, load the theme from settings.
- ₱1 stays the default: `CHECKOUT_MODE` unset means showcase.
- JSON errors keep the shape `{ error: string }`.
- Nothing runs against production. `scripts/showcase-catalog.js` is dry-run unless `--apply` is passed, and only the owner triggers `--apply`.
- Commits are under the owner's identity with no Claude line.

## Review Focus

- The webhook and the confirm call arrive together: exactly one `Paid` order and one receipt.
- A customer returns from PayMongo without paying: the order stays pending, no receipt, confirm reports pending.
- A product is deleted or sold out after being added to a bag: checkout returns a clear 400 and creates no session.
- A bag saved before this change has a custom line with no `customOrderId`: checkout returns a clear 400 asking to rebuild it.
- `RESEND_API_KEY` or `PAYMONGO_WEBHOOK_SECRET` is missing: the server still starts, a failed email never fails an order, the webhook rejects.

---

### Task 1: Repo clean-up and test harness

**Files:** remove tracked root `node_modules`, root `package.json`, root `package-lock.json`, `beaded-frontend/index.js`, `beaded-frontend/src/App.css`. Create `.gitignore`, `beaded-backend/test/helpers.js`. Modify `beaded-backend/package.json`.

**Interfaces:**
- Produces: `helpers.startDb()`, `helpers.stopDb()`, `helpers.resetDb()`, `helpers.api()` returning a supertest agent over `createApp({ rateLimits: false })`.

- [x] Remove the listed files with `git rm`, add a root `.gitignore` for `node_modules/`, `dist/`, `.env`, `.env.*`, `.taste-skill/`, and commit.
- [x] Update dependencies: remove `stripe`, `nodemailer`, `multer-storage-cloudinary`; upgrade `cloudinary` to 2.x and the rest within range; add `zod`, `helmet`, `compression`; dev add `supertest`, `mongodb-memory-server`. `npm audit --omit=dev` must report 0. Add `"start": "node server.js"` and `"test": "node --test test/"`.

### Task 2: Split the server, fail closed at startup

**Files:** Create `app.js`, `config/env.js`, `middleware/errors.js`. Rewrite `server.js`. Test: `test/app.test.js`.

**Interfaces:**
- Produces: `createApp({ rateLimits = true } = {}) -> express.Application`; `assertEnv(env = process.env)` throws naming missing keys from `JWT_SECRET`, `ADMIN_SECRET`, `MONGODB_URI`, `CLIENT_URL`; `checkoutMode() -> 'showcase' | 'live'`; `allowedOrigins() -> string[]`; `HttpError(status, message)`.

- [x] Tests: `assertEnv` throws for each missing key; unknown route returns 404 JSON; a thrown internal error returns 500 with a generic message and no internal text; CORS allows `CLIENT_URL` and both its `www` and bare forms and refuses others; helmet headers present; `GET /api/health` reports `db`.
- [x] Move all existing routes into `routes/*.js` unchanged in behaviour, mount them from `app.js`, set `trust proxy` to 1 and `mongoose.set('sanitizeFilter', true)`.

### Task 3: Authentication and one-time codes

**Files:** Create `middleware/auth.js`, `middleware/validate.js`, `middleware/limits.js`, `services/otp.js`, `services/email.js`, `services/firebase.js`. Modify `routes/auth.js`, `routes/user.js`, `models/User.js`. Test: `test/auth.test.js`, `test/otp.test.js`.

**Interfaces:**
- Produces: `validate(schema)`; `requireUser` sets `req.account`; `issueOtp(user, purpose) -> code` (`purpose`: `login`, `reset`, `delete`); `checkOtp(user, purpose, code, { consume = true }) -> boolean`; `email.send({ to, subject, html })` never throws; `email.transport.deliver` replaceable in tests; `escapeHtml(value)`; `firebase.verifyIdToken(token) -> { email, firstName, lastName }`.

- [x] Tests: a non-string `email` or `otp` returns 400 on every auth route; a code cannot be used for a different purpose; a sixth wrong attempt fails even with the right code; codes are stored hashed; reset without a valid code changes nothing and a used code cannot be reused; forgot-password and resend-code answer identically for known and unknown emails; google-login rejects a body with no token and takes identity only from the verified token; a deleted user's token returns 401 on `/api/user/me`; rate limit returns 429 after the limit with `createApp({ rateLimits: true })`.
- [x] Verify Firebase tokens with `jsonwebtoken` against Google's `securetoken` x509 certificates, cached by `max-age`, with `RS256`, audience and issuer from `FIREBASE_PROJECT_ID` (default `beaded-shop`), and require `email_verified`.

### Task 4: Admin access, products and uploads

**Files:** Create `middleware/admin.js`, `services/uploads.js`, `services/cache.js`. Rewrite `cloudinary.js` into `services/uploads.js`. Modify `routes/products.js`, `routes/admin.js`, `routes/content.js`, `routes/customOrders.js`, `models/Product.js`. Test: `test/admin.test.js`.

**Interfaces:**
- Produces: `requireAdmin` (constant time, fails closed when `ADMIN_SECRET` is unset); `uploads.store(file) -> url`, replaceable in tests; `cached(key, ttlMs, fn)`, `cache.clear(prefix?)`, `publicCache` middleware.

- [x] Tests: every admin route and each product write returns 403 without the key and when `ADMIN_SECRET` is unset; product writes ignore unlisted fields; a non-image or oversized upload returns 400; editing with `primaryImage` or `image` replaces the picture; `GET /api/custom-orders` returns 403 without the key.

### Task 5: Pricing, checkout, orders and the webhook

**Files:** Create `data/beads.js`, `services/pricing.js`, `services/payments.js`, `services/orders.js`. Modify `routes/orders.js`, `routes/webhooks.js`, `routes/customOrders.js`, `models/Order.js`, `models/CustomOrder.js`. Test: `test/orders.test.js`, `test/pricing.test.js`.

**Interfaces:**
- Produces: `priceCustomDesign({ collectionId, beads, stringId, lockColor, extender, charmIds, wristCm }) -> { beadType, beadSize, string, charms, totalPrice }`; `priceCart(cart, region, settings) -> { lines, subtotal, shippingFee, total }`; `payments.createSession(...)`, `payments.fetchSession(id)`, `payments.verifySignature(header, rawBody, secret, livemode) -> boolean`; `markOrderPaid(sessionId) -> order | null`, which sends the receipt only for the call that flips the status.
- Consumes: `checkoutMode()`, `email.send`, `Settings`.

- [x] Tests: client-sent prices are ignored; free shipping applies at or above the threshold; shipping uses the region's rate; every Review Focus case above; showcase sends one ₱1 line while the order records the real total and `chargedAmount: 1`; live sends real lines plus shipping; a bad webhook signature returns 400 and creates nothing; a stale timestamp is refused; `POST /api/orders` is gone; pending orders are absent from stats, bestsellers and the customer's list.

### Task 6: Settings, theme, shipping and optimisation

**Files:** Modify `models/Settings.js`, `routes/content.js`, `routes/admin.js`, model indexes. Test: `test/settings.test.js`.

- [x] Tests: `GET /api/settings` returns `theme`, `shippingRates`, `freeShippingOver`, `showcase`; `PUT /api/admin/settings` saves them and rejects an unknown theme; a settings write clears the cache; public GETs send `Cache-Control`; `/api/admin/stats` totals match paid orders without loading documents.
- [x] Add the spec's indexes, `compression`, `.lean()` and field selection on public reads.

### Task 7: Emails and catalogue script

**Files:** Modify `services/email.js`. Create `scripts/showcase-catalog.js`. Test: `test/email.test.js`.

- [x] Tests: templates escape user values, sign off as Unknown, and use "I"; the showcase receipt says nothing will ship.
- [x] The script sets the spec's prices, categories, materials and descriptions by product ID, prints a before and after table, and writes only with `--apply`.

### Task 8: Keep the current storefront and dashboard working

**Files:** Modify `beaded-frontend/src/App.jsx`, `beaded-frontend/src/AdminDashboard.jsx`, `beaded-frontend/index.html`, `beaded-frontend/vercel.json`, `beaded-frontend/package.json`. Create `beaded-frontend/src/analytics.js`.

- [x] `App.jsx`: Google login posts `idToken`; reset posts the code; the builder posts structured IDs and keeps `customOrderId` on the cart line; checkout stops writing `pending_order`; the success return posts `/api/orders/confirm`.
- [x] Dashboard: send `admin_secret` on the custom order list and availability toggle; read the theme from settings.
- [x] Move analytics into `src/analytics.js`; add CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy` in `vercel.json`; update frontend dependencies until `npm audit --omit=dev` is clean.
- [x] Verify: `npm test` in the backend and `npx vite build` in the frontend both pass. Run the API locally against an in-memory database and drive the sign-in, cart and admin paths once.
