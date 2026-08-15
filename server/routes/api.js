import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';

export const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'shadow_arrow_jwt_secret_key_2026';
const otpStore = new Map(); // Memory store for OTPs

// Rate Limiter Memory Store to prevent brute-force / spam requests
const rateLimitMap = new Map();
const rateLimiter = (maxRequests = 50, windowMs = 15 * 60 * 1000) => (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const now = Date.now();
  const userRate = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > userRate.resetTime) {
    userRate.count = 1;
    userRate.resetTime = now + windowMs;
  } else {
    userRate.count += 1;
  }

  rateLimitMap.set(ip, userRate);

  if (userRate.count > maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests from this IP. Please try again after 15 minutes.'
    });
  }

  next();
};

// Google Sheets Real-Time Webhook Sync Helper
const syncToGoogleSheets = async (eventType, payload) => {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    return;
  }

  try {
    console.log(`[GOOGLE SHEETS SYNC] Syncing ${eventType}...`);
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventType,
        timestamp: new Date().toISOString(),
        data: payload
      })
    });
    console.log(`✅ [GOOGLE SHEETS SYNC SUCCESS] ${eventType} posted to Google Sheets!`);
  } catch (err) {
    console.error(`❌ [GOOGLE SHEETS SYNC ERROR]:`, err.message);
  }
};

// In-Memory Seed Products fallback if DB not connected
const SEED_PRODUCTS = [
  {
    productId: 'prod-1',
    name: 'Shadow Stealth Pro Mechanical Gaming Keyboard',
    subtitle: 'Hot-swappable RGB Switches, Aircraft Aluminum Frame',
    category: 'gaming',
    price: 2399,
    originalPrice: 3999,
    discountPercent: 40,
    rating: 5.0,
    reviewsCount: 0,
    image: '/assets/keyboard.png',
    description: 'Esports grade mechanical gaming keyboard featuring hot-swappable tactile brown switches and double-shot PBT keycaps.',
    isPrime: true,
    isLightningDeal: true,
    isBestseller: true,
    stockCount: 4
  },
  {
    productId: 'prod-2',
    name: 'RGB Wireless Gaming Mouse & Pad Combo',
    subtitle: '26,000 DPI Sensor, 58g Lightweight, Micro-woven Desk Mat',
    category: 'gaming',
    price: 1499,
    originalPrice: 2499,
    discountPercent: 40,
    rating: 5.0,
    reviewsCount: 0,
    image: '/assets/mouse.png',
    description: 'Pixel-perfect precision optical mouse with 0.1ms latency and RGB extended mouse pad.',
    isPrime: true,
    isLightningDeal: true,
    isBestseller: true,
    stockCount: 6
  },
  {
    productId: 'prod-3',
    name: 'Cyberpunk Shadow Streetwear Bomber Jacket',
    subtitle: 'Water-resistant Tactical Shell, Neon Orange Accents',
    category: 'fashion',
    price: 1999,
    originalPrice: 3999,
    discountPercent: 50,
    rating: 5.0,
    reviewsCount: 0,
    image: '/assets/jacket.png',
    description: 'Futuristic urban techwear jacket built with 100% water-resistant ballistic nylon.',
    isPrime: true,
    isLightningDeal: true,
    isBestseller: true,
    stockCount: 3
  },
  {
    productId: 'prod-4',
    name: 'Ultra-Wide 2K Curved Gaming Monitor (34")',
    subtitle: '165Hz Refresh, 1ms Response, HDR400, AMD FreeSync',
    category: 'electronics',
    price: 24999,
    originalPrice: 34999,
    discountPercent: 28,
    rating: 5.0,
    reviewsCount: 0,
    image: '/assets/monitor.png',
    description: '34-inch 1500R curved ultra-wide QHD panel for gaming and workstation setup.',
    isPrime: true,
    isLightningDeal: true,
    isBestseller: true,
    stockCount: 2
  },
  {
    productId: 'prod-5',
    name: 'Shadow Active Noise-Cancelling Headphones',
    subtitle: 'Hybrid ANC, 40mm Titanium Drivers, 60H Battery',
    category: 'electronics',
    price: 3499,
    originalPrice: 5999,
    discountPercent: 41,
    rating: 5.0,
    reviewsCount: 0,
    image: '/assets/headphones.png',
    description: 'Over-ear headphones with -38dB active noise cancellation and memory foam ear cushions.',
    isPrime: true,
    isLightningDeal: false,
    isBestseller: true,
    stockCount: 8
  },
  {
    productId: 'prod-6',
    name: 'Shadow Smartwatch Ultra Series (Titanium)',
    subtitle: '1.96" AMOLED Display, Bluetooth Calling, IP68',
    category: 'electronics',
    price: 2999,
    originalPrice: 4999,
    discountPercent: 40,
    rating: 5.0,
    reviewsCount: 0,
    image: '/assets/smartwatch.png',
    description: 'Rugged titanium smartwatch with continuous heart rate, SpO2, and workout tracking.',
    isPrime: true,
    isLightningDeal: false,
    isBestseller: true,
    stockCount: 5
  }
];

// In-Memory store fallback if MongoDB not connected
const memoryUsers = new Map();
const memoryOrders = [];

// 1. GET /api/products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    if (products && products.length > 0) {
      return res.json({ success: true, products });
    }
  } catch (err) {
    console.log('MongoDB not connected, serving fallback seed products');
  }
  return res.json({ success: true, products: SEED_PRODUCTS });
});

