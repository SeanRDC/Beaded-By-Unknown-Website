# Going live: what to do next

Everything is built and tested, and all of it is on the `redesign` branch on GitHub. **The live site is still running the old code, including the old security problems, until you finish step 5.** The repository is public, so please do this soon.

Nothing here can be done from the code alone, because it needs your Render, PayMongo and GitHub logins. It takes about 30 minutes.

Do the steps in order. Merging before steps 1 to 3 would break payment confirmations on the live site.

Nothing in this release deletes your existing products, customers or orders. The only data that gets removed automatically is new: checkouts that are never paid expire after 7 days, and designs left in a bag and never paid for expire after 30 days.

---

## Step 1: Get the PayMongo webhook secret

The new backend checks that every webhook really came from PayMongo, so it needs the webhook's secret. Without it, webhooks are refused.

Your webhook address has not changed:

```text
https://beaded-by-unknown.onrender.com/api/webhooks/paymongo
```

1. Open **Git Bash**.
2. See your existing webhooks. Replace `YOUR_SECRET_KEY` with the same PayMongo secret key that is on Render, the one starting with `sk_`, and keep the colon after it:

   ```sh
   curl -u "YOUR_SECRET_KEY:" https://api.paymongo.com/v1/webhooks
   ```

3. Find the entry whose `url` matches the address above, and check its `status` is `enabled`.
   - Its `events` must include `checkout_session.payment.paid`.
   - Copy its `secret_key`. It starts with `whsk_`.
4. If no entry matches, create one, then copy `secret_key` from the reply:

   ```sh
   curl -X POST https://api.paymongo.com/v1/webhooks \
     -u "YOUR_SECRET_KEY:" \
     -H "Content-Type: application/json" \
     -d '{"data":{"attributes":{"url":"https://beaded-by-unknown.onrender.com/api/webhooks/paymongo","events":["checkout_session.payment.paid"]}}}'
   ```

Keep the `whsk_` value for the next step. Do not put it in any file in this repository.

---

## Step 2: Make two new secrets

Run this twice in Git Bash and keep both results somewhere private, like a password manager:

