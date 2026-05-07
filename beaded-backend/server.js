require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const util = require('util');
const multer = require('multer');
const nodemailer = require('nodemailer');
const { upload } = require('./cloudinary');
const rateLimit = require('express-rate-limit');


const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Settings = require('./models/Settings');
const Review = require('./models/Review');
const Blog = require('./models/Blog');
const CustomOrder = require('./models/CustomOrder');

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

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify(function(error, success) {
  if (error) {
    console.log("❌ Mail Server Connection Error:", error);
  } else {
    console.log("✅ Mail Server is ready to take our messages");
  }
});

// MASTER EMAIL TEMPLATE
const buildEmail = (title, messageHtml, boxLabel = null, boxValue = null) => {
  return `
    <div style="background-color: #FAF6F1; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #E8DFD3; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        
        <!-- Premium Header -->
        <div style="background-color: #3E2F1C; padding: 30px 20px; text-align: center;">
          <h1 style="color: #FAF6F1; margin: 0; font-size: 16px; letter-spacing: 4px; text-transform: uppercase; font-weight: 600;">Beaded by Unknown</h1>
        </div>

        <!-- Body Content -->
        <div style="padding: 40px 30px; color: #3E2F1C; font-size: 15px; line-height: 1.6;">
          <h2 style="color: #A0522D; font-size: 24px; font-family: Georgia, serif; margin-top: 0;">${title}</h2>
          ${messageHtml}

          <!-- Optional Highlight Box (For OTPs or Addresses) -->
          ${boxValue ? `
            <div style="background-color: #FAF6F1; border: 1px solid #E8DFD3; border-radius: 8px; padding: 25px 20px; text-align: center; margin: 30px 0;">
              <span style="font-size: 12px; color: #8B7D6B; text-transform: uppercase; letter-spacing: 2px;">${boxLabel}</span><br/>
              <strong style="font-size: 26px; letter-spacing: 6px; color: #3E2F1C; display: block; margin-top: 10px;">${boxValue}</strong>
            </div>
          ` : ''}
          
          <p style="margin-top: 30px; margin-bottom: 0; color: #8B7D6B;">With intention,<br/><strong style="color: #3E2F1C;">The Studio Team</strong></p>
        </div>

        <!-- Minimal Footer -->
        <div style="background-color: #ffffff; padding: 0 30px 30px; text-align: center; font-size: 12px; color: #B0A395;">
          <p style="margin: 0; border-top: 1px solid #E8DFD3; padding-top: 20px;">
            © 2026 Beaded by Unknown<br/>A gift for your friends, family, and yourself.
          </p>
        </div>

      </div>
    </div>
  `;
};

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
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({ 
      firstName, lastName, email, password: hashedPassword, 
      cart: [], wishlist: [],
      resetOtp: otp, resetOtpExpire: Date.now() + 10 * 60 * 1000 
    });
    await newUser.save();

    // SAFETY NET: If the email fails to send, don't crash the server!
    try {
      transporter.sendMail({
        from: `"Beaded by Unknown" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Account Verification Code',
        html: buildEmail(
          'Welcome to the Community', 
          '<p>We are thrilled to have you! To complete your registration, please verify your email using the secure code below.</p>', 
          'Verification Code', 
          otp
        )
      });
    } catch (mailError) {
      console.error("OTP Delivery failed, but user was created:", mailError);
    }

    res.json({ requireOtp: true, email });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });
    if (user.password === 'google-auth-no-password') return res.status(400).json({ error: 'Please sign in with Google.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    // SAFETY NET
    try {
      transporter.sendMail({
        from: `"Beaded by Unknown" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Login Verification Code',
        html: buildEmail(
          'Welcome to the Community', 
          '<p>We are thrilled to have you! To complete your registration, please verify your email using the secure code below.</p>', 
          'Verification Code', 
          otp
        )
      });
    } catch (mailError) {
      console.error("OTP Delivery failed:", mailError);
    }

    res.json({ requireOtp: true, email });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

