# Storefront redesign: The Strand

Date: 2026-11-02. Status: awaiting review.
Companion spec: `2026-11-02-backend-security-optimisation-design.md`, which ships first.
Visual reference: `concept-a/a-strand.html` (the approved board, open it in a browser). The admin dashboard redesign comes after this and gets its own spec.

## Intent

Make a finished shop feel minimal, personal and alive, with GSAP motion and no AI look. skinnify.co inspires the calm, not the content. Every feature keeps working.

Success means:

- A visitor remembers the threaded name.
- The inspector reports no fails on home, shop and product pages, apart from the floating bar passing over text while scrolling.
- Every current flow passes end to end on desktop and phone.
- The performance budget below is met.

## Decisions from the owner

| Topic | Decision |
| --- | --- |
| Direction | A, The Strand |
| Approved features | 1 threaded name, 2 scrolling thread, 3 wrist in beads, 4 section motion, 5 builder motion, 6 bag motion, 7 page transitions |
| Approved structure | 9 split `App.jsx`, 10 real URLs, 11 image pipeline, 12 accessibility pass, 14 repo clean-up |
| Approved fixes | 16 to 21 |
| Left out | 8 Lenis, 13 drawn charms (emoji stay), 15 dashboard restyle (later) |
| ₱1 checkout | Stays. A notice tells visitors the shop is a portfolio project. |
| Pictures | The six staged pictures stay for now, optimised |
| Prices | Realistic prices are displayed, checkout still charges ₱1 (values in the backend spec, under "Catalogue data") |
| Shipping | Regional rates are the truth, not the ₱150 flat rate, and all surfaces read one source |
| Blush Pink | Kept and fixed, so customers actually see it |
| Voice | Unknown is "I" |
| FAQ | Build it now |

## Identity

The handle is `beeeaded`. All its letters are round, so the word is a strand of beads. One gold thread is the only ornament on the site.

- Name in the hero: lowercase `beeeaded`, fitted to the full width, threaded through the middle of the x-height. `by Unknown` sits below it. The `h1` remains "Beaded by Unknown" for screen readers and search.
- Each bag item strings one more `e` on to the small name, up to five.
- The footer repeats the name with extra e's, running off the edge and sliding along the thread as the page ends.

Borrowed from Skinnify in spirit: white space, one plain typeface, large rounded pictures, a compact floating bar, one slow line of large pale words, the founder's letter on a dark panel, questions beside a sticky title.

Left behind: discount badges, ticker bars, press logos, star rows on cards, comparison tables, rows of identical cards.

## Design system

Everything references tokens. No component uses a raw hex value.

**Type.** Jost, self-hosted through `@fontsource-variable/jost`. One family, five sizes: display (fitted), head, lead, body, small. Display tracking about -0.035em. Text never drops below 13px and body never below 17px on a phone.

**Colour tokens.**

| Token | `brown` (default) | `pink` (Blush) |
| --- | --- | --- |
| `--ground` | `#FAFAF8` | `#FFF7F8` |
| `--step` | `#F0EFEB` | `#FBE9ED` |
| `--ink` | `#191612` | `#3A2328` |
| `--soft` | `#5A5347` | `#7A5A62` |
| `--thread` | `#B38E42` | `#C9788E` |

Both sets are checked for 4.5:1 text contrast during the build. The dashboard keeps calling the default "Earthy Brown" until its own project. Tailwind stays on v3, with its theme mapped to these variables. The theme comes from `settings.theme`, applied as `data-theme` on `<html>` and cached in `localStorage` only to avoid a flash on load.

**Shape.** Pictures 28px radius, surfaces 18px, buttons fully round, one page margin of 16 to 26px.

**Motion tokens.** `power3.out` for arrivals, `power3.inOut` for travel, 140ms press, 180ms hover, 800ms reveal. No bounce, no elastic, no looping decoration.

## Architecture

`App.jsx` is 3,090 lines with 18 pages in one component and all state beside them. `Card` is defined inside `App`, so it remounts on every state change, which would break GSAP. It splits with no change in behaviour.

```text
beaded-frontend/src/
  main.jsx               routes, lazy loading
  api/client.js          one base URL (VITE_API_URL with the current URL as fallback), retry for cold starts, auth header
  store/                 shop, cart, auth and ui providers
  data/beads.js          bead, string and charm catalogue
  lib/                   fit, money, shipping, slug, cloudinary helpers
  motion/                GSAP registration, useReveal, page transition, reduced-motion handling
  components/            header, floating bar, footer, threaded name, strand, bead ring, product card,
                         bag drawer, search, login dialog, quick view, toast, showcase notice
  pages/                 one file per route
  AdminDashboard.jsx     unchanged apart from the backend milestone edits, lazy loaded
```

**Routes.**

| URL | Page |
| --- | --- |
| `/` | Home |
| `/shop` | Collection, category in the query string |
| `/shop/:slug` | Product, slug derived from the name |
| `/custom` | Builder |
| `/story` | Our story |
| `/journal`, `/journal/:slug` | Journal |
| `/faq`, `/size-guide`, `/shipping`, `/terms` | Help pages |
| `/wishlist`, `/account` | Customer |
| `/checkout`, `/checkout/confirmed` | Checkout |
| `/admin` | Dashboard |
| anything else | Designed 404 |

