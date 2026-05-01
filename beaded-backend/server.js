require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const util = require('util');
const multer = require('multer');
const { upload } = require('./cloudinary');

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Settings = require('./models/Settings');
const Review = require('./models/Review');
const Blog = require('./models/Blog');

const app = express();

// =====================================================================
// MIDDLEWARE & CONFIGURATION
// =====================================================================
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

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

const uploadFields = upload.fields([
  { name: 'primaryImage', maxCount: 1 },
  { name: 'secondaryImage', maxCount: 1 }
]);

// =====================================================================
// MONGODB CONNECTION
// =====================================================================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('📦 Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// =====================================================================
// AUTHENTICATION & USER ROUTES
// =====================================================================
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
    res.json({ 
      user: { 
        firstName: user.firstName, 
        lastName: user.lastName, 
        email: user.email, 
        phone: user.phone,
        points: user.points,
        shippingAddress: user.shippingAddress
      }, 
      cart: user.cart, 
      wishlist: user.wishlist 
    });
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

app.put('/api/user/profile', verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, shippingAddress } = req.body; 
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId, 
      { firstName, lastName, phone, shippingAddress },
      { returnDocument: 'after' }
    );

    res.json({
      user: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        points: updatedUser.points,
        shippingAddress: updatedUser.shippingAddress
      }
    });
  } catch (error) {
    console.error("🔥 Profile Update Error:", error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.get('/api/user/orders', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const userOrders = await Order.find({ customerEmail: user.email }).sort({ createdAt: -1 });
    res.json(userOrders);
  } catch (error) {
    console.error("🔥 Fetch User Orders Error:", error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// =====================================================================
// CATALOG & PRODUCT ROUTES
// =====================================================================
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/admin/products', async (req, res) => {
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

app.put('/api/admin/products/:id', async (req, res) => {
  if (req.headers.admin_secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Intruder alert: Invalid admin key' });
  }
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    console.error("🔥 UPDATE ERROR:", err.message);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

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

app.post('/api/products', uploadFields, async (req, res) => {
  try {
    const primaryUrl = req.files['primaryImage'] ? req.files['primaryImage'][0].path : null;
    const secondaryUrl = req.files['secondaryImage'] ? req.files['secondaryImage'][0].path : null;

    if (!primaryUrl) {
      return res.status(400).json({ error: "Primary image is required and failed to upload." });
    }

    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      cat: req.body.cat,
      img: primaryUrl,
      img2: secondaryUrl,
      rating: 5,
      reviews: 0
    });

    await newProduct.save();
    res.status(201).json({ message: "Success!", product: newProduct });
    
  } catch (err) {
    console.log("❌--- CRITICAL ERROR START ---❌");
    console.log(util.inspect(err, { showHidden: false, depth: null, colors: true }));
    console.log("❌--- CRITICAL ERROR END ---❌");
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

app.put('/api/products/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'secondaryImage', maxCount: 1 }]), async (req, res) => {
  try {
    const productId = req.params.id;
    console.log(`Received request to update product ${productId}. Handling files...`);

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      console.error(`Product ${productId} not found during update.`);
      return res.status(404).json({ status: "Bad", message: "Product not found" });
    }

    let primaryImageUrl = existingProduct.img;
    let secondaryImageUrl = existingProduct.img2;

    if (req.files && req.files.image && req.files.image[0]) {
      try {
        console.log("New primary image detected. Uploading to Cloudinary...");
        if (!req.files.image[0].path) { throw new Error("Multer failed to provide primary file path.")}
        
        const result = await cloudinary.uploader.upload(req.files.image[0].path, {
          folder: 'beaded_by_unknown',
        });
        primaryImageUrl = result.secure_url;
        console.log("Primary image upload success.");
      } catch (cloudErr) {
        console.error("Cloudinary Primary Upload Failed:", cloudErr);
      }
    } else {
      console.log("No new primary image uploaded. Retaining existing image URL.");
    }

    if (req.files && req.files.secondaryImage && req.files.secondaryImage[0]) {
      try {
        console.log("New secondary image detected. Uploading to Cloudinary...");
        if (!req.files.secondaryImage[0].path) { throw new Error("Multer failed to provide secondary file path.")}

        const result2 = await cloudinary.uploader.upload(req.files.secondaryImage[0].path, {
          folder: 'beaded_by_unknown',
        });
        secondaryImageUrl = result2.secure_url;
        console.log("Secondary image upload success.");
      } catch (cloudErr2) {
        console.error("Cloudinary Secondary Upload Failed:", cloudErr2);
      }
    } else {
      console.log("No new secondary image uploaded. Retaining existing secondary image URL.");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        ...req.body,
        img: primaryImageUrl,
        img2: secondaryImageUrl,
        colors: req.body.colors ? req.body.colors.split(',') : (existingProduct.colors || []), 
        rating: req.body.rating || existingProduct.rating,
        reviews: req.body.reviews || existingProduct.reviews
      },
      { new: true, returnDocument: 'after', runValidators: true } 
    );

    console.log(`Product ${productId} updated successfully.`);
    res.json({ status: "OK", message: "Product updated successfully.", product: updatedProduct });

  } catch (err) {
    console.error("Error during product update (PUT route):", err);
    res.status(500).json({ status: "Bad", message: "Product update failed on server.", error: err.message });
  }
});

// =====================================================================
// PAYMONGO & ORDER ROUTES
// =====================================================================
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { cart, checkoutForm, shippingRegion } = req.body;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    let lineItems = cart.map((item) => ({
      currency: 'PHP',
      amount: Math.round(item.price * 100),
      name: item.name,
      quantity: item.qty,
      description: item.mat || 'Handcrafted Bracelet',
    }));

    let shippingFee = 0;
    if (subtotal < 500) {
      const shippingRates = {
        'Metro Manila': 85,
        'Luzon': 100,
        'Visayas': 120,
        'Mindanao': 130
      };
      shippingFee = shippingRates[shippingRegion] || 85;
    }

    if (shippingFee > 0) {
      lineItems.push({
        currency: 'PHP',
        amount: shippingFee * 100,
        name: 'Shipping Fee',
        quantity: 1,
        description: `J&T Express Delivery (${shippingRegion})`
      });
    }

    // =========================================================
    // 🛠️ 1 PESO TESTING MODE
    // It will overwrite the real cart items with a single 1 PHP item.
    // =========================================================
    
    /*
    lineItems = [{
      currency: 'PHP',
      amount: 100, // 100 centavos = 1 Peso
      name: 'Test Order (1 Peso)',
      quantity: 1,
      description: 'Testing PayMongo integration'
    }];
    */

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
            description: 'Beaded by Unknown Order',
            metadata: {
              customer_name: `${checkoutForm.firstName} ${checkoutForm.lastName}`,
              customer_email: checkoutForm.email,
              contact_number: checkoutForm.phone,
              street: checkoutForm.street,
              barangay: checkoutForm.barangay,
              city: checkoutForm.city,
              province: checkoutForm.province,
              region: shippingRegion,
              postal_code: checkoutForm.postalCode
            }
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

app.post('/api/webhooks/paymongo', async (req, res) => {
  try {
    const event = req.body.data;
    
    if (event.attributes.type === 'checkout_session.payment.paid') {
      const session = event.attributes.data.attributes;
      const metadata = session.metadata || {};
      
      const newOrder = new Order({
        checkoutSessionId: event.attributes.data.id,
        customerName: metadata.customer_name || session.billing?.name || 'Guest',
        customerEmail: metadata.customer_email || session.billing?.email || 'No Email',
        contactNumber: metadata.contact_number || 'No Number',
        shippingAddress: {
          street: metadata.street || '',
          barangay: metadata.barangay || '',
          city: metadata.city || '',
          province: metadata.province || '',
          region: metadata.region || '',
          postalCode: metadata.postal_code || ''
        },
        amountPaid: session.payment_intent.attributes.amount / 100,
        items: session.line_items
      });

      await newOrder.save();
      console.log(`💰 NEW SALE RECORDED: ₱${newOrder.amountPaid}`);
    }
    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('🔥 Webhook error:', error);
    res.status(500).send('Webhook failed');
  }
});

app.get('/api/admin/orders', async (req, res) => {
  if (req.headers.admin_secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Invalid admin key' });
  }

  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Backend error fetching orders:", error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.patch('/api/admin/orders/:id/status', async (req, res) => {
  if (req.headers.admin_secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Invalid admin key' });
  }

  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!updatedOrder) return res.status(404).json({ error: 'Order not found' });
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// =====================================================================
// DASHBOARD STATS & ALGORITHMS
// =====================================================================
app.get('/api/admin/stats', async (req, res) => {
  if (req.headers.admin_secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Invalid admin key' });
  }
  
  try {
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + order.amountPaid, 0);
    
    res.json({
      revenue: totalRevenue,
      totalOrders: orders.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/bestsellers', async (req, res) => {
  try {
    const topSellingItems = await Order.aggregate([
      { $unwind: "$items" },
      { 
        $group: { 
          _id: "$items.name",
          totalSold: { $sum: "$items.quantity" }
        } 
      },
      { $sort: { totalSold: -1 } },
      { $limit: 4 }
    ]);

    const topNames = topSellingItems.map(item => item._id);
    const bestsellers = await Product.find({ name: { $in: topNames } });

    res.json(bestsellers);
  } catch (error) {
    console.error("Bestseller Algo Error:", error);
    res.status(500).json({ error: 'Failed to calculate bestsellers' });
  }
});

// =====================================================================
// STORE SETTINGS (Top Banner)
// =====================================================================
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ topBannerText: 'WELCOME' });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/admin/settings', async (req, res) => {
  if (req.headers.admin_secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Invalid admin key' });
  }
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ 
        topBannerText: req.body.topBannerText,
        featureOne: req.body.featureOne,
        featureTwo: req.body.featureTwo,
        featureThree: req.body.featureThree
      });
    } else {
      settings.topBannerText = req.body.topBannerText;
      settings.featureOne = req.body.featureOne;
      settings.featureTwo = req.body.featureTwo;
      settings.featureThree = req.body.featureThree;
    }
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// =====================================================================
// COMMUNITY LOVE (Reviews)
// =====================================================================
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.post('/api/admin/reviews', async (req, res) => {
  if (req.headers.admin_secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Invalid admin key' });
  }
  try {
    const newReview = new Review(req.body);
    await newReview.save();
    res.json(newReview);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add review' });
  }
});

app.delete('/api/admin/reviews/:id', async (req, res) => {
  if (req.headers.admin_secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Invalid admin key' });
  }
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// =====================================================================
// JOURNAL / BLOG ROUTES
// =====================================================================
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

app.post('/api/admin/blogs', async (req, res) => {
  if (req.headers.admin_secret !== process.env.ADMIN_SECRET) return res.status(403).json({ error: 'Invalid key' });
  try {
    const newBlog = new Blog(req.body);
    await newBlog.save();
    res.json(newBlog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.put('/api/admin/blogs/:id', async (req, res) => {
  if (req.headers.admin_secret !== process.env.ADMIN_SECRET) return res.status(403).json({ error: 'Invalid key' });
  try {
    const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update post' });
  }
});

app.delete('/api/admin/blogs/:id', async (req, res) => {
  if (req.headers.admin_secret !== process.env.ADMIN_SECRET) return res.status(403).json({ error: 'Invalid key' });
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// =====================================================================
// SERVER STARTUP
// =====================================================================
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`🚀 Master Backend running on http://localhost:${PORT}`);
});