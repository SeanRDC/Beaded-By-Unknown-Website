<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![React](https://img.shields.io/badge/React-18-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-green.svg?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-lightgreen.svg?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">Beaded by Unknown</h3>

  <p align="center">
    A production-ready, full-stack e-commerce platform for handcrafted, intentional bead jewelry. Features a custom jewelry builder, secure payments via PayMongo, and a bespoke headless CMS admin dashboard.
    <br />
    <br />
    <strong>Tags:</strong> <code>react</code>, <code>node.js</code>, <code>mongodb</code>, <code>ecommerce</code>, <code>paymongo</code>, <code>cms</code>, <code>full-stack</code>, <code>tailwindcss</code>, <code>firebase-auth</code>, <code>order-fulfillment</code>, <code>business-management</code>
    <br />
    <br />
    <a href="#"><strong>View Live Demo »</strong></a>
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
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

This repository contains the source code for Beaded by Unknown, a comprehensive full-stack e-commerce platform built to manage an end-to-end small-scale business. Beyond serving as a highly interactive storefront for handcrafted bead jewelry, the system handles the complete operational pipeline—from domain hosting configuration and live website deployment to secure payment processing and comprehensive product order fulfillment. It features a custom jewelry builder for customers and a bespoke headless CMS to give administrators full control over inventory, themes, and orders.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* **Frontend (Client):** React 18 (Vite), Tailwind CSS, Lucide React, Firebase Authentication, Deployed on Vercel
* **Backend (Server):** Node.js, Express.js, JSON Web Tokens (JWT) & bcryptjs, PayMongo API & Webhooks, Nodemailer, Cloudinary & Multer, Deployed on Render
* **Database:** MongoDB Atlas, Mongoose (Strict schemas for Users, Products, Orders, Blogs, Reviews, and Settings)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LIVE PREVIEW -->
## Live Preview

You can explore the interactive storefront, custom jewelry builder, checkout flow, and dynamic themes directly in your browser. *(Note: Admin dashboard routes are securely locked behind authentication).*

* 🔗 **[Visit Beaded by Unknown - www.beadedbyunknown.shop](https://www.beadedbyunknown.shop)**

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- KEY FEATURES -->
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

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- PROJECT STRUCTURE -->
## Project Structure

```text
├── beaded-backend/
│   ├── models/
│   │   ├── Blog.js
│   │   ├── CustomOrder.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   ├── Review.js
│   │   ├── Settings.js
│   │   └── User.js
│   ├── .gitignore
│   ├── cloudinary.js
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
├── beaded-frontend/
│   ├── node_modules/
│   ├── public/
│   │   ├── Beaded-logo.png
│   │   └── admin-icon.png
│   ├── src/
│   │   ├── assets/
│   │   ├── AdminDashboard.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── firebase.js
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── index.js
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── vite.config.js
└── LICENSE

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Sean Rhani Jarin Dela Cruz

Project Link: https://github.com/SeanRDC/beaded-by-unknown <br />
LinkedIn Link: https://www.linkedin.com/in/sean-rhani-dela-cruz-834573334/

<p align="right">(<a href="#readme-top">back to top</a>)</p>