The search box, bag, login and quick view stay as overlays. Vercel's rewrite already supports these URLs.

**Dependencies added:** `gsap`, `@gsap/react`, `@fontsource-variable/jost`, and dev only `sharp`, `vitest` and `@playwright/test`. Firebase is imported on demand when someone signs in with Google, so it leaves the first load. Admin and its Playfair font load only on `/admin`, so the dashboard looks exactly as it does now.

## Pages

**Home**, in the order of the concept board:

1. Name, `by Unknown`, one sentence, the actions and the hero picture.
2. The pieces: one large and two smaller, not a uniform grid. Bestsellers first, then newest. Handles any number of products.
3. Your wrist, in beads: the live bracelet.
4. Six sizes, sold by the bead: beads at true relative scale on a straight thread, with real "from" prices.
5. The letter on a dark panel, in first person.
6. One slow line of large pale words, using the admin's banner and feature settings. The announcement bar at the top of the current site goes away and its text moves here, so those settings still work.
7. What people said: one large quotation at a time, from `/api/reviews`, without stars. Hidden if there are none.
8. Before you order: three questions and a link to the FAQ.
9. Journal: the latest post, hidden if there are none.
10. Footer.

**Shop.** Title and piece count, category chips from settings, sort, then a composed grid repeating one large and two small. Empty and loading states are designed. Sold out keeps the picture in colour and says so in words.

**Product.** Pictures stacked in a sticky left column, details in a calm right column: name, price, description, size, quantity, add to bag, wishlist, then details that open in place. The size guide opens in place. A sticky add bar appears on phones.

**Builder.** The same six steps and data. The bracelet is the bead ring from the concept, sticky on desktop, at the top on phones, with the live total. Selecting a bead strings it on. Emoji charms stay. Values arrive from the home widget through router state.

**Bag.** A drawer from the right. Free shipping is shown as a thread filling with beads toward the threshold.

**Checkout.** Three calm steps with a sticky summary. Shipping comes from settings, free over the threshold. While `showcase` is true, a note above the pay button reads: "This is a portfolio project. You'll be charged ₱1 through PayMongo and nothing will ship." The button reads "Continue to PayMongo".

**Account, wishlist, search, login, quick view, confirmation.** Same functions, rebuilt on the tokens. Account and wishlist get designed empty states. The header bar replaces the mobile bottom tabs: the floating bar carries the small name, a menu and the bag, and the menu holds every link.

**Story, Journal, Help pages, 404.** Reading pages with one composition each. The story page keeps the studio slideshow as a slow crossfade.

**Footer.** Appears on every page except checkout. Keeps the social links and the developer credit, and gains one line while showcase mode is on: "Portfolio project. Orders are not fulfilled."

**Pictures.** The hero uses the real yellow and blue bracelet photo from the approved concept, stored locally so it cannot disappear with a product. The six staged pictures stay in use on the story page, letter panel, builder and share image.

## Portfolio notice

Shown the first time a visitor opens any page in a browser session, tracked in `sessionStorage`, and only while `settings.showcase` is true, so it disappears when the shop goes live.

> **This shop is a portfolio project**
> Everything works, but nothing here is really for sale. Please don't place an order, because it won't arrive. Checkout runs in test mode at ₱1.
> [I understand]

It is a real modal `<dialog>`: focus moves in, Escape closes it, the page behind is inert, and it rises gently unless reduced motion is on. Render can be slow to wake, so the notice does not wait for settings: it uses the last cached value and shows by default.

## Motion

GSAP with ScrollTrigger through `useGSAP`, so every animation is scoped and cleaned up on route change. All motion runs through `gsap.matchMedia()`. Only `transform`, `opacity` and `clip-path` animate.

| Item | Behaviour |
| --- | --- |
| 1 Threaded name | The thread draws across, then the letters slide in along it, first letter first. Runs once per session on home, then the name simply appears. |
| 2 Scrolling thread | The thread turns down the margin, carrying a run of beads, drops beads in short strung runs, loops into the bracelet and strings it as it arrives, then ends through the footer name. Home page only. Beads sit in the margin, and the path never crosses text. |
| 3 Wrist in beads | Slider, bead type and colour change the count, price and ring live. "String this one" opens the builder with those choices. |
| 4 Section motion | Chosen per section: picture wipes, a rising heading, row-by-row lists, a panel growing into place, sideways words tied to scroll. Each runs once, and nothing uses one repeated fade. |
| 5 Builder motion | Beads string on in order and the ring resizes at true proportion. |
| 6 Bag motion | A bead flies from the button to the bag, the drawer slides in, the thread fills, the name gains an `e`. |
| 7 Page transitions | A thread sweeps across and a ground-coloured panel wipes behind it, 500ms at most. Checkout to PayMongo is a normal navigation. |

**Reduced motion.** Everything is present and readable, the thread is fully drawn, the name is in place and picture changes are instant.

