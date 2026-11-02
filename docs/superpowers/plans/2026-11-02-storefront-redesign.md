# Storefront Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the storefront as Direction A, The Strand, with real URLs, GSAP motion, a token-based design system and the approved fixes, keeping every current flow.

**Architecture:** `App.jsx` splits into four stores, shared components and one file per route. Tailwind v3 stays, mapped to CSS variable tokens. GSAP runs through `useGSAP` and `gsap.matchMedia()`, so everything is scoped, cleaned up and reduced-motion aware. The approved concept board was the visual reference, and remains in the git history.

**Tech Stack:** React 19, React Router 7, Vite, Tailwind 3, GSAP 3 with ScrollTrigger and `@gsap/react`, Jost through `@fontsource-variable/jost`, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-02-storefront-redesign-design.md`

## Global Constraints

- No component uses a raw hex value. Tokens only.
- Text never below 13px. Body never below 17px on a phone.
- Animate only `transform`, `opacity` and `clip-path`.
- Everything is readable with JavaScript animations skipped: reduced motion ends in the finished state.
- Voice is first person singular: "I", never "we" or "our studio". Sentence case. No exclamation marks.
- `AdminDashboard.jsx` and its look stay unchanged, beyond the backend milestone edits.
- Emoji charms stay. No Lenis.
- Commits are small, under the owner's identity, with no Claude line.

## Review Focus

- The API is asleep on first visit: pages show their loading state, the home hero and notice do not wait, and data fills in when it arrives.
- A visitor opens `/shop/some-old-slug`, or a slug for a deleted product: the page shows a calm not-found state with a way back to the shop.
- A visitor refreshes on any route: Vercel serves the app and the page loads from its URL.
- The strand on a window that resizes, or fonts that load late: thread and name re-measure and stay aligned.
- A very long product name or an empty catalogue: layouts hold, and the home page section hides rather than collapsing.

---

### Task 1: Foundation

**Files:** Modify `package.json`, `tailwind.config.js`, `src/index.css`, `index.html`. Create `src/lib/{fit,money,shipping,slug,cart,cloudinary}.js`, `src/data/beads.js`, `src/api/client.js`, `scripts/optimise-images.mjs`. Test: `src/lib/*.test.js`.

**Interfaces:**
- Produces: `fit(cm, collection) -> { count, beads, total }`; `peso(n)`; `shippingFor(subtotal, region, settings) -> number`; `slugify(text)`; `findBySlug(items, slug, field)`; `lineKey(item)`, `addLine`, `removeLine`, `setLineQty`, `cartCount`, `cartSubtotal`; `cld(url, width)`, `cldSrcSet(url, widths)`; `api(path, { method, body, token, admin, retries, signal })`.

- [ ] Vitest tests for each lib function, including `removeLine` leaving another size of the same product, and free shipping at exactly the threshold.
- [ ] Add dependencies, tokens for both themes, Tailwind mapping, component classes (`.t-head`, `.t-lead`, `.btn`, `.link`, `.chip`), Jost, and the image script producing AVIF and WebP at 640, 1024 and 1600.

### Task 2: Stores, split and routes

**Files:** Create `src/store/{shop,cart,auth,ui}.jsx`, `src/components/*`, `src/pages/*`, `src/motion/gsap.js`. Rewrite `src/App.jsx` and `src/main.jsx`.

**Interfaces:**
- Produces: `useShop()`, `useCart()`, `useAuth()`, `useUi()`; `<Seo title description />`.

- [ ] Split behaviour first, with a mechanical move so the app keeps working at each commit, then real URLs per the spec's route table, a designed 404, scroll handling, and analytics page views.
- [ ] Apply fixes 16 to 21 with tests where logic allows.

### Task 3: Shell

**Files:** `src/components/{Header,FloatingBar,MobileMenu,Footer,BagDrawer,SearchOverlay,LoginDialog,QuickView,Toast,ShowcaseNotice,PageTransition}.jsx`.

- [ ] Header, floating bar with the small name, phone menu replacing the bottom tabs, footer on every page but checkout, theme from settings, portfolio notice as a real `<dialog>`, thread-sweep transition under 500ms.

### Task 4: Home

**Files:** `src/pages/Home.jsx`, `src/components/home/{ThreadedName,Strand,BeadRing,Pieces,WristInBeads,SizesLine,Letter,SlowWords,Quotes,BeforeYouOrder,LatestPost}.jsx`, `src/lib/beads-canvas.js`.

- [ ] Port one section per commit from the concept, in spec order, ending with the strand. Thread positions come from a sampled table, not per-frame measuring.
- [ ] "String this one" passes wrist, collection and colours through router state.

### Task 5: Shop and product

- [ ] Shop grid of one large and two small repeating, category chips from settings, sort, loading and empty states.
- [ ] Product page with sticky pictures, details in place, phone add bar, not-found state.

### Task 6: Builder, bag and checkout

- [ ] Builder keeps its six steps and posts structured IDs. Uses `BeadRing` for the live bracelet.
- [ ] Bag drawer with the bead-filled shipping thread and the fly-to-bag move.
- [ ] Checkout steps, shipping from settings, showcase note, "Continue to PayMongo", confirmation page posting `/api/orders/confirm`. The backend's return URLs move to `/checkout/confirmed` and `/checkout`.

### Task 7: Remaining pages

- [ ] Account, wishlist, story, journal, journal post, FAQ, size guide, shipping, terms, confirmation, error boundary. Voice pass across all copy.

### Task 8: Verification

- [ ] Accessibility pass, `robots.txt`, `sitemap.xml`, share image, per-route metadata.
- [ ] Playwright flows at 1440 and 390 with a mocked API. Inspector and screenshots at 1440, 768 and 390. Lighthouse against the spec's budget. Dashboard screenshot before and after.
- [ ] Update `README.md`, remove `docs/superpowers/specs/concept-a/`.
