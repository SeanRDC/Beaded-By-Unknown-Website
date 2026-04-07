# Beaded by Unknown 📿

A fully-featured, full-stack e-commerce platform for handcrafted, intentional bead jewelry. Built with the MERN stack, this application features secure social authentication, a dynamic MongoDB product catalog, seamless cart synchronization, and integrated payment processing.

## ✨ Key Features

* **Secure Authentication:** Dual-login system supporting traditional Email/Password (hashed via bcrypt and secured with JWT) and Google OAuth (via Firebase).
* **Persistent Sessions & Cart Sync:** Users' carts and wishlists are automatically saved to the database in real-time and restored upon login across any device.
* **Integrated Checkout:** Live payment processing via the **PayMongo API**, supporting GCash, Maya, QR Ph, and Credit/Debit cards.
* **Custom Bracelet Builder:** An interactive UI allowing users to select specific stones, string materials, and charms to design their own jewelry, dynamically calculating the final price.
* **Dynamic Catalog & Admin Controls:** Products are fetched securely from MongoDB Atlas. Includes a locked, secret route for administrators to add new products to the catalog.
* **Loyalty System:** "The Bead Tribe" points engine built into the user schema to track and reward purchases.

## 🛠️ Tech Stack

**Frontend (Client)**
* **Framework:** React 18 (via Vite)
* **Styling:** Tailwind CSS (Custom thematic color palette)
* **Icons:** Lucide React
* **Auth:** Firebase Authentication (Google OAuth)

**Backend (Server)**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Authentication:** JSON Web Tokens (JWT), bcryptjs
* **Payments:** PayMongo API (Checkout Sessions)

**Database**
* **Database:** MongoDB Atlas
* **ODM:** Mongoose (Strict schemas for Users and Products)

---

## 🚀 Getting Started

To run this project locally, you will need to start both the backend server and the frontend development server.

### Prerequisites
* Node.js (v16 or higher)
* A MongoDB Atlas Account & Cluster
* A PayMongo Developer Account
* A Firebase Web App Project

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/Beaded-By-Unknown-Website.git
cd Beaded-By-Unknown-Website
\`\`\`

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and configure your environment variables.

\`\`\`bash
cd beaded-backend
npm install
\`\`\`

Create a `.env` file in the `beaded-backend` directory:
\`\`\`env
PORT=4242
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0...
JWT_SECRET=your_super_secret_jwt_key_here
PAYMONGO_SECRET_KEY=sk_test_your_paymongo_secret_key
ADMIN_SECRET=your_secret_admin_creation_key
\`\`\`

Start the server:
\`\`\`bash
node server.js
# Expected output: 🚀 Master Backend running on http://localhost:4242
# Expected output: 📦 Connected to MongoDB Atlas
\`\`\`

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, install dependencies, and configure Firebase.

\`\`\`bash
cd beaded-shop
npm install
\`\`\`

*Note: Ensure your Firebase configuration keys are correctly placed inside `src/firebase.js`.*

Start the development server:
\`\`\`bash
npm run dev
# Expected output: ➜  Local:   http://localhost:5173/
\`\`\`

---

## 📁 Project Structure

\`\`\`text
Beaded-By-Unknown-Website/
│
├── beaded-backend/             # Node.js + Express API
│   ├── models/                 # Mongoose Schemas (User.js, Product.js)
│   ├── .env                    # Secret API keys and DB credentials
│   └── server.js               # Main server logic and routing
│
└── beaded-shop/                # React + Vite Frontend
    ├── src/                    
    │   ├── App.jsx             # Main UI components, state, and API calls
    │   ├── firebase.js         # Firebase Auth configuration
    │   └── index.css           # Tailwind directives and custom fonts
    └── package.json
\`\`\`

## 🔒 Security Notes
* The `.env` files and `node_modules` are explicitly ignored via `.gitignore`. 
* Passwords are never stored in plain text; they are hashed using `bcryptjs` with a salt factor of 10.
* Admin routes are protected via a custom header validation checking against the `ADMIN_SECRET`.