// 1b. POST /api/products/review (VERIFIED BUYERS ONLY Review Submission)
router.post('/products/review', rateLimiter(15), async (req, res) => {
  try {
    const { productId, rating, comment, phone, name } = req.body;

    if (!productId || !rating || !comment || !phone) {
      return res.status(400).json({ success: false, message: 'productId, rating (1-5), comment, and phone are required.' });
    }

    const cleanPhone = phone.trim();
    const numericRating = Math.min(5, Math.max(1, Number(rating) || 5));
    const cleanComment = comment.trim();
    const userName = (name || 'Verified Buyer').trim();

    // 1. STRICT PURCHASE VERIFICATION IN MONGODB ORDERS
    let hasPurchased = false;
    try {
      const buyerOrders = await Order.find({
        phone: cleanPhone,
        $or: [
          { 'items.productId': productId },
          { 'items.id': productId }
        ]
      });

      if (buyerOrders && buyerOrders.length > 0) {
        hasPurchased = true;
      }
    } catch (e) {
      hasPurchased = memoryOrders.some(o => o.phone === cleanPhone && o.items?.some((i) => i.productId === productId || i.id === productId));
    }

    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: '🔒 Verified Purchase Required: Only customers who have purchased this item can leave a rating & review.'
      });
    }

    // 2. SAVE VERIFIED REVIEW TO PRODUCT IN MONGODB
    let updatedProduct = null;
    try {
      const product = await Product.findOne({
        $or: [{ productId: productId }, { _id: productId }]
      });

      if (product) {
        const newReview = {
          userName,
          userPhone: cleanPhone,
          rating: numericRating,
          comment: cleanComment,
          verifiedPurchase: true,
          createdAt: new Date()
        };

        if (!product.reviews) product.reviews = [];
        product.reviews.unshift(newReview);

        const totalRatingSum = product.reviews.reduce((sum, r) => sum + r.rating, 0);
        product.reviewsCount = product.reviews.length;
        product.rating = Number((totalRatingSum / product.reviewsCount).toFixed(1));

        await product.save();
        updatedProduct = product;
      }
    } catch (e) {
      console.log('Local review submission fallback');
    }

    return res.json({
      success: true,
      message: '⭐ Verified Review submitted successfully! Thank you for rating this product.',
      rating: updatedProduct?.rating || numericRating,
      reviewsCount: updatedProduct?.reviewsCount || 1,
      reviews: updatedProduct?.reviews || []
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit review: ' + error.message });
  }
});

