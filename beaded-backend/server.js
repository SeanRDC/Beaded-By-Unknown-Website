const Product = require('./models/Product');
const Order = require('./models/Order');
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
// 2.1 CATALOG & ADMIN ROUTES
// =====================================================================

// PUBLIC: Get all products to display on the website
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// SECRET ADMIN: Add a new product
app.post('/api/admin/products', async (req, res) => {
  // Check the secret key from the headers
  if (req.headers.admin_secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Intruder alert: Invalid admin key' });
  }
  
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json(newProduct);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save product to database' });
  }
});

// SECRET ADMIN: Update an existing product
app.put('/api/admin/products/:id', async (req, res) => {
  if (req.headers.admin_secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Intruder alert: Invalid admin key' });
  }
  try {
    // findByIdAndUpdate replaces the old data with the new req.body
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    console.error("🔥 UPDATE ERROR:", err.message);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// SECRET ADMIN: Delete a product
app.delete('/api/admin/products/:id', async (req, res) => {
  if (req.headers.admin_secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Intruder alert: Invalid admin key' });
  }
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("🔥 DELETE ERROR:", err.message);
    res.status(500).json({ error: 'Failed to delete product' });
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

// =====================================================================
// PAYMONGO WEBHOOK (Listens for successful payments)
// =====================================================================
app.post('/api/webhooks/paymongo', async (req, res) => {
  try {
    const event = req.body.data;
    
    // PayMongo sends various events. We only care when a payment succeeds.
    if (event.attributes.type === 'checkout_session.payment.paid') {
      const session = event.attributes.data.attributes;
      
      const newOrder = new Order({
        checkoutSessionId: event.attributes.data.id,
        customerName: session.billing?.name || 'Guest',
        customerEmail: session.billing?.email || 'No Email',
        amountPaid: session.payment_intent.attributes.amount / 100, // Convert centavos back to PHP
        items: session.line_items
      });

      await newOrder.save();
      console.log(`💰 NEW SALE RECORDED: ₱${newOrder.amountPaid}`);
    }

    // Always tell PayMongo "Message Received" so they stop pinging you
    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('🔥 Webhook error:', error);
    res.status(500).send('Webhook failed');
  }
});

// =====================================================================
// ADMIN STATS ROUTE (Sends real data to your dashboard)
// =====================================================================
app.get('/api/admin/stats', async (req, res) => {
  if (req.headers.admin_secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Invalid admin key' });
  }
  
  try {
    const orders = await Order.find();
    
    // Calculate total revenue by adding up all amountPaid values
    const totalRevenue = orders.reduce((sum, order) => sum + order.amountPaid, 0);
    
    res.json({
      revenue: totalRevenue,
      totalOrders: orders.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`🚀 Master Backend running on http://localhost:${PORT}`);
});