<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![React](https://img.shields.io/badge/React-19-blue.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![GSAP](https://img.shields.io/badge/GSAP-3-88CE02.svg?style=for-the-badge&logo=greensock)](https://gsap.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-green.svg?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-lightgreen.svg?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">Beaded by Unknown</h3>

  <p align="center">
    A full-stack e-commerce platform for handcrafted bead jewelry. Features a custom jewelry builder, secure payments via PayMongo, and a bespoke admin dashboard.
    <br />
    <br />
    <strong>Tags:</strong> <code>react</code>, <code>gsap</code>, <code>node.js</code>, <code>mongodb</code>, <code>ecommerce</code>, <code>paymongo</code>, <code>cms</code>, <code>full-stack</code>, <code>firebase-auth</code>, <code>order-fulfillment</code>, <code>business-management</code>
    <br />
    <br />
    <a href="https://www.beadedbyunknown.shop/"><strong>View Live Demo »</strong></a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#live-preview">Live Preview</a></li>
    <li><a href="#key-features">Key Features</a></li>
    <li><a href="#running-it-locally">Running It Locally</a></li>
    <li><a href="#testing">Testing</a></li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

This repository contains the source code for Beaded by Unknown, a full-stack e-commerce platform built to manage a small business from end to end. Beyond the storefront itself, the system handles the complete operational pipeline: domain hosting, deployment, secure payment processing and order fulfillment. It features a custom jewelry builder for customers and a bespoke dashboard that gives administrators control over inventory, themes and orders.

> **This is a portfolio project.** The shop is fully functional, but orders are not fulfilled. Every checkout charges ₱1 and nothing is shipped, and a notice tells visitors so when they arrive.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* **Frontend:** React 19 (Vite), React Router, GSAP with ScrollTrigger, hand-written CSS on design tokens shared by the storefront and the dashboard, Firebase Authentication, deployed on Vercel
* **Backend:** Node.js, Express 5, Zod, Helmet, express-rate-limit, JSON Web Tokens and bcryptjs, PayMongo API and webhooks, Resend, Cloudinary and Multer, deployed on Render
* **Database:** MongoDB Atlas, Mongoose (schemas for Users, Products, Orders, Custom Orders, Blogs, Reviews and Settings)
* **Testing:** Node's test runner with Supertest and mongodb-memory-server, Vitest, Playwright with axe

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LIVE PREVIEW -->
## Live Preview

You can explore the storefront, custom jewelry builder, checkout flow and themes directly in your browser. *(Note: Admin dashboard routes are locked behind authentication).*

* 🔗 **[Visit Beaded by Unknown - www.beadedbyunknown.shop](https://www.beadedbyunknown.shop)**

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- KEY FEATURES -->
## Key Features

### The Storefront
* **The Strand:** The shop's name is set huge with a gold thread through its letters. As you scroll, the thread runs down the margin carrying beads, loops into a bracelet drawn to true proportions, and ends through the footer.
* **Your Wrist, in Beads:** Move the thread to your wrist size and the bead count, the price and the bracelet change with it, then carry that design straight into the builder.
* **Custom Bracelet Builder:** Design jewelry by choosing beads, colours, patterns, hardware and charms, with live pricing and a fit calculated from real bead sizes.
* **A Bag That Follows You:** A guest's bag stays on their device, and signing in syncs the bag and saved pieces across devices.
* **Dynamic Theme Engine:** The whole site switches between "Earthy Brown" and "Blush Pink" from the admin panel.
* **Real Page Addresses:** Every page has its own URL, with product links, search, a sitemap and Open Graph tags for sharing.
* **Built to Be Used by Everyone:** Pages pass an automated WCAG AA audit in both themes, and all motion gives way for people who ask for reduced motion.
* **Fast on a Phone:** The opening screen paints first and the long page follows, Firebase loads only when someone signs in with Google, and pictures are served as AVIF and WebP in sizes that fit the screen.

### Authentication & Security
* **Dual-Login System:** Email and password (bcrypt and JWT) alongside Google sign-in, with Firebase ID tokens verified on the server.
* **Sign-In Codes:** Hashed, single-purpose one-time codes for sign-in, password resets and account deletion, limited to five guesses counted atomically, with a lock after that.
* **Sessions That End:** Changing a password signs out every earlier session.
* **Validated Requests:** Every request body is checked with Zod and database filters are sanitised against injection.
* **Layered Protection:** Helmet headers, a strict Content Security Policy, rate limits on sensitive routes and a fail-closed, constant-time admin check.
* **Honest Prices:** Totals are always worked out on the server, so a tampered browser cannot change what an order costs.

### Checkout & Payments
* **Integrated PayMongo Checkout:** Payment processing supporting GCash, Maya, QR Ph and Credit/Debit cards.
* **Signed Webhooks:** PayMongo webhooks are verified by signature and handled idempotently, so a repeated event never confirms an order twice.
* **Branded Receipts:** Successful payments trigger HTML email receipts through Resend.
* **Shipping by Region:** Rates depend on the destination and are set from the dashboard, with free shipping over a set amount.
* **Showcase Mode:** Real prices are displayed while checkout charges ₱1, until `CHECKOUT_MODE` is set to `live`.

### The Studio (Admin Dashboard)
* **One Design Language:** The dashboard shares the shop's tokens, type and controls, and its navigation is the same gold thread with a bead on the current page.
* **Locked by a Server-Checked Key:** Nothing loads until the server accepts the studio key, and a changed key sends the dashboard back to the door.
* **Sales at a Glance:** Revenue, orders and a seven-day chart.
* **Order Fulfillment:** Read each order's details and move it through Paid, Shipped and Delivered, with the customer emailed at each step.
* **Custom Designs:** A drawn preview of every paid design, with its beads, charms and measurements.
* **Catalogue:** Add, edit, sell out and delete pieces, with pictures hosted on **Cloudinary**.
* **Store Controls:** Edit the banner, highlights, categories, shipping rates, the free shipping amount, reviews, journal articles and the theme without touching the code.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- RUNNING IT LOCALLY -->
## Running It Locally

The quickest way needs no accounts at all. A throwaway API runs on an in-memory database, with fake payments and email:

```sh
cd beaded-backend
npm install
node scripts/dev-server.js        # http://localhost:4599
```

```sh
cd beaded-frontend
npm install
VITE_API_URL=http://localhost:4599 npm run dev
```

To run the real backend, copy `beaded-backend/.env.example` to `.env`, fill it in, and start it with `npm start`. The file explains each setting, and the server refuses to start without the required ones.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- TESTING -->
## Testing

```sh
cd beaded-backend
npm test                          # API tests on an in-memory MongoDB
```

```sh
cd beaded-frontend
npm run lint
npm test                          # Unit tests
npm run test:e2e                  # Browser tests at desktop and phone sizes, with accessibility audits
```

The browser tests start the throwaway API and a production build by themselves. They run in Google Chrome.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- PROJECT STRUCTURE -->
## Project Structure

```text
├── beaded-backend/               # Express API
│   ├── config/                   # Environment checks
│   ├── data/                     # Bead catalogue used for server-side pricing
│   ├── middleware/               # Auth, admin check, validation, rate limits, errors
│   ├── models/                   # Mongoose database schemas
│   ├── routes/                   # Auth, user, products, orders, webhooks, content, admin
│   ├── scripts/                  # Throwaway dev API and the showcase catalogue script
│   ├── services/                 # Email, codes, payments, pricing, orders, uploads, cache
│   ├── test/                     # API tests
│   ├── .env.example              # Every setting the server reads
│   ├── app.js                    # Builds the Express app
│   └── server.js                 # Starts the server
├── beaded-frontend/              # React (Vite) frontend
│   ├── e2e/                      # Playwright browser tests
│   ├── public/                   # Pictures, icons, robots.txt and sitemap
│   ├── scripts/                  # Picture optimiser
│   ├── src/
│   │   ├── admin/                # One file for each screen of the dashboard
│   │   ├── api/                  # API client
│   │   ├── components/           # Header, footer, bag, dialogs, cards and home sections
│   │   ├── data/                 # Bead catalogue, questions and picture sizes
│   │   ├── lib/                  # Fit, pricing, shipping, bead drawing and the strand engine
│   │   ├── motion/               # GSAP setup and shared animations
│   │   ├── pages/                # One file for each page of the shop
│   │   ├── store/                # Shop, bag, account and interface state
│   │   ├── styles/               # Design tokens and storefront styles
│   │   ├── AdminDashboard.jsx    # Dashboard shell, loaded only on /admin
│   │   ├── Site.jsx              # Storefront routes and layout
│   │   └── main.jsx              # App entry point
│   ├── index.html                # Base HTML template
│   ├── playwright.config.js      # Browser test setup
│   ├── tailwind.config.js        # Tailwind, used for its CSS reset
│   ├── vercel.json               # Routing and security headers
│   └── vite.config.js            # Bundler and unit test configuration
└── LICENSE                       # Project license
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Sean Rhani Jarin Dela Cruz

Project Link: https://github.com/SeanRDC/Beaded-By-Unknown-Website <br />
LinkedIn Link: https://www.linkedin.com/in/sean-rhani-dela-cruz-834573334/

<p align="right">(<a href="#readme-top">back to top</a>)</p>