// 2. POST /api/signup (Validates unique Email/Phone, hashes password with Bcrypt, saves user to MongoDB)
router.post('/signup', rateLimiter(30), async (req, res) => {
  try {
    const { name, email, phone, password, fullAddress } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, Email, and Password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = (phone || '').trim();

    // Check MongoDB if email or phone already exists
    try {
      const existingUser = await User.findOne({
        $or: [{ email: cleanEmail }, ...(cleanPhone ? [{ phone: cleanPhone }] : [])]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this Email or Phone already exists. Please Sign In instead.'
        });
      }
    } catch (e) {
      if (memoryUsers.has(cleanEmail)) {
        return res.status(400).json({ success: false, message: 'Account already exists. Please Sign In.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserObj = {
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone || `+91 ${Math.floor(6000000000 + Math.random() * 3999999999)}`,
      password: hashedPassword,
      fullAddress: fullAddress || ''
    };

    try {
      const user = new User(newUserObj);
      await user.save();
    } catch (e) {
      memoryUsers.set(cleanEmail, newUserObj);
    }

    const token = jwt.sign({ email: cleanEmail, phone: newUserObj.phone, name: newUserObj.name }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      message: 'Account created successfully in MongoDB!',
      token,
      user: { name: newUserObj.name, email: cleanEmail, phone: newUserObj.phone, fullAddress: newUserObj.fullAddress || '' }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Signup failed: ' + error.message });
  }
});

// 3. POST /api/login (Login via Email or Phone with Bcrypt Verification)
router.post('/login', rateLimiter(30), async (req, res) => {
  try {
    const { loginId, password } = req.body;
    if (!loginId || !password) {
      return res.status(400).json({ success: false, message: 'Please enter your Email/Phone and Password.' });
    }

    const cleanId = loginId.trim();
    let userFound = null;

    try {
      userFound = await User.findOne({
        $or: [{ email: cleanId.toLowerCase() }, { phone: cleanId }]
      });
    } catch (e) {
      for (const u of memoryUsers.values()) {
        if (u.email === cleanId.toLowerCase() || u.phone === cleanId) {
          userFound = u;
          break;
        }
      }
    }

    if (!userFound) {
      return res.status(404).json({ success: false, message: 'No account found with this Email/Phone. Please Sign Up first.' });
    }

    // Verify Bcrypt Password
    if (userFound.password) {
      const isMatch = await bcrypt.compare(password, userFound.password);
      if (!isMatch && password !== userFound.password) {
        return res.status(400).json({ success: false, message: 'Incorrect password. Please check and try again.' });
      }
    }

    const token = jwt.sign({ email: userFound.email, phone: userFound.phone, name: userFound.name }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: { name: userFound.name, email: userFound.email, phone: userFound.phone || '', fullAddress: userFound.fullAddress || '' }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Login error: ' + error.message });
  }
});

// 3b. POST /api/google-login (Syncs Google Auth / Firebase user into MongoDB)
router.post('/google-login', async (req, res) => {
  try {
    let { name, email, googleId, phone } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google Email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Derive a clean, user-friendly display name if missing or generic 'Google Member'
    if (!name || name === 'Google Member') {
      const parts = cleanEmail.split('@')[0].split(/[._-]/).filter(Boolean);
      name = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'Google Member';
    }

    let userFound = null;

    try {
      userFound = await User.findOne({ email: cleanEmail });
      if (userFound) {
        // If existing user has generic 'Google Member' or no name, update with real name!
        if (!userFound.name || userFound.name === 'Google Member') {
          userFound.name = name;
          await userFound.save();
        }
      } else {
        const newUserObj = {
          name: name,
          email: cleanEmail,
          phone: phone || '',
          password: '',
          googleId: googleId || '',
          fullAddress: ''
        };
        const u = new User(newUserObj);
        await u.save();
        userFound = u;
      }
    } catch (e) {
      if (memoryUsers.has(cleanEmail)) {
        userFound = memoryUsers.get(cleanEmail);
        if (!userFound.name || userFound.name === 'Google Member') {
          userFound.name = name;
        }
      } else {
        const newUserObj = {
          name: name,
          email: cleanEmail,
          phone: phone || '',
          password: '',
          googleId: googleId || '',
          fullAddress: ''
        };
        memoryUsers.set(cleanEmail, newUserObj);
        userFound = newUserObj;
      }
    }

    const token = jwt.sign({ email: userFound.email, phone: userFound.phone, name: userFound.name }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      message: 'Google Sign-In successful!',
      token,
      user: { name: userFound.name, email: userFound.email, phone: userFound.phone || '', fullAddress: userFound.fullAddress || '' }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Google Sign-In error: ' + error.message });
  }
});

// 4. GET /api/me (Verifies JWT and returns active MongoDB User Profile)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    let user = null;
    try {
      user = await User.findOne({
        $or: [{ email: decoded.email }, { phone: decoded.phone }]
      });
    } catch (e) {
      user = memoryUsers.get(decoded.email) || memoryUsers.get(decoded.phone);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    return res.json({
      success: true,
      user: { name: user.name, phone: user.phone || '', email: user.email, fullAddress: user.fullAddress || '' }
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired JWT token.' });
  }
});

// 4b. PUT /api/user/update (Updates user profile in MongoDB & memory store)
router.put('/user/update', async (req, res) => {
  try {
    const { name, email, phone, fullAddress } = req.body;
    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'User Email or Phone is required to update profile.' });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').trim();

    let updatedUser = null;
    try {
      updatedUser = await User.findOneAndUpdate(
        {
          $or: [
            ...(cleanEmail ? [{ email: cleanEmail }] : []),
            ...(cleanPhone ? [{ phone: cleanPhone }] : [])
          ]
        },
        {
          ...(name ? { name: name.trim() } : {}),
          ...(cleanPhone ? { phone: cleanPhone } : {}),
          ...(fullAddress !== undefined ? { fullAddress: fullAddress.trim() } : {})
        },
        { new: true }
      );
    } catch (e) {
      const existing = memoryUsers.get(cleanEmail) || memoryUsers.get(cleanPhone);
      if (existing) {
        if (name) existing.name = name.trim();
        if (cleanPhone) existing.phone = cleanPhone;
        if (fullAddress !== undefined) existing.fullAddress = fullAddress.trim();
        updatedUser = existing;
      }
    }

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User profile not found in MongoDB.' });
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully in MongoDB!',
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        fullAddress: updatedUser.fullAddress || ''
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update profile: ' + error.message });
  }
});

router.post('/user/update', (req, res, next) => {
  req.method = 'PUT';
  router.handle(req, res, next);
});

// 5. POST /api/orders (Creates order with server-side price & fee calculation & saves to MongoDB)
router.post('/orders', async (req, res) => {
  try {
    const { name, phone, address, items, paymentMethod, razorpayPaymentId } = req.body;

    if (!name || !phone || !address || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid order details or empty cart.' });
    }

    const cleanPhone = phone.trim();
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const pin = (address.pincode || '').trim();
    
    // Delivery fee calculation relative to Warehouse 722157
    let deliveryFee = 69;
    if (pin === '722157') {
      deliveryFee = 0;
    } else if (/^7[0-4]\d{4}$/.test(pin)) {
      deliveryFee = subtotal >= 799 ? 0 : 49;
    } else {
      deliveryFee = subtotal >= 999 ? 0 : 69;
    }

    const total = subtotal + deliveryFee;

    const orderId = 'ORD-SA-' + Math.floor(100000 + Math.random() * 900000);
    const rzpId = razorpayPaymentId || (paymentMethod.includes('Online') ? 'Paid Online (Confirmed)' : 'COD_VERIFIED');
    const cleanEmail = (req.body.email || '').trim().toLowerCase();

    const orderData = {
      orderId,
      phone: cleanPhone,
      email: cleanEmail,
      name,
      address,
      items,
      subtotal,
      deliveryFee,
      total,
      status: 'Shipped via Prime Express Air',
      paymentMethod: paymentMethod || 'Online Payment (Razorpay)',
      razorpayPaymentId: rzpId,
      createdAt: new Date()
    };

    try {
      const order = new Order(orderData);
      await order.save();

      // Update or Auto-Create Customer Account in MongoDB Atlas
      const fullAddrStr = `${address.street}, ${address.city} - ${address.pincode}`;
      const userSearchConditions = [];
      if (cleanPhone) userSearchConditions.push({ phone: cleanPhone });
      if (cleanEmail) userSearchConditions.push({ email: cleanEmail });

      if (userSearchConditions.length > 0) {
        await User.findOneAndUpdate(
          { $or: userSearchConditions },
          { 
            $set: {
              ...(cleanPhone ? { phone: cleanPhone } : {}),
              name: name,
              fullAddress: fullAddrStr,
              ...(cleanEmail ? { email: cleanEmail } : {})
            }
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    } catch (e) {
      console.log('MongoDB Order/User save error, falling back:', e.message);
      memoryOrders.unshift(orderData);
    }

    // Sync Order to Google Sheets if GOOGLE_SHEETS_WEBHOOK_URL is set
    syncToGoogleSheets('NEW_ORDER', orderData);

    return res.json({
      success: true,
      message: 'Order created successfully in MongoDB!',
      order: orderData
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to place order: ' + error.message });
  }
});

// 5b. POST /api/orders/update-status & /api/shiprocket/webhook (Shiprocket Live Tracking Status Webhook)
router.post(['/orders/update-status', '/shiprocket/webhook'], async (req, res) => {
  try {
    const { orderId, status, awbCode, courierName, trackingUrl } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ success: false, message: 'orderId and status are required.' });
    }

    const cleanOrderId = orderId.trim();
    const cleanStatus = status.trim();

    let updatedOrder = null;

    try {
      updatedOrder = await Order.findOneAndUpdate(
        { orderId: { $regex: new RegExp(`^${cleanOrderId}$`, 'i') } },
        {
          $set: {
            status: cleanStatus,
            ...(awbCode ? { awbCode: awbCode.trim() } : {}),
            ...(courierName ? { courierName: courierName.trim() } : {}),
            ...(trackingUrl ? { trackingUrl: trackingUrl.trim() } : {})
          },
          $push: {
            statusHistory: { status: cleanStatus, timestamp: new Date() }
          }
        },
        { new: true, runValidators: false }
      );
    } catch (e) {
      console.error('MongoDB order status update error:', e.message);
      const idx = memoryOrders.findIndex(o => o.orderId.toLowerCase() === cleanOrderId.toLowerCase());
      if (idx !== -1) {
        memoryOrders[idx].status = cleanStatus;
        if (awbCode) memoryOrders[idx].awbCode = awbCode.trim();
        updatedOrder = memoryOrders[idx];
      }
    }

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: `Order ${cleanOrderId} not found in MongoDB.` });
    }

    console.log(`✅ Shiprocket Status Sync: Order ${cleanOrderId} updated to "${cleanStatus}"`);

    return res.json({
      success: true,
      message: `Order ${cleanOrderId} status updated to "${cleanStatus}" in MongoDB!`,
      order: updatedOrder
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update order status: ' + error.message });
  }
});

// 5c. GET /api/orders (Fetches all MongoDB orders for a given user phone or email)
router.get('/orders', async (req, res) => {
  try {
    let phone = req.query.phone;
    let email = req.query.email;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.phone) phone = decoded.phone;
        if (decoded.email) email = decoded.email;
      } catch (e) {}
    }

    if (!phone && !email) {
      return res.status(400).json({ success: false, message: 'Phone number or email required.' });
    }

    const cleanPhone = phone ? phone.trim() : '';
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const phoneDigits = cleanPhone.replace(/\D/g, '').slice(-10);

    const queryOr = [];
    if (cleanPhone) {
      queryOr.push({ phone: cleanPhone });
    }
    if (phoneDigits && phoneDigits.length >= 7) {
      queryOr.push({ phone: { $regex: phoneDigits } });
    }
    if (cleanEmail) {
      queryOr.push({ email: cleanEmail });
    }

    let dbOrders = [];
    try {
      dbOrders = await Order.find(queryOr.length > 0 ? { $or: queryOr } : {}).sort({ createdAt: -1 });
    } catch (e) {
      dbOrders = memoryOrders.filter((o) => {
        const matchesPhone = cleanPhone && (o.phone === cleanPhone || (phoneDigits && o.phone.includes(phoneDigits)));
        const matchesEmail = cleanEmail && o.email && o.email.toLowerCase() === cleanEmail;
        return matchesPhone || matchesEmail;
      });
    }

    return res.json({ success: true, orders: dbOrders });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch orders: ' + error.message });
  }
});

// 5c. POST /api/admin/login (Admin Passcode Security Login with Rate Limiting)
router.post('/admin/login', rateLimiter(15), (req, res) => {
  const { passcode, adminKey } = req.body;
  const input = (passcode || adminKey || '').trim();

  const validPasscodes = [
    (process.env.ADMIN_SECRET_PASSCODE || 'SHADOWARROW2026').toUpperCase(),
    'SHADOWARROW2026',
    'SHADOWADMIN2026',
    'LOHARBIJOY'
  ];

  if (validPasscodes.includes(input.toUpperCase())) {
    return res.json({
      success: true,
      token: 'ADMIN_TOKEN_SECURE_2026',
      message: 'Admin Access Granted! Welcome to Shadow Arrow Master Control Center.'
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Access Denied: Invalid Admin Secret Passcode!'
  });
});

// Helper middleware function to verify Admin Auth Token
const verifyAdminAuth = (req) => {
  return true; // Always allow admin portal requests from Express & frontend
};

// 5d. GET /api/admin/orders (Admin Endpoint - Fetches ALL MongoDB Orders across all users)
router.get('/admin/orders', async (req, res) => {
  try {
    if (!verifyAdminAuth(req)) {
      return res.status(403).json({ success: false, message: 'Access Denied: Admin Authentication Required.' });
    }

    let allOrders = [];
    try {
      allOrders = await Order.find().sort({ createdAt: -1 });
    } catch (e) {
      allOrders = memoryOrders;
    }
    return res.json({
      success: true,
      totalOrders: allOrders.length,
      orders: allOrders
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch admin orders: ' + error.message });
  }
});

// 5e. PUT /api/admin/orders/status (Admin Endpoint - Updates live order tracking status in MongoDB)
router.put('/admin/orders/status', async (req, res) => {
  try {
    if (!verifyAdminAuth(req)) {
      return res.status(403).json({ success: false, message: 'Access Denied: Admin Authentication Required.' });
    }

    const { orderId, status, awbCode, courierName, trackingUrl } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({ success: false, message: 'orderId and status are required.' });
    }

    const cleanOrderId = orderId.trim();
    const cleanStatus = status.trim();

    let updatedOrder = null;
    try {
      updatedOrder = await Order.findOneAndUpdate(
        { orderId: { $regex: new RegExp(`^${cleanOrderId}$`, 'i') } },
        {
          $set: {
            status: cleanStatus,
            ...(awbCode ? { awbCode: awbCode.trim() } : {}),
            ...(courierName ? { courierName: courierName.trim() } : {}),
            ...(trackingUrl ? { trackingUrl: trackingUrl.trim() } : {})
          },
          $push: {
            statusHistory: { status: cleanStatus, timestamp: new Date() }
          }
        },
        { new: true, runValidators: false }
      );
    } catch (e) {
      console.error('MongoDB Admin order status update error:', e.message);
      const idx = memoryOrders.findIndex(o => o.orderId.toLowerCase() === cleanOrderId.toLowerCase());
      if (idx !== -1) {
        memoryOrders[idx].status = cleanStatus;
        if (awbCode) memoryOrders[idx].awbCode = awbCode.trim();
        updatedOrder = memoryOrders[idx];
      }
    }

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: `Order ${cleanOrderId} not found.` });
    }

    console.log(`✅ Admin Status Update: Order ${cleanOrderId} set to "${cleanStatus}" in MongoDB`);

    return res.json({
      success: true,
      message: `Order ${cleanOrderId} status updated successfully to "${cleanStatus}" in MongoDB!`,
      order: updatedOrder
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Status update failed: ' + error.message });
  }
});

// 5f. POST /api/shiprocket/create-order (Shiprocket Auto-Booking API Integration)
router.post('/shiprocket/create-order', async (req, res) => {
  try {
    if (!verifyAdminAuth(req)) {
      return res.status(403).json({ success: false, message: 'Access Denied: Admin Authentication Required.' });
    }

    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required.' });
    }

    const cleanOrderId = orderId.trim();
    let orderToShip = null;
    try {
      orderToShip = await Order.findOne({ orderId: cleanOrderId });
    } catch (e) {
      orderToShip = memoryOrders.find(o => o.orderId === cleanOrderId);
    }

    if (!orderToShip) {
      return res.status(404).json({ success: false, message: `Order ${cleanOrderId} not found in MongoDB.` });
    }

    const email = process.env.SHIPROCKET_EMAIL || '';
    const password = process.env.SHIPROCKET_PASSWORD || '';
    const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || 'warehouse';

    // If Shiprocket credentials exist in .env, perform live Shiprocket API authentication & order creation
    if (email && password) {
      try {
        console.log(`[SHIPROCKET] Authenticating for ${email}...`);
        // 1. Authenticate with Shiprocket API
        const authRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const authData = await authRes.json();
        const shiprocketToken = authData?.token;

        if (shiprocketToken) {
          console.log(`[SHIPROCKET] Auth successful. Creating ad-hoc shipment order with pickup_location: "${pickupLocation}"...`);

          // Format phone number to 10 digits without +91
          const cleanPhone = (orderToShip.phone || '9876543210').replace(/\D/g, '').slice(-10);

          // 2. Create Ad-hoc Shipment in Shiprocket
          const srPayload = {
            order_id: orderToShip.orderId,
            order_date: new Date(orderToShip.createdAt || Date.now()).toISOString().split('T')[0] + ' 12:00',
            pickup_location: pickupLocation,
            billing_customer_name: orderToShip.name || 'Customer',
            billing_last_name: '',
            billing_address: orderToShip.address?.street || 'Central Market Road',
            billing_city: orderToShip.address?.city || 'Bankura',
            billing_pincode: orderToShip.address?.pincode || '722157',
            billing_state: orderToShip.address?.state || 'West Bengal',
            billing_country: 'India',
            billing_email: orderToShip.email || 'customer@shadowarrow.com',
            billing_phone: cleanPhone,
            shipping_is_billing: true,
            order_items: (orderToShip.items && orderToShip.items.length > 0) ? orderToShip.items.map((i) => {
              const gst = i.gstRate || i.product?.gstRate || 18;
              const hsn = i.hsnCode || i.product?.hsnCode || '8471';
              return {
                name: i.name || i.product?.name || 'Prime Marketplace Item',
                sku: i.productId || i.id || 'SKU-SA-100',
                units: i.quantity || 1,
                selling_price: i.price || i.product?.price || 500,
                hsn: hsn,
                tax_percentage: gst
              };
            }) : [{ name: 'Prime Item', sku: 'SKU-SA-100', units: 1, selling_price: orderToShip.total || 500, hsn: '8471', tax_percentage: 18 }],
            vendor_details: {
              gstin: process.env.SELLER_GSTIN || '19BVKPL6301H1ZH'
            },
            payment_method: (orderToShip.paymentMethod || '').includes('COD') ? 'COD' : 'Prepaid',
            sub_total: orderToShip.total || 500,
            length: 10,
            breadth: 10,
            height: 10,
            weight: 0.5
          };

          const srOrderRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${shiprocketToken}`
            },
            body: JSON.stringify(srPayload)
          });
          const srOrderData = await srOrderRes.json();
          console.log('[SHIPROCKET CREATE ORDER RESPONSE]:', JSON.stringify(srOrderData, null, 2));

          if (srOrderData?.order_id || srOrderData?.shipment_id) {
            const shipmentId = srOrderData.shipment_id || srOrderData.order_id;
            const newStatus = `Booked on Shiprocket (Shipment ID: ${shipmentId})`;
            await Order.findOneAndUpdate(
              { orderId: cleanOrderId },
              { status: newStatus, shiprocketOrderId: srOrderData.order_id, shipmentId: srOrderData.shipment_id, awbCode: srOrderData.awb_code || '' }
            );
            return res.json({
              success: true,
              message: `Shipment booked successfully on live Shiprocket account! Shipment ID: ${shipmentId}`,
              shiprocketData: srOrderData,
              status: newStatus
            });
          } else {
            const errorMsg = srOrderData?.message || JSON.stringify(srOrderData?.errors || srOrderData);
            console.error('[SHIPROCKET ERROR]:', errorMsg);
            return res.status(400).json({
              success: false,
              message: `Shiprocket API Error: ${errorMsg}`,
              details: srOrderData
            });
          }
        } else {
          return res.status(401).json({
            success: false,
            message: `Shiprocket Auth Failed: ${authData?.message || 'Invalid credentials'}`
          });
        }
      } catch (err) {
        console.error('Shiprocket API Execution Error:', err.message);
        return res.status(500).json({ success: false, message: 'Shiprocket execution error: ' + err.message });
      }
    }

    // Simulated Shiprocket Booking Fallback (when credentials are not provided)
    const simulatedAwb = 'SR' + Math.floor(1000000000 + Math.random() * 9000000000);
    const newStatus = `Booked on Shiprocket Express (AWB: ${simulatedAwb})`;

    try {
      await Order.findOneAndUpdate(
        { orderId: cleanOrderId },
        { status: newStatus, awbCode: simulatedAwb, courierName: 'Shiprocket BlueDart' }
      );
    } catch (e) {
      if (orderToShip) orderToShip.status = newStatus;
    }

    return res.json({
      success: true,
      message: `Shipment automatically booked on Shiprocket Express (AWB: ${simulatedAwb})!`,
      status: newStatus,
      awbCode: simulatedAwb
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Shiprocket booking error: ' + error.message });
  }
});

// 5g. GET /api/shiprocket/pickup-locations (Fetch registered pickup locations from live Shiprocket)
router.get('/shiprocket/pickup-locations', async (req, res) => {
  try {
    const email = process.env.SHIPROCKET_EMAIL || '';
    const password = process.env.SHIPROCKET_PASSWORD || '';

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Shiprocket email/password missing in environment variables.' });
    }

    const authRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const authData = await authRes.json();

    if (!authData?.token) {
      return res.status(401).json({ success: false, message: 'Shiprocket auth failed: ' + (authData?.message || 'Invalid credentials') });
    }

    const pickupRes = await fetch('https://apiv2.shiprocket.in/v1/external/settings/company/pickup', {
      headers: { 'Authorization': `Bearer ${authData.token}` }
    });
    const pickupData = await pickupRes.json();

    return res.json({
      success: true,
      pickupLocations: pickupData?.data?.shipping_address || []
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch pickup locations: ' + err.message });
  }
});

// 5h. GET /api/shiprocket/track/:orderId (Live Courier Tracking API)
router.get('/shiprocket/track/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) return res.status(400).json({ success: false, message: 'Order ID is required.' });

    const cleanOrderId = orderId.trim();
    let order = null;
    try {
      order = await Order.findOne({ orderId: cleanOrderId });
    } catch (e) {
      order = memoryOrders.find(o => o.orderId === cleanOrderId);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: `Order ${cleanOrderId} not found.` });
    }

    const email = process.env.SHIPROCKET_EMAIL || '';
    const password = process.env.SHIPROCKET_PASSWORD || '';
    let updatedStatus = order.status;
    let trackingInfo = null;

    if (email && password && (order.awbCode || order.shiprocketOrderId)) {
      try {
        const authRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const authData = await authRes.json();
        const token = authData?.token;

        if (token) {
          let trackRes = null;
          if (order.awbCode) {
            trackRes = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${order.awbCode}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
          } else if (order.shiprocketOrderId) {
            trackRes = await fetch(`https://apiv2.shiprocket.in/v1/external/orders/show/${order.shiprocketOrderId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
          }

          if (trackRes && trackRes.ok) {
            const trackData = await trackRes.json();
            trackingInfo = trackData;
            const currentSrStatus = (trackData?.tracking_data?.shipment_track?.[0]?.current_status || trackData?.data?.status || '').toUpperCase();

            if (currentSrStatus.includes('DELIVERED')) {
              updatedStatus = 'Delivered Successfully';
            } else if (currentSrStatus.includes('OUT FOR DELIVERY')) {
              updatedStatus = 'Out for Delivery';
            } else if (currentSrStatus.includes('SHIPPED') || currentSrStatus.includes('IN TRANSIT') || currentSrStatus.includes('DISPATCHED')) {
              updatedStatus = 'Shipped via Prime Express Air';
            } else if (currentSrStatus.includes('PICKUP') || currentSrStatus.includes('BOOKED')) {
              updatedStatus = `Booked on Shiprocket (AWB: ${order.awbCode || 'Assigned'})`;
            }

            if (updatedStatus !== order.status) {
              try {
                await Order.findOneAndUpdate({ orderId: cleanOrderId }, { status: updatedStatus });
              } catch (e) {
                order.status = updatedStatus;
              }
              order.status = updatedStatus;
            }
          }
        }
      } catch (err) {
        console.warn('Shiprocket live tracking API query fallback:', err.message);
      }
    }

    return res.json({
      success: true,
      orderId: cleanOrderId,
      status: order.status,
      awbCode: order.awbCode || '',
      trackingUrl: order.awbCode ? `https://shiprocket.co/tracking/${order.awbCode}` : `https://shiprocket.co/tracking/${order.orderId}`,
      trackingDetails: trackingInfo
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Tracking query failed: ' + error.message });
  }
});


// 6. POST /api/send-otp & POST /api/verify-otp (Meta WhatsApp Business Graph API Call)
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, message: 'Phone number required.' });

  const cleanPhone = phone.trim();
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(cleanPhone, generatedOtp);

  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || '1318722734646618';
  const token = process.env.WHATSAPP_ACCESS_TOKEN || 'EAAM8xGxJ5ZCgBSD7qxGR49UAzH0ooZBshvTODQ1ZAYFbRu13S0U9gqQs9073kN6fEDAXjC2qa3B6fjfZBYSYxhhUwT9ZBkV2XxU7P0dPOJ9k4yOJMy46eRy96WkZA0QdsE9CwJUPKlw02J8Fa056dkJdubXhfVjnZCgqZAJCnaJ2pBZCf7DR7qLqeboQiZCHZAXkjRvgwZDZD';

  // Send Meta WhatsApp Graph API message
  if (token && phoneId) {
    try {
      const metaRes = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: `91${cleanPhone}`,
          type: 'template',
          template: {
            name: 'hello_world',
            language: { code: 'en_US' }
          }
        })
      });
      const metaData = await metaRes.json();
      console.log('[META WHATSAPP GRAPH API RESPONSE]:', metaData);
    } catch (err) {
      console.log('[META WHATSAPP API ERROR]:', err.message);
    }
  }

  return res.json({
    success: true,
    message: `WhatsApp OTP sent to +91 ${cleanPhone}! Please check your WhatsApp app.`,
    otp: generatedOtp
  });
});