```sh
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

- The first result is your new `JWT_SECRET`.
- The second result is your new `ADMIN_SECRET`. **This is the new key for the dashboard.**

These replace the old ones because the old values may have been exposed. Changing `JWT_SECRET` signs every customer out once, which is expected.

---

## Step 3: Update the environment on Render

Open the [Render dashboard](https://dashboard.render.com), choose the backend service, then **Environment**.

| Variable | What to do |
| --- | --- |
| `PAYMONGO_WEBHOOK_SECRET` | **Add it.** Paste the `whsk_` value from step 1. |
| `JWT_SECRET` | **Replace it** with the first value from step 2. |
| `ADMIN_SECRET` | **Replace it** with the second value from step 2. |
| `CLIENT_URL` | **Check it.** It must be set, or the server will not start. It should be `https://www.beadedbyunknown.shop`. |
| `CHECKOUT_MODE` | **Leave it unset.** Unset means showcase mode: real prices are shown and every checkout charges ₱1. |
| `MONGODB_URI`, `PAYMONGO_SECRET_KEY`, `RESEND_API_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | **Leave these alone.** They keep working as they are. |
| `EMAIL_USER` | No longer used. You can delete it. |

Save the changes. Render will restart the old code with the new secrets, which is fine.

---

## Step 4: Check how the two hosts deploy

This is a quick look, so that the merge in step 5 goes where it should.

**On Render**, in the backend service's **Settings**:

- **Branch** is `main`.
- **Root Directory** is `beaded-backend`.
- **Start Command** is `node server.js` or `npm start`.

**On Vercel**, in the project's **Settings**:

- The production branch is `main`.
- **Root Directory** is `beaded-frontend`.

You do not need to change the Node version. The code now declares that it needs Node 22 or 24, and both hosts read that.

Pushing `redesign` may have made Vercel create a preview deployment. Do not judge the site by that preview, because the backend only accepts requests from your real address, so its products may not load. To look at the new site before going live, run it locally by following **Running It Locally** in `README.md`.

---

## Step 5: Merge to `main`

This is the step that puts everything live.

**On GitHub (the easy way):**

1. Open <https://github.com/SeanRDC/Beaded-By-Unknown-Website>.
2. Choose **Pull requests**, then **New pull request**.
3. Set **base** to `main` and **compare** to `redesign`.
4. Choose **Create pull request**, then **Merge pull request**.

**Or from a terminal:**

```sh
git checkout main
git pull origin main
git merge redesign
git push origin main
```

Vercel and Render then both deploy by themselves. Wait for both to show success, usually under 5 minutes.

---

## Step 6: Check the live site

**The server.** In Git Bash:

```sh
curl -i https://beaded-by-unknown.onrender.com/api/health
curl -i https://beaded-by-unknown.onrender.com/api/admin/stats
curl -i https://beaded-by-unknown.onrender.com/api/custom-orders
```

The first should answer `200`. The other two should answer `403`. If the first is slow, Render is waking up, so try again after a minute.

**The shop.** Open <https://www.beadedbyunknown.shop> in a private window and check:

- [ ] The new design loads, and the portfolio notice appears.
- [ ] The shop and a product page show your products and pictures.
- [ ] You can sign in with email and a code.
- [ ] You can sign in with Google.
- [ ] A password reset emails you a code.

**One real ₱1 order.** This is the most important check:

- [ ] Add something to the bag and pay ₱1 through PayMongo.
- [ ] You land on the confirmation page.
- [ ] You receive exactly one receipt email.
- [ ] Exactly one order appears in the dashboard, marked Paid.
- [ ] In PayMongo, the webhook shows as delivered.

**The dashboard.** Open <https://www.beadedbyunknown.shop/admin>, enter your new `ADMIN_SECRET`, and check each screen opens.

---

## Step 7: Set the real prices

Your products still hold test prices. Choose one way:

**In the dashboard (simplest).** Go to **Catalogue**, choose **Edit** on each piece, and set the price, material and description. You can also change these at any time afterwards.

**Or with the script**, which sets every showcase product at once to ₱65, ₱85 or ₱185, with categories, materials and descriptions. It changes live data, so it runs as a preview first. From `beaded-backend`, with your production `MONGODB_URI` in your local `.env`:

```sh
node scripts/showcase-catalog.js
```

Read the table it prints. If it looks right, apply it:

```sh
node scripts/showcase-catalog.js --apply
```

---

## Step 8: Decide about the custom order list

On the old site, the custom order list could be read by anyone, without a key. The list holds customers' email addresses and designs. It is closed once step 5 is done, but it was open before then. Decide whether you want to tell the customers affected.

---

## Step 9: Tidy up

- Delete the `redesign` branch on GitHub once everything works. GitHub offers a button after the merge.
- Keep the shipping rates up to date in **Store settings** in the dashboard.

---

## If something goes wrong

| What you see | What it means | What to do |
| --- | --- | --- |
| Render shows `Missing required environment variables` | A required setting is missing | Add the variable it names, then redeploy |
| The site says it cannot reach the shop | The server is waking up, or `CLIENT_URL` is wrong | Wait a minute. If it continues, check `CLIENT_URL` is exactly `https://www.beadedbyunknown.shop` with no slash at the end |
| Webhooks fail in PayMongo | The secret is missing or does not match | Compare `PAYMONGO_WEBHOOK_SECRET` with step 1. Orders still complete when the customer returns to the confirmation page, because the site asks PayMongo directly |
| The dashboard refuses the key | The key was mistyped, or there were too many wrong tries | Copy `ADMIN_SECRET` from Render again. After 30 wrong tries, wait 15 minutes |
| A customer gets no sign-in code | The code was requested less than 25 seconds ago, or 5 wrong guesses locked it | Sign in again with the password. After 5 wrong guesses, a password reset is locked for 15 minutes |

**To undo the release:** on Render open **Events**, and on Vercel open **Deployments**, then roll each one back to the previous deployment. Or undo the merge on GitHub with the **Revert** button on the pull request. The new secrets from step 3 keep working with the old code.

---

## Later: selling for real

When the shop stops being a portfolio project, add `CHECKOUT_MODE` with the value `live` on Render. Checkout then charges real prices and the portfolio notice goes away. Test one small real order straight after.
