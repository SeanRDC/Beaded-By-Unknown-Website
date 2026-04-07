require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// =====================================================================
// 1. MONGODB CONNECTION
// =====================================================================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('📦 Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// =====================================================================
// 2. AUTHENTICATION & USER ROUTES
// =====================================================================

// Security tool to verify logged-in users
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already in use' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ firstName, lastName, email, password: hashedPassword, cart: [], wishlist: [] });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { firstName, email, points: newUser.points }, cart: newUser.cart, wishlist: newUser.wishlist });
  } catch (error) {
    console.error("🔥 Register Error:", error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    // Prevent manual login if they created their account with Google
    if (user.password === 'google-auth-no-password') {
      return res.status(400).json({ error: 'Please sign in with Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { firstName: user.firstName, email, points: user.points }, cart: user.cart, wishlist: user.wishlist });
  } catch (error) {
    console.error("🔥 Login Error:", error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

app.post('/api/google-login', async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, firstName, lastName, password: 'google-auth-no-password', cart: [], wishlist: [] });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { firstName: user.firstName, email: user.email, points: user.points }, cart: user.cart, wishlist: user.wishlist });
  } catch (error) {
    console.error("🔥 Google Login Error:", error);
    res.status(500).json({ error: error.message || 'Google login failed' });
  }
});

app.get('/api/user/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json({ user: { firstName: user.firstName, email: user.email, points: user.points }, cart: user.cart, wishlist: user.wishlist });
  } catch (error) {
    console.error("🔥 Fetch User Error:", error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.post('/api/user/sync', verifyToken, async (req, res) => {
  try {
    const { cart, wishlist } = req.body;
    await User.findByIdAndUpdate(req.user.userId, { cart, wishlist });
    res.json({ success: true });
  } catch (error) {
    console.error("🔥 Sync Error:", error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

// =====================================================================
// 3. PAYMONGO ROUTES
// =====================================================================
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { cart } = req.body;
    const lineItems = cart.map((item) => ({
      currency: 'PHP',
      amount: Math.round(item.price * 100),
      name: item.name,
      quantity: item.qty,
      description: item.mat || 'Handcrafted Bracelet',
    }));

    const encodedKey = Buffer.from(process.env.PAYMONGO_SECRET_KEY).toString('base64');
    const paymongoResponse = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${encodedKey}`
      },
      body: JSON.stringify({
        data: {
          attributes: {
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            payment_method_types: ['gcash', 'paymaya', 'card', 'qrph'],
            line_items: lineItems,
            success_url: `${process.env.CLIENT_URL}/?success=true`,
            cancel_url: `${process.env.CLIENT_URL}/?canceled=true`,
            description: 'Beaded by Unknown Order'
          }
        }
      })
    });

    const sessionData = await paymongoResponse.json();
    res.json({ checkout_url: sessionData.data.attributes.checkout_url });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment link' });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`🚀 Master Backend running on http://localhost:${PORT}`);
});