app.post('/api/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    transporter.sendMail({
      from: `"Beaded by Unknown" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your New Verification Code',
      html: buildEmail('Resend Request', '<p>Your new verification code is below.</p>', 'Verification Code', otp)
    }).catch(err => console.error("Resend Mail Error:", err));

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

app.post('/api/verify-login-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ 
      email, resetOtp: otp, resetOtpExpire: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired Code' });
    
    user.resetOtp = null;
    user.resetOtpExpire = null;
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { firstName: user.firstName, email, points: user.points }, cart: user.cart, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
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
    
    const standardOrders = await Order.find({ customerEmail: user.email }).lean();

    const customOrders = await CustomOrder.find({ email: user.email }).lean();

    const formattedCustomOrders = customOrders.map(co => ({
      _id: co._id,
      createdAt: co.createdAt,
      status: co.status,
      amountPaid: co.totalPrice,
      items: [{
        name: `Custom Design: ${co.name || 'Bracelet'}`,
        quantity: 1,
        amount: co.totalPrice * 100,
        color: co.beadType || 'Mixed'
      }]
    }));

    const allOrders = [...standardOrders, ...formattedCustomOrders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json(allOrders);
  } catch (error) {
    console.error("🔥 Fetch User Orders Error:", error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.post('/api/user/request-delete', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: `"Beaded by Unknown" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Account Deletion Request - Beaded by Unknown',
      html: buildEmail(
        'Account Deletion Request',
        '<p>We received a request to permanently delete your Beaded by Unknown account. If you wish to proceed, please use the verification code below. <strong>This action cannot be undone and you will lose your order history and wishlist.</strong></p>',
        'Deletion Code',
        otp
      )
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request' });
  }
});