**Performance.** Thread positions are sampled once into a table and looked up during scroll, not measured every frame. If the strand drops frames on a mid-range phone, phones get a fully drawn static thread, as approved in the proposal.

## Content

**Voice.** First person singular everywhere: "I", "my", never "we" or "our studio". Sentence case. No exclamation marks. This covers the site, the order emails ("Unknown" replaces "The Studio Team") and the error messages.

**Corrections.** The Terms and home description claim natural gemstones, but the builder sells imitation jade, imitation pearl, acrylic and glass. The owner did not choose between these, so the spec follows what is actually sold: Terms, meta description and search hints name the real materials. The Shipping page shows the regional table from settings instead of ₱150 flat.

**FAQ page.** Written from existing policies:

1. How long does my order take? Everything is made to order. Allow 7 to 14 days for me to make, check and pack your piece. Then it ships by J&T Express.
2. How much is shipping? The regional table from settings, free over the threshold.
3. How do I find my size? Measure snug with a soft tape in centimetres, then the builder counts the beads for you.
4. Can I design my own? Yes, with the builder, including wrist fit, string and one charm.
5. What are the beads made of? Seed and glass beads, acrylic, cracked, cat eye, mermaid acrylic, imitation jade and imitation pearl. They are not natural gemstones.
6. How do I care for my piece? Take it off before swimming and store it in its pouch.
7. Can I cancel or return an order? Each piece is made for you, so all sales are final once I've started.
8. How can I pay? GCash, Maya, QR Ph or card through PayMongo.
9. Can I follow my order? Your account shows its status, and I email you when it ships.
10. Is this a real shop? Shown only in showcase mode: the portfolio statement.

## Fixes

| # | Fix |
| --- | --- |
| 16 | Bestseller cards open their product. |
| 17 | The bag treats product plus size as one line, so removing one size leaves the others. |
| 18 | The checkout total applies free shipping over the threshold, matching the server. |
| 19 | Builder step 2 shows the wrist in centimetres. |
| 20 | The footer appears on all storefront pages except checkout. |
| 21 | Debug logging of orders and addresses is removed. |

Also corrected while rebuilding: the "Discover Our Process" link, `Oops!` wording in the error boundary, and the `og:image`, which points at a file that does not exist in the build.

## Quality budget

Baseline today: 542 KB JS (147.6 KB gzipped) in one file, 45.7 MB of PNGs, a 1 MB logo as favicon, 42 lint problems, 10 inspector fails.

| Measure | Target |
| --- | --- |
| Home route JS | 150 KB gzipped or less, including GSAP |
| Home images, first view | 400 KB or less |
| Lighthouse mobile | Performance 85+, accessibility 95+, best practices 95+, SEO 95+ |
| Largest contentful paint | Under 2.5s on simulated 4G |
| Layout shift | Under 0.1 |
| Lint | 0 errors in `src`, excluding the dashboard until its own project |
| Inspector | 0 fails on home, shop and product, apart from the floating bar note above |

**Images.** A one-time `sharp` script produces AVIF and WebP at 640, 1024 and 1600 widths, served with `srcset`. The original PNGs leave the working tree. A Cloudinary helper requests `f_auto,q_auto` at the needed width.

**Accessibility.** Semantic landmarks, skip link, visible focus, labelled controls, alt text, real buttons and links instead of clickable divs, 44px targets, keyboard-operable builder, reduced-motion support.

**Search and sharing.** Per-route title and description using React 19 metadata, a working `og:image`, `robots.txt`, `sitemap.xml`, and a Google Analytics page view on each route change.

## Testing

- Vitest for pure logic: bead fit, totals, shipping, slugs, bag lines.
- Playwright with a mocked API for each flow on 1440 and 390 widths: browse, search, add to bag, checkout to the redirect, builder to bag, sign-in dialog, account, wishlist, notice, theme switching, reduced motion.
- Inspector and screenshots on every page at 1440, 768 and 390 widths, looked at, not just scored.
- A dashboard screenshot before and after, to prove it did not change.

## Delivery

One branch, `redesign`, in small commits under the owner's identity with no Claude line. The README's stack and structure sections are updated at the end, and `concept-a/` is removed once the real site replaces it.

1. Repo clean-up: root `node_modules`, stray root `package.json`, `index.js`, `App.css`, root `.gitignore`.
2. Backend milestone, per its spec, merged first.
3. Foundation: tokens, fonts, GSAP, image pipeline, API client.
4. Split `App.jsx` into stores, components and pages with no visual change, then real URLs.
5. Fixes 16 to 21.
6. Header, floating bar, footer, overlays and theme.
7. Home, one section per commit, ending with the strand.
8. Shop and product.
9. Builder.
10. Bag and checkout.
11. Account, wishlist, reading pages, FAQ, 404.
12. Page transitions, portfolio notice, voice pass.
13. Accessibility, performance, search and final verification.

## Not in scope

Dashboard redesign, drawn charms, Lenis, a Tailwind upgrade, and new photography. If the owner later replaces the staged pictures, the image pipeline already handles it.
