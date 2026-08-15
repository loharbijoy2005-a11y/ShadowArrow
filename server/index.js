import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { router as apiRouter } from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['*']
}));
app.use(express.json({ limit: '5mb' }));

// Bank-Grade Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
});

// API & Webhook Routes
app.use('/api', apiRouter);
app.use('/webhook', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Render Anti-Sleep Keep-Alive Heartbeat (Pings /health every 10 minutes to prevent 15-minute sleep)
const RENDER_APP_URL = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;
if (RENDER_APP_URL) {
  setInterval(async () => {
    try {
      await fetch(`${RENDER_APP_URL}/health`);
      console.log(`💓 [RENDER KEEP-ALIVE] Heartbeat ping sent to ${RENDER_APP_URL}/health - Server kept 100% awake!`);
    } catch (e) {
      console.log(`[RENDER KEEP-ALIVE NOTICE]: ${e.message}`);
    }
  }, 10 * 60 * 1000); // Pings every 10 minutes
}

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Privacy Policy Endpoint for Meta Developer App Verification
app.get(['/privacy', '/privacy-policy', '/privacy-policy.html'], (req, res) => {
  res.sendFile(path.join(__dirname, '../public/privacy-policy.html'));
});

// Standalone Backend Admin Portal Endpoint (Separated from Customer Frontend)
app.get(['/admin', '/admin-login', '/admin-portal', '/admin.html'], (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Serve static frontend assets from dist in production
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/webhook')) {
    return next();
  }
  const distIndex = path.join(__dirname, '../dist/index.html');
  res.sendFile(distIndex, (err) => {
    if (err) next();
  });
});


// MongoDB Connection with auto-formatting & Atlas database targeting
let MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://loharbijoy2005_db_user:LoharBijoy@cluster0.54bsyva.mongodb.net/shadow_arrow?retryWrites=true&w=majority';

if (MONGO_URI.includes('.mongodb.net/') && !MONGO_URI.includes('.mongodb.net/shadow_arrow')) {
  if (MONGO_URI.includes('.mongodb.net/?')) {
    MONGO_URI = MONGO_URI.replace('.mongodb.net/?', '.mongodb.net/shadow_arrow?');
  } else {
    MONGO_URI = MONGO_URI.replace('.mongodb.net/', '.mongodb.net/shadow_arrow');
  }
}

console.log('Attempting MongoDB connection to Atlas cluster (Database: shadow_arrow)...');

mongoose
  .connect(MONGO_URI, {
    dbName: 'shadow_arrow',
    serverSelectionTimeoutMS: 8000
  })
  .then(async () => {
    console.log('✅ CONNECTED TO MONGODB ATLAS SUCCESSFULLY! Database: shadow_arrow');

    // Auto-seed initial catalog products to MongoDB Atlas if collection is empty
    try {
      const { Product } = await import('./models/Product.js');
      const count = await Product.countDocuments();
      if (count === 0) {
        console.log('📦 Auto-seeding initial catalog products directly into MongoDB Atlas shadow_arrow.products...');
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
            stockCount: 15,
            hsnCode: '84716060',
            gstRate: 18
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
            stockCount: 20,
            hsnCode: '84716070',
            gstRate: 18
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
            stockCount: 10,
            hsnCode: '62019300',
            gstRate: 12
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
            stockCount: 8,
            hsnCode: '85285200',
            gstRate: 18
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
            stockCount: 12,
            hsnCode: '85183000',
            gstRate: 18
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
            stockCount: 14,
            hsnCode: '85176290',
            gstRate: 18
          }
        ];
        await Product.insertMany(SEED_PRODUCTS);
        console.log('✅ Seed products successfully written to MongoDB Atlas shadow_arrow.products!');
      }
    } catch (seedErr) {
      console.error('Seed products notice:', seedErr.message);
    }
  })
  .catch((err) => {
    console.error('❌ MongoDB Atlas Connection Error:', err.message);
    console.log('MongoDB Notice: If using Atlas, ensure 0.0.0.0/0 IP is allowed under MongoDB Atlas Network Access.');
  });

app.listen(PORT, () => {
  console.log(`⚡ SHADOW ARROW Express Server running at http://localhost:${PORT}`);
});
