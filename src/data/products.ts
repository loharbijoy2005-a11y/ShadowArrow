import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Shadow Stealth Pro Mechanical Gaming Keyboard',
    subtitle: 'Hot-swappable RGB Switches, Aircraft Aluminum Frame',
    category: 'gaming',
    price: 2399,
    originalPrice: 3999,
    discountPercent: 40,
    rating: 5.0,
    reviewsCount: 0,
    image: '/assets/keyboard.png',
    galleryImages: [
      '/assets/keyboard.png',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Esports grade mechanical gaming keyboard featuring hot-swappable tactile brown switches, double-shot PBT keycaps, and per-key RGB backlighting encased in CNC-machined aircraft grade aluminum alloy.',
    highlights: [
      'Hot-Swappable 5-Pin Mechanical Brown Tactile Switches',
      'Per-Key 16.8M RGB Custom Lighting Modes',
      'Aircraft-Grade Anodized Aluminum Top Chassis',
      'Double-shot PBT Keycaps (Zero Shine, Anti-Friction)',
      'Detachable Braided Type-C Coiled Cable'
    ],
    specs: {
      'Form Factor': 'Tenkeyless (80% TKL)',
      'Switch Type': 'Hot-Swappable Tactile Brown',
      'Connectivity': 'Detachable USB-C Braided Cable',
      'Polling Rate': '1000Hz Ultra-Low Latency',
      'Compatibility': 'Windows, macOS, Linux, PS5, Xbox',
      'Dimensions': '356 x 130 x 38 mm',
      'Weight': '875g'
    },
    warranty: '1 Year Brand Replacement Guarantee',
    isPrime: true,
    isLightningDeal: true,
    isBestseller: true,
    stockCount: 4
  },
  {
    id: 'prod-2',
    name: 'RGB Wireless Gaming Mouse & Pad Combo',
    subtitle: '26,000 DPI Sensor, 58g Lightweight, Micro-woven Desk Mat',
    category: 'gaming',
    price: 1499,
    originalPrice: 2499,
    discountPercent: 40,
    rating: 5.0,
    reviewsCount: 0,
    image: '/assets/mouse.png',
    galleryImages: [
      '/assets/mouse.png',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Ultra-lightweight 58g wireless esports mouse equipped with PAW3395 26K DPI optical sensor and combined with an extended micro-woven RGB desk mat.',
    highlights: [
      'Flagship PAW3395 26,000 DPI Precision Sensor',
      '58g Ultra Lightweight Honeycomb Construction',
      '80 Million Click Optical Micro Switches',
      'Extended 900x400mm RGB Micro-woven Desk Mat Included',
      'Up to 80 Hours Battery Life on Single Charge'
    ],
    specs: {
      'Sensor': 'PAW3395 Optical (26K DPI)',
      'Tracking Speed': '650 IPS / 50G Acceleration',
      'Weight': '58 Grams',
      'Battery Life': '80 Hours Wireless',
      'Desk Mat Size': '900 x 400 x 4 mm',
      'Connection': '2.4GHz Low-Latency / Bluetooth 5.2'
    },
    warranty: '1 Year Official Warranty',
    isPrime: true,
    isLightningDeal: true,
    isBestseller: true,
    stockCount: 6
  },
  {
    id: 'prod-3',
    name: 'Cyberpunk Shadow Streetwear Bomber Jacket',
    subtitle: 'Water-resistant Tactical Shell, Neon Orange Accents',
    category: 'fashion',
    price: 1999,
    originalPrice: 3999,
    discountPercent: 50,
    rating: 5.0,
    reviewsCount: 0,
    image: '/assets/jacket.png',
    galleryImages: [
      '/assets/jacket.png',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Futuristic urban techwear jacket crafted from 100% water-resistant ballistic nylon with reflective orange accents and utility cargo pockets.',
    highlights: [
      '100% Water-Resistant Ballistic Nylon Exterior',
      'Thermal Fleece Lining for All-Weather Comfort',
      'Dual Chest Cargo Pockets & Arm Sleeve Zip',
      'High-Reflective Neon Safety Piping',
      'Heavy-Duty YKK Matte Black Zippers'
    ],
    specs: {
      'Material': 'Ballistic Nylon & Polyester Fleece',
      'Fit Type': 'Modern Urban Oversized Fit',
      'Pockets': '6 Utility Cargo Pockets',
      'Care': 'Machine Washable (Cold, Line Dry)'
    },
    warranty: '6 Months Stitching Guarantee',
    isPrime: true,
    isLightningDeal: true,
    isBestseller: true,
    stockCount: 3
  },
  {
    id: 'prod-4',
    name: 'Ultra-Wide 2K Curved Gaming Monitor (34")',
    subtitle: '165Hz Refresh, 1ms Response, HDR400, AMD FreeSync',
    category: 'electronics',
    price: 24999,
    originalPrice: 34999,
    discountPercent: 28,
    rating: 5.0,
    reviewsCount: 0,
    image: '/assets/monitor.png',
    galleryImages: [
      '/assets/monitor.png',
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Immersive 34-inch 1500R curved WQHD (3440x1440) gaming display delivering 165Hz smooth refresh rate, 1ms MPRT, and 125% sRGB wide color gamut.',
    highlights: [
      '34" WQHD (3440 x 1440) 21:9 Panoramic Panel',
      '165Hz Fast Refresh Rate & 1ms Response Time',
      'Immersive 1500R Curvature matching human field of view',
      'HDR400 Peak Brightness & AMD FreeSync Premium',
      'Ergonomic Height, Tilt, and Swivel Stand'
    ],
    specs: {
      'Panel Size': '34 Inches Curved VA',
      'Resolution': '3440 x 1440 (UW-QHD)',
      'Refresh Rate': '165Hz',
      'Response Time': '1ms MPRT',
      'Inputs': '2x HDMI 2.0, 2x DisplayPort 1.4, 3.5mm Audio',
      'Color Gamut': '125% sRGB / 95% DCI-P3'
    },
    warranty: '3 Years Replacement Warranty',
    isPrime: true,
    isLightningDeal: true,
    isBestseller: true,
    stockCount: 2
  },
  {
    id: 'prod-5',
    name: 'Shadow Active Noise-Cancelling Headphones',
    subtitle: 'Hybrid ANC, 40mm Titanium Drivers, 60H Battery',
    category: 'electronics',
    price: 3499,
    originalPrice: 5999,
    discountPercent: 41,
    rating: 5.0,
    reviewsCount: 0,
    image: '/assets/headphones.png',
    galleryImages: [
      '/assets/headphones.png',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Premium wireless over-ear headphones featuring -38dB hybrid active noise cancellation, custom-tuned 40mm titanium diaphragm drivers, and 60-hour playtime.',
    highlights: [
      'Hybrid Active Noise Cancellation (-38dB Reduction)',
      '40mm Titanium-Coated Diaphragm Acoustic Drivers',
      '60 Hours Continuous Playtime (40H with ANC ON)',
      'Ultra-Soft Protein Leather & Memory Foam Cushions',
      'Multipoint Bluetooth 5.3 & Low Latency Gaming Mode'
    ],
    specs: {
      'Driver Unit': '40mm Titanium Dome',
      'ANC Rating': 'Hybrid ANC (-38dB)',
      'Battery Capacity': '800mAh (60H Playback)',
      'Charging Time': '1.5 Hours (Type-C Fast Charge)',
      'Weight': '245g'
    },
    warranty: '1 Year Replacement Warranty',
    isPrime: true,
    isLightningDeal: false,
    isBestseller: true,
    stockCount: 8
  },
  {
    id: 'prod-6',
    name: 'Shadow Smartwatch Ultra Series (Titanium)',
    subtitle: '1.96" AMOLED Display, Bluetooth Calling, IP68',
    category: 'electronics',
    price: 2999,
    originalPrice: 4999,
    discountPercent: 40,
    rating: 5.0,
    reviewsCount: 0,
    image: '/assets/smartwatch.png',
    galleryImages: [
      '/assets/smartwatch.png',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Rugged titanium aerospace alloy smartwatch featuring a 1.96-inch HD AMOLED display, HD Bluetooth calling, 100+ sports tracking modes, and IP68 water resistance.',
    highlights: [
      '1.96" Always-On AMOLED Display (1000 nits Peak Brightness)',
      'Aerospace Titanium Alloy Case & Sapphire Glass Screen',
      'HD Bluetooth Hands-Free Calling with Noise Cancelling Mic',
      '24/7 Heart Rate, SpO2, Sleep & Stress Sensors',
      'IP68 Waterproof & Dustproof Rating'
    ],
    specs: {
      'Display': '1.96" AMOLED (410 x 502 Pixels)',
      'Case Material': 'Titanium Alloy Body',
      'Water Resistance': 'IP68 Waterproof',
      'Battery Life': 'Up to 10 Days Typical Usage',
      'Sensors': 'Optical HR, SpO2, Accelerometer, Gyroscope'
    },
    warranty: '1 Year Official Brand Warranty',
    isPrime: true,
    isLightningDeal: false,
    isBestseller: true,
    stockCount: 5
  }
];
