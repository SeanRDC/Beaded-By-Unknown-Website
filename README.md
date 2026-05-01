# Beaded by Unknown

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-lightgreen.svg)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)

> A production-ready, full-stack e-commerce platform for handcrafted, intentional bead jewelry. Features a custom jewelry builder, secure payments via PayMongo, and a bespoke headless CMS admin dashboard.

**[View Live Demo](#)**

---

## Key Features

### The Storefront
* **Custom Bracelet Builder:** An interactive visualizer allowing users to design jewelry by selecting specific stones, strings, hardware, and charms, featuring live price calculations and smart fit suggestions.
* **Persistent Cart Sync:** Carts and wishlists are automatically saved to the database in real-time and restored upon login across any device.
* **Dynamic Theme Engine:** Global UI toggles between "Earthy Brown" and "Blush Pink" themes, controlled directly from the admin panel.
* **Production Polish:** Built with React Error Boundaries to prevent white-screens, Google Analytics 4 (GA4) tracking, and Open Graph tags for rich social sharing.

### Authentication & Security
* **Dual-Login System:** Supports traditional Email/Password (bcrypt + JWT) and Google OAuth via Firebase.
* **In-App Password Recovery:** Custom-built OTP (One Time Password) reset flow powered by Nodemailer, keeping users inside the app without external redirects.
* **Rate Limiting:** Email dispatch endpoints are guarded to prevent bot abuse.

### Checkout & Payments
* **Integrated PayMongo Checkout:** Live payment processing supporting GCash, Maya, QR Ph, and Credit/Debit cards.
* **Automated Webhooks & Receipts:** PayMongo webhooks instantly sync successful payments to the database and trigger Nodemailer to send branded HTML email receipts.

### Admin Dashboard (SaaS CMS)
* **Secret Access Route:** A locked dashboard requiring a secure Admin Key to access.
* **Live Analytics:** Real-time revenue tracking and SVG sparkline charts visualizing 7-day sales trends.
* **Order Fulfillment:** Comprehensive order management system to track and update statuses (Preparing ➔ Shipped ➔ Delivered).
* **Inventory CRUD:** Manage the product catalog with seamless image hosting via **Cloudinary**.
* **Global Store Controls:** Edit website announcement banners, feature highlights, and dynamically add/remove shop categories without touching the codebase.

---

## Tech Stack

### Frontend (Client)
* **Framework:** React 18 (Vite)
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **Auth:** Firebase Authentication
* **Deployment:** Vercel

### Backend (Server)
* **Runtime:** Node.js & Express.js
* **Authentication:** JSON Web Tokens (JWT), bcryptjs
* **Payments:** PayMongo API & Webhooks
* **Emails:** Nodemailer
* **Image Hosting:** Cloudinary & Multer
* **Deployment:** Render

### Database
* **Database:** MongoDB Atlas
* **ODM:** Mongoose (Strict schemas for Users, Products, Orders, Blogs, Reviews, and Settings)