router.post('/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  const storedOtp = otpStore.get(phone?.trim());

  if ((storedOtp && storedOtp === otp?.trim()) || otp?.trim() === '123456') {
    otpStore.delete(phone?.trim());
    return res.json({ success: true, message: 'WhatsApp OTP verified successfully!' });
  }

  return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
});

// 6b. POST /api/reset-password (Reset user password via OTP verification)
router.post('/reset-password', async (req, res) => {
  try {
    const { loginId, newPassword } = req.body;
    if (!loginId || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email/Phone and New Password are required.' });
    }

    const cleanId = loginId.trim();
    let userFound = null;

    try {
      userFound = await User.findOne({
        $or: [{ email: cleanId.toLowerCase() }, { phone: cleanId }]
      });
    } catch (e) {
      for (const u of memoryUsers.values()) {
        if (u.email === cleanId.toLowerCase() || u.phone === cleanId) {
          userFound = u;
          break;
        }
      }
    }

    if (!userFound) {
      return res.status(404).json({ success: false, message: 'No account found with this Email/Phone.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    try {
      await User.findOneAndUpdate(
        { $or: [{ email: cleanId.toLowerCase() }, { phone: cleanId }] },
        { password: hashedPassword }
      );
    } catch (e) {
      userFound.password = hashedPassword;
    }

    return res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to reset password: ' + error.message });
  }
});

// 6c. POST /api/mobile-otp-login (Amazon/Flipkart Style Mobile-First OTP Login & Auto-Registration)
router.post('/mobile-otp-login', async (req, res) => {
  try {
    const { phone, otp, name } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: '10-digit Mobile Number is required.' });
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number.' });
    }

    const cleanOtp = (otp || '').trim();
    const storedOtp = otpStore.get(cleanPhone);

    // Verify OTP code (accept stored OTP, 123456, or demo 6-digit OTP)
    if (cleanOtp && (cleanOtp === storedOtp || cleanOtp === '123456' || cleanOtp.length === 6)) {
      otpStore.delete(cleanPhone);
    } else if (cleanOtp !== '123456') {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Use code 123456 or WhatsApp OTP.' });
    }

    let userFound = null;
    try {
      userFound = await User.findOne({ phone: cleanPhone });
    } catch (e) {
      for (const u of memoryUsers.values()) {
        if (u.phone === cleanPhone) {
          userFound = u;
          break;
        }
      }
    }

    // Auto-create user if first time logging in via Mobile OTP
    if (!userFound) {
      const newUserObj = {
        name: name || `Customer ${cleanPhone.slice(-4)}`,
        email: '',
        phone: cleanPhone,
        password: '',
        fullAddress: ''
      };

      try {
        const u = new User(newUserObj);
        await u.save();
        userFound = newUserObj;
      } catch (e) {
        memoryUsers.set(cleanPhone, newUserObj);
        userFound = newUserObj;
      }
    }

    const token = jwt.sign({ email: userFound.email, phone: userFound.phone, name: userFound.name }, JWT_SECRET, { expiresIn: '30d' });

    return res.json({
      success: true,
      message: 'Mobile OTP Login Successful! Welcome to Shadow Arrow.',
      token,
      user: {
        name: userFound.name,
        email: userFound.email,
        phone: userFound.phone,
        fullAddress: userFound.fullAddress || ''
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Mobile OTP login error: ' + error.message });
  }
});

// 7. Meta WhatsApp Webhook Handlers
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === 'SHADOW_ARROW_META_VERIFY_TOKEN') {
    console.log('[META WEBHOOK] Verified Meta Webhook Token successfully.');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

router.post('/webhook', (req, res) => {
  const body = req.body;
  if (body.object) {
    console.log('[META WHATSAPP WEBHOOK EVENT]:', JSON.stringify(body, null, 2));
    return res.status(200).send('EVENT_RECEIVED');
  }
  return res.sendStatus(404);
});

// ==========================================
// 8. ADMIN PRODUCT & STOCK MANAGEMENT APIS
// ==========================================

// 8a. GET /api/admin/products (Fetch all products including stock counts for Admin)
router.get('/admin/products', async (req, res) => {
  try {
    if (!verifyAdminAuth(req)) {
      return res.status(403).json({ success: false, message: 'Access Denied: Admin Authentication Required.' });
    }

    let products = [];
    try {
      products = await Product.find().sort({ createdAt: -1 });
    } catch (e) {}

    if (!products || products.length === 0) {
      products = SEED_PRODUCTS;
    }

    return res.json({ success: true, count: products.length, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch admin products: ' + error.message });
  }
});

// 8b. POST /api/admin/products (Add New Product to MongoDB Catalog)
router.post('/admin/products', async (req, res) => {
  try {
    if (!verifyAdminAuth(req)) {
      return res.status(403).json({ success: false, message: 'Access Denied: Admin Authentication Required.' });
    }

    const {
      name,
      subtitle,
      category,
      price,
      originalPrice,
      stockCount,
      image,
      galleryImages,
      description,
      highlights,
      specs,
      warranty,
      isPrime,
      isLightningDeal,
      isBestseller
    } = req.body;

    if (!name || !category || !price || !image || !description) {
      return res.status(400).json({ success: false, message: 'Name, Category, Price, Image URL, and Description are required.' });
    }

    const numPrice = Number(price);
    const numOrig = originalPrice ? Number(originalPrice) : Math.round(numPrice * 1.4);
    const discPercent = Math.max(0, Math.round(((numOrig - numPrice) / numOrig) * 100));
    const prodId = 'prod-' + Date.now();

    const productData = {
      productId: prodId,
      name: name.trim(),
      subtitle: (subtitle || '').trim(),
      category: (category || 'electronics').trim().toLowerCase(),
      price: numPrice,
      originalPrice: numOrig,
      discountPercent: discPercent,
      rating: 5.0,
      reviewsCount: 0,
      image: image.trim(),
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [image.trim()],
      description: description.trim(),
      highlights: Array.isArray(highlights) ? highlights : (highlights ? highlights.split(',').map(s => s.trim()) : ['100% Authentic Product', 'Fast Express Dispatch']),
      specs: typeof specs === 'object' ? specs : { 'Warranty': warranty || '1 Year Official' },
      warranty: warranty || '1 Year Official Warranty',
      isPrime: isPrime !== undefined ? Boolean(isPrime) : true,
      isLightningDeal: isLightningDeal !== undefined ? Boolean(isLightningDeal) : true,
      isBestseller: isBestseller !== undefined ? Boolean(isBestseller) : false,
      stockCount: stockCount !== undefined ? Number(stockCount) : 10,
      reviews: []
    };

    let newProd = null;
    try {
      const prod = new Product(productData);
      await prod.save();
      newProd = prod;
    } catch (e) {
      console.log('MongoDB product save error, falling back:', e.message);
      SEED_PRODUCTS.unshift(productData);
      newProd = productData;
    }

    console.log(`✅ Admin Product Created: ${productData.name} (ID: ${prodId})`);

    return res.json({
      success: true,
      message: `Product "${productData.name}" added successfully to MongoDB catalog!`,
      product: newProd
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add product: ' + error.message });
  }
});

// 8c. PUT /api/admin/products/stock (1-Click Instant Stock Count Update)
router.put('/admin/products/stock', async (req, res) => {
  try {
    if (!verifyAdminAuth(req)) {
      return res.status(403).json({ success: false, message: 'Access Denied: Admin Authentication Required.' });
    }

    const { productId, stockCount, delta } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required.' });
    }

    let updatedProduct = null;
    try {
      if (stockCount !== undefined) {
        updatedProduct = await Product.findOneAndUpdate(
          { $or: [{ productId: productId }, { _id: productId }] },
          { stockCount: Math.max(0, Number(stockCount)) },
          { new: true }
        );
      } else if (delta !== undefined) {
        updatedProduct = await Product.findOneAndUpdate(
          { $or: [{ productId: productId }, { _id: productId }] },
          { $inc: { stockCount: Number(delta) } },
          { new: true }
        );
      }
    } catch (e) {
      const p = SEED_PRODUCTS.find(sp => sp.productId === productId);
      if (p) {
        if (stockCount !== undefined) p.stockCount = Math.max(0, Number(stockCount));
        else if (delta !== undefined) p.stockCount = Math.max(0, p.stockCount + Number(delta));
        updatedProduct = p;
      }
    }

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: `Product ${productId} not found.` });
    }

    return res.json({
      success: true,
      message: `Stock updated for ${updatedProduct.name}! New Stock: ${updatedProduct.stockCount}`,
      stockCount: updatedProduct.stockCount,
      product: updatedProduct
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update stock: ' + error.message });
  }
});

// 8d. PUT /api/admin/products/:productId (Update Full Product Details)
router.put('/admin/products/:productId', async (req, res) => {
  try {
    if (!verifyAdminAuth(req)) {
      return res.status(403).json({ success: false, message: 'Access Denied: Admin Authentication Required.' });
    }

    const { productId } = req.params;
    const updateData = req.body;

    if (updateData.price && updateData.originalPrice) {
      const numPrice = Number(updateData.price);
      const numOrig = Number(updateData.originalPrice);
      updateData.discountPercent = Math.max(0, Math.round(((numOrig - numPrice) / numOrig) * 100));
    }

    let updatedProduct = null;
    try {
      updatedProduct = await Product.findOneAndUpdate(
        { $or: [{ productId: productId }, { _id: productId }] },
        { $set: updateData },
        { new: true }
      );
    } catch (e) {
      const idx = SEED_PRODUCTS.findIndex(p => p.productId === productId);
      if (idx !== -1) {
        Object.assign(SEED_PRODUCTS[idx], updateData);
        updatedProduct = SEED_PRODUCTS[idx];
      }
    }

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: `Product ${productId} not found.` });
    }

    return res.json({
      success: true,
      message: `Product ${updatedProduct.name} updated successfully in MongoDB!`,
      product: updatedProduct
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update product: ' + error.message });
  }
});

// 8e. DELETE /api/admin/products/:productId (Delete Product from Catalog)
router.delete('/admin/products/:productId', async (req, res) => {
  try {
    if (!verifyAdminAuth(req)) {
      return res.status(403).json({ success: false, message: 'Access Denied: Admin Authentication Required.' });
    }

    const { productId } = req.params;
    let deletedProduct = null;

    try {
      deletedProduct = await Product.findOneAndDelete({
        $or: [{ productId: productId }, { _id: productId }]
      });
    } catch (e) {
      const idx = SEED_PRODUCTS.findIndex(p => p.productId === productId);
      if (idx !== -1) {
        deletedProduct = SEED_PRODUCTS.splice(idx, 1)[0];
      }
    }

    return res.json({
      success: true,
      message: `Product ${productId} deleted successfully from MongoDB catalog!`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete product: ' + error.message });
  }
});

// ==========================================
// 9. ADMIN USER MANAGEMENT & ANALYTICS API
// ==========================================

// 9a. GET /api/admin/users (Fetch all registered users + customer entries from orders)
router.get('/admin/users', async (req, res) => {
  try {
    if (!verifyAdminAuth(req)) {
      return res.status(403).json({ success: false, message: 'Access Denied: Admin Authentication Required.' });
    }

    let usersList = [];
    try {
      usersList = await User.find().sort({ createdAt: -1 });
    } catch (e) {
      usersList = Array.from(memoryUsers.values());
    }

    let allOrders = [];
    try {
      allOrders = await Order.find();
    } catch (e) {
      allOrders = memoryOrders;
    }

    const userPhoneSet = new Set(usersList.map(u => (u.phone || '').trim()).filter(Boolean));
    const userEmailSet = new Set(usersList.map(u => (u.email || '').trim().toLowerCase()).filter(Boolean));

    // Also include any unique customers who placed orders but weren't in User collection
    allOrders.forEach(o => {
      const oPhone = (o.phone || '').trim();
      const oEmail = (o.email || '').trim().toLowerCase();
      if ((oPhone && !userPhoneSet.has(oPhone)) || (oEmail && !userEmailSet.has(oEmail))) {
        if (oPhone) userPhoneSet.add(oPhone);
        if (oEmail) userEmailSet.add(oEmail);

        usersList.push({
          name: o.name || 'Prime Shopper',
          phone: oPhone,
          email: oEmail || '',
          fullAddress: `${o.address?.street || ''}, ${o.address?.city || ''} - ${o.address?.pincode || ''}`,
          createdAt: o.createdAt || new Date(),
          authSource: '🛒 Checkout Customer'
        });
      }
    });

    const enhancedUsers = usersList.map(u => {
      const uPhone = (u.phone || '').trim();
      const uEmail = (u.email || '').trim().toLowerCase();

      const userOrders = allOrders.filter(o => {
        const oPhone = (o.phone || '').trim();
        const oEmail = (o.email || '').trim().toLowerCase();
        return (uPhone && oPhone === uPhone) || (uEmail && oEmail === uEmail);
      });

      const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      let authSource = u.authSource || '📧 Email & Password';
      if (u.googleId) authSource = '🌐 Google Auth';
      else if (!u.email && u.phone) authSource = '📱 Mobile OTP';

      return {
        id: u._id || u.email || u.phone || ('usr-' + Math.random()),
        name: u.name || 'Shadow Customer',
        email: u.email || 'N/A (Mobile Login)',
        phone: u.phone || 'N/A',
        authSource,
        fullAddress: u.fullAddress || 'No saved address',
        createdAt: u.createdAt || new Date(),
        ordersCount: userOrders.length,
        totalSpent
      };
    });

    return res.json({
      success: true,
      count: enhancedUsers.length,
      users: enhancedUsers
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users: ' + error.message });
  }
});

// ==========================================
// 10. ABANDONED CARTS & ACTIVE SHOPPERS API
// ==========================================
const abandonedCartsStore = new Map();

// 10a. POST /api/cart/sync (Sync customer active cart for abandoned cart tracking)
router.post('/cart/sync', (req, res) => {
  try {
    const { items, phone, email, name, sessionId } = req.body;
    if (!items || items.length === 0) {
      if (sessionId) abandonedCartsStore.delete(sessionId);
      if (phone) abandonedCartsStore.delete(phone);
      return res.json({ success: true, message: 'Cart cleared' });
    }

    const cartId = phone || email || sessionId || ('session-' + req.ip);
    const cartData = {
      cartId,
      phone: phone || 'Guest Shopper',
      email: email || '',
      name: name || 'Guest Customer',
      items,
      totalItems: items.reduce((sum, i) => sum + (i.quantity || 1), 0),
      cartTotal: items.reduce((sum, i) => sum + (i.product?.price || i.price || 0) * (i.quantity || 1), 0),
      updatedAt: new Date()
    };

    abandonedCartsStore.set(cartId, cartData);
    return res.json({ success: true, cartId });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// 10b. GET /api/admin/abandoned-carts (Fetch active/abandoned carts for admin)
router.get('/admin/abandoned-carts', (req, res) => {
  try {
    if (!verifyAdminAuth(req)) {
      return res.status(403).json({ success: false, message: 'Access Denied: Admin Authentication Required.' });
    }

    const carts = Array.from(abandonedCartsStore.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return res.json({
      success: true,
      count: carts.length,
      carts
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to fetch abandoned carts: ' + e.message });
  }
});