app.delete('/api/user/delete', verifyToken, async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findOne({ 
      _id: req.user.userId, 
      resetOtp: otp, 
      resetOtpExpire: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired code' });

    await User.findByIdAndDelete(req.user.userId);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// =====================================================================
// PASSWORD RESET & OTP ROUTES
// =====================================================================

app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: `"Beaded by Unknown" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Code',
      html: buildEmail(
        'Password Reset Request', 
        '<p>We received a request to reset the password for your account. If this was you, use the code below to securely authenticate.</p>', 
        'Your Reset Code', 
        otp
      )
    });

    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 2, 
  message: { error: 'Too many requests. Please wait a minute.' }
});

app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ 
      email, 
      resetOtp: otp, 
      resetOtpExpire: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired OTP' });
    res.json({ message: 'OTP verified' });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    user.resetOtp = null;
    user.resetOtpExpire = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
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

app.put('/api/products/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id, 
      { isAvailable: isAvailable }, 
      { new: true } 
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({ message: 'Failed to update product status.' });
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
/*
    if (shippingFee > 0) {
      lineItems.push({
        currency: 'PHP',
        amount: shippingFee * 100, 
        name: 'Shipping Fee',
        quantity: 1,
        description: `J&T Express Delivery (${shippingRegion})`
      });
    }
*/

    // 1 PESO TESTING MODE

    lineItems = [{
      currency: 'PHP',
      amount: 100, // 100 centavos = 1 Peso
      name: 'Test Order (1 Peso)',
      quantity: 1,
      description: 'Testing PayMongo integration'
    }];


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
            billing: {
              name: `${checkoutForm.firstName} ${checkoutForm.lastName}`,
              email: checkoutForm.email,
              phone: checkoutForm.phone,
              address: {
                line1: checkoutForm.street,
                line2: checkoutForm.barangay,
                city: checkoutForm.city,
                state: checkoutForm.province,
                postal_code: checkoutForm.postalCode,
                country: 'PH'
              }
            },
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

      try {
        await transporter.sendMail({
          from: `"Beaded by Unknown" <${process.env.EMAIL_USER}>`,
          to: newOrder.customerEmail,
          subject: 'Order Confirmed - Beaded by Unknown',
          html: buildEmail(
            `Order Confirmed, ${newOrder.customerName}!`, 
            `<p>We have successfully received your payment of <strong>₱${newOrder.amountPaid}</strong>. Our studio is now reviewing your items and preparing them for crafting.</p>
             <p>Because each piece is made to order with careful intention, please allow 7-14 days for crafting and delivery. We will email you again the moment it ships!</p>`, 
            'Shipping To', 
            `${newOrder.shippingAddress.street}<br/><span style="font-size: 14px;">Brgy. ${newOrder.shippingAddress.barangay}, ${newOrder.shippingAddress.city}</span>`
          )
        });
        console.log('✉️ Confirmation email sent to', newOrder.customerEmail);
      } catch (mailErr) {
        console.error('Failed to send confirmation email:', mailErr);
      }
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
    const orders = await Order.find().sort({ createdAt: -1 }).limit(50);
    res.json(orders);
  } catch (error) {
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

    if (status === 'Shipped' || status === 'Delivered') {
      try {
        await transporter.sendMail({
          from: `"Beaded by Unknown" <${process.env.EMAIL_USER}>`,
          to: updatedOrder.customerEmail,
          subject: `Your order has been ${status}! - Beaded by Unknown`,
          html: buildEmail(
            `Great news, ${updatedOrder.customerName}!`, 
            `<p>Your handcrafted order is officially <strong>${status}</strong>.</p>
             ${status === 'Shipped' ? '<p>It has left our studio, is currently with J&T Express, and is making its way to you.</p>' : '<p>Your order has arrived safely. We hope you love your new pieces!</p>'}`, 
            'Order Status', 
            status
          )
        });
        console.log(`✉️ Update email sent to ${updatedOrder.customerEmail}`);
      } catch (mailErr) {
        console.error('Failed to send status email:', mailErr);
      }
    }

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
// STORE SETTINGS & DYNAMIC CATEGORIES
// =====================================================================
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ 
        topBannerText: 'WELCOME',
        categories: ['Plastic', 'Gemstone', 'Glass']
      });
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
        featureThree: req.body.featureThree,
        theme: req.body.theme,
        categories: req.body.categories || ['Plastic', 'Gemstone', 'Glass']
      });
    } else {
      if (req.body.topBannerText) settings.topBannerText = req.body.topBannerText;
      if (req.body.featureOne) settings.featureOne = req.body.featureOne;
      if (req.body.featureTwo) settings.featureTwo = req.body.featureTwo;
      if (req.body.featureThree) settings.featureThree = req.body.featureThree;
      if (req.body.theme) settings.theme = req.body.theme;
      if (req.body.categories) settings.categories = req.body.categories;
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
// CUSTOM DESIGNS ROUTES
// =====================================================================

app.post('/api/custom-orders', async (req, res) => {
  try {
    const newCustomOrder = new CustomOrder(req.body);
    await newCustomOrder.save();
    res.status(201).json(newCustomOrder);
  } catch (error) {
    console.error('Error saving custom order:', error);
    res.status(500).json({ error: 'Failed to save custom order' });
  }
});

app.get('/api/custom-orders', async (req, res) => {
  try {
    const customOrders = await CustomOrder.find().sort({ createdAt: -1 });
    res.json(customOrders);
  } catch (error) {
    console.error('Error fetching custom orders:', error);
    res.status(500).json({ error: 'Failed to fetch custom orders' });
  }
});

app.patch('/api/admin/custom-orders/:id/status', async (req, res) => {
  if (req.headers.admin_secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Invalid admin key' });
  }
  try {
    const { status } = req.body;
    const updated = await CustomOrder.findByIdAndUpdate(
      req.params.id, 
      { status: status }, 
      { new: true }
    );

    if (status === 'Shipped' || status === 'Delivered') {
      try {
        await transporter.sendMail({
          from: `"Beaded by Unknown" <${process.env.EMAIL_USER}>`,
          to: updated.email,
          subject: `Your Custom Design has been ${status}! - Beaded by Unknown`,
          html: buildEmail(
            `Great news!`, 
            `<p>Your custom-designed bracelet (${updated.name}) is officially <strong>${status}</strong>.</p>
             ${status === 'Shipped' ? '<p>It has left our studio, is currently with J&T Express, and is making its way to you.</p>' : '<p>Your order has arrived safely. We hope you love your new piece!</p>'}`, 
            'Design Status', 
            status
          )
        });
      } catch (mailErr) {
        console.error('Failed to send custom status email:', mailErr);
      }
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating custom order:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// =====================================================================
// SERVER STARTUP
// =====================================================================
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`🚀 Master Backend running on http://localhost:${PORT}`);
});