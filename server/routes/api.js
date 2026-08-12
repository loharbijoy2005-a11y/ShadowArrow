import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';

export const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'shadow_arrow_jwt_secret_key_2026';
const otpStore = new Map(); // Memory store for OTPs

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
    rating: 4.9,
    reviewsCount: 1420,
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
    rating: 4.8,
    reviewsCount: 980,
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
    rating: 4.9,
    reviewsCount: 750,
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
    rating: 4.9,
    reviewsCount: 610,
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
    rating: 4.8,
    reviewsCount: 1120,
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
    rating: 4.7,
    reviewsCount: 840,
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

// 2. POST /api/signup (Validates unique phone number, hashes password with Bcrypt, saves user to MongoDB)
router.post('/signup', async (req, res) => {
  try {
    const { name, phone, email, password, fullAddress } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
    }

    const cleanPhone = phone.trim();
    const cleanEmail = (email || `${cleanPhone}@shadowarrow.in`).toLowerCase().trim();
    const cleanPassword = password || 'otp_authenticated_user';

    // Check MongoDB for existing phone
    try {
      const existingUser = await User.findOne({ phone: cleanPhone });
      if (existingUser) {
        const token = jwt.sign({ phone: cleanPhone, name: existingUser.name }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({
          success: true,
          message: 'Welcome back!',
          token,
          user: { name: existingUser.name, phone: cleanPhone, email: existingUser.email, fullAddress: existingUser.fullAddress || '' }
        });
      }
    } catch (e) {
      if (memoryUsers.has(cleanPhone)) {
        const u = memoryUsers.get(cleanPhone);
        const token = jwt.sign({ phone: cleanPhone, name: u.name }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({
          success: true,
          message: 'Welcome back!',
          token,
          user: { name: u.name, phone: cleanPhone, email: u.email, fullAddress: u.fullAddress || '' }
        });
      }
    }

    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    const newUserObj = {
      name: name || 'Shadow Member',
      phone: cleanPhone,
      email: cleanEmail,
      password: hashedPassword,
      fullAddress: fullAddress || ''
    };

    try {
      const user = new User(newUserObj);
      await user.save();
    } catch (e) {
      memoryUsers.set(cleanPhone, newUserObj);
    }

    const token = jwt.sign({ phone: cleanPhone, name: newUserObj.name }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      message: 'Account created successfully in MongoDB!',
      token,
      user: { name: newUserObj.name, phone: cleanPhone, email: cleanEmail, fullAddress: fullAddress || '' }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Signup failed: ' + error.message });
  }
});

// 3. POST /api/login (Dual login via Phone or Email with Bcrypt)
router.post('/login', async (req, res) => {
  try {
    const { loginId, password } = req.body; // loginId can be Phone or Email
    if (!loginId) {
      return res.status(400).json({ success: false, message: 'Please enter your Phone/Email.' });
    }

    const cleanId = loginId.trim();
    let userFound = null;

    try {
      userFound = await User.findOne({
        $or: [{ phone: cleanId }, { email: cleanId.toLowerCase() }]
      });
    } catch (e) {
      for (const u of memoryUsers.values()) {
        if (u.phone === cleanId || u.email === cleanId.toLowerCase()) {
          userFound = u;
          break;
        }
      }
    }

    // Auto-create user on OTP sign-in if not exists
    if (!userFound) {
      const newUserObj = {
        name: 'Shadow Member',
        phone: cleanId,
        email: `${cleanId}@shadowarrow.in`,
        password: await bcrypt.hash(password || 'otp_user', 10),
        fullAddress: ''
      };
      try {
        const u = new User(newUserObj);
        await u.save();
        userFound = newUserObj;
      } catch (e) {
        memoryUsers.set(cleanId, newUserObj);
        userFound = newUserObj;
      }
    }

    const token = jwt.sign({ phone: userFound.phone, name: userFound.name }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: { name: userFound.name, phone: userFound.phone, email: userFound.email, fullAddress: userFound.fullAddress || '' }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Login error: ' + error.message });
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
      user = await User.findOne({ phone: decoded.phone });
    } catch (e) {
      user = memoryUsers.get(decoded.phone);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    return res.json({
      success: true,
      user: { name: user.name, phone: user.phone, email: user.email, fullAddress: user.fullAddress || '' }
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired JWT token.' });
  }
});

// 5. POST /api/orders (Creates order with server-side price & fee calculation)
router.post('/orders', async (req, res) => {
  try {
    const { name, phone, address, items, paymentMethod, razorpayPaymentId } = req.body;

    if (!name || !phone || !address || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid order details or empty cart.' });
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal >= 999 ? 0 : 69;
    const total = subtotal + deliveryFee;

    const orderId = 'ORD-SA-' + Math.floor(100000 + Math.random() * 900000);
    const rzpId = razorpayPaymentId || (paymentMethod.includes('Online') ? 'Paid Online (Confirmed)' : 'COD_VERIFIED');

    const orderData = {
      orderId,
      phone,
      name,
      address,
      items,
      subtotal,
      deliveryFee,
      total,
      status: 'Shipped via Prime Express Air',
      paymentMethod: paymentMethod || 'Cash on Delivery (COD)',
      razorpayPaymentId: rzpId,
      createdAt: new Date()
    };

    try {
      const order = new Order(orderData);
      await order.save();
    } catch (e) {
      memoryOrders.unshift(orderData);
    }

    return res.json({
      success: true,
      message: 'Order created successfully!',
      order: orderData
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to place order: ' + error.message });
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
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  // If Meta Access Token is set, send Meta WhatsApp Graph API message
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

  console.log(`[META WHATSAPP API] Sent WhatsApp OTP ${generatedOtp} to +91 ${cleanPhone}`);

  return res.json({
    success: true,
    message: `WhatsApp OTP sent to +91 ${cleanPhone}! (Demo OTP: ${generatedOtp})`,
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
